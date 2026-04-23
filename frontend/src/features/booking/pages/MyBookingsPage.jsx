import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bookingService } from "../api/bookingService";
import BookingCard from "../components/BookingCard";

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error(err);
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
      // Refresh the list immediately after success
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel the booking. It may have already started or been rejected.");
    }
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: "8px" }}>My Bookings</h1>
          <p className="page-subtitle">Track and manage your resource reservations.</p>
        </div>
        <div className="actions-row">
          <Link to="/bookings/new" className="btn">
            Create New Booking
          </Link>
        </div>
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
      ) : bookings.length === 0 ? (
        <div className="empty-state card" style={{ padding: "48px 24px" }}>
          <h3>No bookings found</h3>
          <p className="helper-text" style={{ marginBottom: "20px", marginTop: "8px" }}>
            You haven't made any resource reservations yet.
          </p>
          <Link to="/bookings/new" className="btn btn-secondary">
            Make a Booking
          </Link>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {bookings.map((booking) => (
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
