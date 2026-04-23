import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bookingService } from "../api/bookingService";
import { getAllResources, getResourceBlocks } from "../../../api/resourceApi";
import ResourceBlockList from "../../resources/components/ResourceBlockList";
import {
  doesBlockOverlap,
  formatBlockWindow,
  formatLabel,
} from "../../resources/resourceUi";
import "../booking.css";

function CreateBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedResourceId = searchParams.get("resourceId");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resources, setResources] = useState([]);
  const [resourceBlocks, setResourceBlocks] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [formData, setFormData] = useState({
    resourceId: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: 1,
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoadingResources(true);
        const data = await getAllResources();
        setResources(data);

        if (preSelectedResourceId) {
          setFormData((prev) => ({ ...prev, resourceId: preSelectedResourceId }));
        } else {
          const firstBookable = data.find((resource) => !resource.permanentlyUnavailable);

          if (firstBookable) {
            setFormData((prev) => ({ ...prev, resourceId: firstBookable.id.toString() }));
          } else if (data.length > 0) {
            setFormData((prev) => ({ ...prev, resourceId: data[0].id.toString() }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch resources:", err);
        setError("Could not load resources. Please try again later.");
      } finally {
        setLoadingResources(false);
      }
    };

    fetchResources();
  }, [preSelectedResourceId]);

  useEffect(() => {
    const fetchBlocks = async () => {
      if (!formData.resourceId) {
        setResourceBlocks([]);
        return;
      }

      try {
        setLoadingBlocks(true);
        const data = await getResourceBlocks(formData.resourceId);
        setResourceBlocks(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch resource blocks:", err);
        setResourceBlocks([]);
        setError("Could not load scheduled unavailable windows for the selected resource.");
      } finally {
        setLoadingBlocks(false);
      }
    };

    fetchBlocks();
  }, [formData.resourceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const selectedResource = resources.find(
    (resource) => resource.id.toString() === formData.resourceId,
  );

  const selectedDateBlocks = useMemo(
    () => resourceBlocks.filter((block) => block.blockDate === formData.bookingDate),
    [resourceBlocks, formData.bookingDate],
  );

  const overlappingBlock = useMemo(
    () =>
      selectedDateBlocks.find((block) =>
        doesBlockOverlap(block, formData.startTime, formData.endTime),
      ) || null,
    [selectedDateBlocks, formData.startTime, formData.endTime],
  );

  const activeResources = resources.filter((resource) => !resource.permanentlyUnavailable).length;
  const submitDisabled =
    loading ||
    loadingResources ||
    selectedResource?.permanentlyUnavailable ||
    !!overlappingBlock;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (formData.startTime >= formData.endTime) {
        throw new Error("End time must be strictly after the start time.");
      }

      if (selectedResource?.permanentlyUnavailable) {
        throw new Error("This resource is permanently unavailable and cannot accept new bookings.");
      }

      if (overlappingBlock) {
        throw new Error(
          `This time overlaps a scheduled out-of-service window: ${formatBlockWindow(overlappingBlock)}.`,
        );
      }

      await bookingService.createBooking({
        ...formData,
        resourceId: parseInt(formData.resourceId, 10),
        expectedAttendees: parseInt(formData.expectedAttendees, 10),
      });

      navigate("/bookings/my");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "Failed to create booking.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-create-page">
      <section className="booking-create-hero">
        <div>
          <p className="eyebrow">Smart Campus Booking</p>
          <h1>Reserve a campus resource with live availability awareness</h1>
          <p className="page-subtitle booking-hero-copy">
            Choose a resource, review scheduled unavailable windows, and submit a reservation request only for bookable time slots.
          </p>
        </div>

        <div className="booking-highlight-list">
          <article className="booking-highlight-card">
            <span>Resources ready</span>
            <strong>{loadingResources ? "..." : activeResources}</strong>
          </article>
          <article className="booking-highlight-card">
            <span>Selected asset</span>
            <strong>{selectedResource ? selectedResource.name : "Choose a resource"}</strong>
          </article>
          <article className="booking-highlight-card">
            <span>Current status</span>
            <strong>{selectedResource ? formatLabel(selectedResource.status) : "Waiting for selection"}</strong>
          </article>
        </div>
      </section>

      <div className="booking-create-layout">
        <section className="booking-form-card">
          <div className="booking-form-header">
            <div>
              <p className="eyebrow">Reservation Form</p>
              <h2>Booking details</h2>
              <p className="page-subtitle">
                Scheduled resource blocks are shown here so users can avoid maintenance windows before submitting a request.
              </p>
            </div>
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}

          {selectedResource?.permanentlyUnavailable ? (
            <div className="booking-warning-banner">
              <strong>This resource is permanently unavailable.</strong>
              <span>Pick another resource or contact staff for assistance.</span>
            </div>
          ) : null}

          {selectedDateBlocks.length > 0 ? (
            <div className={`booking-warning-banner ${overlappingBlock ? "booking-warning-banner-strong" : ""}`}>
              <strong>Unavailable windows on {formData.bookingDate}</strong>
              <span>
                {selectedDateBlocks.map((block) => formatBlockWindow(block)).join(" | ")}
              </span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="booking-form-grid">
            <div className="booking-form-field">
              <label htmlFor="resourceId">Resource to book</label>
              <select
                id="resourceId"
                className="input"
                name="resourceId"
                value={formData.resourceId}
                onChange={handleChange}
                required
                disabled={loadingResources}
              >
                {loadingResources ? (
                  <option value="">Loading facilities...</option>
                ) : resources.length === 0 ? (
                  <option value="">No resources found</option>
                ) : (
                  resources.map((resource) => (
                    <option
                      key={resource.id}
                      value={resource.id}
                      disabled={resource.permanentlyUnavailable}
                    >
                      {resource.name} ({resource.code})
                      {resource.permanentlyUnavailable
                        ? " - Permanently unavailable"
                        : resource.currentlyBlocked
                          ? " - Blocked right now"
                          : ""}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="booking-form-field">
              <label htmlFor="bookingDate">Booking date</label>
              <input
                id="bookingDate"
                type="date"
                className="input"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="form-columns">
              <div className="booking-form-field">
                <label htmlFor="startTime">From</label>
                <input
                  id="startTime"
                  type="time"
                  className="input"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="booking-form-field">
                <label htmlFor="endTime">Until</label>
                <input
                  id="endTime"
                  type="time"
                  className="input"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="booking-form-field">
              <label htmlFor="purpose">Purpose of reservation</label>
              <input
                id="purpose"
                type="text"
                className="input"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="e.g. Research Seminar"
                required
              />
            </div>

            <div className="booking-form-field">
              <label htmlFor="expectedAttendees">Expected headcount</label>
              <input
                id="expectedAttendees"
                type="number"
                className="input"
                name="expectedAttendees"
                value={formData.expectedAttendees}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="booking-form-actions">
              <button type="submit" className="btn" disabled={submitDisabled}>
                {loading ? "Processing..." : "Confirm reservation"}
              </button>
            </div>
          </form>
        </section>

        <aside className="booking-insight-list">
          <article className="booking-form-note">
            <p className="eyebrow">Selection Snapshot</p>
            <h2>{selectedResource ? selectedResource.name : "Pick a resource to preview it here"}</h2>
            <div className="booking-note-list">
              <div className="booking-note-item">
                <strong>Code</strong>
                <p className="page-subtitle">{selectedResource?.code || "No resource selected yet."}</p>
              </div>
              <div className="booking-note-item">
                <strong>Location</strong>
                <p className="page-subtitle">{selectedResource?.location || "Location will appear after selection."}</p>
              </div>
              <div className="booking-note-item">
                <strong>Current status</strong>
                <p className="page-subtitle">
                  {selectedResource ? formatLabel(selectedResource.status) : "Current status will appear here."}
                </p>
              </div>
              <div className="booking-note-item">
                <strong>Permanent status</strong>
                <p className="page-subtitle">
                  {selectedResource ? formatLabel(selectedResource.baseStatus) : "Permanent status will appear here."}
                </p>
              </div>
            </div>
          </article>

          {loadingBlocks ? (
            <article className="booking-loading-card">
              <span className="booking-spinner" aria-hidden="true" />
              <p className="page-subtitle">Loading scheduled unavailable windows...</p>
            </article>
          ) : (
            <ResourceBlockList
              blocks={resourceBlocks}
              title="Scheduled unavailable windows"
              subtitle="These time windows are enforced by booking validation on the backend."
              emptyMessage="No current or future maintenance windows are scheduled for this resource."
              compact={true}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

export default CreateBookingPage;
