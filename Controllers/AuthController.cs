using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using EmployeeManagement.Data;
using EmployeeManagement.Models;
using EmployeeManagement.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // Built-in admin credentials — not stored in the database
    private const string AdminUsername = "admin";
    private const string AdminPassword = "Password123!";

    private readonly AppDbContext _db;
    private readonly IPasswordHasher _passwordHasher;

    public AuthController(AppDbContext db, IPasswordHasher passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/Auth/register
    // ─────────────────────────────────────────────────────────────────────────
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        // Trim username for consistency
        var username = request.UserName.Trim();

        // Employee accounts must use the email of an existing employee record.
        if (username.Length > 50 || !new EmailAddressAttribute().IsValid(username))
        {
            return BadRequest(new { message = "Enter a valid employee email address (up to 50 characters)." });
        }
        if (string.Equals(username, AdminUsername, StringComparison.OrdinalIgnoreCase))
            return Conflict(new { message = "That email is not available." });
        var normalizedEmail = username.ToLowerInvariant();
        if (!await _db.Employees.AnyAsync(e => e.Email.ToLower() == normalizedEmail))
            return BadRequest(new { message = "Registration is available only to employees with an existing employee record." });

        // 2. Confirm password fields match (server-side check)
        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Password and Confirm Password do not match." });
        }

        // 3. Check username uniqueness (case-insensitive — DB index is NOCASE but we also
        //    guard here to return a clear message before any insert attempt)
        bool exists = await _db.Users
            .AnyAsync(u => u.Username == normalizedEmail); // EF uses COLLATE NOCASE index

        if (exists)
        {
            return Conflict(new { message = "A user with that username already exists." });
        }

        // 4. Hash the password securely using PBKDF2-SHA256 + random salt
        var passwordHash = _passwordHasher.HashPassword(request.Password);

        // 5. Persist the new user — no plain-text password is stored
        var user = new User
        {
            Username = normalizedEmail,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Registration successful. You can now sign in." });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/Auth/login
    // ─────────────────────────────────────────────────────────────────────────
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var username = request.UserName.Trim();

        // 1. Check built-in admin credentials first (not stored in DB)
        bool isAdmin = string.Equals(username, AdminUsername, StringComparison.OrdinalIgnoreCase)
                       && request.Password == AdminPassword;
        string role;
        string authenticatedName;

        if (!isAdmin)
        {
            var normalizedEmail = username.ToLowerInvariant();
            var employeeExists = await _db.Employees.AnyAsync(e => e.Email.ToLower() == normalizedEmail);
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Username == normalizedEmail);

            // 3. If not found or password does not match, reject
            if (!employeeExists || user is null || !_passwordHasher.VerifyPassword(user.PasswordHash, request.Password))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }
            role = "Employee";
            authenticatedName = normalizedEmail;
        }
        else
        {
            role = "Admin";
            authenticatedName = username;
        }

        // 4. Issue the authentication cookie (same as before — reuses existing cookie auth)
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, authenticatedName),
            new Claim(ClaimTypes.Name, authenticatedName),
            new Claim(ClaimTypes.Role, role)
        };
        var identity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal);

        HttpContext.Session.SetString("UserName", authenticatedName);

        return Ok(new { message = "Login successful.", userName = authenticatedName, role });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult CurrentUser() => Ok(new
    {
        userName = User.Identity?.Name,
        role = User.FindFirstValue(ClaimTypes.Role)
    });

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/Auth/logout
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        HttpContext.Session.Remove("UserName");
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Request DTO classes
    // ─────────────────────────────────────────────────────────────────────────

    public sealed class LoginRequest
    {
        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public sealed class RegisterRequest
    {
        [Required(ErrorMessage = "Username is required.")]
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Password strength rules:
        ///  - At least 8 characters
        ///  - At least one uppercase letter
        ///  - At least one lowercase letter
        ///  - At least one digit
        ///  - At least one special character
        /// </summary>
        [Required(ErrorMessage = "Password is required.")]
        [RegularExpression(
            @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$",
            ErrorMessage = "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a digit, and a special character.")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Confirm Password is required.")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
