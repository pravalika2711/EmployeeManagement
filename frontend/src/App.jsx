// App.jsx - Root application component with auth state & page routing

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmployeesPage from './pages/EmployeesPage';
import { getEmployees } from './api/employeeApi';
import { logout } from './api/authApi';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userName, setUserName] = useState('');
  const [activePage, setActivePage] = useState('dashboard'); // 'dashboard' or 'employees'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openAddModalOnEmployees, setOpenAddModalOnEmployees] = useState(false);
  // Controls which auth view to show when not authenticated: 'login' or 'register'
  const [authView, setAuthView] = useState('login');

  // Check auth status on initial load by querying an authorized endpoint
  useEffect(() => {
    async function verifyAuth() {
      try {
        await getEmployees();
        // If GET /api/Employee succeeds (status 200), cookie auth is valid
        setIsAuthenticated(true);
      } catch (err) {
        // If status 401 Unauthorized, show Login page
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    verifyAuth();
  }, []);

  const handleLoginSuccess = (name) => {
    setUserName(name || 'user');
    setIsAuthenticated(true);
    setActivePage('dashboard');
    setAuthView('login'); // reset for next logout
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setIsAuthenticated(false);
      setActivePage('dashboard');
      setAuthView('login');
    }
  };

  const handleOpenAddModalFromSidebar = () => {
    setActivePage('employees');
    setOpenAddModalOnEmployees(true);
  };

  // Initial loading splash screen
  if (isCheckingAuth) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner-large" />
        <p style={{ marginTop: '1rem', fontWeight: 500 }}>
          Connecting to Employee Management API...
        </p>
      </div>
    );
  }

  // If not authenticated, render Login or Register view
  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <Register
          onGoToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => setAuthView('register')}
      />
    );
  }

  // Authenticated application layout
  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenAddModal={handleOpenAddModalFromSidebar}
        userName={userName}
      />

      <div className="main-layout">
        <Navbar
          userName={userName}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          activePage={activePage}
        />

        <main className="page-content">
          {activePage === 'dashboard' && (
            <Dashboard
              onNavigateEmployees={() => setActivePage('employees')}
              onOpenAddModal={handleOpenAddModalFromSidebar}
              userName={userName}
            />
          )}

          {activePage === 'employees' && (
            <EmployeesPage
              isAddModalOpenInitially={openAddModalOnEmployees}
              onResetInitialAddModal={() => setOpenAddModalOnEmployees(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
