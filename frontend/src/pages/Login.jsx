// Login.jsx - User login view

import React, { useState } from 'react';
import { login } from '../api/authApi';

/**
 * Login page component.
 *
 * Props:
 *  - onLoginSuccess: function(userName) — called on successful login
 *  - onGoToRegister: function — called when user clicks the Register link
 */
export default function Login({ onLoginSuccess, onGoToRegister }) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!userName.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(userName, password);
      // Notify parent app of successful login
      onLoginSuccess(userName.trim());
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">👥</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to the Employee Management Portal</p>
        </div>

        {errorMessage && (
          <div className="auth-error-alert" role="alert">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="userName">
              Username <span className="required">*</span>
            </label>
            <input
              id="userName"
              type="text"
              className="form-input"
              placeholder="Enter your username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="auth-switch-link">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="auth-link-btn"
            onClick={onGoToRegister}
          >
            Register here
          </button>
        </div>

        <div className="auth-hint-box">
          <div className="auth-hint-title">Default Admin Credentials:</div>
          <div>Username: <code className="auth-hint-code">admin</code></div>
          <div style={{ marginTop: '0.2rem' }}>
            Password: <code className="auth-hint-code">Password123!</code>
          </div>
        </div>
      </div>
    </div>
  );
}
