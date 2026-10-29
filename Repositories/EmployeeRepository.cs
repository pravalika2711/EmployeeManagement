using EmployeeManagement.Data;
using EmployeeManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly AppDbContext _context;

    // AppDbContext is provided by dependency injection
    public EmployeeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Employee>> GetAllAsync()
    {
        return await _context.Employees.ToListAsync();
    }

    public async Task<Employee?> GetByIdAsync(int id)
    {
        return await _context.Employees.FindAsync(id);
    }

    public async Task<Employee> AddAsync(Employee employee)
    {
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();
        return employee; // Id is filled in after SaveChanges
    }

    public async Task<bool> UpdateAsync(Employee employee)
    {
        var existingEmployee = await _context.Employees.FindAsync(employee.Id);

        if (existingEmployee == null)
        {
            return false;
        }

        existingEmployee.Name = employee.Name;
        existingEmployee.Department = employee.Department;
        existingEmployee.Salary = employee.Salary;
        existingEmployee.Email = employee.Email;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
        {
            return false;
        }

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();
        return true;
    }
}
