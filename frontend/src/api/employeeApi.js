// employeeApi.js - Employee CRUD and Query API service

import { request } from './apiClient';

/**
 * Fetch employees with optional search term, department filter, and sort key.
 *
 * Calls the existing GET /api/Employee endpoint.
 *
 * @param {Object} [filters={}]
 * @param {string} [filters.search] - Search by Name, Email, or Department (substring match)
 * @param {string} [filters.department] - Exact department filter
 * @param {string} [filters.sort] - Sort key: name_asc, name_desc, salary_asc, salary_desc, department_asc, department_desc
 * @returns {Promise<Array<{ id: number, name: string, department: string, salary: number, email: string }>>}
 */
export async function getEmployees({ search = '', department = '', sort = '' } = {}) {
  const params = new URLSearchParams();

  if (search && search.trim()) {
    params.append('search', search.trim());
  }

  if (department && department.trim()) {
    params.append('department', department.trim());
  }

  if (sort && sort.trim()) {
    params.append('sort', sort.trim());
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/api/Employee?${queryString}` : '/api/Employee';

  return await request(endpoint, { method: 'GET' });
}

/**
 * Fetch a single employee by their ID.
 *
 * Calls the existing GET /api/Employee/{id} endpoint.
 *
 * @param {number|string} id
 * @returns {Promise<{ id: number, name: string, department: string, salary: number, email: string }>}
 */
export async function getEmployeeById(id) {
  return await request(`/api/Employee/${id}`, { method: 'GET' });
}

/**
 * Create a new employee record.
 *
 * Calls the existing POST /api/Employee endpoint.
 *
 * @param {Object} employeeData
 * @param {string} employeeData.name
 * @param {string} employeeData.department
 * @param {number|string} employeeData.salary
 * @param {string} employeeData.email
 * @returns {Promise<{ id: number, name: string, department: string, salary: number, email: string }>}
 */
export async function createEmployee(employeeData) {
  return await request('/api/Employee', {
    method: 'POST',
    body: {
      name: employeeData.name.trim(),
      department: employeeData.department?.trim() || '',
      salary: parseFloat(employeeData.salary) || 0,
      email: employeeData.email.trim(),
    },
  });
}

/**
 * Update an existing employee record.
 *
 * Calls the existing PUT /api/Employee/{id} endpoint.
 * Note: The backend requires `id` in both route and body to match.
 *
 * @param {number|string} id
 * @param {Object} employeeData
 * @param {string} employeeData.name
 * @param {string} employeeData.department
 * @param {number|string} employeeData.salary
 * @param {string} employeeData.email
 * @returns {Promise<void>}
 */
export async function updateEmployee(id, employeeData) {
  const numericId = parseInt(id, 10);
  return await request(`/api/Employee/${numericId}`, {
    method: 'PUT',
    body: {
      id: numericId,
      name: employeeData.name.trim(),
      department: employeeData.department?.trim() || '',
      salary: parseFloat(employeeData.salary) || 0,
      email: employeeData.email.trim(),
    },
  });
}

/**
 * Delete an employee record by ID.
 *
 * Calls the existing DELETE /api/Employee/{id} endpoint.
 *
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export async function deleteEmployee(id) {
  return await request(`/api/Employee/${id}`, {
    method: 'DELETE',
  });
}

