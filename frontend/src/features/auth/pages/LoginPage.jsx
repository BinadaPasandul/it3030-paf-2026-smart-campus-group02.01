import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import { useAuth } from "../context/useAuth";

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
    <div className="auth-wrapper">
      <div className="card auth-card auth-grid">
        <div>
          <p className="eyebrow">Shared Login</p>
          <h1>Login as admin, technician, or user from the same page.</h1>
          <p className="page-subtitle">
            Use your local email and password, or continue with Google if you
            prefer OAuth. Google users will be sent to a complete-profile page if
            their account still needs extra details.
          </p>
          <p className="helper-text">
            Seeded admin email: <strong>admin@smartcampus.com</strong>
          </p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {location.state?.successMessage && (
            <div className="alert alert-success">{location.state.successMessage}</div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

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

          <label className="input-group" htmlFor="password">
            <span>Password</span>
            <input
              id="password"
              className="input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>

          <button className="btn btn-ghost" type="button" onClick={loginWithGoogle}>
            Continue with Google
          </button>

          <p className="helper-text">
            Don&apos;t have an account? <Link to="/register">Create one here</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
