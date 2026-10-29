using EmployeeManagement.Models;

namespace EmployeeManagement.Repositories;

public interface IEmployeeRepository
{
    Task<IEnumerable<Employee>> GetAllAsync();
    Task<Employee?> GetByIdAsync(int id);
    Task<Employee> AddAsync(Employee employee);
    Task<bool> UpdateAsync(Employee employee);   // false = employee not found
    Task<bool> DeleteAsync(int id);              // false = employee not found
}
