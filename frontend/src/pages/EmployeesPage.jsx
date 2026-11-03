// EmployeesPage.jsx - Complete Employee Management Hub

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeModal from '../components/EmployeeModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../api/employeeApi';

export default function EmployeesPage({
  isAddModalOpenInitially = false,
  onResetInitialAddModal,
}) {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Search, filter, and sorting states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [currentSort, setCurrentSort] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle opening modal if triggered from sidebar or dashboard
  useEffect(() => {
    if (isAddModalOpenInitially) {
      setModalMode('create');
      setSelectedEmployee(null);
      setIsModalOpen(true);
      if (onResetInitialAddModal) onResetInitialAddModal();
    }
  }, [isAddModalOpenInitially, onResetInitialAddModal]);

  /**
   * Fetch employees from the backend using the current filters
   */
  const fetchEmployeesList = useCallback(
    async (overrideSearch = searchTerm) => {
      setIsLoading(true);
      try {
        const data = await getEmployees({
          search: overrideSearch,
          department: selectedDepartment,
          sort: currentSort,
        });
        setEmployees(data || []);
      } catch (err) {
        setNotification({
          type: 'error',
          message: err.message || 'Failed to load employees.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, selectedDepartment, currentSort]
  );

  // Initial load and filter change trigger
  useEffect(() => {
    fetchEmployeesList();
  }, [fetchEmployeesList]);

  // Extract all distinct departments from loaded employees to populate filter dropdown
  const distinctDepartments = useMemo(() => {
    const set = new Set();
    employees.forEach((e) => {
      if (e.department && e.department.trim()) {
        set.add(e.department.trim());
      }
    });
    return Array.from(set).sort();
  }, [employees]);

  // Handlers for Add/Edit
  const handleOpenAddModal = () => {
    setModalMode('create');
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee) => {
    setModalMode('edit');
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const created = await createEmployee(formData);
        setNotification({
          type: 'success',
          message: `Employee "${created.name}" created successfully!`,
        });
      } else {
        await updateEmployee(selectedEmployee.id, formData);
        setNotification({
          type: 'success',
          message: `Employee "${formData.name}" updated successfully!`,
        });
      }
      setIsModalOpen(false);
      // Refresh the employee list
      await fetchEmployeesList();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Delete
  const handleOpenDeleteDialog = (employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(employeeToDelete.id);
      setNotification({
        type: 'success',
        message: `Employee "${employeeToDelete.name}" was deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      // Refresh list
      await fetchEmployeesList();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete employee.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setCurrentSort('');
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h2 className="page-heading">Employee Directory</h2>
          <p className="page-subheading">
            Manage your organization's staff, view details, search, and update records.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <span>➕</span>
          <span>Add Employee</span>
        </button>
      </div>

      {/* Alert Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Search & Filter Toolbar */}
      <div className="toolbar-card">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {/* Department Filter */}
          <select
            className="filter-select"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            title="Filter by Department"
          >
            <option value="">All Departments</option>
            {distinctDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            className="filter-select"
            value={currentSort}
            onChange={(e) => setCurrentSort(e.target.value)}
            title="Sort records"
          >
            <option value="">Sort: Default</option>
            <option value="name_asc">Name (A → Z)</option>
            <option value="name_desc">Name (Z → A)</option>
            <option value="salary_asc">Salary (Low → High)</option>
            <option value="salary_desc">Salary (High → Low)</option>
            <option value="department_asc">Department (A → Z)</option>
            <option value="department_desc">Department (Z → A)</option>
          </select>

          {(searchTerm || selectedDepartment || currentSort) && (
            <button className="btn-reset" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="table-card">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner-large" />
            <p>Fetching employee records from database...</p>
          </div>
        ) : (
          <EmployeeTable
            employees={employees}
            currentSort={currentSort}
            onSortChange={setCurrentSort}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteDialog}
            onOpenAddModal={handleOpenAddModal}
          />
        )}
      </div>

      {/* Add / Edit Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedEmployee}
        availableDepartments={distinctDepartments}
        onSubmit={handleModalSubmit}
        onClose={() => setIsModalOpen(false)}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Employee"
        message={
          <>
            Are you sure you want to delete{' '}
            <strong className="confirm-name-highlight">
              {employeeToDelete?.name}
            </strong>
            ? This action will permanently remove this record from the database.
          </>
        }
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setEmployeeToDelete(null);
        }}
      />
    </div>
  );
}

