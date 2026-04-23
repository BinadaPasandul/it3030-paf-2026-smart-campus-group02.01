import { FiAlertTriangle, FiX } from "react-icons/fi";
import "../resources.css";

function ConfirmActionModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "primary",
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <div className="resource-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="resource-modal-shell resource-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="resource-modal-header">
          <div className="resource-confirm-copy">
            <div className="resource-confirm-icon">
              <FiAlertTriangle />
            </div>
            <div>
              <p className="eyebrow">Please confirm</p>
              <h2 id="resource-confirm-title">{title}</h2>
              <p className="page-subtitle">{message}</p>
            </div>
          </div>

          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <FiX />
            Close
          </button>
        </div>

        <div className="resource-form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${confirmTone === "danger" ? "btn-danger" : ""}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmActionModal;
