using System.Security.Cryptography;
using BCrypt.Net;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TRDS.Core.DTOs;
using TRDS.Core.Interfaces;
using TRDS.Infrastructure.Data;
using TRDS.Infrastructure.Queries;
using TRDS.Shared.Helpers;

namespace TRDS.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly EmployeeQueryService _employeeQuery;

    public AuthService(AppDbContext db, IConfiguration config, EmployeeQueryService employeeQuery)
    {
        _db = db;
        _config = config;
        _employeeQuery = employeeQuery;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress, string userAgent)
    {
        try
        {
            // Auto-detect user type: check SecurityUsers table first
            var isSuperUser = await _db.SecurityUsers
                .AnyAsync(u => u.Username == request.Username && u.IsActive);

            if (isSuperUser)
                return await LoginSuperUserAsync(request, ipAddress, userAgent);
            else
                return await LoginEmployeeAsync(request, ipAddress, userAgent);
        }
        catch (Exception ex)
        {
            return new LoginResponse { Success = false, ErrorMessage = "An error occurred during login. Please try again." };
        }
    }

    private async Task<LoginResponse> LoginSuperUserAsync(LoginRequest request, string ipAddress, string userAgent)
    {
        var user = await _db.SecurityUsers
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

        if (user == null)
        {
            await LogLoginAttempt("SuperUser", request.Username, ipAddress, userAgent, false, "User not found");
            return new LoginResponse { Success = false, ErrorMessage = "Invalid username or password." };
        }

        if (user.IsLocked && user.LockoutEndDate > DateTime.Now)
        {
            await LogLoginAttempt("SuperUser", request.Username, ipAddress, userAgent, false, "Account locked");
            return new LoginResponse { Success = false, ErrorMessage = "Account is locked. Please try again later." };
        }

        if (!VerifyPassword(request.Password, user.PasswordHash, user.Salt, user))
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= 5)
            {
                user.IsLocked = true;
                user.LockoutEndDate = DateTime.Now.AddMinutes(30);
            }
            await _db.SaveChangesAsync();
            await LogLoginAttempt("SuperUser", request.Username, ipAddress, userAgent, false, "Invalid password");
            return new LoginResponse { Success = false, ErrorMessage = "Invalid username or password." };
        }

        // Reset failed attempts on success
        user.FailedLoginAttempts = 0;
        user.IsLocked = false;
        user.LockoutEndDate = null;
        user.LastLoginDate = DateTime.Now;
        await _db.SaveChangesAsync();

        // Get roles and permissions
        var roles = await GetUserRoles("SuperUser", null, user.Id);
        var permissions = await GetUserPermissions(roles.Select(r => r.Id).ToList());
        var menuItems = await GetUserMenus(roles.Select(r => r.RoleCode).ToList());
        var scopeFilter = await GetUserScope("SuperUser", null, user.Id);
        var preferences = await GetUserPreferences("SuperUser", null, user.Id);

        var profile = new UserProfileDto
        {
            UserType = "SuperUser",
            EmployeeNo = user.Username,
            EmployeeName = user.DisplayName,
            Email = user.Email,
            Roles = roles.Select(r => r.RoleCode).ToList(),
            Permissions = permissions,
            ScopeFilter = scopeFilter,
            MenuItems = menuItems,
            Preferences = preferences
        };

        var token = JwtHelper.GenerateToken(
            profile.EmployeeNo, profile.UserType, profile.Roles, profile.Permissions,
            _config["Jwt:Key"]!, _config["Jwt:Issuer"]!, _config["Jwt:Audience"]!,
            request.RememberMe ? 7 : 1);

        await LogLoginAttempt("SuperUser", request.Username, ipAddress, userAgent, true, null);

        return new LoginResponse
        {
            Success = true,
            Token = token,
            ExpiresAt = DateTime.Now.AddDays(request.RememberMe ? 7 : 1),
            Profile = profile
        };
    }

    private async Task<LoginResponse> LoginEmployeeAsync(LoginRequest request, string ipAddress, string userAgent)
    {
        // Query HRIS database for employee authentication
        // For employee login: Username = DocumentEmployeeNo, Password = EISPassword
        var employee = await ValidateEmployeeCredentialsAsync(request.Username, request.Password);
        if (employee == null)
        {
            await LogLoginAttempt("Employee", request.Username, ipAddress, userAgent, false, "Invalid credentials");
            return new LoginResponse { Success = false, ErrorMessage = "Invalid employee number or password." };
        }

        // Get roles, permissions, menu, scope from TRDSDB
        var roles = await GetUserRoles("Employee", request.Username, null);
        
        // If no roles assigned, default to Employee role
        if (!roles.Any())
        {
            var defaultRole = await _db.Roles.FirstOrDefaultAsync(r => r.RoleCode == "EMPLOYEE");
            if (defaultRole != null) roles = new List<(int Id, string RoleCode)> { (defaultRole.Id, defaultRole.RoleCode) };
        }

        var permissions = await GetUserPermissions(roles.Select(r => r.Id).ToList());
        var menuItems = await GetUserMenus(roles.Select(r => r.RoleCode).ToList());
        var scopeFilter = await GetUserScope("Employee", request.Username, null);
        var preferences = await GetUserPreferences("Employee", request.Username, null);

        // Get hierarchy info
        var hierarchy = await _db.EmployeeHierarchies
            .Include(h => h.Department)
            .Include(h => h.Designation)
            .Include(h => h.Cluster)
            .Include(h => h.Location)
            .FirstOrDefaultAsync(h => h.EmployeeNo == request.Username);

        var profile = new UserProfileDto
        {
            UserType = "Employee",
            EmployeeNo = request.Username,
            EmployeeName = employee.EmployeeName,
            Department = hierarchy?.Department?.DepartmentName,
            Designation = hierarchy?.Designation?.DesignationName,
            Cluster = hierarchy?.Cluster?.ClusterName,
            Location = hierarchy?.Location?.LocationName,
            ManagerEmployeeNo = hierarchy?.ManagerEmployeeNo,
            Roles = roles.Select(r => r.RoleCode).ToList(),
            Permissions = permissions,
            ScopeFilter = scopeFilter,
            MenuItems = menuItems,
            Preferences = preferences
        };

        var token = JwtHelper.GenerateToken(
            profile.EmployeeNo, profile.UserType, profile.Roles, profile.Permissions,
            _config["Jwt:Key"]!, _config["Jwt:Issuer"]!, _config["Jwt:Audience"]!,
            request.RememberMe ? 7 : 1);

        await LogLoginAttempt("Employee", request.Username, ipAddress, userAgent, true, null);

        return new LoginResponse
        {
            Success = true,
            Token = token,
            ExpiresAt = DateTime.Now.AddDays(request.RememberMe ? 7 : 1),
            Profile = profile
        };
    }

    private async Task<EmployeeLookupDto?> ValidateEmployeeCredentialsAsync(string documentEmployeeNo, string password)
    {
        // Query HRIS MasterEmployee table for authentication
        using var conn = new Microsoft.Data.SqlClient.SqlConnection(
            _config.GetConnectionString("HRISDB"));
        var sql = @"SELECT DocumentEmployeeNo AS EmployeeNo, EmployeeName 
                    FROM [dbo].[MasterEmployee] 
                    WHERE DocumentEmployeeNo = @DocumentEmployeeNo AND EISPassword = @Password";
        var result = await Dapper.SqlMapper.QueryFirstOrDefaultAsync<EmployeeLookupDto>(
            conn, sql, new { DocumentEmployeeNo = documentEmployeeNo, Password = password });
        return result;
    }

    private async Task<List<(int Id, string RoleCode)>> GetUserRoles(string userType, string? employeeNo, int? securityUserId)
    {
        var query = _db.UserRoles
            .Include(ur => ur.Role)
            .Where(ur => ur.UserType == userType && ur.IsActive && ur.Role.IsActive);

        if (userType == "Employee")
            query = query.Where(ur => ur.EmployeeNo == employeeNo);
        else
            query = query.Where(ur => ur.SecurityUserId == securityUserId);

        return await query.Select(ur => new { ur.Role.Id, ur.Role.RoleCode })
            .ToListAsync()
            .ContinueWith(t => t.Result.Select(r => (r.Id, r.RoleCode)).ToList());
    }

    private async Task<List<string>> GetUserPermissions(List<int> roleIds)
    {
        return await _db.RolePermissions
            .Where(rp => roleIds.Contains(rp.RoleId) && rp.IsActive && rp.Permission.IsActive)
            .Select(rp => rp.Permission.PermissionCode)
            .Distinct()
            .ToListAsync();
    }

    private async Task<List<MenuItemDto>> GetUserMenus(List<string> roleCodes)
    {
        var roleIds = await _db.Roles
            .Where(r => roleCodes.Contains(r.RoleCode) && r.IsActive)
            .Select(r => r.Id)
            .ToListAsync();

        var menuIds = await _db.RoleMenus
            .Where(rm => roleIds.Contains(rm.RoleId) && rm.IsActive)
            .Select(rm => rm.MenuId)
            .Distinct()
            .ToListAsync();

        var allMenus = await _db.Menus
            .Where(m => menuIds.Contains(m.Id) && m.IsActive && m.IsVisible)
            .OrderBy(m => m.SortOrder)
            .ToListAsync();

        // Build tree
        var rootMenus = allMenus.Where(m => m.ParentId == null).ToList();
        var menuTree = new List<MenuItemDto>();
        foreach (var menu in rootMenus)
        {
            var item = MapToMenuDto(menu);
            item.Children = allMenus
                .Where(m => m.ParentId == menu.Id)
                .OrderBy(m => m.SortOrder)
                .Select(MapToMenuDto)
                .ToList();
            menuTree.Add(item);
        }
        return menuTree;
    }

    private MenuItemDto MapToMenuDto(Core.Entities.Menu menu) => new()
    {
        Id = menu.Id,
        ParentId = menu.ParentId,
        MenuCode = menu.MenuCode,
        MenuName = menu.MenuName,
        Icon = menu.Icon,
        Route = menu.Route,
        ModuleCode = menu.ModuleCode,
        SortOrder = menu.SortOrder
    };

    private async Task<ScopeFilterDto> GetUserScope(string userType, string? employeeNo, int? securityUserId)
    {
        var scope = await _db.UserScopeFilters
            .Where(sf => sf.UserType == userType && sf.IsActive &&
                (userType == "Employee" ? sf.EmployeeNo == employeeNo : sf.SecurityUserId == securityUserId))
            .FirstOrDefaultAsync();

        return scope != null
            ? new ScopeFilterDto { ScopeType = scope.ScopeType, ScopeValue = scope.ScopeValue }
            : new ScopeFilterDto { ScopeType = "Self" };
    }

    private async Task<UserPreferenceDto> GetUserPreferences(string userType, string? employeeNo, int? securityUserId)
    {
        var pref = await _db.UserPreferences
            .Where(p => p.UserType == userType &&
                (userType == "Employee" ? p.EmployeeNo == employeeNo : p.SecurityUserId == securityUserId))
            .FirstOrDefaultAsync();

        return pref != null
            ? new UserPreferenceDto
            {
                ThemeMode = pref.ThemeMode,
                SidebarCollapsed = pref.SidebarCollapsed,
                DefaultPageSize = pref.DefaultPageSize,
                DashboardLayout = pref.DashboardLayout
            }
            : new UserPreferenceDto();
    }

    private string HashPassword(string password, string salt)
    {
        // BCrypt hashing (salt is embedded in the hash)
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }

    /// <summary>
    /// Verifies password against stored hash. Supports both BCrypt (new) and SHA256 (legacy).
    /// If legacy SHA256 hash matches, auto-upgrades to BCrypt.
    /// </summary>
    private bool VerifyPassword(string password, string storedHash, string salt, Core.Entities.SecurityUser? user = null)
    {
        // Try BCrypt first (new format starts with $2)
        if (storedHash.StartsWith("$2"))
        {
            return BCrypt.Net.BCrypt.Verify(password, storedHash);
        }

        // Fallback: legacy SHA256 check
        using var sha256 = SHA256.Create();
        var bytes = Encoding.Unicode.GetBytes(password + salt);
        var hash = sha256.ComputeHash(bytes);
        var sha256Hash = BitConverter.ToString(hash).Replace("-", "").ToUpperInvariant();

        if (sha256Hash == storedHash)
        {
            // Auto-upgrade to BCrypt on successful legacy login
            if (user != null)
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
            }
            return true;
        }

        return false;
    }

    private async Task LogLoginAttempt(string userType, string username, string ipAddress, string userAgent, bool success, string? failureReason)
    {
        _db.LoginAudits.Add(new Core.Entities.LoginAudit
        {
            UserType = userType,
            Username = username,
            IPAddress = ipAddress,
            UserAgent = userAgent,
            IsSuccess = success,
            FailureReason = failureReason
        });
        await _db.SaveChangesAsync();
    }

    public Task LogoutAsync(string token) => Task.CompletedTask; // Token invalidation via client-side

    public Task<LoginResponse> RefreshTokenAsync(string refreshToken)
    {
        // Simplified refresh - in production, use refresh token storage
        return Task.FromResult(new LoginResponse { Success = false, ErrorMessage = "Refresh not implemented" });
    }
}
