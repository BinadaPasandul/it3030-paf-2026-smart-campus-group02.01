import React, { useEffect, useState } from "react";
import { bookingService } from "../api/bookingService";
import BookingCard from "../components/BookingCard";

function AdminBookingReview() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getAllBookings(filter);
      setBookings(data);
      setError(null);
    } catch (err) {
      setError("Failed to load bookings database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const handleReview = async (bookingId, newStatus) => {
    // Collect reasoning visually via standard prompt
    const reason = window.prompt(`Enter a reason for ${newStatus} (Optional):`, 
      newStatus === "APPROVED" ? "Room available, approved." : "Conflict detected, rejected."
    );
    
    if (reason === null) return; // User cancelled prompt

    try {
      await bookingService.reviewBooking(bookingId, newStatus, reason);
      // Refresh list to show shiny new badges
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review due to overlap or server configuration.");
    }
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: "8px" }}>Review Bookings</h1>
          <p className="page-subtitle">Examine and authorize campus resource reservations.</p>
        </div>
      </div>

      <div className="card" style={{ padding: "16px", marginBottom: "8px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>Filter View:</span>
          <select 
            className="input" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: "200px" }}
          >
            <option value="">All Bookings</option>
            <option value="PENDING">Pending Only</option>
            <option value="APPROVED">Approved Only</option>
            <option value="REJECTED">Rejected Only</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-card card">
          Syncing records...
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state card" style={{ padding: "48px 24px" }}>
          <h3>No records</h3>
          <p className="helper-text" style={{ marginTop: "8px" }}>
            No bookings match the current filter.
          </p>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {bookings.map((booking) => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              isAdmin={true} 
              onReview={handleReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminBookingReview;
