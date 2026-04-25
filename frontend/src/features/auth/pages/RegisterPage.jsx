import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import ProfileDetailsFields from "../components/ProfileDetailsFields";
import { applyProfileFormChange } from "../constants/profileOptions";
import { useAuth } from "../context/useAuth";
import authVisual from "../../../assets/auth-visual.png";

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
  const [showPassword, setShowPassword] = useState(false);
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
      navigate("/verify-email", {
        replace: true,
        state: {
          email: form.email,
        },
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-split-container">
      <div className="auth-visual-side">
        <img src={authVisual} alt="Smart Campus Technology" />
        <div className="auth-visual-content">
          <h2>Start Your Journey.</h2>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container" style={{ maxWidth: "520px" }}>
          <header className="form-header">
            <span className="eyebrow">User Registration</span>
            <h1>Join the Hub</h1>
            <p>Create your profile to get started with campus operations.</p>
          </header>

          <form className="form-grid" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <ProfileDetailsFields form={form} onChange={handleChange} />

            <div className="form-columns">
              <label className="input-group" htmlFor="registerEmail">
                <span>Email Address</span>
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
                <div className="password-input-wrapper">
                  <input
                    id="registerPassword"
                    className="input"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    minLength={6}
                    pattern="(?=.*[a-z])(?=.*[A-Z]).{6,}"
                    title="Password must contain at least one uppercase and one lowercase letter"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
            </div>

            <button className="btn btn-large" type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Complete Registration"}
            </button>

            <p className="helper-text" style={{ textAlign: "center", marginTop: "20px" }}>
              Already registered? <Link to="/login" style={{ color: "var(--primary)", fontWeight: "700" }}>Go back to login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
