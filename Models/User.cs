using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Models;

/// <summary>
/// Represents a registered user account in the system.
/// </summary>
public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Holds the PBKDF2 hashed password and cryptographic salt.
    /// Never contains the plain-text password.
    /// </summary>
    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

