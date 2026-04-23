import TicketStatusStepper from "./TicketStatusStepper";

/**
 * TicketDetailsView - Renders the primary information for a ticket
 */
function TicketDetailsView({ ticket }) {
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <article className="card ticket-details-card">
      <div className="ticket-details-header">
        <div>
          <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>Ticket #{ticket.id}</p>
          <h1>{ticket.title}</h1>
        </div>
        <span className={`status-badge ${getStatusClass(ticket.status)}`}>
          {ticket.status.replace("_", " ")}
        </span>
      </div>

      <TicketStatusStepper currentStatus={ticket.status} />

      <div className="ticket-description-panel">
        <p style={{ whiteSpace: "pre-wrap", color: "var(--text)" }}>{ticket.description}</p>
      </div>

      <div className="ticket-details-grid">
        <div>
          <p className="eyebrow">Category</p>
          <p style={{ fontWeight: 600 }}>{ticket.category || "N/A"}</p>
        </div>
        <div>
          <p className="eyebrow">Priority</p>
          <p style={{ fontWeight: 600, color: ticket.priority === "HIGH" ? "var(--error)" : "inherit" }}>
            {ticket.priority}
          </p>
        </div>
        <div>
          <p className="eyebrow">Location</p>
          <p style={{ fontWeight: 600 }}>{ticket.location || "N/A"}</p>
        </div>
        <div>
          <p className="eyebrow">Contact Info</p>
          <p style={{ fontWeight: 600 }}>{ticket.contactDetails || "None provided"}</p>
        </div>
      </div>

      <div className="ticket-details-grid ticket-details-grid-secondary">
        <div>
          <p className="eyebrow">Reported By</p>
          <p style={{ fontWeight: 600 }}>{ticket.createdByName || "Anonymous"}</p>
        </div>
        <div>
          <p className="eyebrow">Assigned To</p>
          <p style={{ fontWeight: 600 }}>{ticket.assignedToName || "Unassigned"}</p>
        </div>
        <div>
          <p className="eyebrow">Date Created</p>
          <p style={{ fontWeight: 600 }}>{formatDate(ticket.createdAt)}</p>
        </div>
        <div>
          <p className="eyebrow">Last Updated</p>
          <p style={{ fontWeight: 600 }}>{formatDate(ticket.updatedAt)}</p>
        </div>
      </div>

      {ticket.resolutionNotes && (
        <div className="ticket-note-panel ticket-note-success">
          <p className="eyebrow" style={{ color: "var(--success)" }}>Resolution Notes</p>
          <p style={{ marginTop: "0.5rem" }}>{ticket.resolutionNotes}</p>
        </div>
      )}

      {ticket.rejectionReason && (
        <div className="ticket-note-panel ticket-note-danger">
          <p className="eyebrow" style={{ color: "var(--error)" }}>Rejection Reason</p>
          <p style={{ marginTop: "0.5rem" }}>{ticket.rejectionReason}</p>
        </div>
      )}
    </article>
  );
}

export default TicketDetailsView;
