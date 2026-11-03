// Dashboard.jsx - Overview dashboard with real metrics

import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { getEmployees } from '../api/employeeApi';

function formatCurrency(amount) {
  if (!amount || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Dashboard({
  onNavigateEmployees,
  onOpenAddModal,
  userName = 'Admin',
}) {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getEmployees();
      setEmployees(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute real metrics from the API data
  const totalEmployees = employees.length;

  const uniqueDepartments = Array.from(
    new Set(employees.map((e) => e.department?.trim()).filter(Boolean))
  );

  const averageSalary =
    totalEmployees > 0
      ? employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0) / totalEmployees
      : 0;

  return (
    <div>
      <div className="dashboard-header">
        <h2 className="dashboard-greeting">Hello, {userName}! 🌸</h2>
        <p className="dashboard-subgreeting">
          Here is an overview of your organization's staff and operations.
        </p>
      </div>

      {error && (
        <div className="auth-error-alert" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadData}
            style={{ marginLeft: 'auto' }}
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner-large" />
          <p>Loading real-time statistics...</p>
        </div>
      ) : (
        <>
          {/* Stat KPI Grid */}
          <div className="stat-grid">
            <StatCard
              title="Total Employees"
              value={totalEmployees}
              description="Active registered staff members"
              icon="👥"
              variant="indigo"
            />
            <StatCard
              title="Active Departments"
              value={uniqueDepartments.length}
              description={uniqueDepartments.slice(0, 3).join(', ') || 'None assigned'}
              icon="🏢"
              variant="blue"
            />
            <StatCard
              title="Average Salary"
              value={formatCurrency(averageSalary)}
              description="Across all current employees"
              icon="₹"
              variant="emerald"
            />
          </div>

          {/* Quick Actions Grid */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Quick Actions</h3>
            </div>
            <div className="quick-action-cards">
              <button
                className="quick-action-card"
                onClick={onNavigateEmployees}
              >
                <span className="quick-action-icon">📋</span>
                <span className="quick-action-title">Browse Directory</span>
                <span className="quick-action-desc">
                  Search, filter, edit, or delete existing employee records.
                </span>
              </button>

              <button
                className="quick-action-card"
                onClick={onOpenAddModal}
              >
                <span className="quick-action-icon">➕</span>
                <span className="quick-action-title">Add New Employee</span>
                <span className="quick-action-desc">
                  Register a new staff member with email, department, and salary.
                </span>
              </button>

              <button
                className="quick-action-card"
                onClick={loadData}
              >
                <span className="quick-action-icon">🔄</span>
                <span className="quick-action-title">Sync Data</span>
                <span className="quick-action-desc">
                  Fetch the latest records directly from the SQLite database.
                </span>
              </button>
            </div>
          </div>

          {/* Recent Employees Preview */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Recent Employees</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onNavigateEmployees}
              >
                View All Directory →
              </button>
            </div>

            {employees.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No employees found in the database yet. Click "Add New Employee" to get started!
              </p>
            ) : (
              <div className="table-responsive">
                <table className="employee-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Salary</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.slice(-5).reverse().map((emp) => (
                      <tr key={emp.id}>
                        <td><span className="emp-id-badge">#{emp.id}</span></td>
                        <td className="emp-name-cell">{emp.name}</td>
                        <td>
                          <span className="badge badge-dept">
                            {emp.department || 'General'}
                          </span>
                        </td>
                        <td>{formatCurrency(emp.salary)}</td>
                        <td className="emp-email-cell">{emp.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

