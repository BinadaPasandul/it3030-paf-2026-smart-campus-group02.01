import { Link } from "react-router-dom";

function ResourceCard({ resource }) {
  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body">
        <h5 className="card-title">{resource.name}</h5>
        <h6 className="card-subtitle mb-3 text-muted">{resource.code}</h6>

        <p className="mb-1">
          <strong>Type:</strong> {resource.type?.replaceAll("_", " ")}
        </p>

        <p className="mb-1">
          <strong>Capacity:</strong> {resource.capacity}
        </p>

        <p className="mb-1">
          <strong>Location:</strong> {resource.location}
        </p>

        <p className="mb-1">
          <strong>Status:</strong> {resource.status?.replaceAll("_", " ")}
        </p>

        <p className="mb-3">
          <strong>Available:</strong> {resource.availableFrom} - {resource.availableTo}
        </p>

        <Link to={`/resources/${resource.id}`} className="btn btn-primary btn-sm">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ResourceCard;