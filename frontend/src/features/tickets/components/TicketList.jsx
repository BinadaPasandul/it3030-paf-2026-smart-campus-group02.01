import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";

/**
 * TicketList - Displays a collection of incident tickets in a card grid.
 */
function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await api.get("/tickets");
        setTickets(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load incident tickets."));
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "OPEN": return "status-open";
      case "IN_PROGRESS": return "status-in-progress";
      case "RESOLVED": return "status-resolved";
      default: return "status-inactive";
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
      <div className="card loading-card">
        <p className="page-subtitle">Finding your reported incidents...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="card empty-state">
        <p className="page-subtitle">You haven't reported any incidents yet.</p>
        <button 
          className="btn btn-primary" 
          style={{ marginTop: "1rem" }}
          onClick={() => navigate("/tickets/new")}
        >
          Report Your First Issue
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {tickets.map((ticket) => (
        <article 
          key={ticket.id} 
          className="card" 
          style={{ cursor: "pointer", transition: "transform 0.2s" }}
          onClick={() => navigate(`/tickets/${ticket.id}`)}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
            <div>
              <h2 style={{ marginBottom: "0.5rem" }}>{ticket.title}</h2>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <p className="eyebrow" style={{ fontSize: "0.75rem" }}>
                  Reported on {formatDate(ticket.createdAt)}
                </p>
                {ticket.createdByName && (
                  <p className="eyebrow" style={{ fontSize: "0.75rem" }}>
                    By {ticket.createdByName}
                  </p>
                )}
              </div>
            </div>
            <span className={`status-badge ${getStatusClass(ticket.status)}`}>
              {ticket.status.replace("_", " ")}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

export default TicketList;
