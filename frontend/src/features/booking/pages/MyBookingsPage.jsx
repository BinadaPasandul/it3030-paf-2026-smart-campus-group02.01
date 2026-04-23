import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bookingService } from "../api/bookingService";
import BookingCard from "../components/BookingCard";

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      setError("Failed to load your bookings. Ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      await bookingService.cancelBooking(bookingId);
      fetchBookings();
    } catch (err) {
      alert("Failed to cancel the booking. It may have already started or been rejected.");
    }
  };

  const filteredBookings = bookings.filter((b) => 
    filterStatus === "ALL" ? true : b.status === filterStatus
  );

  const statuses = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: "8px" }}>My Bookings</h1>
          <p className="page-subtitle">Track and manage your resource reservations.</p>
        </div>
        <div className="actions-row">
          <Link to="/resources" className="btn">
            Book Resource
          </Link>
        </div>
      </div>

      <div className="filter-bar mb-4" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px" }}>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`btn btn-sm ${filterStatus === status ? "btn-primary" : "btn-outline-secondary"}`}
            style={{ textTransform: "capitalize" }}
          >
            {status.toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-card card">
          Loading your bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state card" style={{ padding: "48px 24px" }}>
          <h3>No {filterStatus !== "ALL" ? filterStatus.toLowerCase() : ""} bookings found</h3>
          <p className="helper-text" style={{ marginBottom: "20px", marginTop: "8px" }}>
            {filterStatus === "ALL" 
              ? "You haven't made any resource reservations yet." 
              : `You don't have any bookings with status ${filterStatus.toLowerCase()}.`}
          </p>
          <Link to="/resources" className="btn btn-secondary">
            Book Resource
          </Link>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {filteredBookings.map((booking) => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              onCancel={handleCancel} 
              isAdmin={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookingsPage;
