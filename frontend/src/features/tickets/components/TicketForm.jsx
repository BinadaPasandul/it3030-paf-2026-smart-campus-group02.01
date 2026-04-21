import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";

/**
 * TicketForm - Enhanced component for reporting a new incident ticket.
 * Supports multiple file uploads and image previews.
 */
function TicketForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [initialComment, setInitialComment] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Create previews for images
    const newPreviews = selectedFiles
      .filter(file => file.type.startsWith('image/'))
      .map(file => URL.createObjectURL(file));
    
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please provide a title and description.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("priority", priority);
      
      if (initialComment.trim()) {
        formData.append("comment", initialComment);
      }
      
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await api.post("/tickets", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setSuccess("Incident reported successfully! Redirecting...");
        setTimeout(() => {
          navigate(`/tickets/${response.data.id}`);
        }, 1200);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to submit the ticket."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="card shadow-md">
      <div className="table-header">
        <h2>Report an Incident</h2>
      </div>

      <p className="page-subtitle" style={{ marginBottom: "1.5rem" }}>
        Tell us what happened. You can attach photos to help us resolve it faster.
      </p>

      {error && <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>{success}</div>}

      <form onSubmit={handleSubmit} className="dashboard-stack">
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="title" className="eyebrow">Title *</label>
            <input
              id="title"
              className="input"
              placeholder="Brief summary of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-columns">
            <div className="input-group">
              <label htmlFor="priority" className="eyebrow">Priority</label>
              <select
                id="priority"
                className="input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading}
              >
                <option value="LOW">Low - General query/minor issue</option>
                <option value="MEDIUM">Medium - Functional problem</option>
                <option value="HIGH">High - Critical failure</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="description" className="eyebrow">Description *</label>
            <textarea
              id="description"
              className="input"
              rows="4"
              placeholder="Explain the issue in detail, including location..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="initialComment" className="eyebrow">Special Instructions (Optional)</label>
            <textarea
              id="initialComment"
              className="input"
              rows="2"
              placeholder="Any immediate notes for the staff?"
              value={initialComment}
              onChange={(e) => setInitialComment(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="eyebrow">Attachments (Photos preferred)</label>
            <div className="info-panel" style={{ background: "#f1f5f9", textAlign: "center", border: "2px dashed var(--border)" }}>
              <input 
                type="file" 
                id="file-upload" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="file-upload" className="btn btn-ghost" style={{ cursor: "pointer" }}>
                Select Files
              </label>
              <p style={{ fontSize: "0.8rem", marginTop: "0.5rem", color: "var(--muted)" }}>
                {files.length > 0 ? `${files.length} files selected` : "No files selected"}
              </p>
            </div>
            
            {previews.length > 0 && (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                {previews.map((preview, idx) => (
                  <img 
                    key={idx} 
                    src={preview} 
                    alt="Preview" 
                    style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border)" }} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Incident Report"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate("/tickets")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </article>
  );
}

export default TicketForm;
