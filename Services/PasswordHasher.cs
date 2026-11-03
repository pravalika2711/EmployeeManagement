using System.Security.Cryptography;

namespace EmployeeManagement.Services;

/// <summary>
/// Implements password hashing and verification using PBKDF2 with SHA-256 and a random salt.
/// Format stored in database: {iterations}.{saltBase64}.{hashBase64}
/// </summary>
public class PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;       // 128-bit random salt
    private const int KeySize = 32;        // 256-bit derived subkey
    private const int Iterations = 100_000; // 100,000 iterations for PBKDF2-HMAC-SHA256
    private static readonly HashAlgorithmName Algorithm = HashAlgorithmName.SHA256;

    public string HashPassword(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);

        // 1. Generate a cryptographically secure 16-byte random salt
        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);

        // 2. Hash the password using PBKDF2 with SHA-256
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            Algorithm,
            KeySize);

        // 3. Return formatted string: iterations.saltBase64.hashBase64
        return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public bool VerifyPassword(string storedHash, string providedPassword)
    {
        if (string.IsNullOrWhiteSpace(storedHash) || string.IsNullOrWhiteSpace(providedPassword))
        {
            return false;
        }

        // Expected format: iterations.salt.hash
        string[] parts = storedHash.Split('.');
        if (parts.Length != 3)
        {
            return false;
        }

        if (!int.TryParse(parts[0], out int iterations) || iterations <= 0)
        {
            return false;
        }

        byte[] salt;
        byte[] expectedHash;
        try
        {
            salt = Convert.FromBase64String(parts[1]);
            expectedHash = Convert.FromBase64String(parts[2]);
        }
        catch (FormatException)
        {
            return false;
        }

        // Re-compute the hash for the provided password using the stored salt and iteration count
        byte[] actualHash = Rfc2898DeriveBytes.Pbkdf2(
            providedPassword,
            salt,
            iterations,
            Algorithm,
            expectedHash.Length);

        // Use constant-time comparison to protect against timing attacks
        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }
}

