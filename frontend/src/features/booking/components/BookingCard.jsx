import React from "react";

const BookingCard = ({ booking, onCancel, onDelete, isAdmin, onReview }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "status-active";
      case "PENDING":
        return "status-pending";
      case "REJECTED":
      case "CANCELLED":
        return "status-inactive";
      default:
        return "status-inactive";
    }
  };

  return (
    <article className="booking-card">
      <div className="booking-card-header">
        <div className="booking-card-title">
          <p className="eyebrow">Resource</p>
          <h2>{booking.resourceName}</h2>
          <p className="booking-card-schedule">
            {booking.bookingDate} | {booking.startTime} - {booking.endTime}
          </p>
        </div>
        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
          {booking.status}
        </span>
      </div>

      <div className="booking-detail-grid">
        <div className="booking-detail-card">
          <p className="booking-detail-label">Purpose</p>
          <p className="booking-detail-value">{booking.purpose}</p>
        </div>
        <div className="booking-detail-card">
          <p className="booking-detail-label">Headcount</p>
          <p className="booking-detail-value">{booking.expectedAttendees} persons</p>
        </div>
        {isAdmin ? (
          <div className="booking-detail-card">
            <p className="booking-detail-label">Requested by</p>
            <p className="booking-detail-value">{booking.userName}</p>
          </div>
        ) : null}
      </div>

      {booking.adminReason ? (
        <div className="booking-card-note">
          <p className="booking-detail-label">Admin note</p>
          <p className="booking-detail-value">{booking.adminReason}</p>
        </div>
      ) : null}

      <div className="booking-card-actions">
        {!isAdmin && (booking.status === "PENDING" || booking.status === "APPROVED") ? (
          <button className="btn btn-secondary" onClick={() => onCancel(booking.id)}>
            Cancel reservation
          </button>
        ) : null}

        {!isAdmin && (booking.status === "REJECTED" || booking.status === "CANCELLED") ? (
          <button className="btn btn-danger" onClick={() => onDelete(booking.id)}>
            Remove booking
          </button>
        ) : null}

        {isAdmin && booking.status === "PENDING" ? (
          <>
            <button className="btn" onClick={() => onReview(booking.id, "APPROVED")}>
              Approve
            </button>
            <button className="btn btn-danger" onClick={() => onReview(booking.id, "REJECTED")}>
              Reject
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
};

export default BookingCard;
