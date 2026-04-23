import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../auth/context/useAuth";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";

/**
 * TicketActionPanel - Specialized component for management actions (Technicians/Admins).
 */
function TicketActionPanel({ ticket, onActionComplete }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [notes, setNotes] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState(ticket.assignedToId || "");

  const isAdmin = user?.role === "ADMIN";
  const isAssigned = ticket.assignedToId === user?.id;

  useEffect(() => {
    setStatus(ticket.status);
    setTechnicianId(ticket.assignedToId || "");
  }, [ticket.assignedToId, ticket.status]);

  useEffect(() => {
    if (!isAdmin) return;

    const loadTechnicians = async () => {
      try {
        const response = await api.get("/users/technicians");
        setTechnicians(response.data || []);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load technicians."));
      }
    };

    loadTechnicians();
  }, [isAdmin]);
  
  // Only Admin or Assigned Technician can perform these actions
  if (!isAdmin && !isAssigned) return null;
  
  // Terminal states cannot be changed
  if (ticket.status === "CLOSED" || ticket.status === "REJECTED") return null;

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (status === ticket.status) return;

    // Validation for notes/reason
    if (status === "RESOLVED" && !notes.trim()) {
      setError("Resolution notes are required when resolving a ticket.");
      return;
    }
    if (status === "REJECTED" && !notes.trim()) {
      setError("A rejection reason is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        status,
        resolutionNotes: status === "RESOLVED" ? notes : null,
        rejectionReason: status === "REJECTED" ? notes : null,
      };

      await api.patch(`/tickets/${ticket.id}/status`, payload);
      onActionComplete();
      setNotes("");
      setSuccess("Ticket status updated successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update status."));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if (!technicianId) {
      setError("Select a technician before assigning this ticket.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccess("");
      await api.patch(`/tickets/${ticket.id}/assign`, {
        technicianId: Number(technicianId),
      });
      setSuccess("Technician assigned successfully.");
      onActionComplete();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to assign technician."));
    } finally {
      setAssigning(false);
    }
  };

  const statusOptions = (() => {
    if (ticket.status === "OPEN") {
      return isAdmin
        ? ["OPEN", "IN_PROGRESS", "REJECTED"]
        : ["OPEN", "IN_PROGRESS"];
    }

    if (ticket.status === "IN_PROGRESS") {
      return isAdmin
        ? ["IN_PROGRESS", "RESOLVED", "REJECTED"]
        : ["IN_PROGRESS", "RESOLVED"];
    }

    if (ticket.status === "RESOLVED") {
      return ["RESOLVED", "CLOSED"];
    }

    return [ticket.status];
  })();

  return (
    <article className="card shadow-md" style={{ borderTop: "4px solid var(--primary)" }}>
      <p className="eyebrow">Management Actions</p>
      
      {error && <div className="alert alert-error" style={{ margin: "1rem 0" }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ margin: "1rem 0" }}>{success}</div>}

      {isAdmin ? (
        <form onSubmit={handleAssignTechnician} className="dashboard-stack" style={{ marginTop: "1rem" }}>
          <div className="input-group">
            <label className="eyebrow">Assign Technician</label>
            <select
              className="input"
              value={technicianId}
              onChange={(e) => {
                setTechnicianId(e.target.value);
                setError("");
                setSuccess("");
              }}
              disabled={assigning || technicians.length === 0}
            >
              <option value="">{ticket.assignedToName || "Select technician"}</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.fullName || technician.email}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-secondary"
            disabled={assigning || !technicianId || Number(technicianId) === ticket.assignedToId}
          >
            {assigning ? "Assigning..." : "Assign Technician"}
          </button>
        </form>
      ) : null}

      <form onSubmit={handleUpdateStatus} className="dashboard-stack" style={{ marginTop: "1rem" }}>
        <div className="input-group">
          <label className="eyebrow">Update Status</label>
          <select 
            className="input"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setError("");
              setSuccess("");
            }}
            disabled={loading}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {(status === "RESOLVED" || status === "REJECTED") && (
          <div className="input-group">
            <label className="eyebrow">
              {status === "RESOLVED" ? "Resolution Notes *" : "Rejection Reason *"}
            </label>
            <textarea
              className="input"
              rows="3"
              placeholder={status === "RESOLVED" ? "Describe how the issue was fixed..." : "Explain why the ticket was rejected..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading || status === ticket.status}
        >
          {loading ? "Updating..." : "Apply Status Change"}
        </button>
      </form>
    </article>
  );
}

export default TicketActionPanel;
