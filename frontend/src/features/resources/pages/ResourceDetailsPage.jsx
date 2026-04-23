import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCalendar, FiClock, FiMapPin, FiShield, FiTag, FiUsers } from "react-icons/fi";
import { getResourceById } from "../../../api/resourceApi";
import ResourceBlockList from "../components/ResourceBlockList";
import {
  formatLabel,
  getAvailabilityRange,
  getResourceDescriptionText,
  getResourceStatusClass,
  getResourceTypeMeta,
} from "../resourceUi";
import "../resources.css";

function ResourceDetailsPage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getResourceById(id);
        setResource(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load resource details.");
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  if (loading) {
    return (
      <div className="resource-details-page">
        <article className="card resource-loading-card">
          <span className="resource-spinner" aria-hidden="true" />
          <p className="page-subtitle">Loading resource profile...</p>
        </article>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resource-details-page">
        <article className="card resource-empty-state">
          <p className="resource-empty-icon">!</p>
          <h2>Unable to load this resource</h2>
          <p className="page-subtitle">{error}</p>
        </article>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="resource-details-page">
        <article className="card resource-empty-state">
          <h2>Resource not found</h2>
          <p className="page-subtitle">The item you selected could not be located in the catalogue.</p>
        </article>
      </div>
    );
  }

  const { icon: ResourceIcon, tone, label } = getResourceTypeMeta(resource.type);
  const bookingDisabled = resource.permanentlyUnavailable;

  return (
    <div className="resource-details-page">
      <div className="resource-detail-header">
        <Link to="/resources" className="btn btn-ghost">
          Back to catalogue
        </Link>
        <div className="resource-card-badge-row">
          <span className={`status-badge ${getResourceStatusClass(resource.status)}`}>
            Current: {formatLabel(resource.status)}
          </span>
          <span className="resource-code-chip">Permanent: {formatLabel(resource.baseStatus)}</span>
        </div>
      </div>

      <section className="resource-hero">
        <div>
          <p className="eyebrow">Resource Profile</p>
          <div className="resource-card-badge-row">
            <span className="resource-type-chip">{label}</span>
            <span className="resource-code-chip">{resource.code}</span>
          </div>
          <h1>{resource.name}</h1>
          <p className="page-subtitle resource-hero-copy">
            {getResourceDescriptionText(resource.description)}
          </p>
        </div>

        <div className="resource-highlight-list">
          <article className="resource-highlight-card">
            <span>Location</span>
            <strong>{resource.location}</strong>
          </article>
          <article className="resource-highlight-card">
            <span>Capacity</span>
            <strong>{resource.capacity} people</strong>
          </article>
          <article className="resource-highlight-card">
            <span>Availability</span>
            <strong>{getAvailabilityRange(resource)}</strong>
          </article>
        </div>
      </section>

      {(resource.currentlyBlocked || resource.permanentlyUnavailable) ? (
        <article className="card resource-warning-banner">
          <div>
            <p className="eyebrow">Availability notice</p>
            <h2>{resource.permanentlyUnavailable ? "This resource is permanently unavailable" : "This resource is currently in a blocked window"}</h2>
            <p className="page-subtitle">
              {resource.permanentlyUnavailable
                ? "New bookings should not be made until staff restore the permanent status."
                : resource.currentBlockReason || "A scheduled maintenance window is active right now."}
            </p>
          </div>
        </article>
      ) : null}

      <div className="resource-detail-layout">
        <article className="card resource-detail-card">
          <div className="resource-detail-title-row">
            <div className="resource-card-title">
              <div className={`resource-card-icon resource-tone-${tone}`}>
                <ResourceIcon />
              </div>
              <div>
                <p className="eyebrow">Operational Overview</p>
                <h2>Resource details</h2>
                <p className="page-subtitle">
                  A complete view of availability, usage, and booking readiness for this campus asset.
                </p>
              </div>
            </div>
          </div>

          <dl className="resource-detail-meta">
            <div>
              <dt>
                <FiTag /> Code
              </dt>
              <dd>{resource.code}</dd>
            </div>
            <div>
              <dt>
                <FiShield /> Current status
              </dt>
              <dd>{formatLabel(resource.status)}</dd>
            </div>
            <div>
              <dt>
                <FiShield /> Permanent status
              </dt>
              <dd>{formatLabel(resource.baseStatus)}</dd>
            </div>
            <div>
              <dt>
                <FiUsers /> Capacity
              </dt>
              <dd>{resource.capacity} people</dd>
            </div>
            <div>
              <dt>
                <FiMapPin /> Location
              </dt>
              <dd>{resource.location}</dd>
            </div>
            <div>
              <dt>
                <FiClock /> Hours
              </dt>
              <dd>{getAvailabilityRange(resource)}</dd>
            </div>
            <div>
              <dt>
                <FiCalendar /> Type
              </dt>
              <dd>{formatLabel(resource.type)}</dd>
            </div>
          </dl>

          <div className="resource-detail-description">
            <p className="eyebrow">Description</p>
            <h2>What this resource is best suited for</h2>
            <p className="page-subtitle" style={{ marginTop: "12px" }}>
              {getResourceDescriptionText(resource.description)}
            </p>
          </div>

          <ResourceBlockList
            blocks={resource.scheduledBlocks || []}
            emptyMessage="No current or future out-of-service windows are scheduled for this resource."
            subtitle="These windows are visible to users so they can avoid unavailable periods before submitting a booking."
          />
        </article>

        <aside className="resource-detail-aside">
          <article className="card resource-aside-note">
            <p className="eyebrow">Booking Status</p>
            <h2>
              {resource.permanentlyUnavailable
                ? "Not bookable until restored"
                : resource.currentlyBlocked
                  ? "Temporarily unavailable right now"
                  : "Ready for reservations"}
            </h2>
            <p className="page-subtitle">
              {resource.permanentlyUnavailable
                ? "The permanent resource status is out of service, so new reservations should not be created."
                : resource.currentlyBlocked
                  ? resource.currentBlockReason || "A scheduled maintenance window is active right now."
                  : "The permanent status is active. Users can still book future slots, and any scheduled block windows will be enforced during validation."}
            </p>
            <div className="resource-form-actions">
              <Link
                to={`/bookings/new?resourceId=${resource.id}`}
                className={`btn ${bookingDisabled ? "resource-card-disabled" : ""}`}
                aria-disabled={bookingDisabled}
                tabIndex={bookingDisabled ? -1 : 0}
              >
                {bookingDisabled ? "Unavailable for booking" : "Book this resource"}
              </Link>
              <Link to="/resources" className="btn btn-secondary">
                Browse more
              </Link>
            </div>
          </article>

          <article className="card resource-aside-note">
            <p className="eyebrow">Usage Snapshot</p>
            <h2>Before you book</h2>
            <ul className="resource-detail-list">
              <li>
                <FiMapPin />
                Confirm the location matches the building or department you need.
              </li>
              <li>
                <FiUsers />
                Capacity helps verify whether the room or asset suits your group size.
              </li>
              <li>
                <FiClock />
                Scheduled out-of-service windows are checked against booking times automatically.
              </li>
            </ul>
          </article>
        </aside>
      </div>
    </div>
  );
}

export default ResourceDetailsPage;
