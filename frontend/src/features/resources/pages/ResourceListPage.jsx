import { useEffect, useState } from "react";
import { getAllResources } from "../../../api/resourceApi";
import ResourceCard from "../components/ResourceCard";
import ResourceFilterBar from "../components/ResourceFilterBar";

function ResourceListPage() {
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    minCapacity: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResources = async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        ...currentFilters,
      };

      if (params.minCapacity === "") {
        delete params.minCapacity;
      }

      if (params.type === "") delete params.type;
      if (params.location === "") delete params.location;
      if (params.status === "") delete params.status;

      const data = await getAllResources(params);
      setResources(data);
    } catch (err) {
      setError("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSearch = () => {
    fetchResources(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      type: "",
      location: "",
      minCapacity: "",
      status: "",
    };
    setFilters(resetFilters);
    fetchResources(resetFilters);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Facilities & Assets Catalogue</h2>
      </div>

      <ResourceFilterBar
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {loading && <p>Loading resources...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="row g-4">
          {resources.length > 0 ? (
            resources.map((resource) => (
              <div className="col-md-4" key={resource.id}>
                <ResourceCard resource={resource} />
              </div>
            ))
          ) : (
            <p>No resources found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ResourceListPage;