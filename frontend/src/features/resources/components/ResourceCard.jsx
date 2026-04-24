import { Link } from "react-router-dom";
import { FiClock, FiMapPin, FiUsers } from "react-icons/fi";
import {
  formatBlockWindow,
  formatDateLabel,
  formatLabel,
  getAvailabilityRange,
  getResourceDescriptionText,
  getResourceStatusClass,
  getResourceTypeMeta,
} from "../resourceUi";

function ResourceCard({ resource, selectedDate = "" }) {
  const { icon: ResourceIcon, tone, label } = getResourceTypeMeta(resource.type);
  const bookingDisabled = resource.permanentlyUnavailable;
  const detailsQuery = selectedDate ? `?date=${selectedDate}` : "";
  const selectedDateBlocks = resource.selectedDateBlocks || [];
  const hasSelectedDateBlocks = selectedDateBlocks.length > 0;
  const selectedDateTone = hasSelectedDateBlocks
    ? "resource-card-date-note-limited"
    : "resource-card-date-note-open";

  return (
    <article className="resource-card">
      <div className="resource-card-head">
        <div className="resource-card-title">
          <div className={`resource-card-icon resource-tone-${tone}`}>
            <ResourceIcon />
          </div>
          <div>
            <div className="resource-card-badge-row">
              <span className="resource-type-chip">{label}</span>
              <span className={`status-badge ${getResourceStatusClass(resource.status)}`}>
                {formatLabel(resource.status)}
              </span>
            </div>
            <h3>{resource.name}</h3>
            <p className="resource-card-code">{resource.code}</p>
          </div>
        </div>
      </div>

      <p className="resource-card-description">
        {getResourceDescriptionText(resource.description)}
      </p>

      {selectedDate ? (
        <div className={`resource-card-date-note ${selectedDateTone}`}>
          <strong>{resource.selectedDateAvailabilityMessage || `Available on ${formatDateLabel(selectedDate)}.`}</strong>
          <span>
            {hasSelectedDateBlocks
              ? `Selected date has ${selectedDateBlocks.length} scheduled blocked ${selectedDateBlocks.length === 1 ? "window" : "windows"}.`
              : `Available on ${formatDateLabel(selectedDate)} during the normal operating window.`}
          </span>
        </div>
      ) : null}

      {resource.currentlyBlocked ? (
        <div className="resource-card-warning">
          <strong>Out of service right now</strong>
          <span>{resource.currentBlockReason || "A scheduled maintenance window is active."}</span>
        </div>
      ) : resource.nextScheduledBlock ? (
        <div className="resource-card-upcoming">
          <strong>Next unavailable window</strong>
          <span>{formatBlockWindow(resource.nextScheduledBlock)}</span>
        </div>
      ) : null}

      <div className="resource-card-meta">
        <div className="resource-meta-tile">
          <span className="resource-meta-label">
            <FiMapPin />
            Location
          </span>
          <strong>{resource.location}</strong>
        </div>

        <div className="resource-meta-tile">
          <span className="resource-meta-label">
            <FiUsers />
            Capacity
          </span>
          <strong>{resource.capacity} people</strong>
        </div>

        <div className="resource-meta-tile">
          <span className="resource-meta-label">
            <FiClock />
            Availability
          </span>
          <strong>{getAvailabilityRange(resource)}</strong>
        </div>

        <div className="resource-meta-tile">
          <span className="resource-meta-label">Scheduled blocks</span>
          <strong>{resource.scheduledBlockCount || 0} windows</strong>
        </div>
      </div>

      <div className="resource-card-actions">
        <Link to={`/resources/${resource.id}${detailsQuery}`} className="btn btn-secondary">
          View Details
        </Link>
        <Link
          to={`/bookings/new?resourceId=${resource.id}`}
          className={`btn ${bookingDisabled ? "resource-card-disabled" : ""}`}
          aria-disabled={bookingDisabled}
          tabIndex={bookingDisabled ? -1 : 0}
        >
          {bookingDisabled ? "Permanently unavailable" : "Book Now"}
        </Link>
      </div>
    </article>
  );
}

export default ResourceCard;
