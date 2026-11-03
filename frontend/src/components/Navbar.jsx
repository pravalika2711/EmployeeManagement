// Navbar.jsx - Top navigation header

import React from 'react';

export default function Navbar({ userName, onLogout, onToggleSidebar, activePage }) {
  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'employees':
        return 'Employee Directory';
      default:
        return 'Employee Management';
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <h1 className="navbar-title">{getPageTitle()}</h1>
      </div>

      <div className="navbar-right">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Signed in as <strong style={{ color: 'var(--text-main)' }}>{userName || 'Admin'}</strong>
        </span>
        <button className="btn-logout" onClick={onLogout} title="Sign Out">
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

