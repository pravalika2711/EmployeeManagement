// Sidebar.jsx - Application navigation drawer

import React from 'react';

export default function Sidebar({
  activePage,
  setActivePage,
  isOpen,
  onClose,
  onOpenAddModal,
  userName = 'Admin',
}) {
  const handleNavClick = (page) => {
    setActivePage(page);
    onClose();
  };

  return (
    <>
      {/* Mobile background overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">👥</div>
          <div>
            <div className="sidebar-brand-name">StaffHub</div>
            <div className="sidebar-brand-sub">Employee Management</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-title">Navigation</span>

          <button
            className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <span className="nav-link-icon">📊</span>
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-link ${activePage === 'employees' ? 'active' : ''}`}
            onClick={() => handleNavClick('employees')}
          >
            <span className="nav-link-icon">👥</span>
            <span>Employees</span>
          </button>

          <span className="nav-section-title" style={{ marginTop: '1rem' }}>
            Quick Actions
          </span>

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.25rem' }}
            onClick={() => {
              onOpenAddModal();
              onClose();
            }}
          >
            <span>➕</span>
            <span>Add Employee</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar">
              {userName.substring(0, 1).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

