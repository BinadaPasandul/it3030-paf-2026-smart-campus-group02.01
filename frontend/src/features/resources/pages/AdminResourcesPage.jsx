import { useEffect, useMemo, useState } from "react";
import { FiActivity, FiCheckCircle, FiDatabase, FiLayers, FiMapPin, FiRefreshCw } from "react-icons/fi";
import {
  createResource,
  deleteResource,
  getAllResources,
  updateResource,
  updateResourceStatus,
} from "../../../api/resourceApi";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import ResourceForm from "../components/ResourceForm";
import {
  formatLabel,
  getAvailabilityRange,
  getResourceStatusClass,
} from "../resourceUi";
import "../resources.css";

function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadResources = async () => {
    try {
      const data = await getAllResources();
      setResources(data);
      setError("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to load resources."));
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadResources();
  }, []);

  const handleCreate = async (formData) => {
    try {
      setMessage("");
      setError("");
      await createResource(formData);
      setMessage("Resource created successfully.");
      setFormResetKey((current) => current + 1);
      await loadResources();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to create resource."));
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingResource) {
      return;
    }

    try {
      setMessage("");
      setError("");
      await updateResource(editingResource.id, formData);
      setMessage("Resource updated successfully.");
      setEditingResource(null);
      setFormResetKey((current) => current + 1);
      await loadResources();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to update resource."));
    }
  };

  const handleToggleStatus = async (resource) => {
    try {
      setMessage("");
      setError("");

      const newStatus =
        resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";

      await updateResourceStatus(resource.id, newStatus);
      setMessage("Resource status updated.");
      await loadResources();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to update resource status."));
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this resource?");
    if (!confirmed) return;

    try {
      setMessage("");
      setError("");
      await deleteResource(id);
      setMessage("Resource deleted successfully.");
      if (editingResource?.id === id) {
        setEditingResource(null);
        setFormResetKey((current) => current + 1);
      }
      await loadResources();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to delete resource."));
    }
  };

  const handleEdit = (resource) => {
    setMessage("");
    setError("");
    setEditingResource({
      id: resource.id,
      name: resource.name,
      code: resource.code,
      type: resource.type,
      capacity: resource.capacity,
      location: resource.location,
      description: resource.description ?? "",
      availableFrom: resource.availableFrom,
      availableTo: resource.availableTo,
    });
  };

  const handleCancelEdit = () => {
    setEditingResource(null);
    setMessage("");
    setError("");
    setFormResetKey((current) => current + 1);
  };

  const stats = useMemo(() => {
    const active = resources.filter((resource) => resource.status === "ACTIVE").length;
    const inactive = resources.filter((resource) => resource.status !== "ACTIVE").length;
    const totalCapacity = resources.reduce(
      (sum, resource) => sum + (Number(resource.capacity) || 0),
      0,
    );
    const locations = new Set(resources.map((resource) => resource.location).filter(Boolean)).size;

    return {
      total: resources.length,
      active,
      inactive,
      capacity: totalCapacity,
      locations,
    };
  }, [resources]);

  return (
    <div className="resource-admin-page">
      <section className="resource-admin-hero">
        <div>
          <p className="eyebrow">Admin Resource Operations</p>
          <h1>Manage rooms, labs, and shared assets</h1>
          <p className="page-subtitle resource-admin-hero-copy">
            Create new resource entries, update availability, and keep the campus inventory aligned with real booking conditions.
          </p>
        </div>
        <div className="resource-admin-live-pill">
          <span className="resource-admin-live-dot" />
          Inventory control active
        </div>
      </section>

      <section className="resource-stats-grid">
        <article className="card resource-stat-card ticket-accent-indigo">
          <div className="resource-stat-icon">
            <FiDatabase />
          </div>
          <div>
            <p className="eyebrow">Total Resources</p>
            <h2>{stats.total}</h2>
          </div>
        </article>
        <article className="card resource-stat-card ticket-accent-green">
          <div className="resource-stat-icon">
            <FiCheckCircle />
          </div>
          <div>
            <p className="eyebrow">Active Resources</p>
            <h2>{stats.active}</h2>
          </div>
        </article>
        <article className="card resource-stat-card ticket-accent-amber">
          <div className="resource-stat-icon">
            <FiActivity />
          </div>
          <div>
            <p className="eyebrow">Managed Capacity</p>
            <h2>{stats.capacity}</h2>
          </div>
        </article>
        <article className="card resource-stat-card ticket-accent-slate">
          <div className="resource-stat-icon">
            <FiMapPin />
          </div>
          <div>
            <p className="eyebrow">Locations</p>
            <h2>{stats.locations}</h2>
          </div>
        </article>
      </section>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="resource-admin-layout">
        <ResourceForm
          key={`${editingResource?.code ?? "create"}-${formResetKey}`}
          initialValues={editingResource}
          onSubmit={editingResource ? handleUpdate : handleCreate}
          onCancel={editingResource ? handleCancelEdit : undefined}
          submitLabel={editingResource ? "Update Resource" : "Create Resource"}
          title={editingResource ? "Update selected resource" : "Create a new resource entry"}
          subtitle={
            editingResource
              ? "Adjust capacity, location, description, or operating hours for the selected inventory item."
              : "Add a fresh catalogue item with the details students and staff need before booking."
          }
        />

        <aside className="resource-admin-side-panel">
          <article className="card resource-form-note">
            <p className="eyebrow">Workspace Status</p>
            <h2>{editingResource ? "Editing existing inventory" : "Ready to create"}</h2>
            <p>
              {editingResource
                ? "You are modifying a live resource record. Save changes when the updated schedule and metadata are correct."
                : "Use the form to introduce new bookable rooms or assets into the system without affecting other modules."}
            </p>
          </article>

          <article className="card resource-form-note">
            <p className="eyebrow">Inventory Snapshot</p>
            <div className="resource-highlight-list">
              <div className="resource-mini-card">
                <span>Out of service</span>
                <strong>{stats.inactive}</strong>
              </div>
              <div className="resource-mini-card">
                <span>Bookable now</span>
                <strong>{stats.active}</strong>
              </div>
              <div className="resource-mini-card">
                <span>Coverage</span>
                <strong>{stats.locations} locations</strong>
              </div>
            </div>
          </article>
        </aside>
      </section>

      <article className="card resource-admin-table-card">
        <div className="ticket-list-header">
          <div>
            <p className="eyebrow">Resource Inventory</p>
            <h2>Existing resources</h2>
            <p className="resource-table-meta">
              Review the live catalogue, change status, or open any resource for editing.
            </p>
          </div>
          <div className="resource-inline-actions">
            <div className="resource-results-count">
              <FiLayers />
              {resources.length} items
            </div>
            <button type="button" className="btn btn-secondary" onClick={loadResources}>
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table resource-admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Availability</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {resources.length > 0 ? (
                resources.map((resource) => (
                  <tr key={resource.id}>
                    <td>
                      <button
                        type="button"
                        className="resource-title-button"
                        onClick={() => handleEdit(resource)}
                      >
                        <span>{resource.code}</span>
                        {resource.name}
                      </button>
                    </td>
                    <td>{formatLabel(resource.type)}</td>
                    <td>
                      <span className="resource-capacity-chip">{resource.capacity} people</span>
                    </td>
                    <td>{resource.location}</td>
                    <td>{getAvailabilityRange(resource)}</td>
                    <td>
                      <span className={`status-badge ${getResourceStatusClass(resource.status)}`}>
                        {formatLabel(resource.status)}
                      </span>
                    </td>
                    <td>
                      <div className="resource-inline-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEdit(resource)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleToggleStatus(resource)}
                        >
                          {resource.status === "ACTIVE" ? "Mark Out" : "Mark Active"}
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(resource.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="resource-admin-empty">
                  <td colSpan="7">
                    <p className="page-subtitle">No resources available yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

export default AdminResourcesPage;
