import { NavLink } from "react-router-dom";
import {
  FiBookOpen,
  FiClipboard,
  FiDatabase,
  FiGrid,
  FiHome,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

function Sidebar({ menuOpen, isAuthenticated, isAdmin, user, onLogout }) {
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
    {
      to: "/admin",
      label: "Admin",
      icon: FiGrid,
      visible: isAdmin && user?.profileCompleted,
    },
    {
      to: "/admin/resources",
      label: "Manage Resources",
      icon: FiDatabase,
      visible: isAdmin && user?.profileCompleted,
    },
    {
      to: "/admin/bookings",
      label: "Review Bookings",
      icon: FiClipboard,
      visible: isAdmin && user?.profileCompleted,
    },
  ].filter((item) => item.visible);

  return (
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
        </div>

        {isAuthenticated ? (
          <button type="button" className="side-nav-link side-nav-action" onClick={onLogout} title="Logout">
            <span className="side-nav-icon">
              <FiLogOut />
            </span>
            <span className="side-nav-text">Logout</span>
          </button>
        ) : null}
      </div>
    </aside>
  );
}

export default Sidebar;
