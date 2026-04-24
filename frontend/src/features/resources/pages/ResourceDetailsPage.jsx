import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { FiCalendar, FiClock, FiMapPin, FiShield, FiTag, FiUsers } from "react-icons/fi";
import { getResourceById } from "../../../api/resourceApi";
import ResourceAvailabilityCalendar from "../components/ResourceAvailabilityCalendar";
import ResourceBookingWindowList from "../components/ResourceBookingWindowList";
import ResourceBlockList from "../components/ResourceBlockList";
import {
  formatDateLabel,
  formatLabel,
  getAvailabilityRange,
  getResourceCapacityLabel,
  getResourceDescriptionText,
  getResourceSecondaryMeta,
  getResourceStatusClass,
  getResourceTypeMeta,
  isEquipmentResource,
} from "../resourceUi";
import "../resources.css";

function ResourceDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialSelectedDate = searchParams.get("date") || "";
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateSyncing, setDateSyncing] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let ignore = false;

    const fetchResource = async () => {
      try {
        if (hasLoadedRef.current) {
          setDateSyncing(true);
        } else {
          setLoading(true);
          setError("");
        }

        const data = await getResourceById(id, selectedDate ? { date: selectedDate } : {});

        if (ignore) {
          return;
        }

        setResource(data);
        setError("");
        hasLoadedRef.current = true;
      } catch (err) {
        if (ignore) {
          return;
        }

        console.error(err);
        setError("Failed to load resource details.");
      } finally {
        if (!ignore) {
          setLoading(false);
          setDateSyncing(false);
        }
      }
    };

    fetchResource();

    return () => {
      ignore = true;
    };
  }, [id, selectedDate]);

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

  if (error && !resource) {
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
  const secondaryMeta = getResourceSecondaryMeta(resource);
  const bookingDisabled = resource.permanentlyUnavailable;
  const selectedDateBlocks = resource.selectedDateBlocks || [];
  const selectedDateBookings = resource.selectedDateBookings || [];
  const blocksToShow = selectedDate ? selectedDateBlocks : resource.scheduledBlocks || [];
  const bookedDates = resource.bookedDates || [];
  const blockedDates = [...new Set((resource.scheduledBlocks || []).map((block) => block.blockDate).filter(Boolean))];
  const selectedDateNoteTone = resource.availableOnSelectedDate
    ? "resource-date-focus-card-open"
    : "resource-date-focus-card-blocked";
  const backToCatalogueLink = selectedDate ? `/resources?date=${selectedDate}` : "/resources";

  let bookingStatusTitle = "Ready for reservations";
  let bookingStatusMessage = "The permanent status is active. Users can still book future slots, and any scheduled block windows will be enforced during validation.";

  if (resource.permanentlyUnavailable) {
    bookingStatusTitle = "Not bookable until restored";
    bookingStatusMessage = "The permanent resource status is out of service, so new reservations should not be created.";
  } else if (selectedDate && resource.availableOnSelectedDate === false) {
    bookingStatusTitle = "Choose another date";
    bookingStatusMessage = resource.selectedDateAvailabilityMessage;
  } else if (selectedDate && resource.availableOnSelectedDate) {
    bookingStatusTitle = "Available on the selected date";
    bookingStatusMessage = `${resource.selectedDateAvailabilityMessage} Booked dates in the calendar mean at least one confirmed reservation already exists.`;
  } else if (resource.currentlyBlocked) {
    bookingStatusTitle = "Temporarily unavailable right now";
    bookingStatusMessage = resource.currentBlockReason || "A scheduled maintenance window is active right now.";
  }

  const handleCalendarSelect = (date) => setSelectedDate(date);
  const handleCalendarClear = () => setSelectedDate("");

  return (
    <div className="resource-details-page">
      <div className="resource-detail-header">
        <Link to={backToCatalogueLink} className="btn btn-ghost">
          Back to catalogue
        </Link>
        <div className="resource-card-badge-row">
          <span className={`status-badge ${getResourceStatusClass(resource.status)}`}>
            Current: {formatLabel(resource.status)}
          </span>
          <span className="resource-code-chip">Permanent: {formatLabel(resource.baseStatus)}</span>
        </div>
      </div>

      {error ? (
        <article className="card resource-warning-banner">
          <div>
            <p className="eyebrow">Refresh issue</p>
            <h2>We could not refresh the selected date details</h2>
            <p className="page-subtitle">{error}</p>
          </div>
        </article>
      ) : null}

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
            <span>{secondaryMeta.label}</span>
            <strong>{secondaryMeta.value}</strong>
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

      {selectedDate ? (
        <article className={`card resource-date-focus-card ${selectedDateNoteTone}`}>
          <div>
            <p className="eyebrow">Selected Date</p>
            <h2>{formatDateLabel(selectedDate)}</h2>
            <p className="page-subtitle">{resource.selectedDateAvailabilityMessage}</p>
          </div>
          <div className="resource-card-badge-row">
            <span className="resource-code-chip">
              {selectedDateBlocks.length} blocked {selectedDateBlocks.length === 1 ? "window" : "windows"}
            </span>
            <span className={`status-badge ${resource.availableOnSelectedDate ? "status-active" : "resource-status-out"}`}>
              {resource.availableOnSelectedDate ? "Available on selected date" : "Unavailable on selected date"}
            </span>
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
              <dd>{getResourceCapacityLabel(resource)}</dd>
            </div>
            {isEquipmentResource(resource.type) ? (
              <div>
                <dt>
                  <FiUsers /> Equipment type
                </dt>
                <dd>{formatLabel(resource.equipmentType)}</dd>
              </div>
            ) : null}
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
            blocks={blocksToShow}
            title={selectedDate ? "Selected Date Availability Windows" : "Scheduled Out-of-Service Windows"}
            emptyMessage={
              selectedDate
                ? `No blocked windows are scheduled for ${formatDateLabel(selectedDate)}.`
                : "No current or future out-of-service windows are scheduled for this resource."
            }
            subtitle={
              selectedDate
                ? `These windows apply specifically on ${formatDateLabel(selectedDate)}.`
                : "These windows are visible to users so they can avoid unavailable periods before submitting a booking."
            }
          />
        </article>

        <aside className="resource-detail-aside">
          <article className="card resource-aside-note">
            <p className="eyebrow">Booking Status</p>
            <h2>{bookingStatusTitle}</h2>
            <p className="page-subtitle">{bookingStatusMessage}</p>
            <div className="resource-form-actions">
              <Link
                to={`/bookings/new?resourceId=${resource.id}`}
                className={`btn ${bookingDisabled ? "resource-card-disabled" : ""}`}
                aria-disabled={bookingDisabled}
                tabIndex={bookingDisabled ? -1 : 0}
              >
                {bookingDisabled ? "Unavailable for booking" : "Book this resource"}
              </Link>
              <Link to={backToCatalogueLink} className="btn btn-secondary">
                Browse more
              </Link>
            </div>
          </article>

          <ResourceAvailabilityCalendar
            title="Booking Calendar"
            subtitle="Booked dates on this resource are marked so you can spot busy days quickly."
            selectedDate={selectedDate}
            onSelectDate={handleCalendarSelect}
            onClear={handleCalendarClear}
            markedDates={bookedDates}
            blockedDates={blockedDates}
            markedLegendLabel="Booked dates"
            blockedLegendLabel="Scheduled out-of-service"
            helperText={
              dateSyncing
                ? "Updating booked slots and date-specific availability..."
                : "Orange dates have scheduled out-of-service windows. Red dates have confirmed bookings."
            }
          />

          <ResourceBookingWindowList
            selectedDate={selectedDate}
            bookings={selectedDateBookings}
          />

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
