using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        if (request.UserName != "admin" || request.Password != "Password123!")
        {
            return Unauthorized(new { message = "Invalid user name or password." });
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, request.UserName),
            new Claim(ClaimTypes.Name, request.UserName)
        };
        var identity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal);
        HttpContext.Session.SetString("UserName", request.UserName);

        return Ok(new { message = "Login successful." });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        HttpContext.Session.Remove("UserName");
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    public sealed class LoginRequest
    {
        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
