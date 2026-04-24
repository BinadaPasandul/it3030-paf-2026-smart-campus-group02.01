import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import { useAuth } from "../context/useAuth";

function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const [form, setForm] = useState({
    email: location.state?.email || "",
    code: "",
    newPassword: "",
  });
  
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      await resetPassword(form);
      navigate("/login", {
        replace: true,
        state: { successMessage: "Password reset successfully. You can now log in." },
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to reset your password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card auth-grid">
        <div>
          <p className="eyebrow">Account Recovery</p>
          <h1>Create a new password</h1>
          <p className="page-subtitle">
            Please enter the 6-digit code we sent to your email, along with your new password.
          </p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          {notice && <div className="alert alert-success">{notice}</div>}

          <label className="input-group" htmlFor="email">
            <span>Email</span>
            <input
              id="email"
              className="input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="input-group" htmlFor="code">
            <span>6-Digit Code</span>
            <input
              id="code"
              className="input"
              name="code"
              type="text"
              value={form.code}
              onChange={handleChange}
              placeholder="123456"
              required
            />
          </label>

          <label className="input-group" htmlFor="newPassword">
            <span>New Password</span>
            <input
              id="newPassword"
              className="input"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Minimum 6 characters, mixed case"
              minLength={6}
              pattern="(?=.*[a-z])(?=.*[A-Z]).{6,}"
              title="Password must contain at least one uppercase and one lowercase letter"
              required
            />
          </label>

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Resetting..." : "Reset Password"}
          </button>

          <p className="helper-text">
            Remembered your password? <Link to="/login">Go back to login</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
