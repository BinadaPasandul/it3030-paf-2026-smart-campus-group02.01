import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <div className="card">
      <p className="eyebrow">Access Restricted</p>
      <h2>Unauthorized</h2>
      <p className="page-subtitle">You do not have permission to access this page.</p>
      <div className="actions-row">
        <Link className="btn" to="/">
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
