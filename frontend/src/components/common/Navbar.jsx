import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../features/auth/context/useAuth";
import Sidebar from "./Sidebar";
import NotificationMenu from "./NotificationMenu";

function Navbar({ menuOpen, onToggleMenu }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout, getHomePathForUser } = useAuth();

  const accountHomePath = isAuthenticated ? getHomePathForUser(user) : "/";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="nav-left nav-left-shell">
            <button
              type="button"
              className="menu-toggle"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              onClick={onToggleMenu}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
            <Link to="/" className="brand">
              Smart Campus
            </Link>
          </div>

          <div className="nav-links nav-links-right">
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
              <div style={{ display: "flex", alignItems: "center" }}>
                <NotificationMenu />
                <span className="user-badge">
                  <Link to={accountHomePath}>{user?.fullName || user?.email}</Link>
                  {user?.profileCompleted ? ` (${user?.role})` : " (Profile incomplete)"}
                </span>
                <button className="btn btn-secondary" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <Sidebar
        menuOpen={menuOpen}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
}

export default Navbar;
