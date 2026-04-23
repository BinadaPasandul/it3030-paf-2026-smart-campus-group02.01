import { Link } from "react-router-dom";
import { FiClock, FiMapPin, FiUsers } from "react-icons/fi";
import {
  formatLabel,
  getAvailabilityRange,
  getResourceDescriptionText,
  getResourceStatusClass,
  getResourceTypeMeta,
} from "../resourceUi";

function ResourceCard({ resource }) {
  const { icon: ResourceIcon, tone, label } = getResourceTypeMeta(resource.type);
  const isActive = resource.status === "ACTIVE";

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
          <span className="resource-meta-label">Booking</span>
          <strong>{isActive ? "Ready to book" : "Unavailable right now"}</strong>
        </div>
      </div>

      <div className="resource-card-actions">
        <Link to={`/resources/${resource.id}`} className="btn btn-secondary">
            View Details
          </Link>
        <Link
          to={`/bookings/new?resourceId=${resource.id}`}
          className={`btn ${isActive ? "" : "resource-card-disabled"}`}
          aria-disabled={!isActive}
          tabIndex={isActive ? 0 : -1}
        >
          Book Now
        </Link>
      </div>
    </article>
  );
}

export default ResourceCard;
