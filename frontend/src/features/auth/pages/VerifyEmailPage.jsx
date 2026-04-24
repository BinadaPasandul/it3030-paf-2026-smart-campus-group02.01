import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";

function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/verify-email", { email, code });
      navigate("/login", {
        replace: true,
        state: {
          registeredEmail: email,
          successMessage:
            "Email verified successfully. You can now log in with your account.",
        },
      });
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Verification failed. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/resend-verification", { email });
      setSuccess(response.data.message || "A new code has been sent to your email.");
      setCooldown(60);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Could not resend code. Try again later.")
      );
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="auth-wrapper">
      <div className="card auth-card auth-grid">
        <div>
          <p className="eyebrow">Email Verification</p>
          <h1>Check your inbox for a 6-digit code.</h1>
          <p className="page-subtitle">
            We sent a verification code to <strong>{email}</strong>. Enter it
            below to activate your account. The code expires in 15 minutes.
          </p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <label className="input-group" htmlFor="verificationCode">
            <span>Verification Code</span>
            <input
              id="verificationCode"
              className="input"
              name="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit code"
              required
              autoFocus
              style={{ letterSpacing: "0.3em", fontSize: "1.2rem", textAlign: "center" }}
            />
          </label>

          <button className="btn" type="submit" disabled={submitting || code.length !== 6}>
            {submitting ? "Verifying..." : "Verify Email"}
          </button>

          <button
            className="btn btn-ghost"
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
          >
            {cooldown > 0
              ? `Resend code in ${cooldown}s`
              : resending
                ? "Sending..."
                : "Resend verification code"}
          </button>

          <p className="helper-text">
            Wrong email? <Link to="/register">Go back to registration</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
