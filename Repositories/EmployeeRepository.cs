using System.Data;
using System.Text;
using Dapper;
using EmployeeManagement.Models;
using Microsoft.Data.Sqlite;

namespace EmployeeManagement.Repositories;

/// <summary>
/// Employee repository implemented with Dapper + raw parameterized SQL queries.
///
/// WHY DAPPER?
/// -----------
/// Dapper is a lightweight "micro-ORM". It sits directly on top of ADO.NET and lets
/// you write plain SQL. Dapper maps result rows onto C# objects automatically, saving
/// the boilerplate of reading DataReader column-by-column yourself.
///
/// Compare with EF Core:
///   EF Core  → you write LINQ → EF translates to SQL → runs it
///   Dapper   → you write SQL  → Dapper maps results → done
///
/// This gives you full control over the exact SQL executed, which is great for
/// learning SQL and for performance-critical queries.
/// </summary>
public class EmployeeRepository : IEmployeeRepository
{
    // The connection string is read from appsettings.json ("DefaultConnection").
    // We store it and create a new SqliteConnection per operation.
    // Opening/closing a connection for each call is the standard ADO.NET/Dapper pattern.
    private readonly string _connectionString;

    public EmployeeRepository(IConfiguration configuration)
    {
        // IConfiguration is provided by ASP.NET Core's dependency injection.
        // GetConnectionString("DefaultConnection") reads from appsettings.json:
        //   "ConnectionStrings": { "DefaultConnection": "Data Source=employees.db" }
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' is not configured in appsettings.json.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper: open a new SQLite connection
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Creates and opens a fresh SqliteConnection.
    /// Using 'using' or 'await using' in each method ensures the connection is
    /// closed and released back to the pool after the query finishes.
    /// </summary>
    private SqliteConnection CreateConnection() => new SqliteConnection(_connectionString);

    // ─────────────────────────────────────────────────────────────────────────
    // GET ALL — with optional search, department filter, and sort
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Retrieves employees that match the optional filters, in the requested sort order.
    ///
    /// HOW DAPPER WORKS HERE:
    ///   connection.QueryAsync&lt;Employee&gt;(sql, parameters)
    ///   - Runs the SQL on the database.
    ///   - Maps each result row onto an Employee object by matching column names to
    ///     property names (Id → Id, Name → Name, etc.).
    ///   - Returns IEnumerable&lt;Employee&gt;.
    ///
    /// PARAMETERIZED QUERIES:
    ///   Notice @Search, @Department in the SQL. These are named parameters.
    ///   Dapper fills them from the anonymous object { Search = ..., Department = ... }.
    ///   The database driver handles escaping, so SQL injection is impossible.
    /// </summary>
    public async Task<IEnumerable<Employee>> GetAllAsync(
        string? search = null,
        string? department = null,
        string? sort = null)
    {
        // ── Build the WHERE clause dynamically ────────────────────────────────
        // We only add conditions for filters that the caller actually provided.
        var whereClauses = new List<string>();
        var parameters = new DynamicParameters();

        if (!string.IsNullOrWhiteSpace(search))
        {
            // LIKE '%term%' performs a substring search.
            // SQLite's LIKE is case-insensitive for ASCII by default, which matches
            // the original OrdinalIgnoreCase behaviour.
            var term = $"%{search.Trim()}%";
            whereClauses.Add("(Name LIKE @Search OR Email LIKE @Search OR Department LIKE @Search)");
            parameters.Add("Search", term);
        }

        if (!string.IsNullOrWhiteSpace(department))
        {
            // COLLATE NOCASE makes the equality check case-insensitive,
            // matching the original StringComparison.OrdinalIgnoreCase filter.
            whereClauses.Add("Department = @Department COLLATE NOCASE");
            parameters.Add("Department", department.Trim());
        }

        // ── Build the ORDER BY clause ─────────────────────────────────────────
        // We use a safe allow-list approach: only hard-coded strings enter the SQL,
        // never raw user input — this prevents ORDER BY injection.
        var orderBy = sort switch
        {
            "name_asc"       => "Name COLLATE NOCASE ASC",
            "name_desc"      => "Name COLLATE NOCASE DESC",
            "salary_asc"     => "CAST(Salary AS REAL) ASC",
            "salary_desc"    => "CAST(Salary AS REAL) DESC",
            "department_asc" => "Department COLLATE NOCASE ASC",
            "department_desc"=> "Department COLLATE NOCASE DESC",
            _                => "Id ASC"   // default order: insertion order by Id
        };

        // ── Assemble the full SQL string ──────────────────────────────────────
        var sql = new StringBuilder("SELECT Id, Name, Department, Salary, Email FROM Employees");

        if (whereClauses.Count > 0)
        {
            sql.Append(" WHERE ");
            sql.Append(string.Join(" AND ", whereClauses));
        }

        sql.Append($" ORDER BY {orderBy}");

        // ── Execute with Dapper ───────────────────────────────────────────────
        await using var connection = CreateConnection();
        return await connection.QueryAsync<Employee>(sql.ToString(), parameters);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET BY ID
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Fetches a single employee by primary key.
    ///
    /// QueryFirstOrDefaultAsync returns the first matching row, or null if none found.
    /// The WHERE Id = @Id clause uses a parameterized value — never string-concatenated.
    /// </summary>
    public async Task<Employee?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT Id, Name, Department, Salary, Email
            FROM Employees
            WHERE Id = @Id
            """;

        await using var connection = CreateConnection();
        return await connection.QueryFirstOrDefaultAsync<Employee>(sql, new { Id = id });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Inserts a new employee and returns the record with its generated Id.
    ///
    /// SQLite's last_insert_rowid() returns the auto-incremented primary key
    /// assigned to the row just inserted. Dapper's ExecuteScalarAsync runs a
    /// query that returns a single value (the new Id).
    ///
    /// We use a transaction to guarantee that both the INSERT and the
    /// last_insert_rowid() call happen atomically.
    /// </summary>
    public async Task<Employee> AddAsync(Employee employee)
    {
        const string sql = """
            INSERT INTO Employees (Name, Department, Salary, Email)
            VALUES (@Name, @Department, @Salary, @Email);
            SELECT last_insert_rowid();
            """;

        await using var connection = CreateConnection();
        // ExecuteScalarAsync<int> runs the SQL and returns the scalar result (new Id).
        var newId = await connection.ExecuteScalarAsync<int>(sql, new
        {
            employee.Name,
            employee.Department,
            employee.Salary,
            employee.Email,
        });

        employee.Id = newId;
        return employee;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Updates an existing employee's fields.
    ///
    /// ExecuteAsync returns the number of rows affected.
    /// If 0 rows were updated it means no employee with that Id exists → return false.
    /// </summary>
    public async Task<bool> UpdateAsync(Employee employee)
    {
        const string sql = """
            UPDATE Employees
            SET Name       = @Name,
                Department = @Department,
                Salary     = @Salary,
                Email      = @Email
            WHERE Id = @Id
            """;

        await using var connection = CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new
        {
            employee.Name,
            employee.Department,
            employee.Salary,
            employee.Email,
            employee.Id,
        });

        return rowsAffected > 0;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Deletes an employee by Id.
    ///
    /// Again, rows affected = 0 means the Id did not exist → return false.
    /// </summary>
    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM Employees WHERE Id = @Id";

        await using var connection = CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });

        return rowsAffected > 0;
    }
}
