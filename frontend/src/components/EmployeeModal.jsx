// EmployeeModal.jsx - Form modal for creating and editing an employee

import React, { useState, useEffect } from 'react';

const DEFAULT_DEPARTMENTS = [
  'Engineering',
  'IT',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
];

export default function EmployeeModal({
  isOpen,
  mode = 'create', // 'create' or 'edit'
  initialData = null,
  availableDepartments = [],
  onSubmit,
  onClose,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    department: 'Engineering',
    customDepartment: '',
    salary: '',
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isCustomDept, setIsCustomDept] = useState(false);

  // Combine default departments and any unique departments from current DB records
  const allDepartments = Array.from(
    new Set([
      ...DEFAULT_DEPARTMENTS,
      ...availableDepartments.filter(Boolean),
    ])
  );

  // When modal opens or initialData changes, populate the form
  useEffect(() => {
    if (initialData && mode === 'edit') {
      const isCustom = initialData.department && !allDepartments.includes(initialData.department);
      setFormData({
        name: initialData.name || '',
        department: isCustom ? '__other__' : (initialData.department || allDepartments[0] || 'IT'),
        customDepartment: isCustom ? initialData.department : '',
        salary: initialData.salary !== undefined ? initialData.salary.toString() : '',
        email: initialData.email || '',
      });
      setIsCustomDept(isCustom);
    } else {
      setFormData({
        name: '',
        department: allDepartments[0] || 'Engineering',
        customDepartment: '',
        salary: '',
        email: '',
      });
      setIsCustomDept(false);
    }
    setErrors({});
    setServerError('');
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'department') {
      if (value === '__other__') {
        setIsCustomDept(true);
      } else {
        setIsCustomDept(false);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-level error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validate Name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Email is not a valid email address.';
    }

    // Validate Salary
    if (formData.salary === '' || formData.salary === null) {
      newErrors.salary = 'Salary is required.';
    } else {
      const numSalary = Number(formData.salary);
      if (isNaN(numSalary) || numSalary < 0) {
        newErrors.salary = 'Salary must be greater than or equal to 0.';
      }
    }

    // Validate Custom Department if selected
    if (isCustomDept && !formData.customDepartment.trim()) {
      newErrors.customDepartment = 'Please specify the custom department name.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    const resolvedDepartment = isCustomDept
      ? formData.customDepartment.trim()
      : formData.department.trim();

    try {
      await onSubmit({
        name: formData.name.trim(),
        department: resolvedDepartment,
        salary: parseFloat(formData.salary),
        email: formData.email.trim(),
      });
    } catch (err) {
      setServerError(err.message || 'Failed to save employee. Please verify input values.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create' ? '➕ Add New Employee' : '✏️ Edit Employee'}
          </h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {serverError && (
              <div className="auth-error-alert" style={{ marginBottom: '1.25rem' }}>
                <span>⚠️</span>
                <span>{serverError}</span>
              </div>
            )}

            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                placeholder="e.g. Jane Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                autoFocus
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'has-error' : ''}`}
                placeholder="e.g. jane.doe@company.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Department Selection */}
            <div className="form-group">
              <label htmlFor="department" className="form-label">
                Department
              </label>
              <select
                id="department"
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                {allDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="__other__">Other (Enter custom department)...</option>
              </select>
            </div>

            {/* Custom Department input when "Other" is chosen */}
            {isCustomDept && (
              <div className="form-group">
                <label htmlFor="customDepartment" className="form-label">
                  Custom Department Name <span className="required">*</span>
                </label>
                <input
                  id="customDepartment"
                  name="customDepartment"
                  type="text"
                  className={`form-input ${errors.customDepartment ? 'has-error' : ''}`}
                  placeholder="Enter department name"
                  value={formData.customDepartment}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.customDepartment && (
                  <span className="form-error">{errors.customDepartment}</span>
                )}
              </div>
            )}

            {/* Salary Field */}
            <div className="form-group">
              <label htmlFor="salary" className="form-label">
                Salary (₹ INR) <span className="required">*</span>
              </label>
              <input
                id="salary"
                name="salary"
                type="number"
                step="0.01"
                min="0"
                className={`form-input ${errors.salary ? 'has-error' : ''}`}
                placeholder="e.g. 75000"
                value={formData.salary}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.salary && <span className="form-error">{errors.salary}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  <span>Saving...</span>
                </>
              ) : mode === 'create' ? (
                'Create Employee'
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

