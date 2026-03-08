using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TRDS.API.Middleware;
using TRDS.Infrastructure.Services;
using TRDS.Core.Interfaces;
using TRDS.Infrastructure.Data;
using TRDS.Infrastructure.Queries;

var builder = WebApplication.CreateBuilder(args);

// ========== Database Contexts ==========
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("TRDSDB")));

// ========== Dapper Query Services ==========
builder.Services.AddScoped<EmployeeQueryService>();
builder.Services.AddScoped<DashboardQueryService>();

// ========== Application Services ==========
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITrainingService, TrainingService>();
builder.Services.AddScoped<IAssignmentService, AssignmentService>();
// Register remaining services as they are implemented
builder.Services.AddScoped<IDashboardService, DashboardService>();
// builder.Services.AddScoped<IApprovalService, ApprovalService>();
// builder.Services.AddScoped<IScheduleService, ScheduleService>();
// builder.Services.AddScoped<IEmployeeService, EmployeeService>();
// builder.Services.AddScoped<INotificationService, NotificationService>();
// builder.Services.AddScoped<IReportService, ReportService>();
// builder.Services.AddScoped<IAuditService, AuditService>();
// builder.Services.AddScoped<IUserManagementService, UserManagementService>();
// builder.Services.AddScoped<IRoleManagementService, RoleManagementService>();
// builder.Services.AddScoped<IMenuService, MenuService>();
// builder.Services.AddScoped<ICertificateService, CertificateService>();
// builder.Services.AddScoped<ISettingsService, SettingsService>();

// ========== Authentication ==========
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ========== CORS ==========
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ========== Controllers & Swagger ==========
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ========== Middleware Pipeline ==========
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
