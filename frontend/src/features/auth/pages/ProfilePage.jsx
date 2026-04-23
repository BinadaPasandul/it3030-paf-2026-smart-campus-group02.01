import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
  FiShield,
  FiUser,
  FiX,
  FiZap,
} from "react-icons/fi";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import ProfileDetailsFields from "../components/ProfileDetailsFields";
import { applyProfileFormChange } from "../constants/profileOptions";
import { useAuth } from "../context/useAuth";

const createProfileForm = (currentUser = {}) => ({
  fullName: currentUser?.fullName ?? "",
  phoneNumber: currentUser?.phoneNumber ?? "",
  studentId: currentUser?.studentId ?? "",
  dateOfBirth: currentUser?.dateOfBirth ?? "",
  faculty: currentUser?.faculty ?? "",
  department: currentUser?.department ?? "",
  academicYear: currentUser?.academicYear ?? "",
  semester: currentUser?.semester ?? "",
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, completeProfile, logout } = useAuth();
  const [form, setForm] = useState(() => createProfileForm(user));
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Not added yet";
    }

    return value;
  };

  const initials = (user?.fullName || user?.email || "Campus User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  const firstName = user?.fullName?.split(" ")?.[0] || "there";
  const statusText = user?.active === false ? "Inactive" : "Active";
  const profileStatus = user?.profileCompleted ? "Complete" : "Needs update";
  const providerLabel = user?.provider || "LOCAL";

  const completionItems = [
    { label: "Name", value: user?.fullName },
    { label: "Phone", value: user?.phoneNumber },
    { label: "Student ID", value: user?.studentId },
    { label: "Birthday", value: user?.dateOfBirth },
    { label: "Faculty", value: user?.faculty },
    { label: "Department", value: user?.department },
    { label: "Year", value: user?.academicYear },
    { label: "Semester", value: user?.semester },
  ];
  const completedCount = completionItems.filter((item) => Boolean(item.value)).length;
  const completionPercent = Math.round((completedCount / completionItems.length) * 100);

  const quickInformation = [
    { label: "Email", value: user?.email, icon: <FiMail /> },
    { label: "Student ID", value: user?.studentId, icon: <FiBookOpen /> },
    { label: "Role", value: user?.role, icon: <FiShield /> },
    { label: "Status", value: statusText, icon: <FiCheckCircle /> },
    { label: "Provider", value: providerLabel, icon: <FiUser /> },
    { label: "Profile", value: profileStatus, icon: <FiClock /> },
  ];

  const personalInformation = [
    { label: "Full name", value: user?.fullName, icon: <FiUser /> },
    { label: "Phone number", value: user?.phoneNumber, icon: <FiPhone /> },
    { label: "Date of birth", value: user?.dateOfBirth, icon: <FiCalendar /> },
    { label: "Faculty", value: user?.faculty, icon: <FiMapPin /> },
    { label: "Department", value: user?.department, icon: <FiGrid /> },
    { label: "Academic year", value: formatYear(user?.academicYear), icon: <FiBookOpen /> },
    { label: "Semester", value: formatSemester(user?.semester), icon: <FiClock /> },
  ];

  const quickActions = [
    {
      title: "Book Space",
      description: "Reserve campus resources fast.",
      path: "/bookings/new",
      icon: <FiCalendar />,
    },
    {
      title: "Resources",
      description: "Browse available rooms and labs.",
      path: "/resources",
      icon: <FiGrid />,
    },
    {
      title: "My Tickets",
      description: "Track your support requests.",
      path: "/tickets",
      icon: <FiHelpCircle />,
    },
    {
      title: "Report Issue",
      description: "Create a new campus incident.",
      path: "/tickets/new",
      icon: <FiZap />,
    },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => applyProfileFormChange(current, name, value));
  };

  const handleStartEdit = () => {
    setForm(createProfileForm(user));
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setForm(createProfileForm(user));
    setIsEditing(false);
    setError("");
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const updatedUser = await completeProfile(form);
      setForm(createProfileForm(updatedUser));
      setIsEditing(false);
      setSuccess("Profile details updated successfully.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to update your profile details."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="profile-page">
      <section className="profile-hero-panel">
        <div className="profile-hero-copy">
          <p className="eyebrow">Smart Campus Profile</p>
          <h1>Hi {firstName}, your campus identity is ready.</h1>
          <p className="page-subtitle">
            Manage your student details, jump into campus services, and keep your profile
            accurate from one clean dashboard.
          </p>
          <div className="profile-chip-row" aria-label="Profile status summary">
            <span className="profile-status-chip profile-status-chip-success">
              <FiCheckCircle aria-hidden="true" />
              {statusText}
            </span>
            <span className="profile-status-chip">
              <FiShield aria-hidden="true" />
              {profileStatus}
            </span>
          </div>
        </div>

        <aside className="profile-pass-card" aria-label="Digital campus pass">
          <div className="profile-pass-orbit" aria-hidden="true" />
          <div className="profile-avatar">{initials}</div>
          <div>
            <p className="eyebrow">Digital Campus Pass</p>
            <h2>{displayValue(user?.fullName)}</h2>
            <p className="profile-pass-meta">{displayValue(user?.email)}</p>
          </div>
          <div className="profile-pass-footer">
            <span>{displayValue(user?.studentId)}</span>
            <span>{user?.role || "USER"}</span>
          </div>
        </aside>
      </section>

      <section className="profile-dashboard-grid">
        <div className="profile-main-column">
          <section className="card profile-section-card">
            <div className="profile-section-header">
              <div>
                <p className="eyebrow">Quick Launch</p>
                <h2>Campus shortcuts</h2>
              </div>
              <p className="page-subtitle">Open the most-used campus services from your profile.</p>
            </div>
            <div className="profile-action-grid">
              {quickActions.map((action) => (
                <button
                  className="profile-action-card"
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  type="button"
                >
                  <span className="profile-action-icon" aria-hidden="true">
                    {action.icon}
                  </span>
                  <strong>{action.title}</strong>
                  <span>{action.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="profile-info-layout" aria-label="Profile information">
            <article className="card profile-info-card">
              <div className="profile-section-header profile-info-header">
                <div>
                  <p className="eyebrow">Quick Information</p>
                  <h2>Account snapshot</h2>
                </div>
                <span className="profile-readonly-pill">Read only</span>
              </div>
              <dl className="profile-info-list profile-quick-info-list">
                {quickInformation.map((item) => (
                  <div key={item.label}>
                    <dt>
                      <span aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </dt>
                    <dd>{displayValue(item.value)}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="card profile-info-card">
              <div className="profile-section-header profile-info-header">
                <div>
                  <p className="eyebrow">Personal Information</p>
                  <h2>Your details</h2>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleStartEdit} type="button">
                  <FiEdit3 aria-hidden="true" />
                  Edit Details
                </button>
              </div>
              <dl className="profile-info-list">
                {personalInformation.map((item) => (
                  <div key={item.label}>
                    <dt>
                      <span aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </dt>
                    <dd>{displayValue(item.value)}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </section>

          <section className="card profile-edit-card">
            <div className="profile-section-header">
              <div>
                <p className="eyebrow">Edit Details</p>
                <h2>{isEditing ? "Update your information" : "Keep your profile accurate"}</h2>
              </div>
              {!isEditing ? (
                <button className="btn" onClick={handleStartEdit} type="button">
                  <FiEdit3 aria-hidden="true" />
                  Edit Profile
                </button>
              ) : null}
            </div>

            {success ? <div className="alert alert-success">{success}</div> : null}
            {error ? <div className="alert alert-error">{error}</div> : null}

            {isEditing ? (
              <form className="profile-edit-form" onSubmit={handleSaveProfile}>
                <ProfileDetailsFields form={form} onChange={handleChange} />
                <div className="actions-row">
                  <button className="btn" type="submit" disabled={submitting}>
                    <FiSave aria-hidden="true" />
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={submitting}
                  >
                    <FiX aria-hidden="true" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-edit-empty">
                <span className="profile-action-icon" aria-hidden="true">
                  <FiEdit3 />
                </span>
                <div>
                  <strong>Edit your details anytime</strong>
                  <p className="page-subtitle">
                    Update your phone number, student ID, faculty, department, year, and
                    semester directly from this profile.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="profile-side-column">
          <section className="card profile-completion-card">
            <p className="eyebrow">Profile Readiness</p>
            <h2>{completionPercent}% complete</h2>
            <div
              className="profile-progress-track"
              aria-label={`Profile is ${completionPercent}% complete`}
            >
              <span style={{ width: `${completionPercent}%` }} />
            </div>
            <div className="profile-checklist">
              {completionItems.map((item) => (
                <div className={item.value ? "complete" : ""} key={item.label}>
                  <FiCheckCircle aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card profile-support-card">
            <p className="eyebrow">Support & Incidents</p>
            <h2>Need help on campus?</h2>
            <p className="page-subtitle">
              Report facility breakages, classroom maintenance needs, or IT and network
              issues directly to the support team.
            </p>
            <div className="profile-support-actions">
              <button className="btn" onClick={() => navigate("/tickets")} type="button">
                My Tickets Dashboard
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/tickets/new")} type="button">
                Report New Issue
              </button>
              <button className="btn btn-ghost" onClick={handleLogout} type="button">
                <FiLogOut aria-hidden="true" />
                Logout
              </button>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

export default ProfilePage;
