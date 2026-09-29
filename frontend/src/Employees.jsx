import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const emptyForm = {
  employee_code: "",
  first_name: "",
  last_name: "",
  email: "",
  country: "",
  department: "",
  job_title: "",
  currency: "",
  annual_salary: "",
};

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [countries, setCountries] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [page, search, country, department]);

  const loadFilters = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/employees/filters/options`
      );

      setCountries(response.data.countries || []);
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error("Failed to load filters:", error);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/employees`,
        {
          params: {
            page,
            page_size: pageSize,
            search: search || undefined,
            country: country || undefined,
            department: department || undefined,
          },
        }
      );

      setEmployees(response.data.items || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleCountry = (value) => {
    setCountry(value);
    setPage(1);
  };

  const handleDepartment = (value) => {
    setDepartment(value);
    setPage(1);
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);

    setForm({
      employee_code: employee.employee_code || "",
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      email: employee.email || "",
      country: employee.country || "",
      department: employee.department || "",
      job_title: employee.job_title || "",
      currency: employee.currency || "",
      annual_salary: employee.annual_salary || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingEmployee(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveEmployee = async (event) => {
    event.preventDefault();

    if (!form.first_name.trim()) {
      alert("First name is required.");
      return;
    }

    if (!form.last_name.trim()) {
      alert("Last name is required.");
      return;
    }

    if (!form.email.trim()) {
      alert("Email is required.");
      return;
    }

    if (!form.country.trim()) {
      alert("Country is required.");
      return;
    }

    if (!form.department.trim()) {
      alert("Department is required.");
      return;
    }

    if (!form.job_title.trim()) {
      alert("Job title is required.");
      return;
    }

    if (!form.currency.trim()) {
      alert("Currency is required.");
      return;
    }

    if (!form.annual_salary || Number(form.annual_salary) <= 0) {
      alert("Annual salary must be greater than 0.");
      return;
    }

    if (!editingEmployee && !form.employee_code.trim()) {
      alert("Employee code is required.");
      return;
    }

    try {
      setSaving(true);

      if (editingEmployee) {
        const updatePayload = {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          country: form.country,
          department: form.department,
          job_title: form.job_title,
          currency: form.currency,
          annual_salary: Number(form.annual_salary),
        };

        await axios.put(
          `${API_URL}/employees/${editingEmployee.id}`,
          updatePayload
        );

        alert("Employee updated successfully.");
      } else {
        const createPayload = {
          ...form,
          annual_salary: Number(form.annual_salary),
        };

        await axios.post(
          `${API_URL}/employees`,
          createPayload
        );

        alert("Employee created successfully.");
      }

      closeModal();
      await loadEmployees();
      await loadFilters();
    } catch (error) {
      console.error("Save employee error:", error);

      const message =
        error.response?.data?.detail ||
        "Unable to save employee.";

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteEmployee = async (employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.first_name} ${employee.last_name}?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/employees/${employee.id}`
      );

      alert("Employee deleted successfully.");

      if (employees.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadEmployees();
      }
    } catch (error) {
      console.error("Delete employee error:", error);

      alert(
        error.response?.data?.detail ||
        "Unable to delete employee."
      );
    }
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(salary || 0);
  };

  return (
    <div className="employees-page">

      <div className="employees-page-header">
        <div>
          <p className="eyebrow">WORKFORCE MANAGEMENT</p>

          <h1>Employees</h1>

          <p className="employees-description">
            Manage employee records and compensation information.
          </p>
        </div>

        <button
          className="add-employee-btn"
          onClick={openAddModal}
        >
          + Add Employee
        </button>
      </div>

      <div className="employee-filters">

        <div className="employee-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search by name, email, code..."
            value={search}
            onChange={(event) =>
              handleSearch(event.target.value)
            }
          />
        </div>

        <select
          value={country}
          onChange={(event) =>
            handleCountry(event.target.value)
          }
        >
          <option value="">All Countries</option>

          {countries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={department}
          onChange={(event) =>
            handleDepartment(event.target.value)
          }
        >
          <option value="">All Departments</option>

          {departments.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="employee-count">
          {total.toLocaleString()} employees
        </div>
      </div>

      <div className="employee-table-card">

        <div className="employee-table-wrapper">

          <table className="employee-table">

            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Country</th>
                <th>Job Title</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="table-state"
                  >
                    Loading employees...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="table-state"
                  >
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id}>

                    <td>
                      <div className="employee-info">

                        <div className="employee-avatar">
                          {employee.first_name?.[0]}
                          {employee.last_name?.[0]}
                        </div>

                        <div>
                          <strong>
                            {employee.first_name}{" "}
                            {employee.last_name}
                          </strong>

                          <span>
                            {employee.employee_code}
                          </span>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="department-pill">
                        {employee.department}
                      </span>
                    </td>

                    <td>{employee.country}</td>

                    <td>{employee.job_title}</td>

                    <td>
                      <strong>
                        {employee.currency}{" "}
                        {formatSalary(employee.annual_salary)}
                      </strong>
                    </td>

                    <td>

                      <div className="action-buttons">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            openEditModal(employee)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteEmployee(employee)
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

        <div className="pagination">

          <button
            disabled={page === 1}
            onClick={() =>
              setPage((previous) => previous - 1)
            }
          >
            ←
          </button>

          <span>
            Page <strong>{page}</strong> of{" "}
            <strong>{totalPages}</strong>
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() =>
              setPage((previous) => previous + 1)
            }
          >
            →
          </button>

        </div>

      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >

          <div className="employee-modal">

            <div className="modal-header">

              <div>
                <p className="eyebrow">
                  EMPLOYEE RECORD
                </p>

                <h2>
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form onSubmit={saveEmployee}>

              <div className="form-grid">

                <div className="form-field">

                  <label>
                    Employee Code
                  </label>

                  <input
                    name="employee_code"
                    value={form.employee_code}
                    onChange={handleChange}
                    disabled={!!editingEmployee}
                    placeholder="EMP00001"
                  />

                </div>

                <div className="form-field">

                  <label>
                    First Name *
                  </label>

                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="First name"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Last Name *
                  </label>

                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Last name"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="employee@acme.com"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Country *
                  </label>

                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="India"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Department *
                  </label>

                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="Engineering"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Job Title *
                  </label>

                  <input
                    name="job_title"
                    value={form.job_title}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Currency *
                  </label>

                  <input
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    placeholder="INR"
                    maxLength="10"
                  />

                </div>

                <div className="form-field full-width">

                  <label>
                    Annual Salary *
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    name="annual_salary"
                    value={form.annual_salary}
                    onChange={handleChange}
                    placeholder="1500000"
                  />

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingEmployee
                    ? "Update Employee"
                    : "Save Employee"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Employees;