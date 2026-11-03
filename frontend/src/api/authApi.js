// authApi.js - Authentication API service

import { request } from './apiClient';

/**
 * Log in to the application.
 *
 * Calls the existing POST /api/Auth/login endpoint.
 * On success, the backend sets the .EmployeeManagement.Auth cookie.
 *
 * @param {string} userName
 * @param {string} password
 * @returns {Promise<{ message: string }>}
 */
export async function login(userName, password) {
  return await request('/api/Auth/login', {
    method: 'POST',
    body: {
      userName: userName.trim(),
      password: password,
    },
  });
}

/**
 * Register a new user account.
 *
 * Calls POST /api/Auth/register.
 * On success the backend returns { message: "Registration successful..." }.
 *
 * @param {string} userName
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {Promise<{ message: string }>}
 */
export async function register(userName, password, confirmPassword) {
  return await request('/api/Auth/register', {
    method: 'POST',
    body: {
      userName: userName.trim(),
      password: password,
      confirmPassword: confirmPassword,
    },
  });
}

/**
 * Log out of the application.
 *
 * Calls the existing POST /api/Auth/logout endpoint to clear auth and session cookies.
 *
 * @returns {Promise<void>}
 */
export async function logout() {
  await request('/api/Auth/logout', {
    method: 'POST',
  });
}
