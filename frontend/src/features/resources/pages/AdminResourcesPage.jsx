import { useEffect, useState } from "react";
import {
  createResource,
  deleteResource,
  getAllResources,
  updateResource,
  updateResourceStatus,
} from "../../../api/resourceApi";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import ResourceForm from "../components/ResourceForm";

function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadResources = async () => {
    try {
      setError("");
      const data = await getAllResources();
      setResources(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to load resources."));
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

  return (
    <div className="container py-4">
      <h2 className="mb-4">Admin Resource Management</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-5">
        <ResourceForm
          key={`${editingResource?.code ?? "create"}-${formResetKey}`}
          initialValues={editingResource}
          onSubmit={editingResource ? handleUpdate : handleCreate}
          onCancel={editingResource ? handleCancelEdit : undefined}
          submitLabel={editingResource ? "Update Resource" : "Create Resource"}
        />
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h4 className="mb-3">Existing Resources</h4>

          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
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
                      <td>{resource.name}</td>
                      <td>{resource.code}</td>
                      <td>{resource.type}</td>
                      <td>{resource.capacity}</td>
                      <td>{resource.location}</td>
                      <td>
                        {resource.availableFrom} - {resource.availableTo}
                      </td>
                      <td>{resource.status}</td>
                      <td className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEdit(resource)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleToggleStatus(resource)}
                        >
                          Toggle Status
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(resource.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No resources available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminResourcesPage;
