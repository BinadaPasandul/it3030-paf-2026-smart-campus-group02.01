import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";

function ProtectedRoute({ children, adminOnly = false, allowIncomplete = false, incompleteOnly = false }) {
  const { user, loading, getHomePathForUser } = useAuth();

  if (loading) {
    return (
      <div className="card loading-card">
        <h2>Loading your session</h2>
        <p className="page-subtitle">Checking whether you are allowed to open this page.</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (incompleteOnly && user.profileCompleted) {
    return <Navigate to={getHomePathForUser(user)} replace />;
  }

  if (!allowIncomplete && !user.profileCompleted) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (adminOnly && user.role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
