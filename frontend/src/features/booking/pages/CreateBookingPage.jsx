import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bookingService } from "../api/bookingService";
import { getAllResources } from "../../../api/resourceApi";

function CreateBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedResourceId = searchParams.get("resourceId");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  
  // Local state for the form fields
  const [formData, setFormData] = useState({
    resourceId: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: 1
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoadingResources(true);
        const data = await getAllResources();
        setResources(data);
        
        // Handle pre-selection from URL or default to first active
        if (preSelectedResourceId) {
          setFormData(prev => ({ ...prev, resourceId: preSelectedResourceId }));
        } else {
          const firstActive = data.find(r => r.status === "ACTIVE");
          if (firstActive) {
            setFormData(prev => ({ ...prev, resourceId: firstActive.id.toString() }));
          } else if (data.length > 0) {
            setFormData(prev => ({ ...prev, resourceId: data[0].id.toString() }));
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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate times loosely before sending
      if (formData.startTime >= formData.endTime) {
        throw new Error("End time must be strictly after the start time.");
      }

      await bookingService.createBooking({
        ...formData,
        resourceId: parseInt(formData.resourceId, 10),
        expectedAttendees: parseInt(formData.expectedAttendees, 10)
      });
      
      // Navigate strictly to "my bookings" upon success
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
    <div className="auth-wrapper" style={{ minHeight: "100%", paddingBottom: "24px" }}>
      <div className="card" style={{ maxWidth: "600px", width: "100%", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "8px", fontSize: "2rem" }}>Book a Resource</h1>
        <p className="page-subtitle" style={{ marginBottom: "24px" }}>
          Reserve a room, lab, or equipment for your activities.
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="input-group">
            <label>Resource</label>
            <select
              className="input"
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              required
              disabled={loadingResources}
            >
              {loadingResources ? (
                <option value="">Loading resources...</option>
              ) : (
                <>
                  {resources.length === 0 ? (
                    <option value="">No resources available</option>
                  ) : (
                    resources.map((resource) => (
                      <option 
                        key={resource.id} 
                        value={resource.id}
                        disabled={resource.status !== "ACTIVE"}
                      >
                        {resource.name} ({resource.code}) {resource.status !== "ACTIVE" ? "- Out of Service" : ""}
                      </option>
                    ))
                  )}
                </>
              )}
            </select>
          </div>

          <div className="input-group">
            <label>Date</label>
            <input
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
            <div className="input-group">
              <label>Start Time</label>
              <input
                type="time"
                className="input"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>End Time</label>
              <input
                type="time"
                className="input"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Purpose</label>
            <input
              type="text"
              className="input"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="e.g. Group Project Meeting"
              required
            />
          </div>

          <div className="input-group">
            <label>Expected Attendees</label>
            <input
              type="number"
              className="input"
              name="expectedAttendees"
              value={formData.expectedAttendees}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="actions-row" style={{ marginTop: "12px" }}>
            <button type="submit" className="btn" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Submitting..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBookingPage;
