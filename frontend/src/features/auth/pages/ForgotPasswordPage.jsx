import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import { useAuth } from "../context/useAuth";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await requestPasswordReset(email);
      setNotice(response.message);
      // Automatically redirect to reset page where they enter code
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 2000);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to request password reset."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card auth-grid">
        <div>
          <p className="eyebrow">Account Recovery</p>
          <h1>Forgot your password?</h1>
          <p className="page-subtitle">
            Enter your email address and we will send you a 6-digit code to reset your password securely.
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Reset Code"}
          </button>

          <p className="helper-text">
            Remembered your password? <Link to="/login">Go back to login</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
