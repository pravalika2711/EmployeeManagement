namespace EmployeeManagement.Services;

/// <summary>
/// Defines methods for secure password hashing and verification.
/// </summary>
public interface IPasswordHasher
{
    /// <summary>
    /// Hashes a plain-text password using PBKDF2 with SHA-256 and a random cryptographic salt.
    /// </summary>
    /// <param name="password">The plain-text password to hash.</param>
    /// <returns>A formatted string containing iterations, salt, and hash.</returns>
    string HashPassword(string password);

    /// <summary>
    /// Verifies whether the provided plain-text password matches the stored hash.
    /// </summary>
    /// <param name="storedHash">The stored hash string (iterations.salt.hash).</param>
    /// <param name="providedPassword">The plain-text password provided by the user.</param>
    /// <returns>True if the password matches; otherwise, false.</returns>
    bool VerifyPassword(string storedHash, string providedPassword);
}

