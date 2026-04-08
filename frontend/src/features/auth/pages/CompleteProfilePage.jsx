import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import ProfileDetailsFields from "../components/ProfileDetailsFields";
import { applyProfileFormChange } from "../constants/profileOptions";
import { useAuth } from "../context/useAuth";

function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, completeProfile, getHomePathForUser, logout } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    studentId: user?.studentId ?? "",
    dateOfBirth: user?.dateOfBirth ?? "",
    faculty: user?.faculty ?? "",
    department: user?.department ?? "",
    academicYear: user?.academicYear ?? "",
    semester: user?.semester ?? "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? "",
        phoneNumber: user.phoneNumber ?? "",
        studentId: user.studentId ?? "",
        dateOfBirth: user.dateOfBirth ?? "",
        faculty: user.faculty ?? "",
        department: user.department ?? "",
        academicYear: user.academicYear ?? "",
        semester: user.semester ?? "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.profileCompleted) {
      navigate(getHomePathForUser(user), { replace: true });
    }
  }, [getHomePathForUser, navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => applyProfileFormChange(current, name, value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const updatedUser = await completeProfile(form);
      navigate(getHomePathForUser(updatedUser), { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to save your profile."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <div className="page-stack">
          <div>
            <p className="eyebrow">Complete Profile</p>
            <h1>Finish setting up your account.</h1>
            <p className="page-subtitle">
              We created your basic account from your {user?.provider || "login"} details.
              Add the remaining student information to continue into the system.
            </p>
          </div>

          <div className="card info-panel">
            <p className="helper-text">
              Signed in as <strong>{user?.email}</strong>
            </p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <ProfileDetailsFields form={form} onChange={handleChange} />

            <div className="actions-row">
              <button className="btn" type="submit" disabled={submitting}>
                {submitting ? "Saving profile..." : "Save and continue"}
              </button>
              <button className="btn btn-secondary" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompleteProfilePage;
