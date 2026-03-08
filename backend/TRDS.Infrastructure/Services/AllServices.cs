using Microsoft.EntityFrameworkCore;
using TRDS.Core.DTOs;
using TRDS.Core.Interfaces;
using TRDS.Infrastructure.Data;

namespace TRDS.Infrastructure.Services;

// =====================================================================
// MENU SERVICE
// =====================================================================
public class MenuService : IMenuService
{
    private readonly AppDbContext _db;
    public MenuService(AppDbContext db) => _db = db;

    public async Task<List<MenuItemDto>> GetUserMenuAsync(List<string> roleCodes)
    {
        var roleIds = await _db.Roles.Where(r => roleCodes.Contains(r.RoleCode) && r.IsActive)
            .Select(r => r.Id).ToListAsync();

        var menuIds = await _db.RoleMenus.Where(rm => roleIds.Contains(rm.RoleId))
            .Select(rm => rm.MenuId).Distinct().ToListAsync();

        var menus = await _db.Menus.Where(m => menuIds.Contains(m.Id) && m.IsActive)
            .OrderBy(m => m.SortOrder).ToListAsync();

        return menus.Where(m => m.ParentId == null).Select(m => MapToMenuDto(m, menus)).ToList();
    }

    public async Task<List<MenuItemDto>> GetAllMenusAsync()
    {
        var menus = await _db.Menus.OrderBy(m => m.SortOrder).ToListAsync();
        return menus.Where(m => m.ParentId == null).Select(m => MapToMenuDto(m, menus)).ToList();
    }

    private MenuItemDto MapToMenuDto(Core.Entities.Menu m, List<Core.Entities.Menu> allMenus)
    {
        return new MenuItemDto
        {
            Id = m.Id,
            MenuCode = m.MenuCode,
            MenuName = m.MenuName,
            Icon = m.Icon,
            Route = m.Route,
            SortOrder = m.SortOrder,
            Children = allMenus.Where(c => c.ParentId == m.Id && c.IsActive)
                .OrderBy(c => c.SortOrder)
                .Select(c => MapToMenuDto(c, allMenus)).ToList()
        };
    }

    public async Task<MenuItemDto> CreateMenuAsync(MenuItemDto menu, string userId)
    {
        var entity = new Core.Entities.Menu
        {
            MenuCode = menu.MenuCode, MenuName = menu.MenuName, Icon = menu.Icon,
            Route = menu.Route, ParentId = null, SortOrder = menu.SortOrder,
            IsActive = true, CreatedBy = userId
        };
        _db.Menus.Add(entity);
        await _db.SaveChangesAsync();
        return MapToMenuDto(entity, new List<Core.Entities.Menu>());
    }

    public async Task<MenuItemDto> UpdateMenuAsync(int id, MenuItemDto menu, string userId)
    {
        var entity = await _db.Menus.FindAsync(id)
            ?? throw new KeyNotFoundException($"Menu {id} not found");
        entity.MenuName = menu.MenuName; entity.Icon = menu.Icon; entity.Route = menu.Route;
        entity.SortOrder = menu.SortOrder;
        entity.ModifiedBy = userId; entity.ModifiedDate = DateTime.Now;
        await _db.SaveChangesAsync();
        return MapToMenuDto(entity, new List<Core.Entities.Menu>());
    }

    public async Task DeleteMenuAsync(int id, string userId)
    {
        var entity = await _db.Menus.FindAsync(id)
            ?? throw new KeyNotFoundException($"Menu {id} not found");
        entity.IsActive = false; entity.ModifiedBy = userId; entity.ModifiedDate = DateTime.Now;
        await _db.SaveChangesAsync();
    }
}

// =====================================================================
// SETTINGS SERVICE
// =====================================================================
public class SettingsService : ISettingsService
{
    private readonly AppDbContext _db;
    public SettingsService(AppDbContext db) => _db = db;

