import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout, getHomePathForUser } = useAuth();

  const accountHomePath = isAuthenticated ? getHomePathForUser(user) : "/";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div className="nav-left">
          <Link to="/" className="brand">
            Smart Campus
          </Link>
        </div>

        <div className="nav-links">
          <NavLink className={({ isActive }) => (isActive ? "active" : undefined)} to="/">
            Home
          </NavLink>

          {isAuthenticated && !user?.profileCompleted && (
            <NavLink
              className={({ isActive }) => (isActive ? "active" : undefined)}
              to="/complete-profile"
            >
              Complete Profile
            </NavLink>
          )}

          {isAuthenticated && user?.profileCompleted && (
            <NavLink className={({ isActive }) => (isActive ? "active" : undefined)} to="/profile">
              Profile
            </NavLink>
          )}

          {isAuthenticated && user?.profileCompleted && (
            <NavLink className={({ isActive }) => (isActive ? "active" : undefined)} to="/resources">
              Resources
            </NavLink>
          )}

          {isAuthenticated && user?.profileCompleted && (
            <NavLink className={({ isActive }) => (isActive ? "active" : undefined)} to="/bookings/my">
              My Bookings
            </NavLink>
          )}

          {isAdmin && user?.profileCompleted && (
            <NavLink className={({ isActive }) => (isActive ? "active" : undefined)} to="/admin">
              Admin
            </NavLink>
          )}

          {isAdmin && user?.profileCompleted && (
            <NavLink className={({ isActive }) => (isActive ? "active" : undefined)} to="/admin/resources">
              Manage Resources
            </NavLink>
          )}

          {isAdmin && user?.profileCompleted && (
            <NavLink className={({ isActive }) => (isActive ? "active" : undefined)} to="/admin/bookings">
              Review Bookings
            </NavLink>
          )}

          {!isAuthenticated ? (
            <>
              <Link className="btn btn-secondary" to="/register">
                Register
              </Link>
              <Link className="btn" to="/login">
                Login
              </Link>
            </>
          ) : (
            <>
              <span className="user-badge">
                <Link to={accountHomePath}>{user?.fullName || user?.email}</Link>
                {user?.profileCompleted ? ` (${user?.role})` : " (Profile incomplete)"}
              </span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
