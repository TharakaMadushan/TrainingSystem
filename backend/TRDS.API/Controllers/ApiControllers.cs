using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TRDS.Core.DTOs;
using TRDS.Core.Interfaces;
using TRDS.Shared.Helpers;

namespace TRDS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<DashboardResponse>>> GetDashboard()
    {
        var employeeNo = User.GetUserId();
        var roles = User.GetRoles();
        var scope = new ScopeFilterDto { ScopeType = User.FindFirst("ScopeType")?.Value ?? "Self" };
        var result = await _dashboardService.GetDashboardAsync(employeeNo, roles, scope);
        return Ok(ApiResponse<DashboardResponse>.Ok(result));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TrainingController : ControllerBase
{
    private readonly ITrainingService _trainingService;

    public TrainingController(ITrainingService trainingService)
    {
        _trainingService = trainingService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResponse<TrainingDto>>>> GetTrainings([FromQuery] PagedRequest request)
    {
        var result = await _trainingService.GetTrainingsAsync(request);
        return Ok(ApiResponse<PagedResponse<TrainingDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TrainingDto>>> GetTraining(int id)
    {
        var result = await _trainingService.GetTrainingByIdAsync(id);
        if (result == null) return NotFound(ApiResponse<TrainingDto>.Fail("Training not found"));
        return Ok(ApiResponse<TrainingDto>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TrainingDto>>> CreateTraining([FromBody] CreateTrainingRequest request)
    {
        if (!User.HasPermission("Training.Create"))
            return Forbid();
        var result = await _trainingService.CreateTrainingAsync(request, User.GetUserId());
        return Ok(ApiResponse<TrainingDto>.Ok(result, "Training created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<TrainingDto>>> UpdateTraining(int id, [FromBody] CreateTrainingRequest request)
    {
        if (!User.HasPermission("Training.Edit"))
            return Forbid();
        var result = await _trainingService.UpdateTrainingAsync(id, request, User.GetUserId());
        return Ok(ApiResponse<TrainingDto>.Ok(result, "Training updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteTraining(int id)
    {
        if (!User.HasPermission("Training.Delete"))
            return Forbid();
        await _trainingService.DeleteTrainingAsync(id, User.GetUserId());
        return Ok(ApiResponse<bool>.Ok(true, "Training deleted successfully"));
    }

    [HttpGet("categories")]
    public async Task<ActionResult<ApiResponse<List<LookupDto>>>> GetCategories()
    {
        var result = await _trainingService.GetCategoriesAsync();
        return Ok(ApiResponse<List<LookupDto>>.Ok(result));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;

    public AssignmentController(IAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<PagedResponse<AssignmentDto>>>> GetMyAssignments([FromQuery] PagedRequest request)
    {
        var result = await _assignmentService.GetMyAssignmentsAsync(User.GetUserId(), request);
        return Ok(ApiResponse<PagedResponse<AssignmentDto>>.Ok(result));
    }

    [HttpGet("team")]
    public async Task<ActionResult<ApiResponse<PagedResponse<AssignmentDto>>>> GetTeamAssignments([FromQuery] PagedRequest request)
    {
        if (!User.HasPermission("Assignment.ViewTeam"))
            return Forbid();
        var scope = new ScopeFilterDto { ScopeType = User.FindFirst("ScopeType")?.Value ?? "DirectReports" };
        var result = await _assignmentService.GetTeamAssignmentsAsync(User.GetUserId(), scope, request);
        return Ok(ApiResponse<PagedResponse<AssignmentDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<AssignmentDto>>> CreateAssignment([FromBody] CreateAssignmentRequest request)
    {
        if (!User.HasPermission("Assignment.Create"))
            return Forbid();
        var result = await _assignmentService.CreateAssignmentAsync(request, User.GetUserId());
        return Ok(ApiResponse<AssignmentDto>.Ok(result, "Training assigned successfully"));
    }

    [HttpGet("{id}/details")]
    public async Task<ActionResult<ApiResponse<List<AssignmentDetailDto>>>> GetAssignmentDetails(int id)
    {
        var result = await _assignmentService.GetAssignmentDetailsAsync(id);
        return Ok(ApiResponse<List<AssignmentDetailDto>>.Ok(result));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeeController(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResponse<EmployeeLookupDto>>>> GetEmployees([FromQuery] PagedRequest request)
    {
        var scope = new ScopeFilterDto { ScopeType = User.FindFirst("ScopeType")?.Value ?? "Self" };
        var result = await _employeeService.GetEmployeesAsync(request, scope);
        return Ok(ApiResponse<PagedResponse<EmployeeLookupDto>>.Ok(result));
    }

    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<List<EmployeeLookupDto>>>> SearchEmployees([FromQuery] string term)
    {
        var scope = new ScopeFilterDto { ScopeType = User.FindFirst("ScopeType")?.Value ?? "Self" };
        var result = await _employeeService.SearchEmployeesAsync(term, scope);
        return Ok(ApiResponse<List<EmployeeLookupDto>>.Ok(result));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApprovalController : ControllerBase
{
    private readonly IApprovalService _approvalService;

    public ApprovalController(IApprovalService approvalService)
    {
        _approvalService = approvalService;
    }

    [HttpGet("pending")]
    public async Task<ActionResult<ApiResponse<PagedResponse<ApprovalDto>>>> GetPendingApprovals([FromQuery] PagedRequest request)
    {
        if (!User.HasPermission("Approval.View"))
            return Forbid();
        var result = await _approvalService.GetPendingApprovalsAsync(User.GetUserId(), request);
        return Ok(ApiResponse<PagedResponse<ApprovalDto>>.Ok(result));
    }

    [HttpPost("{id}/action")]
    public async Task<ActionResult<ApiResponse<ApprovalDto>>> ProcessApproval(int id, [FromBody] ApprovalActionRequest request)
    {
        if (!User.HasPermission("Approval.Approve"))
            return Forbid();
        var result = await _approvalService.ProcessApprovalAsync(id, request, User.GetUserId());
        return Ok(ApiResponse<ApprovalDto>.Ok(result, "Approval processed successfully"));
    }

    [HttpGet("history/{referenceType}/{referenceId}")]
    public async Task<ActionResult<ApiResponse<List<ApprovalDto>>>> GetApprovalHistory(string referenceType, int referenceId)
    {
        var result = await _approvalService.GetApprovalHistoryAsync(referenceType, referenceId);
        return Ok(ApiResponse<List<ApprovalDto>>.Ok(result));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResponse<NotificationDto>>>> GetNotifications([FromQuery] PagedRequest request)
    {
        var result = await _notificationService.GetNotificationsAsync(User.GetUserId(), request);
        return Ok(ApiResponse<PagedResponse<NotificationDto>>.Ok(result));
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
    {
        var count = await _notificationService.GetUnreadCountAsync(User.GetUserId());
        return Ok(ApiResponse<int>.Ok(count));
    }

    [HttpPut("{id}/read")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAsRead(long id)
    {
        await _notificationService.MarkAsReadAsync(id, User.GetUserId());
        return Ok(ApiResponse<bool>.Ok(true));
    }
}

[ApiController]
[Route("api/admin/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserManagementService _userService;

    public UsersController(IUserManagementService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResponse<UserManagementDto>>>> GetUsers([FromQuery] PagedRequest request)
    {
        if (!User.HasPermission("Admin.UserManagement"))
            return Forbid();
        var result = await _userService.GetUsersAsync(request);
        return Ok(ApiResponse<PagedResponse<UserManagementDto>>.Ok(result));
    }

    [HttpPost("{employeeNo}/roles")]
    public async Task<ActionResult<ApiResponse<bool>>> AssignRoles(string employeeNo, [FromBody] List<int> roleIds)
    {
        if (!User.HasPermission("Admin.UserManagement"))
            return Forbid();
        await _userService.AssignRolesAsync(employeeNo, roleIds, User.GetUserId());
        return Ok(ApiResponse<bool>.Ok(true, "Roles assigned successfully"));
    }
}

[ApiController]
[Route("api/admin/[controller]")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly IRoleManagementService _roleService;

    public RolesController(IRoleManagementService roleService)
    {
        _roleService = roleService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<RoleDto>>>> GetRoles()
    {
        if (!User.HasPermission("Admin.RoleManagement"))
            return Forbid();
        var result = await _roleService.GetRolesAsync();
        return Ok(ApiResponse<List<RoleDto>>.Ok(result));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MenuController : ControllerBase
{
    private readonly IMenuService _menuService;

    public MenuController(IMenuService menuService)
    {
        _menuService = menuService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<MenuItemDto>>>> GetMenus()
    {
        var roles = User.GetRoles();
        var result = await _menuService.GetUserMenuAsync(roles);
        return Ok(ApiResponse<List<MenuItemDto>>.Ok(result));
    }

    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<List<MenuItemDto>>>> GetAllMenus()
    {
        if (!User.HasPermission("Admin.MenuManagement"))
            return Forbid();
        var result = await _menuService.GetAllMenusAsync();
        return Ok(ApiResponse<List<MenuItemDto>>.Ok(result));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet("preferences")]
    public async Task<ActionResult<ApiResponse<UserPreferenceDto>>> GetPreferences()
    {
        var result = await _settingsService.GetPreferencesAsync(
            User.GetUserType(), User.GetUserId(), null);
        return Ok(ApiResponse<UserPreferenceDto>.Ok(result));
    }

    [HttpPut("preferences")]
    public async Task<ActionResult<ApiResponse<bool>>> SavePreferences([FromBody] UserPreferenceDto preferences)
    {
        await _settingsService.SavePreferencesAsync(
            User.GetUserType(), User.GetUserId(), null, preferences);
        return Ok(ApiResponse<bool>.Ok(true, "Preferences saved"));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ReportDataDto>>> GenerateReport([FromBody] ReportFilterRequest request)
    {
        if (!User.HasPermission("Report.View"))
            return Forbid();
        var scope = new ScopeFilterDto { ScopeType = User.FindFirst("ScopeType")?.Value ?? "Self" };
        var result = await _reportService.GenerateReportAsync(request, scope);
        return Ok(ApiResponse<ReportDataDto>.Ok(result));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    [HttpGet("logs")]
    public async Task<ActionResult<ApiResponse<PagedResponse<AuditLogDto>>>> GetAuditLogs([FromQuery] PagedRequest request)
    {
        if (!User.HasPermission("Audit.View"))
            return Forbid();
        var result = await _auditService.GetAuditLogsAsync(request);
        return Ok(ApiResponse<PagedResponse<AuditLogDto>>.Ok(result));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ScheduleController : ControllerBase
{
    private readonly IScheduleService _scheduleService;

    public ScheduleController(IScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResponse<ScheduleDto>>>> GetSchedules([FromQuery] PagedRequest request)
    {
        var result = await _scheduleService.GetSchedulesAsync(request);
        return Ok(ApiResponse<PagedResponse<ScheduleDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ScheduleDto>>> CreateSchedule([FromBody] CreateScheduleRequest request)
    {
        if (!User.HasPermission("Schedule.Create"))
            return Forbid();
        var result = await _scheduleService.CreateScheduleAsync(request, User.GetUserId());
        return Ok(ApiResponse<ScheduleDto>.Ok(result, "Schedule created successfully"));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CertificateController : ControllerBase
{
    private readonly ICertificateService _certificateService;

    public CertificateController(ICertificateService certificateService)
    {
        _certificateService = certificateService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResponse<CertificateDto>>>> GetCertificates([FromQuery] PagedRequest request)
    {
        var scope = new ScopeFilterDto { ScopeType = User.FindFirst("ScopeType")?.Value ?? "Self" };
        var result = await _certificateService.GetCertificatesAsync(User.GetUserId(), request, scope);
        return Ok(ApiResponse<PagedResponse<CertificateDto>>.Ok(result));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LookupController : ControllerBase
{
    private readonly Infrastructure.Data.AppDbContext _db;

    public LookupController(Infrastructure.Data.AppDbContext db) => _db = db;

    [HttpGet("departments")]
    public async Task<ActionResult<ApiResponse<List<LookupDto>>>> GetDepartments()
    {
        var result = await _db.Departments.Where(d => d.IsActive)
            .Select(d => new LookupDto { Id = d.Id, Code = d.DepartmentCode, Name = d.DepartmentName })
            .ToListAsync();
        return Ok(ApiResponse<List<LookupDto>>.Ok(result));
    }

    [HttpGet("clusters")]
    public async Task<ActionResult<ApiResponse<List<LookupDto>>>> GetClusters()
    {
        var result = await _db.Clusters.Where(c => c.IsActive)
            .Select(c => new LookupDto { Id = c.Id, Code = c.ClusterCode, Name = c.ClusterName })
            .ToListAsync();
        return Ok(ApiResponse<List<LookupDto>>.Ok(result));
    }

    [HttpGet("designations")]
    public async Task<ActionResult<ApiResponse<List<LookupDto>>>> GetDesignations()
    {
        var result = await _db.Designations.Where(d => d.IsActive)
            .Select(d => new LookupDto { Id = d.Id, Code = d.DesignationCode, Name = d.DesignationName })
            .ToListAsync();
        return Ok(ApiResponse<List<LookupDto>>.Ok(result));
    }

    [HttpGet("locations")]
    public async Task<ActionResult<ApiResponse<List<LookupDto>>>> GetLocations()
    {
        var result = await _db.Locations.Where(l => l.IsActive)
            .Select(l => new LookupDto { Id = l.Id, Code = l.LocationCode, Name = l.LocationName })
            .ToListAsync();
        return Ok(ApiResponse<List<LookupDto>>.Ok(result));
    }
}
