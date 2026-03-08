using TRDS.Core.DTOs;

namespace TRDS.Core.Interfaces;

// =============== AUTH ===============
public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress, string userAgent);
    Task LogoutAsync(string token);
    Task<LoginResponse> RefreshTokenAsync(string refreshToken);
}

// =============== SCOPE FILTERING ===============
public interface IScopeFilterService
{
    Task<ScopeFilterDto> GetUserScopeAsync(string userType, string employeeNo, int? securityUserId);
    string BuildScopeWhereClause(ScopeFilterDto scope, string employeeNoColumn = "EmployeeNo");
    Task<List<string>> GetFilteredEmployeeNosAsync(ScopeFilterDto scope);
}

// =============== MENU ===============
public interface IMenuService
{
    Task<List<MenuItemDto>> GetUserMenuAsync(List<string> roleCodes);
    Task<List<MenuItemDto>> GetAllMenusAsync();
    Task<MenuItemDto> CreateMenuAsync(MenuItemDto menu, string userId);
    Task<MenuItemDto> UpdateMenuAsync(int id, MenuItemDto menu, string userId);
    Task DeleteMenuAsync(int id, string userId);
}

// =============== DASHBOARD ===============
public interface IDashboardService
{
    Task<DashboardResponse> GetDashboardAsync(string employeeNo, List<string> roles, ScopeFilterDto scope);
}

// =============== TRAINING ===============
public interface ITrainingService
{
    Task<PagedResponse<TrainingDto>> GetTrainingsAsync(PagedRequest request);
    Task<TrainingDto?> GetTrainingByIdAsync(int id);
    Task<TrainingDto> CreateTrainingAsync(CreateTrainingRequest request, string userId);
    Task<TrainingDto> UpdateTrainingAsync(int id, CreateTrainingRequest request, string userId);
    Task DeleteTrainingAsync(int id, string userId);
    Task<List<LookupDto>> GetCategoriesAsync();
}

// =============== ASSIGNMENT ===============
public interface IAssignmentService
{
    Task<PagedResponse<AssignmentDto>> GetMyAssignmentsAsync(string employeeNo, PagedRequest request);
    Task<PagedResponse<AssignmentDto>> GetTeamAssignmentsAsync(string employeeNo, ScopeFilterDto scope, PagedRequest request);
    Task<AssignmentDto> CreateAssignmentAsync(CreateAssignmentRequest request, string assignedByEmployeeNo);
    Task<List<AssignmentDetailDto>> GetAssignmentDetailsAsync(int assignmentId);
    Task UpdateAssignmentDetailStatusAsync(int detailId, string status, decimal? completionPercent, string userId);
}

// =============== APPROVAL ===============
public interface IApprovalService
{
    Task<PagedResponse<ApprovalDto>> GetPendingApprovalsAsync(string approverEmployeeNo, PagedRequest request);
    Task<ApprovalDto> ProcessApprovalAsync(int approvalId, ApprovalActionRequest request, string approverEmployeeNo);
    Task<List<ApprovalDto>> GetApprovalHistoryAsync(string referenceType, int referenceId);
}

// =============== SCHEDULE ===============
public interface IScheduleService
{
    Task<PagedResponse<ScheduleDto>> GetSchedulesAsync(PagedRequest request, ScopeFilterDto? scope = null);
    Task<ScheduleDto> CreateScheduleAsync(CreateScheduleRequest request, string userId);
    Task<ScheduleDto> UpdateScheduleAsync(int id, CreateScheduleRequest request, string userId);
    Task DeleteScheduleAsync(int id, string userId);
}

// =============== EMPLOYEE ===============
public interface IEmployeeService
{
    Task<PagedResponse<EmployeeLookupDto>> GetEmployeesAsync(PagedRequest request, ScopeFilterDto scope);
    Task<EmployeeLookupDto?> GetEmployeeByNoAsync(string employeeNo);
    Task<List<EmployeeLookupDto>> SearchEmployeesAsync(string searchTerm, ScopeFilterDto scope, int maxResults = 20);
}

// =============== NOTIFICATION ===============
public interface INotificationService
{
    Task<PagedResponse<NotificationDto>> GetNotificationsAsync(string employeeNo, PagedRequest request);
    Task<int> GetUnreadCountAsync(string employeeNo);
    Task MarkAsReadAsync(long notificationId, string employeeNo);
    Task MarkAllAsReadAsync(string employeeNo);
    Task CreateNotificationAsync(string recipientEmployeeNo, string type, string title, string? message, string? refType = null, int? refId = null);
}

// =============== REPORT ===============
public interface IReportService
{
    Task<ReportDataDto> GenerateReportAsync(ReportFilterRequest request, ScopeFilterDto scope);
}

// =============== AUDIT ===============
public interface IAuditService
{
    Task<PagedResponse<AuditLogDto>> GetAuditLogsAsync(PagedRequest request);
    Task LogActivityAsync(string tableName, string recordId, string action, string? oldValues, string? newValues, string userId, string? ipAddress = null);
}

// =============== USER MANAGEMENT ===============
public interface IUserManagementService
{
    Task<PagedResponse<UserManagementDto>> GetUsersAsync(PagedRequest request);
    Task AssignRolesAsync(string employeeNo, List<int> roleIds, string assignedBy);
    Task UpdateScopeFilterAsync(string userType, string? employeeNo, int? securityUserId, string scopeType, string? scopeValue, string modifiedBy);
}

// =============== ROLE MANAGEMENT ===============
public interface IRoleManagementService
{
    Task<List<RoleDto>> GetRolesAsync();
    Task<RoleDto> CreateRoleAsync(RoleDto role, string userId);
    Task<RoleDto> UpdateRoleAsync(int id, RoleDto role, string userId);
    Task AssignPermissionsAsync(int roleId, List<int> permissionIds, string userId);
    Task AssignMenusAsync(int roleId, List<int> menuIds, string userId);
}

// =============== CERTIFICATE ===============
public interface ICertificateService
{
    Task<PagedResponse<CertificateDto>> GetCertificatesAsync(string employeeNo, PagedRequest request, ScopeFilterDto? scope = null);
    Task<CertificateDto> IssueCertificateAsync(int trainingId, string employeeNo, DateTime issueDate, DateTime? expiryDate, string issuedBy);
}

// =============== SETTINGS ===============
public interface ISettingsService
{
    Task<UserPreferenceDto> GetPreferencesAsync(string userType, string? employeeNo, int? securityUserId);
    Task SavePreferencesAsync(string userType, string? employeeNo, int? securityUserId, UserPreferenceDto preferences);
}
