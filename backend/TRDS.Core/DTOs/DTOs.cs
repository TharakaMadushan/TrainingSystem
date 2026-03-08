namespace TRDS.Core.DTOs;

// =============== AUTH DTOs ===============
public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string LoginType { get; set; } = "Employee"; // Employee or SuperUser
    public bool RememberMe { get; set; }
}

public class LoginResponse
{
    public bool Success { get; set; }
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public UserProfileDto? Profile { get; set; }
    public string? ErrorMessage { get; set; }
}

public class UserProfileDto
{
    public string UserType { get; set; } = string.Empty;
    public string EmployeeNo { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public string? Department { get; set; }
    public string? Cluster { get; set; }
    public string? Location { get; set; }
    public string? ManagerEmployeeNo { get; set; }
    public string? ManagerName { get; set; }
    public string? Email { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public ScopeFilterDto? ScopeFilter { get; set; }
    public List<MenuItemDto> MenuItems { get; set; } = new();
    public UserPreferenceDto? Preferences { get; set; }
}

public class ScopeFilterDto
{
    public string ScopeType { get; set; } = "Self";
    public string? ScopeValue { get; set; }
}

public class UserPreferenceDto
{
    public string ThemeMode { get; set; } = "Light";
    public bool SidebarCollapsed { get; set; }
    public int DefaultPageSize { get; set; } = 20;
    public string? DashboardLayout { get; set; }
}

// =============== MENU DTOs ===============
public class MenuItemDto
{
    public int Id { get; set; }
    public int? ParentId { get; set; }
    public string MenuCode { get; set; } = string.Empty;
    public string MenuName { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Route { get; set; }
    public string? ModuleCode { get; set; }
    public int SortOrder { get; set; }
    public List<MenuItemDto> Children { get; set; } = new();
}

// =============== DASHBOARD DTOs ===============
public class DashboardResponse
{
    public List<DashboardWidgetDto> Widgets { get; set; } = new();
    public string UserRole { get; set; } = string.Empty;
}

public class DashboardWidgetDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // stat, chart, list, progress
    public object? Data { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public int Order { get; set; }
}

public class TrainingStatDto
{
    public int PendingCount { get; set; }
    public int OverdueCount { get; set; }
    public int CompletedCount { get; set; }
    public int InProgressCount { get; set; }
    public int TotalAssigned { get; set; }
    public decimal CompliancePercent { get; set; }
    public int PendingApprovals { get; set; }
    public int UpcomingSessions { get; set; }
    public int ExpiringCertificates { get; set; }
}

// =============== TRAINING DTOs ===============
public class TrainingDto
{
    public int Id { get; set; }
    public string TrainingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
    public int? CategoryId { get; set; }
    public string? Description { get; set; }
    public decimal? DurationHours { get; set; }
    public string TrainingMode { get; set; } = "Online";
    public string? TrainerName { get; set; }
    public int? ValidityMonths { get; set; }
    public int? RetrainingIntervalMonths { get; set; }
    public bool IsMandatory { get; set; }
    public decimal? PassMark { get; set; }
    public int? MaxAttempts { get; set; }
    public bool IsActive { get; set; }
}

public class CreateTrainingRequest
{
    public string TrainingCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string? Description { get; set; }
    public decimal? DurationHours { get; set; }
    public string TrainingMode { get; set; } = "Online";
    public string? TrainerName { get; set; }
    public string? TrainerEmployeeNo { get; set; }
    public int? ValidityMonths { get; set; }
    public int? RetrainingIntervalMonths { get; set; }
    public bool IsMandatory { get; set; }
    public decimal? PassMark { get; set; }
    public int? MaxAttempts { get; set; }
}

// =============== ASSIGNMENT DTOs ===============
public class AssignmentDto
{
    public int Id { get; set; }
    public string TrainingTitle { get; set; } = string.Empty;
    public string TrainingCode { get; set; } = string.Empty;
    public string AssignmentType { get; set; } = string.Empty;
    public string AssignedBy { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public string Priority { get; set; } = "Normal";
    public bool IsMandatory { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TotalAssigned { get; set; }
    public int CompletedCount { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class AssignmentDetailDto
{
    public int Id { get; set; }
    public string EmployeeNo { get; set; } = string.Empty;
    public string? EmployeeName { get; set; }
    public string? Department { get; set; }
    public string Status { get; set; } = "NotStarted";
    public decimal CompletionPercent { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public decimal? Score { get; set; }
    public bool? IsPassed { get; set; }
}

public class CreateAssignmentRequest
{
    public int TrainingId { get; set; }
    public string AssignmentType { get; set; } = "Individual";
    public List<string>? EmployeeNos { get; set; }
    public List<int>? DepartmentIds { get; set; }
    public List<int>? DesignationIds { get; set; }
    public List<int>? ClusterIds { get; set; }
    public DateTime? DueDate { get; set; }
    public string Priority { get; set; } = "Normal";
    public bool IsMandatory { get; set; }
    public bool IsRecurring { get; set; }
    public int? RecurrenceMonths { get; set; }
    public string? Notes { get; set; }
}

// =============== APPROVAL DTOs ===============
public class ApprovalDto
{
    public int Id { get; set; }
    public string ReferenceType { get; set; } = string.Empty;
    public int ReferenceId { get; set; }
    public string RequestedBy { get; set; } = string.Empty;
    public string RequestedByName { get; set; } = string.Empty;
    public string ApproverEmployeeNo { get; set; } = string.Empty;
    public int ApprovalLevel { get; set; }
    public string Action { get; set; } = "Pending";
    public string? Remarks { get; set; }
    public DateTime? ActionDate { get; set; }
    public DateTime CreatedDate { get; set; }
    public string? TrainingTitle { get; set; }
}

public class ApprovalActionRequest
{
    public string Action { get; set; } = string.Empty; // Approved, Rejected, OnHold, Returned
    public string? Remarks { get; set; }
}

// =============== SCHEDULE DTOs ===============
public class ScheduleDto
{
    public int Id { get; set; }
    public string ScheduleCode { get; set; } = string.Empty;
    public string? SessionTitle { get; set; }
    public string TrainingTitle { get; set; } = string.Empty;
    public string? Venue { get; set; }
    public string? MeetingLink { get; set; }
    public string? TrainerName { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public int? Capacity { get; set; }
    public int EnrolledCount { get; set; }
    public string Status { get; set; } = "Scheduled";
}

public class CreateScheduleRequest
{
    public int TrainingId { get; set; }
    public string ScheduleCode { get; set; } = string.Empty;
    public string? SessionTitle { get; set; }
    public string? Venue { get; set; }
    public string? MeetingLink { get; set; }
    public string? TrainerName { get; set; }
    public string? TrainerEmployeeNo { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public int? Capacity { get; set; }
}

// =============== EMPLOYEE LOOKUP DTOs ===============
public class EmployeeLookupDto
{
    public string EmployeeNo { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Designation { get; set; }
    public string? Cluster { get; set; }
    public string? Location { get; set; }
}

// =============== NOTIFICATION DTOs ===============
public class NotificationDto
{
    public long Id { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Message { get; set; }
    public string? ReferenceType { get; set; }
    public int? ReferenceId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedDate { get; set; }
}

// =============== AUDIT DTOs ===============
public class AuditLogDto
{
    public long Id { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string RecordId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

// =============== ADMIN DTOs ===============
public class UserManagementDto
{
    public string EmployeeNo { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string? Department { get; set; }
    public List<string> Roles { get; set; } = new();
    public string ScopeType { get; set; } = "Self";
    public bool IsActive { get; set; }
}

public class RoleDto
{
    public int Id { get; set; }
    public string RoleCode { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystemRole { get; set; }
    public bool IsActive { get; set; }
    public int UserCount { get; set; }
    public List<string> Permissions { get; set; } = new();
}

// =============== COMMON DTOs ===============
public class PagedRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; }
    public string SortDirection { get; set; } = "asc";
    public string? SearchTerm { get; set; }
    public Dictionary<string, string>? Filters { get; set; }
}

public class PagedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string>? Errors { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Fail(string message, List<string>? errors = null) =>
        new() { Success = false, Message = message, Errors = errors };
}

public class LookupDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

// =============== REPORT DTOs ===============
public class ReportFilterRequest
{
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public int? DepartmentId { get; set; }
    public int? ClusterId { get; set; }
    public int? CategoryId { get; set; }
    public string? Status { get; set; }
    public string? EmployeeNo { get; set; }
    public string ReportType { get; set; } = string.Empty;
}

public class ReportDataDto
{
    public string ReportTitle { get; set; } = string.Empty;
    public List<Dictionary<string, object>> Rows { get; set; } = new();
    public List<ReportColumnDto> Columns { get; set; } = new();
    public Dictionary<string, object>? Summary { get; set; }
}

public class ReportColumnDto
{
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Type { get; set; } = "string"; // string, number, date, percent
}

// =============== CERTIFICATE DTOs ===============
public class CertificateDto
{
    public int Id { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public string TrainingTitle { get; set; } = string.Empty;
    public string EmployeeNo { get; set; } = string.Empty;
    public string? EmployeeName { get; set; }
    public DateTime IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string Status { get; set; } = "Active";
    public int? DaysToExpiry { get; set; }
}
