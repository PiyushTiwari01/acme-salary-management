import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://acme-salary-management-93ug.onrender.com";

const emptyForm = {
  employee_code: "",
  first_name: "",
  last_name: "",
  email: "",
  country: "",
  department: "",
  job_title: "",
  currency: "USD",
  annual_salary: "",
};

const currencySymbols = {
  USD: "$",
  INR: "₹",
  GBP: "£",
  EUR: "€",
  SGD: "S$",
  CAD: "C$",
  AUD: "A$",
};

function formatSalary(value, currency = "USD") {
  const symbol = currencySymbols[currency] || currency;

  return `${symbol} ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function App() {
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD EMPLOYEES
  // =========================================================

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/employees`,
        {
          params: {
            page,
            page_size: pageSize,
            search: search.trim() || undefined,
            country: countryFilter || undefined,
            department: departmentFilter || undefined,
          },
        }
      );

      const responseData = response.data || {};

      // Supports both:
      // { data: [], count: 100 }
      // and:
      // { items: [], total: 100 }
      const employeeData =
        responseData.data ||
        responseData.items ||
        [];

      const employeeCount =
        responseData.count ??
        responseData.total ??
        0;

      const calculatedPages =
        responseData.total_pages ??
        Math.max(
          1,
          Math.ceil(employeeCount / pageSize)
        );

      setEmployees(Array.isArray(employeeData) ? employeeData : []);
      setTotalEmployees(Number(employeeCount) || 0);
      setTotalPages(Number(calculatedPages) || 1);
    } catch (err) {
      console.error("Failed to load employees:", err);

      const backendMessage =
        err?.response?.data?.detail;

      setError(
        Array.isArray(backendMessage)
          ? backendMessage.map((item) => item.msg).join(", ")
          : backendMessage ||
              "Unable to load employee data. Please make sure the backend server is running."
      );

      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load + pagination/filter changes
  useEffect(() => {
    loadEmployees();
  }, [page, countryFilter, departmentFilter]);

  // =========================================================
  // SEARCH
  // =========================================================

  async function handleSearch(event) {
    event.preventDefault();

    setPage(1);

    // If already on page 1, explicitly reload
    if (page === 1) {
      await loadEmployees();
    }
  }

  // =========================================================
  // FORM
  // =========================================================

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =========================================================
  // CREATE MODAL
  // =========================================================

  function openCreateModal() {
    setEditingEmployee(null);

    setForm({
      ...emptyForm,
      employee_code: `EMP${String(
        totalEmployees + 1
      ).padStart(5, "0")}`,
    });

    setModalOpen(true);
    setError("");
    setSuccess("");
  }

  // =========================================================
  // EDIT MODAL
  // =========================================================

  function openEditModal(employee) {
    setEditingEmployee(employee);

    setForm({
      employee_code: employee.employee_code || "",
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      email: employee.email || "",
      country: employee.country || "",
      department: employee.department || "",
      job_title: employee.job_title || "",
      currency: employee.currency || "USD",
      annual_salary: employee.annual_salary ?? "",
    });

    setModalOpen(true);
    setError("");
    setSuccess("");
  }

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingEmployee(null);
    setForm(emptyForm);
  }

  // =========================================================
  // CREATE / UPDATE EMPLOYEE
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...form,
        annual_salary: Number(form.annual_salary),
      };

      if (editingEmployee) {
        await axios.put(
          `${API_URL}/api/employees/${editingEmployee.id}`,
          payload
        );

        setSuccess("Employee updated successfully.");
      } else {
        await axios.post(
          `${API_URL}/api/employees`,
          payload
        );

        setSuccess("Employee created successfully.");
      }

      setModalOpen(false);
      setEditingEmployee(null);
      setForm(emptyForm);

      await loadEmployees();
    } catch (err) {
      console.error("Save employee error:", err);

      const message =
        err?.response?.data?.detail ||
        "Unable to save employee. Please check the entered data.";

      setError(
        Array.isArray(message)
          ? message.map((item) => item.msg).join(", ")
          : message
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // DELETE EMPLOYEE
  // =========================================================

  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.first_name} ${employee.last_name}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await axios.delete(
        `${API_URL}/api/employees/${employee.id}`
      );

      setSuccess("Employee deleted successfully.");

      if (employees.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadEmployees();
      }
    } catch (err) {
      console.error("Delete employee error:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to delete employee. Please try again."
      );
    }
  }

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  async function clearFilters() {
    setSearch("");
    setCountryFilter("");
    setDepartmentFilter("");
    setPage(1);

    // Direct API call because React state updates are async
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/employees`,
        {
          params: {
            page: 1,
            page_size: pageSize,
          },
        }
      );

      const responseData = response.data || {};

      const employeeData =
        responseData.data ||
        responseData.items ||
        [];

      const employeeCount =
        responseData.count ??
        responseData.total ??
        0;

      const calculatedPages =
        responseData.total_pages ??
        Math.max(
          1,
          Math.ceil(employeeCount / pageSize)
        );

      setEmployees(
        Array.isArray(employeeData)
          ? employeeData
          : []
      );

      setTotalEmployees(
        Number(employeeCount) || 0
      );

      setTotalPages(
        Number(calculatedPages) || 1
      );
    } catch (err) {
      console.error(
        "Failed to clear filters:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to reload employee data."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // COUNTRIES
  // =========================================================

  const countries = useMemo(() => {
    return [
      ...new Set(
        employees
          .map((employee) => employee.country)
          .filter(Boolean)
      ),
    ].sort();
  }, [employees]);

  // =========================================================
  // DEPARTMENTS
  // =========================================================

  const departments = useMemo(() => {
    return [
      ...new Set(
        employees
          .map((employee) => employee.department)
          .filter(Boolean)
      ),
    ].sort();
  }, [employees]);

  // =========================================================
  // DASHBOARD STATS
  // =========================================================

  const dashboardStats = useMemo(() => {
    const salaries = employees.map((employee) =>
      Number(employee.annual_salary || 0)
    );

    const totalSalary = salaries.reduce(
      (sum, salary) => sum + salary,
      0
    );

    const averageSalary =
      salaries.length > 0
        ? totalSalary / salaries.length
        : 0;

    const highestSalary =
      salaries.length > 0
        ? Math.max(...salaries)
        : 0;

    const currencyCounts = employees.reduce(
      (result, employee) => {
        const currency =
          employee.currency || "Unknown";

        result[currency] =
          (result[currency] || 0) + 1;

        return result;
      },
      {}
    );

    const topCurrency =
      Object.entries(currencyCounts).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || "—";

    return {
      averageSalary,
      highestSalary,
      topCurrency,
    };
  }, [employees]);

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">A</div>

          <div>
            <h1>ACME</h1>
            <span>Salary Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span>▦</span>
            Dashboard
          </div>

          <div className="nav-item">
            <span>♙</span>
            Employees
          </div>

          <div className="nav-item">
            <span>◫</span>
            Salary Insights
          </div>

          <div className="nav-item">
            <span>⚙</span>
            Settings
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">HR</div>

          <div>
            <strong>HR Manager</strong>
            <small>ACME Organization</small>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">

        {/* HEADER */}
        <header className="topbar">
          <div>
            <p className="eyebrow">
              PEOPLE OPERATIONS
            </p>

            <h2>Salary Dashboard</h2>

            <p className="subtitle">
              Manage employee compensation and
              understand how ACME pays its people.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={openCreateModal}
          >
            <span>＋</span>
            Add Employee
          </button>
        </header>

        {/* ALERTS */}
        {error && (
          <div className="alert error-alert">
            <span>⚠</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert success-alert">
            <span>✓</span>
            {success}
          </div>
        )}

        {/* KPI CARDS */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon blue">♙</div>

            <div>
              <span>Total Employees</span>

              <strong>
                {totalEmployees.toLocaleString()}
              </strong>

              <small>
                Across all locations
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">⌁</div>

            <div>
              <span>Average Salary</span>

              <strong>
                {dashboardStats.averageSalary
                  ? dashboardStats.averageSalary.toLocaleString(
                      "en-US",
                      {
                        maximumFractionDigits: 0,
                      }
                    )
                  : "—"}
              </strong>

              <small>
                Current page average
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">↗</div>

            <div>
              <span>Highest Salary</span>

              <strong>
                {dashboardStats.highestSalary
                  ? dashboardStats.highestSalary.toLocaleString(
                      "en-US",
                      {
                        maximumFractionDigits: 0,
                      }
                    )
                  : "—"}
              </strong>

              <small>
                Current page maximum
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">◈</div>

            <div>
              <span>Popular Currency</span>

              <strong>
                {dashboardStats.topCurrency}
              </strong>

              <small>
                Based on current page
              </small>
            </div>
          </div>

        </section>

        {/* EMPLOYEE SECTION */}
        <section className="content-card">

          <div className="section-header">
            <div>
              <h3>Employee Directory</h3>

              <p>
                Search, filter and manage
                compensation records for your
                organization.
              </p>
            </div>

            <div className="record-count">
              {totalEmployees.toLocaleString()} records
            </div>
          </div>

          {/* FILTER BAR */}
          <form
            className="filter-bar"
            onSubmit={handleSearch}
          >
            <div className="search-wrapper">
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search employee, email or employee code..."
              />
            </div>

            <select
              value={countryFilter}
              onChange={(event) => {
                setCountryFilter(
                  event.target.value
                );
                setPage(1);
              }}
            >
              <option value="">
                All Countries
              </option>

              {countries.map((country) => (
                <option
                  key={country}
                  value={country}
                >
                  {country}
                </option>
              ))}
            </select>

            <select
              value={departmentFilter}
              onChange={(event) => {
                setDepartmentFilter(
                  event.target.value
                );
                setPage(1);
              }}
            >
              <option value="">
                All Departments
              </option>

              {departments.map(
                (department) => (
                  <option
                    key={department}
                    value={department}
                  >
                    {department}
                  </option>
                )
              )}
            </select>

            <button
              type="submit"
              className="filter-button"
            >
              Search
            </button>

            <button
              type="button"
              className="clear-button"
              onClick={clearFilters}
            >
              Clear
            </button>
          </form>

          {/* TABLE */}
          <div className="table-wrapper">

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>

                <p>
                  Loading employee data...
                </p>
              </div>
            ) : employees.length === 0 ? (
              <div className="empty-state">

                <div className="empty-icon">
                  ⌕
                </div>

                <h3>
                  No employees found
                </h3>

                <p>
                  Try changing your search or
                  filters, or create a new
                  employee.
                </p>

                <button
                  className="primary-button"
                  onClick={openCreateModal}
                >
                  Add Employee
                </button>
              </div>
            ) : (
              <table className="employee-table">

                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>COUNTRY</th>
                    <th>DEPARTMENT</th>
                    <th>JOB TITLE</th>
                    <th>ANNUAL SALARY</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>

                  {employees.map((employee) => (
                    <tr key={employee.id}>

                      <td>
                        <div className="employee-cell">

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
                              {employee.email}
                            </span>

                            <small>
                              {employee.employee_code}
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="country-badge">
                          {employee.country}
                        </span>
                      </td>

                      <td>
                        <span className="department-badge">
                          {employee.department}
                        </span>
                      </td>

                      <td>
                        <div className="job-title">
                          {employee.job_title}
                        </div>
                      </td>

                      <td>
                        <div className="salary-cell">

                          <strong>
                            {formatSalary(
                              employee.annual_salary,
                              employee.currency
                            )}
                          </strong>

                          <span>
                            {employee.currency}
                          </span>

                        </div>
                      </td>

                      <td>
                        <div className="actions">

                          <button
                            className="icon-button edit"
                            title="Edit employee"
                            onClick={() =>
                              openEditModal(
                                employee
                              )
                            }
                          >
                            ✎
                          </button>

                          <button
                            className="icon-button delete"
                            title="Delete employee"
                            onClick={() =>
                              handleDelete(
                                employee
                              )
                            }
                          >
                            ×
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            )}

          </div>

          {/* PAGINATION */}
          {!loading &&
            employees.length > 0 && (
              <div className="pagination">

                <span>
                  Showing{" "}
                  <strong>
                    {(page - 1) * pageSize + 1}-
                    {Math.min(
                      page * pageSize,
                      totalEmployees
                    )}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {totalEmployees.toLocaleString()}
                  </strong>
                </span>

                <div className="pagination-buttons">

                  <button
                    disabled={page <= 1}
                    onClick={() =>
                      setPage(
                        (previous) =>
                          previous - 1
                      )
                    }
                  >
                    ← Previous
                  </button>

                  <div className="page-number">
                    Page{" "}
                    <strong>{page}</strong>{" "}
                    of{" "}
                    <strong>
                      {totalPages}
                    </strong>
                  </div>

                  <button
                    disabled={
                      page >= totalPages
                    }
                    onClick={() =>
                      setPage(
                        (previous) =>
                          previous + 1
                      )
                    }
                  >
                    Next →
                  </button>

                </div>
              </div>
            )}

        </section>

        {/* FOOTER */}
        <footer className="app-footer">
          <span>
            ACME Salary Management
          </span>

          <span>•</span>

          <span>
            10,000 employee scale
          </span>

          <span>•</span>

          <span>
            HR Operations
          </span>
        </footer>

      </main>

      {/* MODAL */}
      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={closeModal}
        >

          <div
            className="employee-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <p className="eyebrow">
                  {editingEmployee
                    ? "EMPLOYEE RECORD"
                    : "NEW RECORD"}
                </p>

                <h3>
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h3>

                <p>
                  Enter accurate employee and
                  compensation information.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Employee Code
                  </label>

                  <input
                    name="employee_code"
                    value={
                      form.employee_code
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={
                      Boolean(
                        editingEmployee
                      )
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={
                      handleFormChange
                    }
                    placeholder="john.doe@acme.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    First Name
                  </label>

                  <input
                    name="first_name"
                    value={
                      form.first_name
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="John"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Last Name
                  </label>

                  <input
                    name="last_name"
                    value={
                      form.last_name
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>

                  <input
                    name="country"
                    value={form.country}
                    onChange={
                      handleFormChange
                    }
                    placeholder="India"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Department
                  </label>

                  <input
                    name="department"
                    value={
                      form.department
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Engineering"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Job Title
                  </label>

                  <input
                    name="job_title"
                    value={
                      form.job_title
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Software Engineer"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Currency</label>

                  <select
                    name="currency"
                    value={
                      form.currency
                    }
                    onChange={
                      handleFormChange
                    }
                    required
                  >
                    <option value="USD">
                      USD — US Dollar
                    </option>

                    <option value="INR">
                      INR — Indian Rupee
                    </option>

                    <option value="GBP">
                      GBP — British Pound
                    </option>

                    <option value="EUR">
                      EUR — Euro
                    </option>

                    <option value="SGD">
                      SGD — Singapore Dollar
                    </option>

                    <option value="CAD">
                      CAD — Canadian Dollar
                    </option>

                    <option value="AUD">
                      AUD — Australian Dollar
                    </option>
                  </select>
                </div>

                <div className="form-group full">
                  <label>
                    Annual Salary
                  </label>

                  <input
                    type="number"
                    name="annual_salary"
                    value={
                      form.annual_salary
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="1500000"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingEmployee
                    ? "Save Changes"
                    : "Create Employee"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;
