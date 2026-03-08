using System.Net;
using System.Text.Json;
using TRDS.Core.DTOs;
using TRDS.Infrastructure.Data;

namespace TRDS.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");

            // Log to database
            try
            {
                db.ErrorLogs.Add(new Core.Entities.ErrorLog
                {
                    ErrorMessage = ex.Message,
                    StackTrace = ex.StackTrace,
                    Source = ex.Source,
                    RequestPath = context.Request.Path,
                    RequestMethod = context.Request.Method,
                    UserId = context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
                    IPAddress = context.Connection.RemoteIpAddress?.ToString(),
                    Severity = "Error"
                });
                await db.SaveChangesAsync();
            }
            catch { /* Don't fail on logging failure */ }

            context.Response.StatusCode = ex switch
            {
                KeyNotFoundException => (int)HttpStatusCode.NotFound,
                UnauthorizedAccessException => (int)HttpStatusCode.Forbidden,
                ArgumentException => (int)HttpStatusCode.BadRequest,
                _ => (int)HttpStatusCode.InternalServerError
            };

            context.Response.ContentType = "application/json";
            var response = ApiResponse<object>.Fail(
                ex is KeyNotFoundException or ArgumentException ? ex.Message : "An unexpected error occurred.");
            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
