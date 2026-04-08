import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="card">
      <p className="eyebrow">404</p>
      <h2>404 - Page Not Found</h2>
      <p className="page-subtitle">The page you requested does not exist in this frontend module.</p>
      <div className="actions-row">
        <Link className="btn" to="/">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
