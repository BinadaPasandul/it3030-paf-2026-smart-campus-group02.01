import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";

import TicketDetailsView from "../components/TicketDetailsView";
import TicketGallery from "../components/TicketGallery";
import TicketAttachmentUpload from "../components/TicketAttachmentUpload";
import CommentSection from "../components/CommentSection";

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
        <div className="card loading-card">
          <p className="page-subtitle">Loading ticket details...</p>
        </div>
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
      <div className="dashboard-stack">
        <section className="page-header">
          <div>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ marginBottom: "1rem" }}
              onClick={() => navigate("/tickets")}
            >
              &larr; Back to Dashboard
            </button>
          </div>
        </section>

        <div className="auth-grid" style={{ gridTemplateColumns: "2fr 1fr", alignItems: "start" }}>
          
          {/* Main Content Area */}
          <div className="dashboard-stack">
            <TicketDetailsView ticket={ticket} />
            <TicketGallery attachments={ticket.attachments} />
            
            {/* Comments Area */}
            <CommentSection 
              ticketId={ticket.id} 
              comments={ticket.comments} 
              onCommentAdded={loadTicketData} 
            />
          </div>

          {/* Sidebar Area */}
          <aside className="dashboard-stack">
            <TicketAttachmentUpload 
              ticketId={ticket.id} 
              onUploadComplete={loadTicketData} 
            />
            
            <article className="card info-panel shadow-sm">
              <p className="eyebrow">Quick Information</p>
              <div className="detail-list" style={{ marginTop: "1rem" }}>
                <div>
                  <dt>Department</dt>
                  <dd>Operations</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>Maintenance</dd>
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