    public async Task<UserPreferenceDto> GetPreferencesAsync(string userType, string? employeeNo, int? securityUserId)
    {
        var pref = await _db.UserPreferences.FirstOrDefaultAsync(p =>
            p.UserType == userType &&
            (employeeNo != null ? p.EmployeeNo == employeeNo : p.SecurityUserId == securityUserId));

        return pref != null
            ? new UserPreferenceDto { ThemeMode = pref.ThemeMode, SidebarCollapsed = pref.SidebarCollapsed, DefaultPageSize = pref.DefaultPageSize }
            : new UserPreferenceDto();
    }

    public async Task SavePreferencesAsync(string userType, string? employeeNo, int? securityUserId, UserPreferenceDto preferences)
    {
        var pref = await _db.UserPreferences.FirstOrDefaultAsync(p =>
            p.UserType == userType &&
            (employeeNo != null ? p.EmployeeNo == employeeNo : p.SecurityUserId == securityUserId));

        if (pref == null)
        {
            pref = new Core.Entities.UserPreference
            {
                UserType = userType, EmployeeNo = employeeNo, SecurityUserId = securityUserId,
                ThemeMode = preferences.ThemeMode, SidebarCollapsed = preferences.SidebarCollapsed,
                DefaultPageSize = preferences.DefaultPageSize
            };
            _db.UserPreferences.Add(pref);
        }
        else
        {
            pref.ThemeMode = preferences.ThemeMode;
            pref.SidebarCollapsed = preferences.SidebarCollapsed;
            pref.DefaultPageSize = preferences.DefaultPageSize;
        }
        await _db.SaveChangesAsync();
    }
}

// =====================================================================
// SCOPE FILTER SERVICE
// =====================================================================
public class ScopeFilterService : IScopeFilterService
{
    private readonly AppDbContext _db;
    public ScopeFilterService(AppDbContext db) => _db = db;

    public async Task<ScopeFilterDto> GetUserScopeAsync(string userType, string employeeNo, int? securityUserId)
    {
        var filter = await _db.UserScopeFilters.FirstOrDefaultAsync(f =>
            f.UserType == userType &&
            (securityUserId != null ? f.SecurityUserId == securityUserId : f.EmployeeNo == employeeNo));

        return new ScopeFilterDto
        {
            ScopeType = filter?.ScopeType ?? (userType == "SuperUser" ? "All" : "Self"),
            ScopeValue = filter?.ScopeValue
        };
    }

    public string BuildScopeWhereClause(ScopeFilterDto scope, string employeeNoColumn = "EmployeeNo")
    {
        return scope.ScopeType switch
        {
            "All" => "1=1",
            "Department" => $"{employeeNoColumn} IN (SELECT EmployeeNo FROM EmployeeHierarchy WHERE DepartmentId IN ({scope.ScopeValue}))",
            "Cluster" => $"{employeeNoColumn} IN (SELECT EmployeeNo FROM EmployeeHierarchy WHERE ClusterId IN ({scope.ScopeValue}))",
            "DirectReports" => $"{employeeNoColumn} IN (SELECT EmployeeNo FROM EmployeeHierarchy WHERE ManagerEmployeeNo = '{scope.ScopeValue}')",
            _ => $"{employeeNoColumn} = '{scope.ScopeValue}'"
        };
    }

    public async Task<List<string>> GetFilteredEmployeeNosAsync(ScopeFilterDto scope)
    {
        if (scope.ScopeType == "All")
            return await _db.EmployeeHierarchies.Select(e => e.EmployeeNo).ToListAsync();

        if (scope.ScopeType == "Self")
            return scope.ScopeValue != null ? new List<string> { scope.ScopeValue } : new List<string>();

        return await _db.EmployeeHierarchies
            .Where(e => scope.ScopeType == "Department"
                ? e.DepartmentId.ToString() == scope.ScopeValue
                : scope.ScopeType == "Cluster"
                    ? e.ClusterId.ToString() == scope.ScopeValue
                    : e.ManagerEmployeeNo == scope.ScopeValue)
            .Select(e => e.EmployeeNo)
            .ToListAsync();
    }
}

