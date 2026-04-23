import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";

import TicketDetailsView from "../components/TicketDetailsView";
import TicketGallery from "../components/TicketGallery";
import TicketAttachmentUpload from "../components/TicketAttachmentUpload";
import TicketActionPanel from "../components/TicketActionPanel";
import CommentSection from "../components/CommentSection";
import TicketSlaTimer from "../components/TicketSlaTimer";

/**
 * TicketDetailsPage - Orchestrates the full ticket interaction experience.
 */
function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTicketData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "We couldn't find the ticket you're looking for."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTicketData();
  }, [loadTicketData]);

  if (loading) {
    return (
      <div className="container page">
        <article className="card loading-card ticket-panel">
          <div className="ticket-loading-state">
            <span className="ticket-spinner" aria-hidden="true" />
            <p className="page-subtitle">Loading ticket details...</p>
          </div>
        </article>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page">
        <div className="alert alert-error">{error}</div>
        <button 
          className="btn btn-secondary" 
          style={{ marginTop: "1rem" }}
          onClick={() => navigate("/tickets")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="container page">
      <div className="dashboard-stack ticket-hub-shell">
        <section className="ticket-detail-topbar">
          <div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/tickets")}
            >
              Back to Ticket Hub
            </button>
          </div>
        </section>

        <div className="ticket-detail-layout">
          <div className="dashboard-stack">
            <TicketDetailsView ticket={ticket} />
            <TicketSlaTimer ticket={ticket} />
            <TicketGallery attachments={ticket.attachments} />

            <CommentSection
              ticketId={ticket.id}
              comments={ticket.comments}
              onCommentAdded={loadTicketData}
            />
          </div>

          <aside className="dashboard-stack">
            <TicketActionPanel
              ticket={ticket}
              onActionComplete={loadTicketData}
            />

            <TicketAttachmentUpload
              ticketId={ticket.id}
              onUploadComplete={loadTicketData}
            />

            <article className="card ticket-side-note">
              <p className="eyebrow">Quick Information</p>
              <div className="detail-list" style={{ marginTop: "1rem" }}>
                <div>
                  <dt>Ticket Type</dt>
                  <dd>{ticket.category || "General Support"}</dd>
                </div>
                <div>
                  <dt>Current Priority</dt>
                  <dd>{ticket.priority || "MEDIUM"}</dd>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default TicketDetailsPage;
