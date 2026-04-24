import { FiCalendar, FiClock } from "react-icons/fi";
import { formatDateLabel, formatTimeLabel } from "../resourceUi";

function ResourceBookingWindowList({ selectedDate = "", bookings = [] }) {
  const hasSelectedDate = Boolean(selectedDate);

  return (
    <article className="card resource-booking-slot-card">
      <div className="resource-block-card-header">
        <div>
          <p className="eyebrow">Booked Time Frames</p>
          <h2>
            {hasSelectedDate
              ? `Approved bookings on ${formatDateLabel(selectedDate)}`
              : "Choose a date to inspect bookings"}
          </h2>
          <p className="page-subtitle">
            {hasSelectedDate
              ? "These time windows are already reserved for this resource on the selected date."
              : "Select a date in the calendar to see booked time frames for this resource."}
          </p>
        </div>
        {hasSelectedDate ? (
          <div className="resource-code-chip">
            <FiCalendar />
            {bookings.length} booked {bookings.length === 1 ? "slot" : "slots"}
          </div>
        ) : null}
      </div>

      {hasSelectedDate && bookings.length > 0 ? (
        <div className="resource-booking-slot-list">
          {bookings.map((booking) => (
            <article key={booking.id} className="resource-booking-slot-item">
              <div className="resource-booking-slot-copy">
                <strong>
                  <FiClock />
                  {formatTimeLabel(booking.startTime)} - {formatTimeLabel(booking.endTime)}
                </strong>
                <p>{booking.purpose?.trim() || "Approved campus booking"}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="resource-block-empty">
          <FiClock />
          <span>
            {hasSelectedDate
              ? "No approved bookings exist for this resource on the selected date."
              : "No date selected yet."}
          </span>
        </div>
      )}
    </article>
  );
}

export default ResourceBookingWindowList;
