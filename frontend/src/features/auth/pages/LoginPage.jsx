import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import { useAuth } from "../context/useAuth";
import authVisual from "../../../assets/auth-visual.png";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    loading,
    isAuthenticated,
    loginWithCredentials,
    loginWithGoogle,
    getHomePathForUser,
  } = useAuth();
  const [form, setForm] = useState({
    email: location.state?.registeredEmail ?? "",
    password: "",
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
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const loggedInUser = await loginWithCredentials(form);
      navigate(getHomePathForUser(loggedInUser), { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to sign in right now."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-split-container">
      <div className="auth-visual-side">
        <img src={authVisual} alt="Smart Campus Technology" />
        <div className="auth-visual-content">
          <h2>Seamless Campus Operations.</h2>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container">
          <header className="form-header">
            <span className="eyebrow">Shared Login</span>
            <h1>Welcome Back</h1>
            <p>Login to access your dashboard and resources.</p>
          </header>

          <form className="form-grid" onSubmit={handleSubmit}>
            {location.state?.successMessage && (
              <div className="alert alert-success">{location.state.successMessage}</div>
            )}

            {error && <div className="alert alert-error">{error}</div>}

            <label className="input-group" htmlFor="email">
              <span>Email Address</span>
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

            <label className="input-group" htmlFor="password">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span>Password</span>
                <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "700" }}>
                  Forgot?
                </Link>
              </div>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  className="input"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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

            <button className="btn btn-large" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Login to Hub"}
            </button>

            <button className="btn btn-ghost btn-large" type="button" onClick={loginWithGoogle}>
              Continue with Google
            </button>

            <p className="helper-text" style={{ textAlign: "center", marginTop: "20px" }}>
              Don&apos;t have an account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: "700" }}>Create one here</Link>
            </p>

            <p className="helper-text" style={{ textAlign: "center", opacity: 0.5, fontSize: "0.8rem" }}>
              System Admin: admin@smartcampus.com
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
