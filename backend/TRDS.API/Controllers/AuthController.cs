using Microsoft.AspNetCore.Mvc;
using TRDS.Core.DTOs;
using TRDS.Core.Interfaces;

namespace TRDS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();
        var result = await _authService.LoginAsync(request, ipAddress, userAgent);

        if (!result.Success)
            return Ok(ApiResponse<LoginResponse>.Fail(result.ErrorMessage ?? "Login failed"));

        return Ok(ApiResponse<LoginResponse>.Ok(result));
    }

    [HttpPost("logout")]
    public async Task<ActionResult<ApiResponse<bool>>> Logout()
    {
        var token = Request.Headers.Authorization.ToString().Replace("Bearer ", "");
        await _authService.LogoutAsync(token);
        return Ok(ApiResponse<bool>.Ok(true, "Logged out successfully"));
    }
}
