using Microsoft.EntityFrameworkCore;
using TRDS.Core.DTOs;
using TRDS.Core.Interfaces;
using TRDS.Infrastructure.Data;
using TRDS.Infrastructure.Queries;

namespace TRDS.Infrastructure.Services;

public class AssignmentService : IAssignmentService
{
    private readonly AppDbContext _db;
    private readonly EmployeeQueryService _employeeQuery;

    public AssignmentService(AppDbContext db, EmployeeQueryService employeeQuery)
    {
        _db = db;
        _employeeQuery = employeeQuery;
    }

    public async Task<PagedResponse<AssignmentDto>> GetMyAssignmentsAsync(string employeeNo, PagedRequest request)
    {
        var query = _db.TrainingAssignmentDetails
            .Include(d => d.Assignment).ThenInclude(a => a.Training)
            .Where(d => d.EmployeeNo == employeeNo);

        if (!string.IsNullOrEmpty(request.SearchTerm))
            query = query.Where(d => d.Assignment.Training.Title.Contains(request.SearchTerm));

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(d => d.CreatedDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(d => new AssignmentDto
            {
                Id = d.AssignmentId,
                TrainingTitle = d.Assignment.Training.Title,
                TrainingCode = d.Assignment.Training.TrainingCode,
                AssignmentType = d.Assignment.AssignmentType,
                AssignedBy = d.Assignment.AssignedByEmployeeNo,
                DueDate = d.DueDate ?? d.Assignment.DueDate,
                Priority = d.Assignment.Priority,
                IsMandatory = d.Assignment.IsMandatory,
                Status = d.Status,
                TotalAssigned = 1,
                CompletedCount = d.Status == "Completed" ? 1 : 0,
                CreatedDate = d.CreatedDate
            })
            .ToListAsync();

        return new PagedResponse<AssignmentDto>
        {
            Items = items, TotalCount = totalCount,
            Page = request.Page, PageSize = request.PageSize
        };
    }

    public async Task<PagedResponse<AssignmentDto>> GetTeamAssignmentsAsync(
        string employeeNo, ScopeFilterDto scope, PagedRequest request)
    {
        var filteredEmployeeNos = await _employeeQuery.GetFilteredEmployeeNosAsync(scope, employeeNo);

        var query = _db.TrainingAssignments
            .Include(a => a.Training)
            .Include(a => a.Details)
            .Where(a => a.Details.Any(d => filteredEmployeeNos.Contains(d.EmployeeNo)));

        if (!string.IsNullOrEmpty(request.SearchTerm))
            query = query.Where(a => a.Training.Title.Contains(request.SearchTerm));

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.CreatedDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new AssignmentDto
            {
                Id = a.Id,
                TrainingTitle = a.Training.Title,
                TrainingCode = a.Training.TrainingCode,
                AssignmentType = a.AssignmentType,
                AssignedBy = a.AssignedByEmployeeNo,
                DueDate = a.DueDate,
                Priority = a.Priority,
                IsMandatory = a.IsMandatory,
                Status = a.Status,
                TotalAssigned = a.Details.Count(d => filteredEmployeeNos.Contains(d.EmployeeNo)),
                CompletedCount = a.Details.Count(d => filteredEmployeeNos.Contains(d.EmployeeNo) && d.Status == "Completed"),
                CreatedDate = a.CreatedDate
            })
            .ToListAsync();

        return new PagedResponse<AssignmentDto>
        {
            Items = items, TotalCount = totalCount,
            Page = request.Page, PageSize = request.PageSize
        };
    }

