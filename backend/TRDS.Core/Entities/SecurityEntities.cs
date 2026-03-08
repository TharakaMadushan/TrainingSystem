namespace TRDS.Core.Entities;

public class SecurityUser
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Salt { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsLocked { get; set; }
    public int FailedLoginAttempts { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public DateTime? LockoutEndDate { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public string CreatedBy { get; set; } = "SYSTEM";
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<UserScopeFilter> UserScopeFilters { get; set; } = new List<UserScopeFilter>();
}

public class Role
{
    public int Id { get; set; }
    public string RoleCode { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystemRole { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public string CreatedBy { get; set; } = "SYSTEM";
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RoleMenu> RoleMenus { get; set; } = new List<RoleMenu>();
}

public class Permission
{
    public int Id { get; set; }
    public string PermissionCode { get; set; } = string.Empty;
    public string PermissionName { get; set; } = string.Empty;
    public string ModuleCode { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class UserRole
{
    public int Id { get; set; }
    public string UserType { get; set; } = string.Empty;
    public string? EmployeeNo { get; set; }
    public int? SecurityUserId { get; set; }
    public int RoleId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime AssignedDate { get; set; } = DateTime.Now;
    public string AssignedBy { get; set; } = "SYSTEM";

    public SecurityUser? SecurityUser { get; set; }
    public Role Role { get; set; } = null!;
}

public class RolePermission
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public int PermissionId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime AssignedDate { get; set; } = DateTime.Now;
    public string AssignedBy { get; set; } = "SYSTEM";

    public Role Role { get; set; } = null!;
    public Permission Permission { get; set; } = null!;
}

public class Menu
{
    public int Id { get; set; }
    public int? ParentId { get; set; }
    public string MenuCode { get; set; } = string.Empty;
    public string MenuName { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Route { get; set; }
    public string? ModuleCode { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsVisible { get; set; } = true;
    public string? Description { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public string CreatedBy { get; set; } = "SYSTEM";
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }

    public Menu? Parent { get; set; }
    public ICollection<Menu> Children { get; set; } = new List<Menu>();
    public ICollection<RoleMenu> RoleMenus { get; set; } = new List<RoleMenu>();
}

public class RoleMenu
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public int MenuId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime AssignedDate { get; set; } = DateTime.Now;
    public string AssignedBy { get; set; } = "SYSTEM";

    public Role Role { get; set; } = null!;
    public Menu Menu { get; set; } = null!;
}

public class UserScopeFilter
{
    public int Id { get; set; }
    public string UserType { get; set; } = string.Empty;
    public string? EmployeeNo { get; set; }
    public int? SecurityUserId { get; set; }
    public string ScopeType { get; set; } = "Self";
    public string? ScopeValue { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.Now;
    public string CreatedBy { get; set; } = "SYSTEM";
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }

    public SecurityUser? SecurityUser { get; set; }
}

public class LoginAudit
{
    public long Id { get; set; }
    public string UserType { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }
    public bool IsSuccess { get; set; }
    public string? FailureReason { get; set; }
    public DateTime LoginDate { get; set; } = DateTime.Now;
}
