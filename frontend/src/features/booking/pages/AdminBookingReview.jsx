import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import { bookingService } from "../api/bookingService";
import BookingCard from "../components/BookingCard";
import "../booking.css";

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
      console.error(err);
      setError("Failed to load bookings database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleReview = async (bookingId, newStatus) => {
    const reason = window.prompt(
      `Enter a reason for ${newStatus} (Optional):`,
      newStatus === "APPROVED" ? "Room available, approved." : "Conflict detected, rejected.",
    );

    if (reason === null) return;

    try {
      await bookingService.reviewBooking(bookingId, newStatus, reason);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review due to overlap or server configuration.");
    }
  };

  const approvedCount = bookings.filter((booking) => booking.status === "APPROVED").length;
  const pendingCount = bookings.filter((booking) => booking.status === "PENDING").length;
  const rejectedCount = bookings.filter((booking) => booking.status === "REJECTED").length;

  return (
    <div className="booking-page">
      <section className="booking-hero">
        <div>
          <p className="eyebrow">Admin Oversight</p>
          <h1>Review Bookings</h1>
          <p className="page-subtitle booking-hero-copy">
            Examine requests, approve valid reservations, and reject conflicts using the same visual structure as the rest of the platform.
          </p>
        </div>

        <div className="booking-highlight-list">
          <article className="booking-highlight-card">
            <span>Total records</span>
            <strong>{bookings.length}</strong>
          </article>
          <article className="booking-highlight-card">
            <span>Pending decisions</span>
            <strong>{pendingCount}</strong>
          </article>
          <article className="booking-highlight-card">
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </article>
        </div>
      </section>

      <section className="booking-stats-grid">
        <article className="card booking-stat-card ticket-accent-amber">
          <div className="booking-stat-icon">
            <FiClock />
          </div>
          <div className="booking-stat-copy">
            <p>Pending</p>
            <h2>{pendingCount}</h2>
          </div>
        </article>
        <article className="card booking-stat-card ticket-accent-green">
          <div className="booking-stat-icon">
            <FiCheckCircle />
          </div>
          <div className="booking-stat-copy">
            <p>Approved</p>
            <h2>{approvedCount}</h2>
          </div>
        </article>
        <article className="card booking-stat-card booking-accent-danger">
          <div className="booking-stat-icon">
            <FiXCircle />
          </div>
          <div className="booking-stat-copy">
            <p>Rejected</p>
            <h2>{rejectedCount}</h2>
          </div>
        </article>
      </section>

      <section className="booking-filter-card">
        <div className="booking-filter-bar">
          <div>
            <p className="eyebrow">Filter View</p>
            <h2>Review queue controls</h2>
          </div>
          <div className="booking-results-count">{bookings.length} loaded</div>
        </div>
        <div className="booking-filter-actions">
          <div className="booking-form-field">
            <label htmlFor="bookingStatusFilter" className="booking-filter-title">Booking status</label>
            <select
              id="bookingStatusFilter"
              className="input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All bookings</option>
              <option value="PENDING">Pending only</option>
              <option value="APPROVED">Approved only</option>
              <option value="REJECTED">Rejected only</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {loading ? (
        <article className="booking-loading-card">
          <span className="booking-spinner" aria-hidden="true" />
          <p className="page-subtitle">Syncing records...</p>
        </article>
      ) : bookings.length === 0 ? (
        <article className="booking-empty-state">
          <h3>No records</h3>
          <p className="page-subtitle">No bookings match the current filter.</p>
        </article>
      ) : (
        <section className="booking-section-head">
          <div className="booking-section-bar">
            <div>
              <p className="eyebrow">Decision Queue</p>
              <h2>Booking records awaiting admin action</h2>
            </div>
            <div className="booking-results-count">{bookings.length} cards</div>
          </div>
          <div className="booking-card-grid">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isAdmin={true}
                onReview={handleReview}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminBookingReview;
