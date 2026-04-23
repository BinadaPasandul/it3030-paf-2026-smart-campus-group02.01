import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getResourceById } from "../../../api/resourceApi";

function ResourceDetailsPage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getResourceById(id);
        setResource(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load resource details.");
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  if (loading) {
    return <div className="container py-4">Loading...</div>;
  }

  if (error) {
    return <div className="container py-4 text-danger">{error}</div>;
  }

  if (!resource) {
    return <div className="container py-4">Resource not found.</div>;
  }

  return (
    <div className="container py-4">
      <Link to="/resources" className="btn btn-outline-secondary mb-3">
        Back
      </Link>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h2 className="mb-3">{resource.name}</h2>

          <p><strong>Code:</strong> {resource.code}</p>
          <p><strong>Type:</strong> {resource.type?.replaceAll("_", " ")}</p>
          <p><strong>Capacity:</strong> {resource.capacity}</p>
          <p><strong>Location:</strong> {resource.location}</p>
          <p><strong>Status:</strong> {resource.status?.replaceAll("_", " ")}</p>
          <p><strong>Availability:</strong> {resource.availableFrom} - {resource.availableTo}</p>
          <p><strong>Description:</strong> {resource.description || "No description available."}</p>
        </div>
      </div>
    </div>
  );
}

export default ResourceDetailsPage;