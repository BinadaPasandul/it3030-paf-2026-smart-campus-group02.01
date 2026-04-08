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
    </div>
  );
}

export default ProfilePage;
