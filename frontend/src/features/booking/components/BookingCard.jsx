import React from "react";
import { Link } from "react-router-dom";

const BookingCard = ({ booking, onCancel, isAdmin, onReview }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "status-active"; // Green
      case "PENDING":
        return "status-pending"; // Yellow
      case "REJECTED":
      case "CANCELLED":
        return "status-inactive"; // Gray
      default:
        return "status-inactive";
    }
  };

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>{booking.resourceName}</h3>
        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
          {booking.status}
        </span>
      </div>
      
      <div className="detail-list" style={{ marginTop: "4px" }}>
        <div>
          <dt>Date & Time</dt>
          <dd>{booking.bookingDate} | {booking.startTime} - {booking.endTime}</dd>
        </div>
        <div>
          <dt>Purpose</dt>
          <dd>{booking.purpose}</dd>
        </div>
        <div>
          <dt>Attendees</dt>
          <dd>{booking.expectedAttendees}</dd>
        </div>
        {isAdmin && (
          <div>
            <dt>Requested By</dt>
            <dd>{booking.userName}</dd>
          </div>
        )}
        {booking.adminReason && (
          <div>
            <dt>Admin Note</dt>
            <dd style={{ fontStyle: "italic", color: "var(--muted)" }}>{booking.adminReason}</dd>
          </div>
        )}
      </div>

      <div className="actions-row compact-actions" style={{ marginTop: "auto", paddingTop: "16px" }}>
        {!isAdmin && (booking.status === "PENDING" || booking.status === "APPROVED") && (
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => onCancel(booking.id)}
          >
            Cancel Booking
          </button>
        )}

        {isAdmin && booking.status === "PENDING" && (
          <>
            <button 
              className="btn btn-success btn-sm" 
              style={{ background: "#16a34a", color: "#fff" }}
              onClick={() => onReview(booking.id, "APPROVED")}
            >
              Approve
            </button>
            <button 
              className="btn btn-danger btn-sm" 
              onClick={() => onReview(booking.id, "REJECTED")}
            >
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
