// Register.jsx - User registration view

import React, { useState } from 'react';
import { register } from '../api/authApi';

/**
 * Registration page component.
 *
 * Props:
 *  - onGoToLogin: function — called when user clicks "Sign In" link
 */
export default function Register({ onGoToLogin }) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Basic client-side check: all fields required
    if (!userName.trim()) {
      setErrorMessage('Username is required.');
      return;
    }
    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }
    if (!confirmPassword) {
      setErrorMessage('Please confirm your password.');
      return;
    }
    // Client-side match check (backend also validates this)
    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(userName, password, confirmPassword);
      // Show success message — user must click "Sign In" to proceed
      setSuccessMessage(result?.message || 'Registration successful! You can now sign in.');
      setUserName('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">✍️</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Register for the Employee Management Portal</p>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="auth-error-alert" role="alert">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success alert shown after a successful registration */}
        {successMessage && (
          <div className="auth-success-alert" role="status">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Hide the form once registration succeeds */}
        {!successMessage && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-userName">
                Username <span className="required">*</span>
              </label>
              <input
                id="reg-userName"
                type="text"
                className="form-input"
                placeholder="Choose a username (letters, digits, underscore)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
                autoFocus
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password <span className="required">*</span>
              </label>
              <input
                id="reg-password"
                type="password"
                className="form-input"
                placeholder="At least 8 chars, upper, lower, digit, symbol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirmPassword">
                Confirm Password <span className="required">*</span>
              </label>
              <input
                id="reg-confirmPassword"
                type="password"
                className="form-input"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            {/* Password requirements hint */}
            <div className="auth-password-hint">
              Password must be at least 8 characters and include an uppercase letter, a lowercase
              letter, a digit, and a special character (e.g.&nbsp;<code>!</code>&nbsp;<code>@</code>&nbsp;<code>#</code>).
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  <span>Registering...</span>
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>
        )}

        {/* Navigation link — always visible */}
        <div className="auth-switch-link">
          Already have an account?{' '}
          <button
            type="button"
            className="auth-link-btn"
            onClick={onGoToLogin}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

