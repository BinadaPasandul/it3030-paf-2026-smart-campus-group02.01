import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import ProfileDetailsFields from "../components/ProfileDetailsFields";
import { applyProfileFormChange } from "../constants/profileOptions";
import { useAuth } from "../context/useAuth";

function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, registerUser, getHomePathForUser } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    studentId: "",
    dateOfBirth: "",
    faculty: "",
    department: "",
    academicYear: "",
    semester: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      navigate(getHomePathForUser(user), { replace: true });
    }
  }, [getHomePathForUser, isAuthenticated, loading, navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => applyProfileFormChange(current, name, value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await registerUser(form);
      navigate("/login", {
        replace: true,
        state: {
          registeredEmail: form.email,
          successMessage: "Registration successful. You can now login with your new account.",
        },
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card auth-grid">
        <div>
          <p className="eyebrow">User Registration</p>
          <h1>Create a full local user account.</h1>
          <p className="page-subtitle">
            Normal registration now collects the same profile details that Google
            users complete after first sign-in.
          </p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <ProfileDetailsFields form={form} onChange={handleChange} />

          <label className="input-group" htmlFor="registerEmail">
            <span>Email</span>
            <input
              id="registerEmail"
              className="input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="input-group" htmlFor="registerPassword">
            <span>Password</span>
            <input
              id="registerPassword"
              className="input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
          </label>

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Register"}
          </button>

          <p className="helper-text">
            Already registered? <Link to="/login">Go back to login</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