// =====================================================================
// EMPLOYEE SERVICE
// =====================================================================
public class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _db;
    public EmployeeService(AppDbContext db) => _db = db;

    public async Task<PagedResponse<EmployeeLookupDto>> GetEmployeesAsync(PagedRequest request, ScopeFilterDto scope)
    {
        var query = _db.EmployeeHierarchies
            .Include(e => e.Department).Include(e => e.Designation)
            .Include(e => e.Cluster).Include(e => e.Location).AsQueryable();

        if (!string.IsNullOrEmpty(request.SearchTerm))
            query = query.Where(e => e.EmployeeNo.Contains(request.SearchTerm));

        var total = await query.CountAsync();
        var items = await query.OrderBy(e => e.EmployeeNo)
            .Skip((request.Page - 1) * request.PageSize).Take(request.PageSize)
            .Select(e => new EmployeeLookupDto
            {
                EmployeeNo = e.EmployeeNo, EmployeeName = e.EmployeeNo,
                Department = e.Department != null ? e.Department.DepartmentName : null,
                Designation = e.Designation != null ? e.Designation.DesignationName : null,
                Cluster = e.Cluster != null ? e.Cluster.ClusterName : null,
                Location = e.Location != null ? e.Location.LocationName : null
            }).ToListAsync();

        return new PagedResponse<EmployeeLookupDto> { Items = items, TotalCount = total, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task<EmployeeLookupDto?> GetEmployeeByNoAsync(string employeeNo)
    {
        return await _db.EmployeeHierarchies
            .Include(e => e.Department).Include(e => e.Designation)
            .Where(e => e.EmployeeNo == employeeNo)
            .Select(e => new EmployeeLookupDto
            {
                EmployeeNo = e.EmployeeNo, EmployeeName = e.EmployeeNo,
                Department = e.Department != null ? e.Department.DepartmentName : null,
                Designation = e.Designation != null ? e.Designation.DesignationName : null
            }).FirstOrDefaultAsync();
    }

    public async Task<List<EmployeeLookupDto>> SearchEmployeesAsync(string searchTerm, ScopeFilterDto scope, int maxResults = 20)
    {
        return await _db.EmployeeHierarchies
            .Include(e => e.Department)
            .Where(e => e.EmployeeNo.Contains(searchTerm))
            .OrderBy(e => e.EmployeeNo).Take(maxResults)
            .Select(e => new EmployeeLookupDto
            {
                EmployeeNo = e.EmployeeNo, EmployeeName = e.EmployeeNo,
                Department = e.Department != null ? e.Department.DepartmentName : null
            }).ToListAsync();
    }
}

// =====================================================================
// NOTIFICATION SERVICE
// =====================================================================
public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    public NotificationService(AppDbContext db) => _db = db;

    public async Task<PagedResponse<NotificationDto>> GetNotificationsAsync(string employeeNo, PagedRequest request)
    {
        var query = _db.NotificationLogs.Where(n => n.RecipientEmployeeNo == employeeNo);

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(n => n.CreatedDate)
            .Skip((request.Page - 1) * request.PageSize).Take(request.PageSize)
            .Select(n => new NotificationDto
            {
                Id = n.Id, NotificationType = n.NotificationType, Title = n.Title,
                Message = n.Message, ReferenceType = n.ReferenceType, ReferenceId = n.ReferenceId,
                IsRead = n.IsRead, CreatedDate = n.CreatedDate
            }).ToListAsync();

        return new PagedResponse<NotificationDto> { Items = items, TotalCount = total, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task<int> GetUnreadCountAsync(string employeeNo)
    {
        return await _db.NotificationLogs.CountAsync(n => n.RecipientEmployeeNo == employeeNo && !n.IsRead);
    }

    public async Task MarkAsReadAsync(long notificationId, string employeeNo)
    {
        var notif = await _db.NotificationLogs.FirstOrDefaultAsync(n => n.Id == notificationId && n.RecipientEmployeeNo == employeeNo);
        if (notif != null) { notif.IsRead = true; notif.ReadDate = DateTime.Now; await _db.SaveChangesAsync(); }
    }

    public async Task MarkAllAsReadAsync(string employeeNo)
    {
        var unread = await _db.NotificationLogs.Where(n => n.RecipientEmployeeNo == employeeNo && !n.IsRead).ToListAsync();
        unread.ForEach(n => { n.IsRead = true; n.ReadDate = DateTime.Now; });
        await _db.SaveChangesAsync();
    }

    public async Task CreateNotificationAsync(string recipientEmployeeNo, string type, string title, string? message, string? refType = null, int? refId = null)
    {
        _db.NotificationLogs.Add(new Core.Entities.NotificationLog
        {
            RecipientEmployeeNo = recipientEmployeeNo, NotificationType = type,
            Title = title, Message = message, ReferenceType = refType, ReferenceId = refId
        });
        await _db.SaveChangesAsync();
    }
}

// =====================================================================
// APPROVAL SERVICE
// =====================================================================
public class ApprovalService : IApprovalService
{
    private readonly AppDbContext _db;
    public ApprovalService(AppDbContext db) => _db = db;

    public async Task<PagedResponse<ApprovalDto>> GetPendingApprovalsAsync(string approverEmployeeNo, PagedRequest request)
    {
        var query = _db.TrainingApprovals.Where(a => a.ApproverEmployeeNo == approverEmployeeNo && a.Action == "Pending");

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(a => a.CreatedDate)
            .Skip((request.Page - 1) * request.PageSize).Take(request.PageSize)
            .Select(a => new ApprovalDto
            {
                Id = a.Id, ReferenceType = a.ReferenceType, ReferenceId = a.ReferenceId,
                RequestedBy = a.RequestedByEmployeeNo, ApproverEmployeeNo = a.ApproverEmployeeNo,
                ApprovalLevel = a.ApprovalLevel, Action = a.Action,
                Remarks = a.Remarks, ActionDate = a.ActionDate, CreatedDate = a.CreatedDate
            }).ToListAsync();

        return new PagedResponse<ApprovalDto> { Items = items, TotalCount = total, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task<ApprovalDto> ProcessApprovalAsync(int approvalId, ApprovalActionRequest request, string approverEmployeeNo)
    {
        var approval = await _db.TrainingApprovals.FindAsync(approvalId)
            ?? throw new KeyNotFoundException($"Approval {approvalId} not found");

        if (approval.ApproverEmployeeNo != approverEmployeeNo)
            throw new UnauthorizedAccessException("Not authorized to process this approval.");

        approval.Action = request.Action;
        approval.Remarks = request.Remarks;
        approval.ActionDate = DateTime.Now;
        await _db.SaveChangesAsync();

        return new ApprovalDto
        {
            Id = approval.Id, ReferenceType = approval.ReferenceType, ReferenceId = approval.ReferenceId,
            Action = approval.Action, Remarks = approval.Remarks, ActionDate = approval.ActionDate
        };
    }

    public async Task<List<ApprovalDto>> GetApprovalHistoryAsync(string referenceType, int referenceId)
    {
        return await _db.TrainingApprovals
            .Where(a => a.ReferenceType == referenceType && a.ReferenceId == referenceId)
            .OrderBy(a => a.ApprovalLevel).ThenByDescending(a => a.CreatedDate)
            .Select(a => new ApprovalDto
            {
                Id = a.Id, ReferenceType = a.ReferenceType, ReferenceId = a.ReferenceId,
                RequestedBy = a.RequestedByEmployeeNo,
                ApprovalLevel = a.ApprovalLevel, Action = a.Action, Remarks = a.Remarks,
                ActionDate = a.ActionDate, CreatedDate = a.CreatedDate
            }).ToListAsync();
    }
}

// =====================================================================
// SCHEDULE SERVICE
// =====================================================================
public class ScheduleService : IScheduleService
{
    private readonly AppDbContext _db;
    public ScheduleService(AppDbContext db) => _db = db;

    public async Task<PagedResponse<ScheduleDto>> GetSchedulesAsync(PagedRequest request, ScopeFilterDto? scope = null)
    {
        var query = _db.TrainingSchedules.Include(s => s.Training).Include(s => s.Attendances).AsQueryable();

        if (!string.IsNullOrEmpty(request.SearchTerm))
            query = query.Where(s => (s.SessionTitle != null && s.SessionTitle.Contains(request.SearchTerm)) ||
                                     s.Training.Title.Contains(request.SearchTerm));

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(s => s.StartDateTime)
            .Skip((request.Page - 1) * request.PageSize).Take(request.PageSize)
            .Select(s => new ScheduleDto
            {
                Id = s.Id, ScheduleCode = s.ScheduleCode, SessionTitle = s.SessionTitle,
                TrainingTitle = s.Training.Title, Venue = s.Venue, MeetingLink = s.MeetingLink,
                TrainerName = s.TrainerName, StartDateTime = s.StartDateTime,
                EndDateTime = s.EndDateTime, Capacity = s.Capacity,
                EnrolledCount = s.Attendances.Count, Status = s.Status
            }).ToListAsync();

        return new PagedResponse<ScheduleDto> { Items = items, TotalCount = total, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task<ScheduleDto> CreateScheduleAsync(CreateScheduleRequest request, string userId)
    {
        var entity = new Core.Entities.TrainingSchedule
        {
            TrainingId = request.TrainingId, ScheduleCode = request.ScheduleCode,
            SessionTitle = request.SessionTitle, Venue = request.Venue,
            MeetingLink = request.MeetingLink, TrainerName = request.TrainerName,
            TrainerEmployeeNo = request.TrainerEmployeeNo,
            StartDateTime = request.StartDateTime, EndDateTime = request.EndDateTime,
            Capacity = request.Capacity, CreatedBy = userId
        };
        _db.TrainingSchedules.Add(entity);
        await _db.SaveChangesAsync();

        return new ScheduleDto
        {
            Id = entity.Id, ScheduleCode = entity.ScheduleCode, SessionTitle = entity.SessionTitle,
            Venue = entity.Venue, StartDateTime = entity.StartDateTime, EndDateTime = entity.EndDateTime,
            Status = entity.Status
        };
    }

    public async Task<ScheduleDto> UpdateScheduleAsync(int id, CreateScheduleRequest request, string userId)
    {
        var entity = await _db.TrainingSchedules.FindAsync(id)
            ?? throw new KeyNotFoundException($"Schedule {id} not found");
        entity.SessionTitle = request.SessionTitle; entity.Venue = request.Venue;
        entity.MeetingLink = request.MeetingLink; entity.TrainerName = request.TrainerName;
        entity.StartDateTime = request.StartDateTime; entity.EndDateTime = request.EndDateTime;
        entity.Capacity = request.Capacity; entity.ModifiedBy = userId; entity.ModifiedDate = DateTime.Now;
        await _db.SaveChangesAsync();
        return new ScheduleDto { Id = entity.Id, ScheduleCode = entity.ScheduleCode, Status = entity.Status };
    }

    public async Task DeleteScheduleAsync(int id, string userId)
    {
        var entity = await _db.TrainingSchedules.FindAsync(id)
            ?? throw new KeyNotFoundException($"Schedule {id} not found");
        entity.Status = "Cancelled"; entity.ModifiedBy = userId; entity.ModifiedDate = DateTime.Now;
        await _db.SaveChangesAsync();
    }
}

// =====================================================================
// CERTIFICATE SERVICE
// =====================================================================
public class CertificateService : ICertificateService
{
    private readonly AppDbContext _db;
    public CertificateService(AppDbContext db) => _db = db;

    public async Task<PagedResponse<CertificateDto>> GetCertificatesAsync(string employeeNo, PagedRequest request, ScopeFilterDto? scope = null)
    {
        var query = _db.TrainingCertificates.Include(c => c.Training).AsQueryable();

        if (scope?.ScopeType != "All")
            query = query.Where(c => c.EmployeeNo == employeeNo);

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(c => c.IssueDate)
            .Skip((request.Page - 1) * request.PageSize).Take(request.PageSize)
            .Select(c => new CertificateDto
            {
                Id = c.Id, CertificateNumber = c.CertificateNumber,
                TrainingTitle = c.Training.Title, EmployeeNo = c.EmployeeNo,
                IssueDate = c.IssueDate, ExpiryDate = c.ExpiryDate, Status = c.Status,
                DaysToExpiry = c.ExpiryDate != null ? (int?)(c.ExpiryDate.Value - DateTime.Now).TotalDays : null
            }).ToListAsync();

        return new PagedResponse<CertificateDto> { Items = items, TotalCount = total, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task<CertificateDto> IssueCertificateAsync(int trainingId, string employeeNo, DateTime issueDate, DateTime? expiryDate, string issuedBy)
    {
        var certNumber = $"CERT-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        var entity = new Core.Entities.TrainingCertificate
        {
            CertificateNumber = certNumber, TrainingId = trainingId, EmployeeNo = employeeNo,
            IssueDate = issueDate, ExpiryDate = expiryDate, IssuedByEmployeeNo = issuedBy
        };
        _db.TrainingCertificates.Add(entity);
        await _db.SaveChangesAsync();
        return new CertificateDto { Id = entity.Id, CertificateNumber = certNumber, EmployeeNo = employeeNo, IssueDate = issueDate, ExpiryDate = expiryDate };
    }
}

// =====================================================================
// REPORT SERVICE
// =====================================================================
public class ReportService : IReportService
{
    private readonly AppDbContext _db;
    public ReportService(AppDbContext db) => _db = db;

    public async Task<ReportDataDto> GenerateReportAsync(ReportFilterRequest request, ScopeFilterDto scope)
    {
        var report = new ReportDataDto { ReportTitle = $"{request.ReportType} Report" };

        switch (request.ReportType)
        {
            case "TrainingCompletion":
                report.Columns = new List<ReportColumnDto>
                {
                    new() { Key = "trainingTitle", Label = "Training", Type = "string" },
                    new() { Key = "totalAssigned", Label = "Total Assigned", Type = "number" },
                    new() { Key = "completed", Label = "Completed", Type = "number" },
                    new() { Key = "completionRate", Label = "Completion Rate", Type = "percent" }
                };

                var trainings = await _db.TrainingAssignments
                    .Include(a => a.Training).Include(a => a.Details)
                    .Where(a => request.DateFrom == null || a.CreatedDate >= request.DateFrom)
                    .Where(a => request.DateTo == null || a.CreatedDate <= request.DateTo)
                    .ToListAsync();

                report.Rows = trainings.Select(a => new Dictionary<string, object>
                {
                    ["trainingTitle"] = a.Training?.Title ?? "Unknown",
                    ["totalAssigned"] = a.Details.Count,
                    ["completed"] = a.Details.Count(d => d.Status == "Completed"),
                    ["completionRate"] = a.Details.Count > 0
                        ? Math.Round(a.Details.Count(d => d.Status == "Completed") * 100.0 / a.Details.Count, 1) : 0
                }).ToList();

                report.Summary = new Dictionary<string, object>
                {
                    ["totalTrainings"] = trainings.Count,
                    ["totalAssigned"] = trainings.Sum(a => a.Details.Count),
                    ["totalCompleted"] = trainings.Sum(a => a.Details.Count(d => d.Status == "Completed"))
                };
                break;

            default:
                report.ReportTitle = "General Training Report";
                report.Columns = new List<ReportColumnDto>
                {
                    new() { Key = "metric", Label = "Metric", Type = "string" },
                    new() { Key = "value", Label = "Value", Type = "number" }
                };
                var stats = new Dictionary<string, int>
                {
                    ["Total Trainings"] = await _db.TrainingMasters.CountAsync(t => t.IsActive),
                    ["Total Assignments"] = await _db.TrainingAssignments.CountAsync(),
                    ["Total Schedules"] = await _db.TrainingSchedules.CountAsync(),
                    ["Active Certificates"] = await _db.TrainingCertificates.CountAsync(c => c.Status == "Active")
                };
                report.Rows = stats.Select(s => new Dictionary<string, object> { ["metric"] = s.Key, ["value"] = s.Value }).ToList();
                break;
        }
        return report;
    }
}

// =====================================================================
// AUDIT SERVICE
// =====================================================================
public class AuditService : IAuditService
{
    private readonly AppDbContext _db;
    public AuditService(AppDbContext db) => _db = db;

    public async Task<PagedResponse<AuditLogDto>> GetAuditLogsAsync(PagedRequest request)
    {
        var query = _db.ActivityAudits.AsQueryable();

        if (!string.IsNullOrEmpty(request.SearchTerm))
            query = query.Where(a => a.TableName.Contains(request.SearchTerm) ||
                                     a.Action.Contains(request.SearchTerm) ||
                                     a.UserId.Contains(request.SearchTerm));

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(a => a.Timestamp)
            .Skip((request.Page - 1) * request.PageSize).Take(request.PageSize)
            .Select(a => new AuditLogDto
            {
                Id = a.Id, TableName = a.TableName, RecordId = a.RecordId,
                Action = a.Action, OldValues = a.OldValues, NewValues = a.NewValues,
                UserId = a.UserId, Timestamp = a.Timestamp
            }).ToListAsync();

        return new PagedResponse<AuditLogDto> { Items = items, TotalCount = total, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task LogActivityAsync(string tableName, string recordId, string action, string? oldValues, string? newValues, string userId, string? ipAddress = null)
    {
        _db.ActivityAudits.Add(new Core.Entities.ActivityAudit
        {
            TableName = tableName, RecordId = recordId, Action = action,
            OldValues = oldValues, NewValues = newValues, UserId = userId, IPAddress = ipAddress
        });
        await _db.SaveChangesAsync();
    }
}

// =====================================================================
// USER MANAGEMENT SERVICE
// =====================================================================
public class UserManagementService : IUserManagementService
{
    private readonly AppDbContext _db;
    public UserManagementService(AppDbContext db) => _db = db;

    public async Task<PagedResponse<UserManagementDto>> GetUsersAsync(PagedRequest request)
    {
        var query = _db.UserRoles
            .Include(ur => ur.Role)
            .Include(ur => ur.SecurityUser)
            .AsQueryable();

        var grouped = await query.GroupBy(ur => new { ur.EmployeeNo, ur.UserType })
            .Select(g => new UserManagementDto
            {
                EmployeeNo = g.Key.EmployeeNo ?? "",
                EmployeeName = g.First().SecurityUser != null ? g.First().SecurityUser!.DisplayName : (g.Key.EmployeeNo ?? ""),
                Roles = g.Select(ur => ur.Role.RoleName).ToList(),
                ScopeType = "Self",
                IsActive = g.Any(ur => ur.IsActive)
            })
            .ToListAsync();

        if (!string.IsNullOrEmpty(request.SearchTerm))
            grouped = grouped.Where(u => u.EmployeeName.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                                         u.EmployeeNo.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase)).ToList();

        var total = grouped.Count;
        var items = grouped.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToList();

        return new PagedResponse<UserManagementDto> { Items = items, TotalCount = total, Page = request.Page, PageSize = request.PageSize };
    }

    public async Task AssignRolesAsync(string employeeNo, List<int> roleIds, string assignedBy)
    {
        var existing = await _db.UserRoles.Where(ur => ur.EmployeeNo == employeeNo).ToListAsync();
        _db.UserRoles.RemoveRange(existing);

        foreach (var roleId in roleIds)
        {
            _db.UserRoles.Add(new Core.Entities.UserRole
            {
                EmployeeNo = employeeNo, RoleId = roleId, UserType = "Employee",
                IsActive = true, AssignedDate = DateTime.Now, AssignedBy = assignedBy
            });
        }
        await _db.SaveChangesAsync();
    }

    public async Task UpdateScopeFilterAsync(string userType, string? employeeNo, int? securityUserId, string scopeType, string? scopeValue, string modifiedBy)
    {
        var filter = await _db.UserScopeFilters.FirstOrDefaultAsync(f =>
            f.UserType == userType &&
            (employeeNo != null ? f.EmployeeNo == employeeNo : f.SecurityUserId == securityUserId));

        if (filter == null)
        {
            _db.UserScopeFilters.Add(new Core.Entities.UserScopeFilter
            {
                UserType = userType, EmployeeNo = employeeNo, SecurityUserId = securityUserId,
                ScopeType = scopeType, ScopeValue = scopeValue, ModifiedBy = modifiedBy
            });
        }
        else
        {
            filter.ScopeType = scopeType; filter.ScopeValue = scopeValue;
            filter.ModifiedBy = modifiedBy; filter.ModifiedDate = DateTime.Now;
        }
        await _db.SaveChangesAsync();
    }
}

// =====================================================================
// ROLE MANAGEMENT SERVICE
// =====================================================================
public class RoleManagementService : IRoleManagementService
{
    private readonly AppDbContext _db;
    public RoleManagementService(AppDbContext db) => _db = db;

    public async Task<List<RoleDto>> GetRolesAsync()
    {
        return await _db.Roles.OrderBy(r => r.SortOrder)
            .Select(r => new RoleDto
            {
                Id = r.Id, RoleCode = r.RoleCode, RoleName = r.RoleName,
                Description = r.Description, IsSystemRole = r.IsSystemRole, IsActive = r.IsActive,
                UserCount = r.UserRoles.Count(ur => ur.IsActive),
                Permissions = r.RolePermissions.Select(rp => rp.Permission.PermissionCode).ToList()
            }).ToListAsync();
    }

    public async Task<RoleDto> CreateRoleAsync(RoleDto role, string userId)
    {
        var entity = new Core.Entities.Role
        {
            RoleCode = role.RoleCode, RoleName = role.RoleName, Description = role.Description,
            IsSystemRole = false, IsActive = true, SortOrder = role.Id, CreatedBy = userId
        };
        _db.Roles.Add(entity);
        await _db.SaveChangesAsync();
        return new RoleDto { Id = entity.Id, RoleCode = entity.RoleCode, RoleName = entity.RoleName, IsActive = true };
    }

    public async Task<RoleDto> UpdateRoleAsync(int id, RoleDto role, string userId)
    {
        var entity = await _db.Roles.FindAsync(id)
            ?? throw new KeyNotFoundException($"Role {id} not found");
        entity.RoleName = role.RoleName; entity.Description = role.Description;
        entity.IsActive = role.IsActive; entity.ModifiedBy = userId; entity.ModifiedDate = DateTime.Now;
        await _db.SaveChangesAsync();
        return new RoleDto { Id = entity.Id, RoleCode = entity.RoleCode, RoleName = entity.RoleName, IsActive = entity.IsActive };
    }

    public async Task AssignPermissionsAsync(int roleId, List<int> permissionIds, string userId)
    {
        var existing = await _db.RolePermissions.Where(rp => rp.RoleId == roleId).ToListAsync();
        _db.RolePermissions.RemoveRange(existing);
        foreach (var permId in permissionIds)
            _db.RolePermissions.Add(new Core.Entities.RolePermission { RoleId = roleId, PermissionId = permId });
        await _db.SaveChangesAsync();
    }

    public async Task AssignMenusAsync(int roleId, List<int> menuIds, string userId)
    {
        var existing = await _db.RoleMenus.Where(rm => rm.RoleId == roleId).ToListAsync();
        _db.RoleMenus.RemoveRange(existing);
        foreach (var menuId in menuIds)
            _db.RoleMenus.Add(new Core.Entities.RoleMenu { RoleId = roleId, MenuId = menuId });
        await _db.SaveChangesAsync();
    }
}
