// apiClient.js - Centralized HTTP fetch client

/**
 * Custom application API error wrapper
 */
export class ApiError extends Error {
  constructor(message, status = 0, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Base fetch function with automatic credentials, headers, and error parsing.
 *
 * @param {string} endpoint - The relative API path (e.g. "/api/Employee")
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<any>} Parsed response data
 */
export async function request(endpoint, options = {}) {
  const config = {
    ...options,
    // Always include credentials (cookies) for both same-origin and proxied calls
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
  };

  // If a request body is supplied and not already a string or FormData, serialize it to JSON
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(endpoint, config);
  } catch (networkError) {
    throw new ApiError(
      'Unable to connect to the backend server. Please ensure the API is running.',
      0
    );
  }

  // Handle 204 No Content responses (like DELETE or PUT)
  if (response.status === 204) {
    return null;
  }

  // Parse JSON or text response
  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  // If the server responded with an HTTP error status (4xx or 5xx)
  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred.';

    if (data && typeof data === 'object') {
      // Check for custom backend message: { message: "..." }
      if (data.message) {
        errorMessage = data.message;
      }
      // Check for ASP.NET Core Validation ProblemDetails: { errors: { FieldName: ["..."] } }
      else if (data.errors && typeof data.errors === 'object') {
        const errorList = Object.values(data.errors).flat();
        errorMessage = errorList.join(' ');
      }
      // Check for standard ProblemDetails title
      else if (data.title) {
        errorMessage = data.title;
      }
    } else if (typeof data === 'string' && data.trim()) {
      errorMessage = data;
    } else {
      errorMessage = `Server returned HTTP ${response.status} (${response.statusText})`;
    }

    throw new ApiError(errorMessage, response.status, data?.errors || null);
  }

  return data;
}