    public async Task<AssignmentDto> CreateAssignmentAsync(CreateAssignmentRequest request, string assignedByEmployeeNo)
    {
        var assignment = new Core.Entities.TrainingAssignment
        {
            TrainingId = request.TrainingId,
            AssignmentType = request.AssignmentType,
            AssignedByEmployeeNo = assignedByEmployeeNo,
            DueDate = request.DueDate,
            Priority = request.Priority,
            IsMandatory = request.IsMandatory,
            IsRecurring = request.IsRecurring,
            RecurrenceMonths = request.RecurrenceMonths,
            Notes = request.Notes,
            CreatedBy = assignedByEmployeeNo
        };

        // Resolve employee list based on assignment type
        var employeeNos = request.EmployeeNos ?? new List<string>();

        if (request.AssignmentType == "Department" && request.DepartmentIds?.Any() == true)
        {
            var deptEmployees = await _db.EmployeeHierarchies
                .Where(eh => eh.IsActive && request.DepartmentIds.Contains(eh.DepartmentId ?? 0))
                .Select(eh => eh.EmployeeNo)
                .ToListAsync();
            employeeNos = deptEmployees;
            assignment.AssignmentScope = System.Text.Json.JsonSerializer.Serialize(request.DepartmentIds);
        }
        else if (request.AssignmentType == "Cluster" && request.ClusterIds?.Any() == true)
        {
            var clusterEmployees = await _db.EmployeeHierarchies
                .Where(eh => eh.IsActive && request.ClusterIds.Contains(eh.ClusterId ?? 0))
                .Select(eh => eh.EmployeeNo)
                .ToListAsync();
            employeeNos = clusterEmployees;
            assignment.AssignmentScope = System.Text.Json.JsonSerializer.Serialize(request.ClusterIds);
        }

        _db.TrainingAssignments.Add(assignment);
        await _db.SaveChangesAsync();

        // Create individual assignment details
        foreach (var empNo in employeeNos.Distinct())
        {
            _db.TrainingAssignmentDetails.Add(new Core.Entities.TrainingAssignmentDetail
            {
                AssignmentId = assignment.Id,
                EmployeeNo = empNo,
                DueDate = request.DueDate
            });
        }
        await _db.SaveChangesAsync();

        var training = await _db.TrainingMasters.FindAsync(request.TrainingId);
        return new AssignmentDto
        {
            Id = assignment.Id,
            TrainingTitle = training?.Title ?? "",
            TrainingCode = training?.TrainingCode ?? "",
            AssignmentType = assignment.AssignmentType,
            AssignedBy = assignedByEmployeeNo,
            DueDate = assignment.DueDate,
            Priority = assignment.Priority,
            IsMandatory = assignment.IsMandatory,
            Status = assignment.Status,
            TotalAssigned = employeeNos.Distinct().Count(),
            CreatedDate = assignment.CreatedDate
        };
    }

    public async Task<List<AssignmentDetailDto>> GetAssignmentDetailsAsync(int assignmentId)
    {
        return await _db.TrainingAssignmentDetails
            .Where(d => d.AssignmentId == assignmentId)
            .Select(d => new AssignmentDetailDto
            {
                Id = d.Id,
                EmployeeNo = d.EmployeeNo,
                Status = d.Status,
                CompletionPercent = d.CompletionPercent,
                DueDate = d.DueDate,
                CompletedDate = d.CompletedDate,
                Score = d.Score,
                IsPassed = d.IsPassed
            })
            .ToListAsync();
    }

    public async Task UpdateAssignmentDetailStatusAsync(int detailId, string status, decimal? completionPercent, string userId)
    {
        var detail = await _db.TrainingAssignmentDetails.FindAsync(detailId)
            ?? throw new KeyNotFoundException($"Assignment detail {detailId} not found.");

        detail.Status = status;
        if (completionPercent.HasValue) detail.CompletionPercent = completionPercent.Value;
        if (status == "InProgress" && !detail.StartedDate.HasValue) detail.StartedDate = DateTime.Now;
        if (status == "Completed") { detail.CompletedDate = DateTime.Now; detail.CompletionPercent = 100; }
        detail.ModifiedDate = DateTime.Now;
        await _db.SaveChangesAsync();
    }
}
