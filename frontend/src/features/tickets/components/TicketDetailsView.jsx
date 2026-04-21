/**
 * TicketDetailsView - Renders the primary information for a ticket
 */
function TicketDetailsView({ ticket }) {
  const getStatusClass = (status) => {
    switch (status) {
      case "OPEN": return "status-open";
      case "IN_PROGRESS": return "status-progress";
      case "RESOLVED": return "status-resolved";
      default: return "status-inactive";
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
    <article className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>Ticket #{ticket.id}</p>
          <h1 style={{ fontSize: "1.75rem" }}>{ticket.title}</h1>
        </div>
        <span className={`status-badge ${getStatusClass(ticket.status)}`}>
          {ticket.status.replace("_", " ")}
        </span>
      </div>

      <div className="info-panel" style={{ marginBottom: "1.5rem" }}>
        <p style={{ whiteSpace: "pre-wrap", color: "var(--text)" }}>{ticket.description}</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
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
    </article>
  );
}

export default TicketDetailsView;
