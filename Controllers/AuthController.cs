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

        // 1. Reject attempts to register the reserved admin account
        if (string.Equals(username, AdminUsername, StringComparison.OrdinalIgnoreCase))
        {
            return Conflict(new { message = "That username is not available." });
        }

        // 2. Confirm password fields match (server-side check)
        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Password and Confirm Password do not match." });
        }

        // 3. Check username uniqueness (case-insensitive — DB index is NOCASE but we also
        //    guard here to return a clear message before any insert attempt)
        bool exists = await _db.Users
            .AnyAsync(u => u.Username == username); // EF uses COLLATE NOCASE index

        if (exists)
        {
            return Conflict(new { message = "A user with that username already exists." });
        }

        // 4. Hash the password securely using PBKDF2-SHA256 + random salt
        var passwordHash = _passwordHasher.HashPassword(request.Password);

        // 5. Persist the new user — no plain-text password is stored
        var user = new User
        {
            Username = username,
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

        if (!isAdmin)
        {
            // 2. Look up the user in the database (case-insensitive lookup via NOCASE collation)
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            // 3. If not found or password does not match, reject
            if (user is null || !_passwordHasher.VerifyPassword(user.PasswordHash, request.Password))
            {
                return Unauthorized(new { message = "Invalid user name or password." });
            }
        }

        // 4. Issue the authentication cookie (same as before — reuses existing cookie auth)
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, username),
            new Claim(ClaimTypes.Name, username)
        };
        var identity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal);

        HttpContext.Session.SetString("UserName", username);

        return Ok(new { message = "Login successful." });
    }

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
        /// <summary>Username — 3 to 50 characters, letters/digits/underscore only.</summary>
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(50, MinimumLength = 3,
            ErrorMessage = "Username must be between 3 and 50 characters.")]
        [RegularExpression(@"^[a-zA-Z0-9_]+$",
            ErrorMessage = "Username may only contain letters, digits, and underscores.")]
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
