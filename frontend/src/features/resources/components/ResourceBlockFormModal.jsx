import { useEffect, useState } from "react";
import { FiCalendar, FiShieldOff, FiX } from "react-icons/fi";
import ResourceBlockList from "./ResourceBlockList";
import { formatLabel } from "../resourceUi";

const initialFormState = {
  reason: "",
  blockDate: "",
  allDay: false,
  startTime: "",
  endTime: "",
};

function ResourceBlockFormModal({
  resource,
  blocks,
  loadingBlocks,
  submitting,
  deletingBlockId,
  error,
  onClose,
  onSubmit,
  onDelete,
}) {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    setFormData(initialFormState);
  }, [resource?.id]);

  if (!resource) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="resource-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="resource-modal-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-block-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="resource-modal-header">
          <div>
            <p className="eyebrow">Scheduled Resource Unavailability</p>
            <h2 id="resource-block-modal-title">Schedule out-of-service time for {resource.name}</h2>
            <p className="page-subtitle">
              Add a maintenance or outage window without changing the whole resource into a permanently unavailable state.
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <FiX />
            Close
          </button>
        </div>

        <div className="resource-modal-summary">
          <div className="resource-mini-card">
            <span>Current status</span>
            <strong>{formatLabel(resource.status)}</strong>
          </div>
          <div className="resource-mini-card">
            <span>Permanent status</span>
            <strong>{formatLabel(resource.baseStatus)}</strong>
          </div>
          <div className="resource-mini-card">
            <span>Scheduled windows</span>
            <strong>{blocks.length}</strong>
          </div>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="resource-modal-layout">
          <form onSubmit={handleSubmit} className="card resource-block-form-card">
            <div className="resource-block-form-header">
              <div>
                <p className="eyebrow">New block window</p>
                <h3>Schedule out-of-service period</h3>
              </div>
              <div className="resource-code-chip">
                <FiShieldOff />
                Temporary block
              </div>
            </div>

            <div className="resource-form-field">
              <label htmlFor="resource-block-reason">Reason</label>
              <textarea
                id="resource-block-reason"
                className="input resource-textarea"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g. Preventive maintenance, wiring inspection, equipment calibration"
                required
              />
            </div>

            <div className="resource-form-columns">
              <div className="resource-form-field">
                <label htmlFor="resource-block-date">Date</label>
                <input
                  id="resource-block-date"
                  type="date"
                  className="input"
                  name="blockDate"
                  value={formData.blockDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <label className="resource-checkbox-field" htmlFor="resource-block-all-day">
                <input
                  id="resource-block-all-day"
                  type="checkbox"
                  name="allDay"
                  checked={formData.allDay}
                  onChange={handleChange}
                />
                <span>
                  <strong>All day block</strong>
                  <small>Use this when the resource should be unavailable for the entire date.</small>
                </span>
              </label>
            </div>

            {!formData.allDay ? (
              <div className="resource-form-columns">
                <div className="resource-form-field">
                  <label htmlFor="resource-block-start-time">Start time</label>
                  <input
                    id="resource-block-start-time"
                    type="time"
                    className="input"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required={!formData.allDay}
                  />
                </div>
                <div className="resource-form-field">
                  <label htmlFor="resource-block-end-time">End time</label>
                  <input
                    id="resource-block-end-time"
                    type="time"
                    className="input"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required={!formData.allDay}
                  />
                </div>
              </div>
            ) : (
              <div className="resource-block-note">
                <FiCalendar />
                This block will cover the full date. Existing approved bookings on that date will prevent it from being saved.
              </div>
            )}

            <div className="resource-form-actions">
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? "Scheduling..." : "Save block window"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>

          {loadingBlocks ? (
            <article className="card resource-loading-card">
              <span className="resource-spinner" aria-hidden="true" />
              <p className="page-subtitle">Loading scheduled windows...</p>
            </article>
          ) : (
            <ResourceBlockList
              blocks={blocks}
              onDelete={onDelete}
              deletingBlockId={deletingBlockId}
              subtitle="These windows are used by the booking service to reject overlapping reservations."
              emptyMessage="No current or future out-of-service windows are scheduled for this resource."
              compact={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourceBlockFormModal;
