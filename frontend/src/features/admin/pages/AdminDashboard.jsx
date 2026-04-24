import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import { useAuth } from "../../auth/context/useAuth";

const ROLE_OPTIONS = ["USER", "TECHNICIAN", "ADMIN"];

const INITIAL_TECHNICIAN_FORM = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
  department: "",
  role: "TECHNICIAN",
};

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roleDrafts, setRoleDrafts] = useState({});
  const [technicianForm, setTechnicianForm] = useState(INITIAL_TECHNICIAN_FORM);
  const [loading, setLoading] = useState(true);
  const [creatingTechnician, setCreatingTechnician] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users");
      setUsers(response.data);
      setRoleDrafts(
        Object.fromEntries(response.data.map((entry) => [entry.id, entry.role]))
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDraftChange = (userId, nextRole) => {
    setRoleDrafts((current) => ({ ...current, [userId]: nextRole }));
  };

  const handleTechnicianFormChange = (event) => {
    const { name, value } = event.target;
    setTechnicianForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateTechnician = async (event) => {
    event.preventDefault();

    try {
      setCreatingTechnician(true);
      setError("");
      setNotice("");
      await api.post("/users", {
        fullName: technicianForm.fullName,
        email: technicianForm.email,
        password: technicianForm.password,
        phoneNumber: technicianForm.phoneNumber,
        department: technicianForm.department,
        role: "TECHNICIAN",
      });
      setTechnicianForm(INITIAL_TECHNICIAN_FORM);
      setNotice("Technician account created successfully.");
      await loadUsers();
    } catch (requestError) {
      setNotice("");
      setError(getApiErrorMessage(requestError, "Unable to create technician account."));
    } finally {
      setCreatingTechnician(false);
    }
  };

  const handleRoleUpdate = async (userId) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: roleDrafts[userId] });
      setNotice("User role updated successfully.");
      await loadUsers();
    } catch (requestError) {
      setNotice("");
      setError(getApiErrorMessage(requestError, "Unable to update the user role."));
    }
  };

  const handleDelete = async (targetUser) => {
    const confirmed = window.confirm(`Delete ${targetUser.fullName}?`);
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/users/${targetUser.id}`);
      setNotice("User account deleted.");
      await loadUsers();
    } catch (requestError) {
      setNotice("");
      setError(getApiErrorMessage(requestError, "Unable to delete this user."));
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((entry) => entry.active).length;
  const adminUsers = users.filter((entry) => entry.role === "ADMIN").length;
  const technicianUsers = users.filter((entry) => entry.role === "TECHNICIAN").length;
  const incompleteUsers = users.filter((entry) => !entry.profileCompleted).length;
  const formatYear = (value) => {
    if (!value) {
      return "Year not set";
    }

    return /^\d+$/.test(String(value)) ? `Year ${value}` : value;
  };
  const formatSemester = (value) => {
    if (!value) {
      return "";
    }

    return /^\d+$/.test(String(value)) ? `Semester ${value}` : value;
  };

  return (
    <div className="dashboard-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h1>User Management</h1>
          <p className="page-subtitle">
            Review accounts, change roles, and delete users from one simple dashboard.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="card stat-card">
          <p className="eyebrow">Total Users</p>
          <h2>{totalUsers}</h2>
        </article>
        <article className="card stat-card">
          <p className="eyebrow">Active Users</p>
          <h2>{activeUsers}</h2>
        </article>
        <article className="card stat-card">
          <p className="eyebrow">Admins</p>
          <h2>{adminUsers}</h2>
        </article>
        <article className="card stat-card">
          <p className="eyebrow">Technicians</p>
          <h2>{technicianUsers}</h2>
        </article>
        <article className="card stat-card">
          <p className="eyebrow">Incomplete Profiles</p>
          <h2>{incompleteUsers}</h2>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="eyebrow">Operations & Support</p>
            <h2>Incident Tickets</h2>
            <p className="page-subtitle">Manage campus maintenance requests and support tickets.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/tickets")}>
            Open Hub
          </button>
        </div>
      </section>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <section className="card">
        <div className="table-header">
          <div>
            <p className="eyebrow">Technician Access</p>
            <h2>Create Technician</h2>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleCreateTechnician}>
          <div className="form-columns">
            <label className="input-group" htmlFor="technicianFullName">
              <span>Name with initials</span>
              <input
                id="technicianFullName"
                className="input"
                name="fullName"
                type="text"
                value={technicianForm.fullName}
                onChange={handleTechnicianFormChange}
                placeholder="E.g. T.N. Fernando"
                required
              />
            </label>

            <label className="input-group" htmlFor="technicianEmail">
              <span>Email</span>
              <input
                id="technicianEmail"
                className="input"
                name="email"
                type="email"
                value={technicianForm.email}
                onChange={handleTechnicianFormChange}
                placeholder="technician@example.com"
                required
              />
            </label>

            <label className="input-group" htmlFor="technicianPassword">
              <span>Temporary password</span>
              <input
                id="technicianPassword"
                className="input"
                name="password"
                type="password"
                value={technicianForm.password}
                onChange={handleTechnicianFormChange}
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
            </label>

            <label className="input-group" htmlFor="technicianPhone">
              <span>Phone number</span>
              <input
                id="technicianPhone"
                className="input"
                name="phoneNumber"
                type="tel"
                value={technicianForm.phoneNumber}
                onChange={handleTechnicianFormChange}
                placeholder="07XXXXXXXX"
                required
              />
            </label>

            <label className="input-group" htmlFor="technicianDepartment">
              <span>Department</span>
              <input
                id="technicianDepartment"
                className="input"
                name="department"
                type="text"
                value={technicianForm.department}
                onChange={handleTechnicianFormChange}
                placeholder="Technical Services"
              />
            </label>
          </div>

          <div className="actions-row">
            <button className="btn btn-primary" type="submit" disabled={creatingTechnician}>
              {creatingTechnician ? "Creating..." : "Create Technician"}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="table-header">
          <h2>Accounts</h2>
          <button className="btn btn-secondary" onClick={loadUsers} disabled={loading}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="page-subtitle">Loading user accounts...</p>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p>No users have been found yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name with initials</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Profile</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Provider</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => {
                  const isSelf = user?.id === entry.id;
                  const roleChanged = roleDrafts[entry.id] && roleDrafts[entry.id] !== entry.role;

                  return (
                    <tr key={entry.id}>
                      <td>{entry.fullName}</td>
                      <td>{entry.email}</td>
                      <td>
                        <select
                          className="input"
                          value={roleDrafts[entry.id] ?? entry.role}
                          onChange={(event) => handleDraftChange(entry.id, event.target.value)}
                          disabled={isSelf}
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            entry.profileCompleted ? "status-complete" : "status-pending"
                          }`}
                        >
                          {entry.profileCompleted ? "COMPLETE" : "PENDING"}
                        </span>
                      </td>
                      <td>
                        {entry.department || "Not set"}
                        <div className="helper-text">
                          {formatYear(entry.academicYear)}
                          {entry.semester ? ` | ${formatSemester(entry.semester)}` : ""}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${entry.active ? "status-active" : "status-inactive"}`}>
                          {entry.active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td>{entry.provider || "LOCAL"}</td>
                      <td>
                        <div className="actions-row compact-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleRoleUpdate(entry.id)}
                            disabled={!roleChanged || isSelf}
                          >
                            Save Role
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(entry)}
                            disabled={isSelf}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
