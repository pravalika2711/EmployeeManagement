using EmployeeManagement.Models;

namespace EmployeeManagement.Repositories;

public interface IEmployeeRepository
{
    // search  : optional substring match on Name, Email, or Department
    // department : optional exact department filter
    // sort    : optional sort key (name_asc, name_desc, salary_asc, salary_desc,
    //           department_asc, department_desc)
    Task<IEnumerable<Employee>> GetAllAsync(
        string? search = null,
        string? department = null,
        string? sort = null);

    Task<Employee?> GetByIdAsync(int id);
    Task<Employee> AddAsync(Employee employee);
    Task<bool> UpdateAsync(Employee employee);   // false = employee not found
    Task<bool> DeleteAsync(int id);              // false = employee not found
}
