import { useEffect, useMemo, useState } from "react";
import { FiActivity, FiCheckCircle, FiLayers, FiMapPin } from "react-icons/fi";
import { getAllResources } from "../../../api/resourceApi";
import ResourceCard from "../components/ResourceCard";
import ResourceFilterBar from "../components/ResourceFilterBar";
import "../resources.css";

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
      console.error(err);
      setError("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const stats = useMemo(() => {
    const totalCapacity = resources.reduce(
      (sum, resource) => sum + (Number(resource.capacity) || 0),
      0,
    );
    const activeResources = resources.filter((resource) => resource.status === "ACTIVE").length;
    const uniqueTypes = new Set(resources.map((resource) => resource.type).filter(Boolean)).size;
    const uniqueLocations = new Set(resources.map((resource) => resource.location).filter(Boolean)).size;

    return {
      total: resources.length,
      active: activeResources,
      capacity: totalCapacity,
      locations: uniqueLocations,
      types: uniqueTypes,
    };
  }, [resources]);

  return (
    <div className="resource-page">
      <section className="resource-hero">
        <div>
          <p className="eyebrow">Campus Resource Centre</p>
          <h1>Browse spaces, labs, and shared campus assets</h1>
          <p className="page-subtitle resource-hero-copy">
            Find the right lecture hall, meeting room, lab, or equipment item with live availability, location context, and booking readiness in one place.
          </p>
          <div className="resource-hero-actions">
            <button type="button" className="btn" onClick={handleSearch}>
              Refresh Results
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleReset}>
              Clear Filters
            </button>
          </div>
        </div>

        <div className="resource-highlight-list">
          <article className="resource-highlight-card">
            <span>Live inventory</span>
            <strong>{stats.total} resources</strong>
          </article>
          <article className="resource-highlight-card">
            <span>Ready to book</span>
            <strong>{stats.active} active entries</strong>
          </article>
          <article className="resource-highlight-card">
            <span>Coverage</span>
            <strong>{stats.locations} campus locations</strong>
          </article>
        </div>
      </section>

      <section className="resource-stats-grid">
        <article className="card resource-stat-card ticket-accent-indigo">
          <div className="resource-stat-icon">
            <FiLayers />
          </div>
          <div>
            <p className="eyebrow">Catalogue Size</p>
            <h2>{stats.total}</h2>
          </div>
        </article>
        <article className="card resource-stat-card ticket-accent-green">
          <div className="resource-stat-icon">
            <FiCheckCircle />
          </div>
          <div>
            <p className="eyebrow">Available Now</p>
            <h2>{stats.active}</h2>
          </div>
        </article>
        <article className="card resource-stat-card ticket-accent-amber">
          <div className="resource-stat-icon">
            <FiActivity />
          </div>
          <div>
            <p className="eyebrow">Total Capacity</p>
            <h2>{stats.capacity}</h2>
          </div>
        </article>
        <article className="card resource-stat-card ticket-accent-slate">
          <div className="resource-stat-icon">
            <FiMapPin />
          </div>
          <div>
            <p className="eyebrow">Resource Types</p>
            <h2>{stats.types}</h2>
          </div>
        </article>
      </section>

      <ResourceFilterBar
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <section className="resource-results-bar">
        <div>
          <p className="eyebrow">Inventory Results</p>
          <h2>Facilities & assets catalogue</h2>
        </div>
        <div className="resource-results-count">{resources.length} matches</div>
      </section>

      {loading ? (
        <article className="card resource-loading-card">
          <span className="resource-spinner" aria-hidden="true" />
          <p className="page-subtitle">Loading available campus resources...</p>
        </article>
      ) : null}

      {error ? (
        <article className="card resource-empty-state">
          <p className="resource-empty-icon">!</p>
          <h2>Unable to load resources</h2>
          <p className="page-subtitle">{error}</p>
        </article>
      ) : null}

      {!loading && !error ? (
        <div className="resource-card-grid">
          {resources.length > 0 ? (
            resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))
          ) : (
            <article className="card resource-empty-state">
              <div className="resource-empty-icon">
                <FiLayers />
              </div>
              <h2>No resources matched your filters</h2>
              <p className="page-subtitle">
                Try widening the location, status, or capacity filters to see more options.
              </p>
            </article>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default ResourceListPage;
