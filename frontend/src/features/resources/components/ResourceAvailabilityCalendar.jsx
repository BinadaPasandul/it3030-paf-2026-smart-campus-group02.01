import { useMemo, useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "../resources.css";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toIsoDate(year, monthIndex, day) {
  const month = `${monthIndex + 1}`.padStart(2, "0");
  const date = `${day}`.padStart(2, "0");
  return `${year}-${month}-${date}`;
}

function parseIsoDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return { year, monthIndex: month - 1, day };
}

function getCalendarAnchor(selectedDate, markedDates, blockedDates) {
  const parsedSelectedDate = parseIsoDate(selectedDate);
  if (parsedSelectedDate) {
    return parsedSelectedDate;
  }

  const parsedMarkedDate = parseIsoDate(markedDates[0]);
  if (parsedMarkedDate) {
    return parsedMarkedDate;
  }

  const parsedBlockedDate = parseIsoDate(blockedDates[0]);
  if (parsedBlockedDate) {
    return parsedBlockedDate;
  }

  const today = new Date();
  return {
    year: today.getFullYear(),
    monthIndex: today.getMonth(),
    day: today.getDate(),
  };
}

function ResourceAvailabilityCalendar({
  title = "Availability Calendar",
  subtitle = "Select a date to explore availability.",
  selectedDate = "",
  onSelectDate,
  onClear,
  markedDates = [],
  blockedDates = [],
  markedLegendLabel = "Booked dates",
  blockedLegendLabel = "Out-of-service dates",
  helperText = "",
}) {
  const anchor = useMemo(
    () => getCalendarAnchor(selectedDate, markedDates, blockedDates),
    [selectedDate, markedDates, blockedDates],
  );
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    year: anchor.year,
    monthIndex: anchor.monthIndex,
  }));

  const today = new Date();
  const todayIso = toIsoDate(today.getFullYear(), today.getMonth(), today.getDate());
  const markedDateSet = useMemo(() => new Set(markedDates), [markedDates]);
  const blockedDateSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(visibleMonth.year, visibleMonth.monthIndex, 1);
    const dayOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(visibleMonth.year, visibleMonth.monthIndex + 1, 0).getDate();

    return Array.from({ length: dayOffset + daysInMonth }, (_, index) => {
      const day = index - dayOffset + 1;
      if (day < 1 || day > daysInMonth) {
        return null;
      }

      const isoDate = toIsoDate(visibleMonth.year, visibleMonth.monthIndex, day);
      return {
        day,
        isoDate,
        isSelected: isoDate === selectedDate,
        isToday: isoDate === todayIso,
        isMarked: markedDateSet.has(isoDate),
        isBlocked: blockedDateSet.has(isoDate),
      };
    });
  }, [blockedDateSet, markedDateSet, selectedDate, todayIso, visibleMonth]);

  const monthLabel = new Date(visibleMonth.year, visibleMonth.monthIndex, 1).toLocaleDateString("en-LK", {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (offset) => {
    setVisibleMonth((currentMonth) => {
      const nextDate = new Date(currentMonth.year, currentMonth.monthIndex + offset, 1);
      return {
        year: nextDate.getFullYear(),
        monthIndex: nextDate.getMonth(),
      };
    });
  };

  return (
    <article className="card resource-calendar-card">
      <div className="resource-calendar-header">
        <div>
          <p className="eyebrow">Calendar View</p>
          <h2>{title}</h2>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        <div className="resource-calendar-toolbar">
          {selectedDate && onClear ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
              Clear date
            </button>
          ) : null}
          <div className="resource-code-chip">
            <FiCalendar />
            {selectedDate || "No date selected"}
          </div>
        </div>
      </div>

      <div className="resource-calendar-shell">
        <div className="resource-calendar-month">
          <button
            type="button"
            className="resource-calendar-nav"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
          >
            <FiChevronLeft />
          </button>
          <strong>{monthLabel}</strong>
          <button
            type="button"
            className="resource-calendar-nav"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
          >
            <FiChevronRight />
          </button>
        </div>

        <div className="resource-calendar-grid" role="grid">
          {WEEKDAY_LABELS.map((dayLabel) => (
            <div key={dayLabel} className="resource-calendar-weekday">
              {dayLabel}
            </div>
          ))}

          {calendarCells.map((cell, index) => {
            if (!cell) {
              return <div key={`blank-${index}`} className="resource-calendar-day resource-calendar-day-empty" />;
            }

            const className = [
              "resource-calendar-day",
              cell.isSelected ? "is-selected" : "",
              cell.isToday ? "is-today" : "",
              cell.isMarked ? "is-marked" : "",
              cell.isBlocked ? "is-blocked" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={cell.isoDate}
                type="button"
                className={className}
                onClick={() => onSelectDate?.(cell.isoDate)}
              >
                <span>{cell.day}</span>
                {cell.isMarked ? <small /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="resource-calendar-legend">
        <span><i className="resource-calendar-dot resource-calendar-dot-selected" /> Selected</span>
        <span><i className="resource-calendar-dot resource-calendar-dot-today" /> Today</span>
        {blockedDates.length > 0 ? (
          <span><i className="resource-calendar-dot resource-calendar-dot-blocked" /> {blockedLegendLabel}</span>
        ) : null}
        {markedDates.length > 0 ? (
          <span><i className="resource-calendar-dot resource-calendar-dot-marked" /> {markedLegendLabel}</span>
        ) : null}
      </div>

      {helperText ? <p className="resource-calendar-helper">{helperText}</p> : null}
    </article>
  );
}

export default ResourceAvailabilityCalendar;
