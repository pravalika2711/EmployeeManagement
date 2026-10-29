using EmployeeManagement.Models;
using EmployeeManagement.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagement.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeRepository _repository;

    // The repository (not AppDbContext) is provided by dependency injection
    public EmployeeController(IEmployeeRepository repository)
    {
        _repository = repository;
    }

    // GET: api/Employee
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees(
        [FromQuery] string? search,
        [FromQuery] string? department,
        [FromQuery] string? sort)
    {
        var employees = await _repository.GetAllAsync();
        IEnumerable<Employee> query = employees;

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(employee =>
                employee.Name.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                employee.Email.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                employee.Department.Contains(term, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(department))
        {
            query = query.Where(employee =>
                employee.Department.Equals(department, StringComparison.OrdinalIgnoreCase));
        }

        query = sort switch
        {
            "name_asc" => query.OrderBy(employee => employee.Name, StringComparer.OrdinalIgnoreCase),
            "name_desc" => query.OrderByDescending(employee => employee.Name, StringComparer.OrdinalIgnoreCase),
            "salary_asc" => query.OrderBy(employee => employee.Salary),
            "salary_desc" => query.OrderByDescending(employee => employee.Salary),
            "department_asc" => query.OrderBy(employee => employee.Department, StringComparer.OrdinalIgnoreCase),
            "department_desc" => query.OrderByDescending(employee => employee.Department, StringComparer.OrdinalIgnoreCase),
            _ => query
        };

        return Ok(query.ToList());
    }

    // GET: api/Employee/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Employee>> GetEmployee(int id)
    {
        var employee = await _repository.GetByIdAsync(id);

        if (employee == null)
        {
            return NotFound();
        }

        return Ok(employee);
    }

    // POST: api/Employee
    [HttpPost]
    public async Task<ActionResult<Employee>> CreateEmployee(Employee employee)
    {
        var createdEmployee = await _repository.AddAsync(employee);

        // Returns 201 Created with a Location header pointing to GET api/Employee/{id}
        return CreatedAtAction(nameof(GetEmployee), new { id = createdEmployee.Id }, createdEmployee);
    }

    // PUT: api/Employee/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, Employee employee)
    {
        if (id != employee.Id)
        {
            return BadRequest("The id in the URL does not match the employee id.");
        }

        var updated = await _repository.UpdateAsync(employee);

        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }

    // DELETE: api/Employee/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var deleted = await _repository.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
