using Microsoft.EntityFrameworkCore;
using TRDS.Core.DTOs;
using TRDS.Core.Interfaces;
using TRDS.Infrastructure.Data;

namespace TRDS.Infrastructure.Services;

public class TrainingService : ITrainingService
{
    private readonly AppDbContext _db;

    public TrainingService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResponse<TrainingDto>> GetTrainingsAsync(PagedRequest request)
    {
        var query = _db.TrainingMasters.Include(t => t.Category).AsQueryable();

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            query = query.Where(t =>
                t.Title.Contains(request.SearchTerm) ||
                t.TrainingCode.Contains(request.SearchTerm) ||
                (t.Category != null && t.Category.CategoryName.Contains(request.SearchTerm)));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.CreatedDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(t => new TrainingDto
            {
                Id = t.Id,
                TrainingCode = t.TrainingCode,
                Title = t.Title,
                CategoryName = t.Category != null ? t.Category.CategoryName : null,
                CategoryId = t.CategoryId,
                Description = t.Description,
                DurationHours = t.DurationHours,
                TrainingMode = t.TrainingMode,
                TrainerName = t.TrainerName,
                ValidityMonths = t.ValidityMonths,
                RetrainingIntervalMonths = t.RetrainingIntervalMonths,
                IsMandatory = t.IsMandatory,
                PassMark = t.PassMark,
                MaxAttempts = t.MaxAttempts,
                IsActive = t.IsActive
            })
            .ToListAsync();

        return new PagedResponse<TrainingDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    public async Task<TrainingDto?> GetTrainingByIdAsync(int id)
    {
        return await _db.TrainingMasters
            .Include(t => t.Category)
            .Where(t => t.Id == id)
            .Select(t => new TrainingDto
            {
                Id = t.Id, TrainingCode = t.TrainingCode, Title = t.Title,
                CategoryName = t.Category != null ? t.Category.CategoryName : null,
                CategoryId = t.CategoryId, Description = t.Description,
                DurationHours = t.DurationHours, TrainingMode = t.TrainingMode,
                TrainerName = t.TrainerName, ValidityMonths = t.ValidityMonths,
                RetrainingIntervalMonths = t.RetrainingIntervalMonths,
                IsMandatory = t.IsMandatory, PassMark = t.PassMark,
                MaxAttempts = t.MaxAttempts, IsActive = t.IsActive
            })
            .FirstOrDefaultAsync();
    }

    public async Task<TrainingDto> CreateTrainingAsync(CreateTrainingRequest request, string userId)
    {
        var entity = new Core.Entities.TrainingMaster
        {
            TrainingCode = request.TrainingCode,
            Title = request.Title,
            CategoryId = request.CategoryId,
            Description = request.Description,
            DurationHours = request.DurationHours,
            TrainingMode = request.TrainingMode,
            TrainerName = request.TrainerName,
            TrainerEmployeeNo = request.TrainerEmployeeNo,
            ValidityMonths = request.ValidityMonths,
            RetrainingIntervalMonths = request.RetrainingIntervalMonths,
            IsMandatory = request.IsMandatory,
            PassMark = request.PassMark,
            MaxAttempts = request.MaxAttempts,
            CreatedBy = userId
        };

        _db.TrainingMasters.Add(entity);
        await _db.SaveChangesAsync();

        return (await GetTrainingByIdAsync(entity.Id))!;
    }

    public async Task<TrainingDto> UpdateTrainingAsync(int id, CreateTrainingRequest request, string userId)
    {
        var entity = await _db.TrainingMasters.FindAsync(id)
            ?? throw new KeyNotFoundException($"Training with ID {id} not found.");

        entity.TrainingCode = request.TrainingCode;
        entity.Title = request.Title;
        entity.CategoryId = request.CategoryId;
        entity.Description = request.Description;
        entity.DurationHours = request.DurationHours;
        entity.TrainingMode = request.TrainingMode;
        entity.TrainerName = request.TrainerName;
        entity.TrainerEmployeeNo = request.TrainerEmployeeNo;
        entity.ValidityMonths = request.ValidityMonths;
        entity.RetrainingIntervalMonths = request.RetrainingIntervalMonths;
        entity.IsMandatory = request.IsMandatory;
        entity.PassMark = request.PassMark;
        entity.MaxAttempts = request.MaxAttempts;
        entity.ModifiedBy = userId;
        entity.ModifiedDate = DateTime.Now;

        await _db.SaveChangesAsync();
        return (await GetTrainingByIdAsync(id))!;
    }

    public async Task DeleteTrainingAsync(int id, string userId)
    {
        var entity = await _db.TrainingMasters.FindAsync(id)
            ?? throw new KeyNotFoundException($"Training with ID {id} not found.");
        entity.IsActive = false;
        entity.ModifiedBy = userId;
        entity.ModifiedDate = DateTime.Now;
        await _db.SaveChangesAsync();
    }

    public async Task<List<LookupDto>> GetCategoriesAsync()
    {
        return await _db.TrainingCategories
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .Select(c => new LookupDto { Id = c.Id, Code = c.CategoryCode, Name = c.CategoryName })
            .ToListAsync();
    }
}
