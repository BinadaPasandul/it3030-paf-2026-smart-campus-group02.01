import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiCheckCircle, FiClock } from "react-icons/fi";
import { bookingService } from "../api/bookingService";
import BookingCard from "../components/BookingCard";
import "../booking.css";

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
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel the booking. It may have already started or been rejected.");
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await bookingService.checkInBooking(bookingId);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Unable to check in for this booking.");
      fetchBookings();
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm("Remove this rejected or cancelled booking permanently?")) return;

    try {
      await bookingService.deleteBooking(bookingId);
      setBookings((currentBookings) => currentBookings.filter((booking) => booking.id !== bookingId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to remove the booking.");
    }
  };

  const filteredBookings = bookings.filter((booking) =>
    filterStatus === "ALL" ? true : booking.status === filterStatus,
  );

  const statuses = ["ALL", "PENDING", "APPROVED", "CHECKED_IN", "REJECTED", "CANCELLED"];
  const approvedCount = bookings.filter((booking) => booking.status === "APPROVED").length;
  const checkedInCount = bookings.filter((booking) => booking.status === "CHECKED_IN").length;
  const pendingCount = bookings.filter((booking) => booking.status === "PENDING").length;

  return (
    <div className="booking-page">
      <section className="booking-hero">
        <div>
          <p className="eyebrow">Booking History</p>
          <h1>My Bookings</h1>
          <p className="page-subtitle booking-hero-copy">
            Track upcoming reservations, check in when your slot starts, and avoid ghost-booking auto-cancellations from one place.
          </p>
          <div className="booking-hero-actions">
            <Link to="/resources" className="btn">
              Book resource
            </Link>
          </div>
        </div>

        <div className="booking-highlight-list">
          <article className="booking-highlight-card">
            <span>Total reservations</span>
            <strong>{bookings.length}</strong>
          </article>
          <article className="booking-highlight-card">
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </article>
          <article className="booking-highlight-card">
            <span>Checked in</span>
            <strong>{checkedInCount}</strong>
          </article>
        </div>
      </section>

      <section className="booking-stats-grid">
        <article className="card booking-stat-card ticket-accent-indigo">
          <div className="booking-stat-icon">
            <FiCalendar />
          </div>
          <div className="booking-stat-copy">
            <p>Bookings</p>
            <h2>{bookings.length}</h2>
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
        <article className="card booking-stat-card ticket-accent-amber">
          <div className="booking-stat-icon">
            <FiClock />
          </div>
          <div className="booking-stat-copy">
            <p>Pending</p>
            <h2>{pendingCount}</h2>
          </div>
        </article>
      </section>

      <section className="booking-filter-card">
        <div className="booking-filter-bar">
          <div>
            <p className="eyebrow">View Options</p>
            <h2>Filter by booking status</h2>
          </div>
          <div className="booking-results-count">{filteredBookings.length} visible</div>
        </div>
        <div className="booking-filter-shell">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`booking-filter-tab ${filterStatus === status ? "active" : ""}`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {loading ? (
        <article className="booking-loading-card">
          <span className="booking-spinner" aria-hidden="true" />
          <p className="page-subtitle">Retrieving your bookings...</p>
        </article>
      ) : filteredBookings.length === 0 ? (
        <article className="booking-empty-state">
          <h3>No {filterStatus !== "ALL" ? filterStatus.toLowerCase() : ""} bookings</h3>
          <p className="page-subtitle">
            {filterStatus === "ALL"
              ? "You haven't made any resource reservations yet."
              : `You don't have any bookings with status ${filterStatus.toLowerCase()}.`}
          </p>
          <Link to="/resources" className="btn btn-secondary">
            Browse resources
          </Link>
        </article>
      ) : (
        <section className="booking-section-head">
          <div className="booking-section-bar">
            <div>
              <p className="eyebrow">Reservation Feed</p>
              <h2>Your current booking records</h2>
            </div>
            <div className="booking-results-count">{filteredBookings.length} cards</div>
          </div>
          <div className="booking-card-grid">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
                onCheckIn={handleCheckIn}
                onDelete={handleDelete}
                isAdmin={false}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default MyBookingsPage;
