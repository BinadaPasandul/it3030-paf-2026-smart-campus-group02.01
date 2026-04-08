import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import { useAuth } from "../../auth/context/useAuth";

function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleDrafts, setRoleDrafts] = useState({});
  const [loading, setLoading] = useState(true);
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

  const handleDeactivate = async (targetUser) => {
    const confirmed = window.confirm(`Deactivate ${targetUser.fullName}?`);
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/users/${targetUser.id}`);
      setNotice("User account deactivated.");
      await loadUsers();
    } catch (requestError) {
      setNotice("");
      setError(getApiErrorMessage(requestError, "Unable to deactivate this user."));
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((entry) => entry.active).length;
  const adminUsers = users.filter((entry) => entry.role === "ADMIN").length;
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
            Review accounts, change roles, and deactivate users from one simple dashboard.
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
          <p className="eyebrow">Incomplete Profiles</p>
          <h2>{incompleteUsers}</h2>
        </article>
      </section>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

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
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
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
                            onClick={() => handleDeactivate(entry)}
                            disabled={!entry.active || isSelf}
                          >
                            Deactivate
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
