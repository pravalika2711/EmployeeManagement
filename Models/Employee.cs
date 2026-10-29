using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Models;

public class Employee
{
    public int Id { get; set; }

    // [Required] also rejects empty and whitespace-only strings
    [Required(ErrorMessage = "Name is required.")]
    public string Name { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "Salary must be greater than or equal to 0.")]
    public decimal Salary { get; set; }

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email is not a valid email address.")]
    public string Email { get; set; } = string.Empty;
}
