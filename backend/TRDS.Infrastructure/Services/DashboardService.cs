using TRDS.Core.DTOs;
using TRDS.Core.Interfaces;
using TRDS.Infrastructure.Queries;

namespace TRDS.Infrastructure.Services;

/// <summary>
/// Implements IDashboardService by delegating to DashboardQueryService (Dapper)
/// and assembling the widget-based DashboardResponse.
/// </summary>
public class DashboardService : IDashboardService
{
    private readonly DashboardQueryService _queryService;

    public DashboardService(DashboardQueryService queryService)
    {
        _queryService = queryService;
    }

    public async Task<DashboardResponse> GetDashboardAsync(string employeeNo, List<string> roles, ScopeFilterDto scope)
    {
        var response = new DashboardResponse
        {
            UserRole = roles.FirstOrDefault() ?? "Employee",
            Widgets = new List<DashboardWidgetDto>()
        };

        // Determine if this is a superuser/admin
        var isSuperUser = roles.Any(r =>
            r.Equals("SUPERUSER", StringComparison.OrdinalIgnoreCase) ||
            r.Equals("SYSADMIN", StringComparison.OrdinalIgnoreCase));

        TrainingStatDto stats;

        if (isSuperUser || string.IsNullOrEmpty(employeeNo))
        {
            // SuperUser/Admin: get global stats (pass empty to get all)
            stats = await _queryService.GetGlobalStatsAsync();
        }
        else
        {
            // Regular employee: get personal stats
            stats = await _queryService.GetEmployeeStatsAsync(employeeNo);
        }

        // Build stat widget
        response.Widgets.Add(new DashboardWidgetDto
        {
            Id = "stats",
            Title = "Training Statistics",
            Type = "stat",
            Data = stats,
            Order = 1
        });

        // Get recent assignments (use employeeNo if available)
        var assignments = !string.IsNullOrEmpty(employeeNo)
            ? await _queryService.GetRecentAssignmentsAsync(employeeNo, 5)
            : new List<AssignmentDetailDto>();

        response.Widgets.Add(new DashboardWidgetDto
        {
            Id = "assignments",
            Title = "Recent Assignments",
            Type = "list",
            Data = assignments,
            Order = 2
        });

        // Upcoming sessions placeholder
        response.Widgets.Add(new DashboardWidgetDto
        {
            Id = "sessions",
            Title = "Upcoming Sessions",
            Type = "schedule",
            Data = new List<object>(),
            Order = 3
        });

        return response;
    }
}
