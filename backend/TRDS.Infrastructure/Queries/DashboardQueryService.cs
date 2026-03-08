using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using TRDS.Core.DTOs;

namespace TRDS.Infrastructure.Queries;

/// <summary>
/// Optimized dashboard queries using Dapper for fast widget data retrieval.
/// </summary>
public class DashboardQueryService
{
    private readonly string _connectionString;

    public DashboardQueryService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("TRDSDB")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<TrainingStatDto> GetEmployeeStatsAsync(string employeeNo)
    {
        using var conn = CreateConnection();
        var sql = @"
            SELECT 
                SUM(CASE WHEN tad.Status = 'NotStarted' THEN 1 ELSE 0 END) AS PendingCount,
                SUM(CASE WHEN tad.Status = 'Overdue' THEN 1 ELSE 0 END) AS OverdueCount,
                SUM(CASE WHEN tad.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedCount,
                SUM(CASE WHEN tad.Status = 'InProgress' THEN 1 ELSE 0 END) AS InProgressCount,
                COUNT(*) AS TotalAssigned,
                CASE WHEN COUNT(*) > 0 
                    THEN CAST(SUM(CASE WHEN tad.Status = 'Completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2))
                    ELSE 0 END AS CompliancePercent,
                0 AS PendingApprovals,
                0 AS UpcomingSessions,
                0 AS ExpiringCertificates
            FROM [dbo].[TrainingAssignmentDetail] tad
            WHERE tad.EmployeeNo = @EmployeeNo";

        var stats = await conn.QueryFirstOrDefaultAsync<TrainingStatDto>(sql, new { EmployeeNo = employeeNo })
                    ?? new TrainingStatDto();

        // Get upcoming sessions
        var sessionsSql = @"
            SELECT COUNT(*) FROM [dbo].[TrainingSchedule] ts
            INNER JOIN [dbo].[TrainingAttendance] ta ON ts.Id = ta.ScheduleId
            WHERE ta.EmployeeNo = @EmployeeNo AND ts.StartDateTime > GETDATE() AND ts.Status = 'Scheduled'";
        stats.UpcomingSessions = await conn.ExecuteScalarAsync<int>(sessionsSql, new { EmployeeNo = employeeNo });

        // Get expiring certificates (within 30 days)
        var certSql = @"
            SELECT COUNT(*) FROM [dbo].[TrainingCertificate]
            WHERE EmployeeNo = @EmployeeNo AND ExpiryDate IS NOT NULL 
              AND ExpiryDate BETWEEN GETDATE() AND DATEADD(DAY, 30, GETDATE()) AND Status = 'Active'";
        stats.ExpiringCertificates = await conn.ExecuteScalarAsync<int>(certSql, new { EmployeeNo = employeeNo });

        return stats;
    }

    public async Task<TrainingStatDto> GetGlobalStatsAsync()
    {
        using var conn = CreateConnection();
        var sql = @"
            SELECT 
                SUM(CASE WHEN tad.Status = 'NotStarted' THEN 1 ELSE 0 END) AS PendingCount,
                SUM(CASE WHEN tad.Status = 'Overdue' THEN 1 ELSE 0 END) AS OverdueCount,
                SUM(CASE WHEN tad.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedCount,
                SUM(CASE WHEN tad.Status = 'InProgress' THEN 1 ELSE 0 END) AS InProgressCount,
                COUNT(*) AS TotalAssigned,
                CASE WHEN COUNT(*) > 0 
                    THEN CAST(SUM(CASE WHEN tad.Status = 'Completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2))
                    ELSE 0 END AS CompliancePercent,
                0 AS PendingApprovals,
                0 AS UpcomingSessions,
                0 AS ExpiringCertificates
            FROM [dbo].[TrainingAssignmentDetail] tad";

        var stats = await conn.QueryFirstOrDefaultAsync<TrainingStatDto>(sql)
                    ?? new TrainingStatDto();

        // Get total upcoming sessions
        var sessionsSql = @"
            SELECT COUNT(*) FROM [dbo].[TrainingSchedule]
            WHERE StartDateTime > GETDATE() AND Status = 'Scheduled'";
        stats.UpcomingSessions = await conn.ExecuteScalarAsync<int>(sessionsSql);

        // Get total pending approvals
        var approvalSql = @"
            SELECT COUNT(*) FROM [dbo].[TrainingApproval]
            WHERE [Action] = 'Pending'";
        stats.PendingApprovals = await conn.ExecuteScalarAsync<int>(approvalSql);

        return stats;
    }

    public async Task<TrainingStatDto> GetTeamStatsAsync(string managerEmployeeNo, List<string> teamEmployeeNos)
    {
        if (!teamEmployeeNos.Any()) return new TrainingStatDto();

        using var conn = CreateConnection();
        var sql = @"
            SELECT 
                SUM(CASE WHEN tad.Status = 'NotStarted' THEN 1 ELSE 0 END) AS PendingCount,
                SUM(CASE WHEN tad.Status = 'Overdue' THEN 1 ELSE 0 END) AS OverdueCount,
                SUM(CASE WHEN tad.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedCount,
                SUM(CASE WHEN tad.Status = 'InProgress' THEN 1 ELSE 0 END) AS InProgressCount,
                COUNT(*) AS TotalAssigned,
                CASE WHEN COUNT(*) > 0 
                    THEN CAST(SUM(CASE WHEN tad.Status = 'Completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2))
                    ELSE 0 END AS CompliancePercent
            FROM [dbo].[TrainingAssignmentDetail] tad
            WHERE tad.EmployeeNo IN @EmployeeNos";

        var stats = await conn.QueryFirstOrDefaultAsync<TrainingStatDto>(sql, new { EmployeeNos = teamEmployeeNos })
                    ?? new TrainingStatDto();

        // Get pending approvals for this manager
        var approvalSql = @"
            SELECT COUNT(*) FROM [dbo].[TrainingApproval]
            WHERE ApproverEmployeeNo = @ManagerNo AND [Action] = 'Pending'";
        stats.PendingApprovals = await conn.ExecuteScalarAsync<int>(approvalSql, new { ManagerNo = managerEmployeeNo });

        return stats;
    }

    public async Task<List<AssignmentDetailDto>> GetRecentAssignmentsAsync(string employeeNo, int top = 5)
    {
        using var conn = CreateConnection();
        var sql = @"
            SELECT TOP (@Top)
                tad.Id, tad.EmployeeNo, tad.Status, tad.CompletionPercent,
                tad.DueDate, tad.CompletedDate, tad.Score, tad.IsPassed,
                tm.Title AS EmployeeName -- reusing field for training title display
            FROM [dbo].[TrainingAssignmentDetail] tad
            INNER JOIN [dbo].[TrainingAssignment] ta ON tad.AssignmentId = ta.Id
            INNER JOIN [dbo].[TrainingMaster] tm ON ta.TrainingId = tm.Id
            WHERE tad.EmployeeNo = @EmployeeNo
            ORDER BY tad.CreatedDate DESC";

        return (await conn.QueryAsync<AssignmentDetailDto>(sql, new { EmployeeNo = employeeNo, Top = top })).ToList();
    }
}
