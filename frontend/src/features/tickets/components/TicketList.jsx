import { useNavigate } from "react-router-dom";

/**
 * TicketList - Displays a collection of incident tickets in a modern card grid.
 */
function TicketList({
  tickets = [],
  loading = false,
  error = "",
  title = "Recent Tickets",
  subtitle = "Browse the latest incident updates from your workspace.",
  emptyTitle = "No tickets found",
  emptySubtitle = "There are no tickets to show right now.",
  actionLabel = "Create Ticket",
  showCreatedBy = true,
}) {
  const navigate = useNavigate();

  const getStatusClass = (status) => {
    switch (status) {
      case "OPEN":
        return "status-open";
      case "IN_PROGRESS":
        return "status-progress";
      case "RESOLVED":
        return "status-resolved";
      case "REJECTED":
        return "status-rejected";
      case "CLOSED":
        return "status-closed";
      default:
        return "status-inactive";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "HIGH":
        return "ticket-priority-high";
      case "LOW":
        return "ticket-priority-low";
      default:
        return "ticket-priority-medium";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <article className="card ticket-panel loading-card">
        <div className="ticket-list-header">
          <div>
            <p className="eyebrow">Loading</p>
            <h2>{title}</h2>
          </div>
        </div>
        <div className="ticket-loading-state">
          <span className="ticket-spinner" aria-hidden="true" />
          <p className="page-subtitle">Finding your reported incidents...</p>
        </div>
      </article>
    );
  }

  if (error) {
    return (
      <article className="card ticket-panel">
        <div className="ticket-list-header">
          <div>
            <p className="eyebrow">Something Went Wrong</p>
            <h2>{title}</h2>
          </div>
        </div>
        <div className="alert alert-error">{error}</div>
      </article>
    );
  }

  if (tickets.length === 0) {
    return (
      <article className="card ticket-panel empty-state">
        <div className="ticket-list-header">
          <div>
            <p className="eyebrow">Empty State</p>
            <h2>{emptyTitle}</h2>
            <p className="page-subtitle">{emptySubtitle}</p>
          </div>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ marginTop: "1rem" }}
          onClick={() => navigate("/tickets/new")}
        >
          {actionLabel}
        </button>
      </article>
    );
  }

  return (
    <article className="card ticket-panel">
      <div className="ticket-list-header">
        <div>
          <p className="eyebrow">Ticket Feed</p>
          <h2>{title}</h2>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        <div className="ticket-list-meta">
          <span>{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="ticket-list-grid">
        {tickets.map((ticket) => (
          <article
            key={ticket.id}
            className="ticket-list-card"
            onClick={() => navigate(`/tickets/${ticket.id}`)}
          >
            <div className="ticket-list-card-top">
              <div>
                <p className="ticket-card-id">Ticket #{ticket.id}</p>
                <h3>{ticket.title}</h3>
              </div>
              <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                {ticket.status.replaceAll("_", " ")}
              </span>
            </div>

            <div className="ticket-meta-row">
              <span className={`ticket-priority ${getPriorityClass(ticket.priority)}`}>
                {ticket.priority || "MEDIUM"}
              </span>
              <span className="ticket-meta-chip">
                {ticket.category || "General"}
              </span>
            </div>

            <div className="ticket-card-footer">
              <div>
                <p className="eyebrow">Created</p>
                <p>{formatDate(ticket.createdAt)}</p>
              </div>
              {showCreatedBy && ticket.createdByName ? (
                <div>
                  <p className="eyebrow">Reporter</p>
                  <p>{ticket.createdByName}</p>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </article>
  );
}

export default TicketList;
