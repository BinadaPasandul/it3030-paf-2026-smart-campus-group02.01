import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bookingService } from "../api/bookingService";
import { getAllResources } from "../../../api/resourceApi";
import "../booking.css";

function CreateBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedResourceId = searchParams.get("resourceId");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
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
          const firstActive = data.find((resource) => resource.status === "ACTIVE");

          if (firstActive) {
            setFormData((prev) => ({ ...prev, resourceId: firstActive.id.toString() }));
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (formData.startTime >= formData.endTime) {
        throw new Error("End time must be strictly after the start time.");
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

  const selectedResource = resources.find(
    (resource) => resource.id.toString() === formData.resourceId,
  );
  const activeResources = resources.filter((resource) => resource.status === "ACTIVE").length;

  return (
    <div className="booking-create-page">
      <section className="booking-create-hero">
        <div>
          <p className="eyebrow">Smart Campus Booking</p>
          <h1>Reserve a campus resource with the same clean flow as the rest of the app</h1>
          <p className="page-subtitle booking-hero-copy">
            Choose an active resource, define the time window, and submit a request with clear usage details.
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
            <span>Status</span>
            <strong>{selectedResource ? selectedResource.status : "Waiting for selection"}</strong>
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
                This form now follows the same spacing, line rhythm, and card structure as the stronger pages in the app.
              </p>
            </div>
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}

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
                      disabled={resource.status !== "ACTIVE"}
                    >
                      {resource.name} ({resource.code}) {resource.status !== "ACTIVE" ? "- Unavailable" : ""}
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
              <button type="submit" className="btn" disabled={loading || loadingResources}>
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
                <strong>Capacity</strong>
                <p className="page-subtitle">
                  {selectedResource ? `${selectedResource.capacity} people` : "Capacity details will appear here."}
                </p>
              </div>
            </div>
          </article>

          <article className="booking-insight-card">
            <span>Before you submit</span>
            <h2>Keep the request easy to approve</h2>
            <p className="page-subtitle">
              Use a clear purpose, choose a realistic attendee count, and make sure the end time is later than the start time.
            </p>
          </article>
        </aside>
      </div>
    </div>
  );
}

export default CreateBookingPage;
