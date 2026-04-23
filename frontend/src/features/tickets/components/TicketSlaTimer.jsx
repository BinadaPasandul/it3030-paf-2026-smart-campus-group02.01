import { useEffect, useEffectEvent, useState } from "react";

function formatDuration(ms) {
  if (!ms || ms < 0) {
    return "Not available";
  }

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  return `${hours}h ${minutes}m ${seconds}s`;
}

function TicketSlaTimer({ ticket }) {
  const [elapsed, setElapsed] = useState(0);

  const updateElapsed = useEffectEvent(() => {
    const createdAt = new Date(ticket.createdAt).getTime();
    setElapsed(Date.now() - createdAt);
  });

  useEffect(() => {
    updateElapsed();
    const timer = window.setInterval(updateElapsed, 1000);

    return () => window.clearInterval(timer);
  }, [ticket.createdAt]);

  const createdAt = new Date(ticket.createdAt).getTime();
  const firstResponseComment = ticket.comments?.find(
    (comment) => comment.createdById && comment.createdById !== ticket.createdById,
  );
  const firstResponseAt = firstResponseComment
    ? new Date(firstResponseComment.createdAt).getTime()
    : null;
  const resolvedAt = ticket.status === "RESOLVED" || ticket.status === "CLOSED"
    ? new Date(ticket.updatedAt).getTime()
    : null;

  const metrics = [
    {
      label: "Time since created",
      value: formatDuration(elapsed),
    },
    {
      label: "Time to first response",
      value: firstResponseAt ? formatDuration(firstResponseAt - createdAt) : "Awaiting first response",
    },
    {
      label: "Time to resolution",
      value: resolvedAt ? formatDuration(resolvedAt - createdAt) : "Still in progress",
    },
  ];

  return (
    <article className="card ticket-sla-card">
      <div className="ticket-list-header">
        <div>
          <p className="eyebrow">SLA Timer</p>
          <h2>Support response timing</h2>
        </div>
      </div>

      <div className="ticket-sla-grid">
        {metrics.map((metric) => (
          <div key={metric.label} className="ticket-sla-metric">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

export default TicketSlaTimer;
