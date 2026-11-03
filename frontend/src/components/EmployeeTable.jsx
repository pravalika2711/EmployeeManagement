// EmployeeTable.jsx - Sortable data table for employees

import React from 'react';

/**
 * Format a number into Indian Rupee currency string (₹xx,xx,xxx.xx)
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function EmployeeTable({
  employees = [],
  currentSort = '',
  onSortChange,
  onEdit,
  onDelete,
  onOpenAddModal,
}) {
  /**
   * Toggles sort direction for a given column field
   */
  const handleSortClick = (field) => {
    if (!onSortChange) return;

    if (currentSort === `${field}_asc`) {
      onSortChange(`${field}_desc`);
    } else if (currentSort === `${field}_desc`) {
      onSortChange(''); // Reset to default
    } else {
      onSortChange(`${field}_asc`);
    }
  };

  /**
   * Helper to display an arrow for active sorting
   */
  const renderSortIndicator = (field) => {
    if (currentSort === `${field}_asc`) {
      return <span className="sort-icon active">▲</span>;
    }
    if (currentSort === `${field}_desc`) {
      return <span className="sort-icon active">▼</span>;
    }
    return <span className="sort-icon">⇅</span>;
  };

  if (!employees || employees.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <h3 className="empty-state-title">No employees found</h3>
        <p className="empty-state-desc">
          There are no employee records matching your current filter criteria, or the database is empty.
        </p>
        {onOpenAddModal && (
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <span>➕</span>
            <span>Add First Employee</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="employee-table">
        <thead>
          <tr>
            <th style={{ width: '80px' }}>ID</th>
            <th
              className="sortable-th"
              onClick={() => handleSortClick('name')}
              title="Click to sort by Name"
            >
              Employee Name {renderSortIndicator('name')}
            </th>
            <th
              className="sortable-th"
              onClick={() => handleSortClick('department')}
              title="Click to sort by Department"
            >
              Department {renderSortIndicator('department')}
            </th>
            <th
              className="sortable-th"
              onClick={() => handleSortClick('salary')}
              title="Click to sort by Salary"
            >
              Salary {renderSortIndicator('salary')}
            </th>
            <th>Email</th>
            <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>
                <span className="emp-id-badge">#{emp.id}</span>
              </td>
              <td>
                <div className="emp-name-cell">{emp.name}</div>
              </td>
              <td>
                <span className="badge badge-dept">
                  {emp.department || 'Unassigned'}
                </span>
              </td>
              <td>
                <span className="emp-salary-cell">
                  {formatCurrency(emp.salary)}
                </span>
              </td>
              <td>
                <a
                  href={`mailto:${emp.email}`}
                  className="emp-email-cell"
                  style={{ textDecoration: 'none' }}
                >
                  {emp.email}
                </a>
              </td>
              <td className="actions-cell">
                <div className="actions-group">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEdit(emp)}
                    title="Edit employee"
                  >
                    <span>✏️</span>
                    <span>Edit</span>
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onDelete(emp)}
                    title="Delete employee"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

