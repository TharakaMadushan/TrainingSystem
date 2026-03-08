using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using TRDS.Core.DTOs;

namespace TRDS.Infrastructure.Queries;

/// <summary>
/// Dapper-based query service for scope-filtered employee lookups.
/// This is the critical service that ensures all data access respects user scope.
/// </summary>
public class EmployeeQueryService
{
    private readonly string _trdsConnectionString;
    private readonly string _hrisConnectionString;

    public EmployeeQueryService(IConfiguration configuration)
    {
        _trdsConnectionString = configuration.GetConnectionString("TRDSDB")!;
        _hrisConnectionString = configuration.GetConnectionString("HRISDB")!;
    }

    private IDbConnection CreateTrdsConnection() => new SqlConnection(_trdsConnectionString);
    private IDbConnection CreateHrisConnection() => new SqlConnection(_hrisConnectionString);

    /// <summary>
    /// Get scope-filtered employees with pagination. Uses cross-database join via view.
    /// </summary>
    public async Task<PagedResponse<EmployeeLookupDto>> GetFilteredEmployeesAsync(
        PagedRequest request, ScopeFilterDto scope, string currentEmployeeNo)
    {
        using var conn = CreateTrdsConnection();
        var whereClause = BuildScopeWhere(scope, currentEmployeeNo);
        var searchClause = string.IsNullOrEmpty(request.SearchTerm)
            ? ""
            : " AND (v.EmployeeName LIKE @Search OR v.EmployeeNo LIKE @Search OR v.DepartmentName LIKE @Search)";

        var countSql = $@"SELECT COUNT(*) FROM [dbo].[vw_EmployeeDetails] v WHERE v.IsActive = 1 {whereClause} {searchClause}";
        var dataSql = $@"
            SELECT v.EmployeeNo, v.EmployeeName, v.DepartmentName AS Department,
                   v.DesignationName AS Designation, v.ClusterName AS Cluster, v.LocationName AS Location
            FROM [dbo].[vw_EmployeeDetails] v
            WHERE v.IsActive = 1 {whereClause} {searchClause}
            ORDER BY v.EmployeeName
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

        var parameters = new DynamicParameters();
        parameters.Add("@CurrentEmployeeNo", currentEmployeeNo);
        parameters.Add("@Search", $"%{request.SearchTerm}%");
        parameters.Add("@Offset", (request.Page - 1) * request.PageSize);
        parameters.Add("@PageSize", request.PageSize);
        AddScopeParameters(parameters, scope);

        var totalCount = await conn.ExecuteScalarAsync<int>(countSql, parameters);
        var items = (await conn.QueryAsync<EmployeeLookupDto>(dataSql, parameters)).ToList();

        return new PagedResponse<EmployeeLookupDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    /// <summary>
    /// Search employees for dropdowns/typeahead with scope filtering.
    /// </summary>
    public async Task<List<EmployeeLookupDto>> SearchEmployeesAsync(
        string searchTerm, ScopeFilterDto scope, string currentEmployeeNo, int maxResults = 20)
    {
        using var conn = CreateTrdsConnection();
        var whereClause = BuildScopeWhere(scope, currentEmployeeNo);

        var sql = $@"
            SELECT TOP (@MaxResults)
                v.EmployeeNo, v.EmployeeName, v.DepartmentName AS Department,
                v.DesignationName AS Designation, v.ClusterName AS Cluster
            FROM [dbo].[vw_EmployeeDetails] v
            WHERE v.IsActive = 1
              AND (v.EmployeeName LIKE @Search OR v.EmployeeNo LIKE @Search)
              {whereClause}
            ORDER BY v.EmployeeName";

        var parameters = new DynamicParameters();
        parameters.Add("@MaxResults", maxResults);
        parameters.Add("@Search", $"%{searchTerm}%");
        parameters.Add("@CurrentEmployeeNo", currentEmployeeNo);
        AddScopeParameters(parameters, scope);

        return (await conn.QueryAsync<EmployeeLookupDto>(sql, parameters)).ToList();
    }

    /// <summary>
    /// Get list of employee numbers visible to the current user based on scope.
    /// Used by other services that need filtered lists.
    /// </summary>
    public async Task<List<string>> GetFilteredEmployeeNosAsync(
        ScopeFilterDto scope, string currentEmployeeNo)
    {
        using var conn = CreateTrdsConnection();
        var whereClause = BuildScopeWhere(scope, currentEmployeeNo);

        var sql = $@"SELECT v.EmployeeNo FROM [dbo].[vw_EmployeeDetails] v WHERE v.IsActive = 1 {whereClause}";

        var parameters = new DynamicParameters();
        parameters.Add("@CurrentEmployeeNo", currentEmployeeNo);
        AddScopeParameters(parameters, scope);

        return (await conn.QueryAsync<string>(sql, parameters)).ToList();
    }

    /// <summary>
    /// Builds SQL WHERE clause fragment based on scope type.
    /// This is the core scope-filtering logic used everywhere.
    /// </summary>
    private string BuildScopeWhere(ScopeFilterDto scope, string currentEmployeeNo)
    {
        return scope.ScopeType switch
        {
            "Self" => " AND v.EmployeeNo = @CurrentEmployeeNo",
            "DirectReports" => " AND (v.EmployeeNo = @CurrentEmployeeNo OR v.ManagerEmployeeNo = @CurrentEmployeeNo)",
            "Department" => " AND v.DepartmentCode IN (SELECT eh2.DepartmentId FROM [dbo].[EmployeeHierarchy] eh2 INNER JOIN [dbo].[Departments] d2 ON eh2.DepartmentId = d2.Id WHERE eh2.EmployeeNo = @CurrentEmployeeNo)",
            "Cluster" => " AND v.ClusterCode IN (SELECT c2.ClusterCode FROM [dbo].[EmployeeHierarchy] eh2 INNER JOIN [dbo].[Clusters] c2 ON eh2.ClusterId = c2.Id WHERE eh2.EmployeeNo = @CurrentEmployeeNo)",
            "Location" => " AND v.LocationCode IN (SELECT l2.LocationCode FROM [dbo].[EmployeeHierarchy] eh2 INNER JOIN [dbo].[Locations] l2 ON eh2.LocationId = l2.Id WHERE eh2.EmployeeNo = @CurrentEmployeeNo)",
            "Company" => "", // No filter — company-wide access
            "Custom" when !string.IsNullOrEmpty(scope.ScopeValue) => $" AND v.EmployeeNo IN (SELECT value FROM STRING_SPLIT(@ScopeValue, ','))",
            _ => " AND v.EmployeeNo = @CurrentEmployeeNo" // Fallback to self
        };
    }

    private void AddScopeParameters(DynamicParameters parameters, ScopeFilterDto scope)
    {
        if (scope.ScopeType == "Custom" && !string.IsNullOrEmpty(scope.ScopeValue))
        {
            parameters.Add("@ScopeValue", scope.ScopeValue);
        }
    }
}
