import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMenu,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../features/auth/context/useAuth";

function Navbar({ menuOpen, onToggleMenu }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout, getHomePathForUser } = useAuth();

  const accountHomePath = isAuthenticated ? getHomePathForUser(user) : "/";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { to: "/", label: "Home", icon: FiHome, visible: true },
    {
      to: "/profile",
      label: "Profile",
      icon: FiUser,
      visible: isAuthenticated && user?.profileCompleted,
    },
    {
      to: "/resources",
      label: "Resources",
      icon: FiBookOpen,
      visible: isAuthenticated && user?.profileCompleted,
    },
    {
      to: "/tickets",
      label: "Tickets",
      icon: FiGrid,
      visible: isAuthenticated && user?.profileCompleted,
    },
  ].filter((item) => item.visible);

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

      <aside className={`side-nav ${menuOpen ? "expanded" : "collapsed"}`}>
        <div className="side-nav-inner">
          <div className="side-nav-top">
            {isAuthenticated && !user?.profileCompleted ? (
              <NavLink
                className={({ isActive }) => `side-nav-link ${isActive ? "active" : ""}`}
                to="/complete-profile"
                title="Complete Profile"
              >
                <span className="side-nav-icon">
                  <FiUser />
                </span>
                <span className="side-nav-text">Complete Profile</span>
              </NavLink>
            ) : null}

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  className={({ isActive }) => `side-nav-link ${isActive ? "active" : ""}`}
                  to={item.to}
                  title={item.label}
                >
                  <span className="side-nav-icon">
                    <Icon />
                  </span>
                  <span className="side-nav-text">{item.label}</span>
                </NavLink>
              );
            })}

            {isAdmin && user?.profileCompleted ? (
              <NavLink
                className={({ isActive }) => `side-nav-link ${isActive ? "active" : ""}`}
                to="/admin"
                title="Admin"
              >
                <span className="side-nav-icon">
                  <FiGrid />
                </span>
                <span className="side-nav-text">Admin</span>
              </NavLink>
            ) : null}
          </div>

          {isAuthenticated ? (
            <button type="button" className="side-nav-link side-nav-action" onClick={handleLogout} title="Logout">
              <span className="side-nav-icon">
                <FiLogOut />
              </span>
              <span className="side-nav-text">Logout</span>
            </button>
          ) : null}
        </div>
      </aside>
    </>
  );
}

export default Navbar;
