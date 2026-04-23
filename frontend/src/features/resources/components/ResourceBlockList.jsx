import { FiAlertTriangle, FiClock, FiTrash2 } from "react-icons/fi";
import { formatBlockWindow, formatDateLabel, formatTimeLabel } from "../resourceUi";
import "../resources.css";

function ResourceBlockList({
  blocks,
  title = "Scheduled Out-of-Service Windows",
  subtitle = "Current and upcoming maintenance windows for this resource.",
  emptyMessage = "No scheduled out-of-service windows.",
  onDelete,
  deletingBlockId,
  compact = false,
}) {
  return (
    <article className={`card resource-block-card ${compact ? "resource-block-card-compact" : ""}`}>
      <div className="resource-block-card-header">
        <div>
          <p className="eyebrow">Availability Windows</p>
          <h2>{title}</h2>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        <div className="resource-results-count">{blocks.length} scheduled</div>
      </div>

      {blocks.length === 0 ? (
        <div className="resource-block-empty">
          <FiClock />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="resource-block-list">
          {blocks.map((block) => (
            <article key={block.id} className={`resource-block-item ${block.activeNow ? "is-active" : ""}`}>
              <div className="resource-block-copy">
                <div className="resource-card-badge-row">
                  <span className="resource-type-chip">
                    {block.allDay ? "All day" : "Timed window"}
                  </span>
                  {block.activeNow ? (
                    <span className="status-badge resource-status-out">Active now</span>
                  ) : null}
                </div>
                <h3>{formatBlockWindow(block)}</h3>
                <p className="page-subtitle">{block.reason}</p>
                <div className="resource-block-meta">
                  <span>
                    <FiClock />
                    {block.allDay
                      ? `${formatDateLabel(block.blockDate)} • Full day`
                      : `${formatTimeLabel(block.startTime)} to ${formatTimeLabel(block.endTime)}`}
                  </span>
                  <span>Created by {block.createdBy}</span>
                </div>
              </div>

              {onDelete && block.canDelete ? (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(block.id)}
                  disabled={deletingBlockId === block.id}
                >
                  <FiTrash2 />
                  {deletingBlockId === block.id ? "Removing..." : "Remove"}
                </button>
              ) : null}

              {onDelete && !block.canDelete ? (
                <div className="resource-block-lock">
                  <FiAlertTriangle />
                  Past window
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </article>
  );
}

export default ResourceBlockList;
