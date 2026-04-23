import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiCalendar,
  FiCheckCircle,
  FiDatabase,
  FiLayers,
  FiMapPin,
  FiRefreshCw,
} from "react-icons/fi";
import {
  createResource,
  createResourceBlock,
  deleteResource,
  deleteResourceBlock,
  getAllResources,
  getResourceBlocks,
  updateResource,
  updateResourceStatus,
} from "../../../api/resourceApi";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import ResourceBlockFormModal from "../components/ResourceBlockFormModal";
import ResourceForm from "../components/ResourceForm";
import {
  formatBlockWindow,
  formatLabel,
  getAvailabilityRange,
  getResourceStatusClass,
} from "../resourceUi";
import ConfirmActionModal from "../components/ConfirmActionModal";
import "../resources.css";

function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceForBlocking, setResourceForBlocking] = useState(null);
  const [resourceBlocks, setResourceBlocks] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [submittingBlock, setSubmittingBlock] = useState(false);
  const [deletingBlockId, setDeletingBlockId] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [blockError, setBlockError] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);
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

  const loadBlocksForResource = async (resourceId) => {
    try {
      setLoadingBlocks(true);
      const data = await getResourceBlocks(resourceId);
      setResourceBlocks(data);
      setBlockError("");
    } catch (requestError) {
      setBlockError(getApiErrorMessage(requestError, "Failed to load scheduled windows."));
    } finally {
      setLoadingBlocks(false);
    }
  };

  useEffect(() => {
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

  const openConfirmDialog = (config) => {
    setConfirmDialog(config);
  };

  const closeConfirmDialog = () => {
    if (confirmBusy) {
      return;
    }

    setConfirmDialog(null);
  };

  const handlePermanentStatusToggle = (resource) => {
    const nextStatus = resource.baseStatus === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    const confirmationMessage = nextStatus === "OUT_OF_SERVICE"
      ? "Set this resource as permanently out of service? Temporary maintenance should use the schedule action instead."
      : "Restore this resource to permanent active status?";

    openConfirmDialog({
      title: nextStatus === "OUT_OF_SERVICE" ? "Set permanent out of service?" : "Restore permanent active status?",
      message: confirmationMessage,
      confirmLabel: nextStatus === "OUT_OF_SERVICE" ? "Set Permanent Out" : "Restore Resource",
      confirmTone: nextStatus === "OUT_OF_SERVICE" ? "danger" : "primary",
      onConfirm: async () => {
        try {
          setConfirmBusy(true);
          setMessage("");
          setError("");
          await updateResourceStatus(resource.id, nextStatus);
          setMessage("Permanent resource status updated.");
          await loadResources();
          setConfirmDialog(null);
        } catch (requestError) {
          setError(getApiErrorMessage(requestError, "Failed to update permanent resource status."));
        } finally {
          setConfirmBusy(false);
        }
      },
    });
  };

  const handleDelete = (id) => {
    openConfirmDialog({
      title: "Delete this resource?",
      message: "This will remove the resource from the catalogue if it is not linked to existing bookings.",
      confirmLabel: "Delete Resource",
      confirmTone: "danger",
      onConfirm: async () => {
        try {
          setConfirmBusy(true);
          setMessage("");
          setError("");
          await deleteResource(id);
          setMessage("Resource deleted successfully.");
          if (editingResource?.id === id) {
            setEditingResource(null);
            setFormResetKey((current) => current + 1);
          }
          if (resourceForBlocking?.id === id) {
            setResourceForBlocking(null);
            setResourceBlocks([]);
          }
          await loadResources();
          setConfirmDialog(null);
        } catch (requestError) {
          setError(getApiErrorMessage(requestError, "Failed to delete resource."));
        } finally {
          setConfirmBusy(false);
        }
      },
    });
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

  const openBlockModal = async (resource) => {
    setResourceForBlocking(resource);
    setBlockError("");
    await loadBlocksForResource(resource.id);
  };

  const closeBlockModal = () => {
    setResourceForBlocking(null);
    setResourceBlocks([]);
    setBlockError("");
    setSubmittingBlock(false);
    setDeletingBlockId(null);
  };

  const handleCreateBlock = async (formData) => {
    if (!resourceForBlocking) {
      return;
    }

    try {
      setSubmittingBlock(true);
      setBlockError("");
      setMessage("");
      await createResourceBlock(resourceForBlocking.id, {
        ...formData,
        startTime: formData.allDay ? null : formData.startTime,
        endTime: formData.allDay ? null : formData.endTime,
      });
      setMessage("Scheduled out-of-service window saved.");
      await Promise.all([
        loadBlocksForResource(resourceForBlocking.id),
        loadResources(),
      ]);
    } catch (requestError) {
      setBlockError(getApiErrorMessage(requestError, "Failed to save the scheduled block."));
    } finally {
      setSubmittingBlock(false);
    }
  };

  const handleDeleteBlock = (blockId) => {
    if (!resourceForBlocking) {
      return;
    }

    openConfirmDialog({
      title: "Remove scheduled out-of-service window?",
      message: "This will cancel the selected temporary block and make that time slot bookable again.",
      confirmLabel: "Remove Window",
      confirmTone: "danger",
      onConfirm: async () => {
        try {
          setConfirmBusy(true);
          setDeletingBlockId(blockId);
          setBlockError("");
          setMessage("");
          await deleteResourceBlock(resourceForBlocking.id, blockId);
          setMessage("Scheduled out-of-service window removed.");
          await Promise.all([
            loadBlocksForResource(resourceForBlocking.id),
            loadResources(),
          ]);
          setConfirmDialog(null);
        } catch (requestError) {
          setBlockError(getApiErrorMessage(requestError, "Failed to remove the scheduled block."));
        } finally {
          setDeletingBlockId(null);
          setConfirmBusy(false);
        }
      },
    });
  };

  const stats = useMemo(() => {
    const active = resources.filter((resource) => resource.status === "ACTIVE").length;
    const inactive = resources.filter((resource) => resource.status !== "ACTIVE").length;
    const permanentlyUnavailable = resources.filter(
      (resource) => resource.baseStatus !== "ACTIVE",
    ).length;
    const totalCapacity = resources.reduce(
      (sum, resource) => sum + (Number(resource.capacity) || 0),
      0,
    );
    const locations = new Set(resources.map((resource) => resource.location).filter(Boolean)).size;

    return {
      total: resources.length,
      active,
      inactive,
      permanentlyUnavailable,
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
            Create new resource entries, schedule maintenance windows, and keep the campus inventory aligned with real booking conditions.
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
            <p className="eyebrow">Currently Active</p>
            <h2>{stats.active}</h2>
          </div>
        </article>
        <article className="card resource-stat-card ticket-accent-amber">
          <div className="resource-stat-icon">
            <FiActivity />
          </div>
          <div>
            <p className="eyebrow">Currently Out</p>
            <h2>{stats.inactive}</h2>
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
            <p className="eyebrow">Availability Snapshot</p>
            <div className="resource-highlight-list">
              <div className="resource-mini-card">
                <span>Current outages</span>
                <strong>{stats.inactive}</strong>
              </div>
              <div className="resource-mini-card">
                <span>Permanent out</span>
                <strong>{stats.permanentlyUnavailable}</strong>
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
              Review live catalogue status, schedule temporary outages, or set permanent availability.
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
                <th>Scheduled Windows</th>
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
                      <div className="resource-status-stack">
                        <span className={`status-badge ${getResourceStatusClass(resource.status)}`}>
                          {formatLabel(resource.status)}
                        </span>
                        <small>Permanent: {formatLabel(resource.baseStatus)}</small>
                        {resource.currentlyBlocked ? (
                          <small>{resource.currentBlockReason || "Active block window in progress."}</small>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="resource-status-stack">
                        <strong>{resource.scheduledBlockCount || 0} windows</strong>
                        <small>
                          {resource.nextScheduledBlock
                            ? formatBlockWindow(resource.nextScheduledBlock)
                            : "No current or future blocks"}
                        </small>
                      </div>
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
                          onClick={() => openBlockModal(resource)}
                        >
                          <FiCalendar />
                          Schedule Out
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handlePermanentStatusToggle(resource)}
                        >
                          {resource.baseStatus === "ACTIVE" ? "Set Permanent Out" : "Restore Permanent"}
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
                  <td colSpan="8">
                    <p className="page-subtitle">No resources available yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      {resourceForBlocking ? (
        <ResourceBlockFormModal
          key={resourceForBlocking.id}
          resource={resourceForBlocking}
          blocks={resourceBlocks}
          loadingBlocks={loadingBlocks}
          submitting={submittingBlock}
          deletingBlockId={deletingBlockId}
          error={blockError}
          onClose={closeBlockModal}
          onSubmit={handleCreateBlock}
          onDelete={handleDeleteBlock}
        />
      ) : null}

      {confirmDialog ? (
        <ConfirmActionModal
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          confirmTone={confirmDialog.confirmTone}
          loading={confirmBusy}
          onConfirm={confirmDialog.onConfirm}
          onClose={closeConfirmDialog}
        />
      ) : null}
    </div>
  );
}

export default AdminResourcesPage;
