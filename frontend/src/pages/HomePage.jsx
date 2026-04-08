import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/useAuth";

function HomePage() {
  const { user, loading, isAuthenticated, getHomePathForUser, loginWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="card loading-card">
        <h1>Checking access</h1>
        <p className="page-subtitle">Loading your session details from the backend.</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePathForUser(user)} replace />;
  }

  return (
    <div className="hero-shell">
      <section className="card hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Smart Campus Operations Hub</p>
          <h1>One place for user accounts, admin control, and access by role.</h1>
          <p className="page-subtitle">
            Users can sign in with Google or a normal password-based account. New
            Google sign-ins are guided through a complete-profile step before they
            enter the system.
          </p>
          <div className="actions-row">
            <Link className="btn" to="/login">
              Login
            </Link>
            <Link className="btn btn-secondary" to="/register">
              Register
            </Link>
            <button className="btn btn-ghost" onClick={loginWithGoogle}>
              Google Sign-In
            </button>
          </div>
        </div>

        <div className="info-panel">
          <h2>What this flow supports</h2>
          <ul className="feature-list">
            <li>One shared login page for admin, local users, and Google users</li>
            <li>Normal registration with full student profile details plus password</li>
            <li>Google OAuth onboarding that creates a basic record first</li>
            <li>Profile completion routing before admin dashboard or user profile access</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
