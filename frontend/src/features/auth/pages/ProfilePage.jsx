import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const formatYear = (value) => {
    if (!value) {
      return "-";
    }

    return /^\d+$/.test(String(value)) ? `Year ${value}` : value;
  };
  const formatSemester = (value) => {
    if (!value) {
      return "-";
    }

    return /^\d+$/.test(String(value)) ? `Semester ${value}` : value;
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="profile-grid">
      <section className="card profile-card">
        <p className="eyebrow">User Profile</p>
        <h1>{user?.fullName}</h1>
        <p className="page-subtitle">
          This is your profile summary after sign-in and profile completion.
        </p>

        <dl className="detail-list">
          <div>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user?.role}</dd>
          </div>
          <div>
            <dt>Provider</dt>
            <dd>{user?.provider || "LOCAL"}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{user?.active ? "ACTIVE" : "INACTIVE"}</dd>
          </div>
          <div>
            <dt>Phone number</dt>
            <dd>{user?.phoneNumber}</dd>
          </div>
          <div>
            <dt>Student ID</dt>
            <dd>{user?.studentId}</dd>
          </div>
          <div>
            <dt>Date of birth</dt>
            <dd>{user?.dateOfBirth}</dd>
          </div>
          <div>
            <dt>Faculty</dt>
            <dd>{user?.faculty}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>{user?.department}</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>{formatYear(user?.academicYear)}</dd>
          </div>
          <div>
            <dt>Semester</dt>
            <dd>{formatSemester(user?.semester)}</dd>
          </div>
          <div>
            <dt>Profile</dt>
            <dd>{user?.profileCompleted ? "COMPLETE" : "INCOMPLETE"}</dd>
          </div>
        </dl>

        <div className="actions-row">
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>

      <section className="card profile-card" style={{ height: "fit-content" }}>
        <p className="eyebrow">Support & Incidents</p>
        <h2>Need Help?</h2>
        <p className="page-subtitle">
          Report technical issues or facility maintenance requests directly to our team.
        </p>

        <div className="dashboard-stack" style={{ marginTop: "1.5rem" }}>
          <button className="btn btn-primary" onClick={() => navigate("/tickets")}>
            My Tickets Dashboard
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/tickets/new")}>
            Report New Issue
          </button>
        </div>

        <div className="info-panel" style={{ marginTop: "2rem" }}>
          <p className="eyebrow">Current Scope</p>
          <ul className="feature-list" style={{ marginTop: "0.5rem" }}>
            <li>Facility Breakages</li>
            <li>IT & Network Issues</li>
            <li>Classroom Maintenance</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
