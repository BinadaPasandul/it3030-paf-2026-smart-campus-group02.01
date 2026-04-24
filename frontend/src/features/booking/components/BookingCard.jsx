import React, { useEffect, useState } from "react";
import { formatLabel } from "../../resources/resourceUi";

const formatDateTime = (value) => {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const BookingCard = ({ booking, onCancel, onDelete, onCheckIn, isAdmin, onReview }) => {
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(Date.now());
    };

    updateCurrentTime();
    const intervalId = window.setInterval(updateCurrentTime, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "status-active";
      case "CHECKED_IN":
        return "booking-status-checked-in";
      case "PENDING":
        return "status-pending";
      case "REJECTED":
      case "CANCELLED":
        return "status-inactive";
      default:
        return "status-inactive";
    }
  };

  const showPermanentWarning =
    !isAdmin &&
    booking.resourcePermanentlyUnavailable &&
    booking.status !== "REJECTED" &&
    booking.status !== "CANCELLED";
  const checkInWindowStartsAt = booking.checkInWindowStartsAt ? new Date(booking.checkInWindowStartsAt) : null;
  const checkInDeadlineAt = booking.checkInDeadlineAt ? new Date(booking.checkInDeadlineAt) : null;
  const checkedInAt = booking.checkedInAt ? new Date(booking.checkedInAt) : null;
  const checkInWindowOpened =
    currentTime === null || !checkInWindowStartsAt || currentTime >= checkInWindowStartsAt.getTime();
  const checkInDeadlinePassed = currentTime !== null && checkInDeadlineAt
    ? currentTime > checkInDeadlineAt.getTime()
    : false;
  const headcountLabel = booking.expectedAttendees ? `${booking.expectedAttendees} persons` : "Not specified";
  const noteLabel = booking.autoCancelled ? "System note" : "Admin note";

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

      {showPermanentWarning ? (
        <div className="booking-warning-banner booking-warning-banner-strong">
          <strong>This resource is permanently unavailable.</strong>
          <span>Please contact staff for assistance.</span>
        </div>
      ) : null}

      {!isAdmin && booking.status === "CHECKED_IN" ? (
        <div className="booking-warning-banner booking-warning-banner-success">
          <strong>Checked in successfully.</strong>
          <span>{checkedInAt ? `Recorded on ${formatDateTime(checkedInAt)}.` : "Your room will remain reserved."}</span>
        </div>
      ) : null}

      {!isAdmin && booking.autoCancelled ? (
        <div className="booking-warning-banner booking-warning-banner-strong">
          <strong>No-show detected. This booking was released automatically.</strong>
          <span>
            {checkInDeadlineAt
              ? `No check-in was recorded by ${formatDateTime(checkInDeadlineAt)}.`
              : "The room is now free for other users."}
          </span>
        </div>
      ) : null}

      {!isAdmin && booking.status === "APPROVED" && !booking.autoCancelled ? (
        <div
          className={`booking-warning-banner ${
            booking.checkInEligible
              ? "booking-warning-banner-info"
              : checkInDeadlinePassed
                ? "booking-warning-banner-strong"
                : ""
          }`}
        >
          <strong>
            {booking.checkInEligible
              ? "Check in now to keep this room."
              : checkInDeadlinePassed
                ? "Check-in deadline passed."
                : "Check-in opens shortly before the booking starts."}
          </strong>
          <span>
            {booking.checkInEligible && checkInDeadlineAt
              ? `Your booking will be auto-cancelled if you do not check in by ${formatDateTime(checkInDeadlineAt)}.`
              : !checkInWindowOpened && checkInWindowStartsAt
                ? `Check-in opens at ${formatDateTime(checkInWindowStartsAt)} and closes 15 minutes after the booking start time.`
                : "If the system has not refreshed yet, overdue no-shows will be released automatically."}
          </span>
        </div>
      ) : null}

      <div className="booking-detail-grid">
        <div className="booking-detail-card">
          <p className="booking-detail-label">Purpose</p>
          <p className="booking-detail-value">{booking.purpose}</p>
        </div>
        <div className="booking-detail-card">
          <p className="booking-detail-label">Headcount</p>
          <p className="booking-detail-value">{headcountLabel}</p>
        </div>
        <div className="booking-detail-card">
          <p className="booking-detail-label">Permanent status</p>
          <p className="booking-detail-value">{formatLabel(booking.resourceBaseStatus)}</p>
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
          <p className="booking-detail-label">{noteLabel}</p>
          <p className="booking-detail-value">{booking.adminReason}</p>
        </div>
      ) : null}

      <div className="booking-card-actions">
        {!isAdmin && booking.checkInEligible ? (
          <button className="btn" onClick={() => onCheckIn(booking.id)}>
            Check in
          </button>
        ) : null}

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
