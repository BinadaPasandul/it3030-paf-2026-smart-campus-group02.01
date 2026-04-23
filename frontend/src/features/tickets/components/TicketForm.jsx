import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";

/**
 * TicketForm - Enhanced component for reporting a new incident ticket.
 * Supports multiple file uploads and image previews.
 */
function TicketForm({ onCreated, onCancelPath = "/tickets" }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Maintenance");
  const [priority, setPriority] = useState("MEDIUM");
  const [location, setLocation] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  const [initialComment, setInitialComment] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length > 3) {
      setError("You can upload up to 3 images per ticket.");
      return;
    }

    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setFiles(selectedFiles);
    setError("");

    const newPreviews = selectedFiles
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => URL.createObjectURL(file));

    setPreviews(newPreviews);
  };

  const resetForm = () => {
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setTitle("");
    setDescription("");
    setCategory("Maintenance");
    setPriority("MEDIUM");
    setLocation("");
    setContactDetails("");
    setInitialComment("");
    setFiles([]);
    setPreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      setError("Please provide a title, description, and location.");
      return;
    }

    if (files.length > 3) {
      setError("You can upload up to 3 images per ticket.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1. Create the Ticket via JSON
      const ticketPayload = {
        title,
        description,
        category,
        priority,
        location,
        contactDetails,
      };

      const response = await api.post("/tickets", ticketPayload);
      const ticketId = response.data.id;

      // 2. Add initial comment if present
      if (initialComment.trim()) {
        await api.post(`/tickets/${ticketId}/comments`, { content: initialComment });
      }

      // 3. Upload attachments sequentially
      for (const file of files) {
        const fileData = new FormData();
        fileData.append("file", file);
        await api.post(`/tickets/${ticketId}/attachments`, fileData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSuccess("Incident reported successfully! Redirecting...");
      resetForm();
      onCreated?.(response.data);
      setTimeout(() => {
        navigate(`/tickets/${ticketId}`);
      }, 1200);

    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to submit the ticket."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="card ticket-form-card">
      <div className="ticket-form-header">
        <div>
          <p className="eyebrow">New Incident</p>
          <h2>Submit a student support ticket</h2>
          <p className="page-subtitle" style={{ marginTop: "0.5rem" }}>
            Share the problem clearly and attach up to three images so the campus support team can respond faster.
          </p>
        </div>
        <div className="ticket-form-badge">POST /api/tickets</div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>{success}</div>}

      <form onSubmit={handleSubmit} className="dashboard-stack ticket-form-layout">
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
              <label htmlFor="category" className="eyebrow">Category *</label>
              <select
                id="category"
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                required
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Security">Security</option>
                <option value="IT Services">IT Services</option>
                <option value="Janitorial">Janitorial</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="priority" className="eyebrow">Priority</label>
              <select
                id="priority"
                className="input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading}
              >
                <option value="LOW">Low - General query</option>
                <option value="MEDIUM">Medium - Normal</option>
                <option value="HIGH">High - Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-columns">
            <div className="input-group">
              <label htmlFor="location" className="eyebrow">Location *</label>
              <input
                id="location"
              className="input"
              placeholder="e.g. Block A, Room 302"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              required
            />
          </div>

            <div className="input-group">
              <label htmlFor="contact" className="eyebrow">Contact Details (Optional)</label>
              <input
                id="contact"
                className="input"
                placeholder="Phone or secondary email"
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="description" className="eyebrow">Description *</label>
            <textarea
              id="description"
              className="input"
              rows="5"
              placeholder="Explain the issue in detail. Include what happened, where it happened, and whether it affects other students."
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
            <div className="ticket-upload-dropzone">
              <input 
                type="file" 
                id="file-upload" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="file-upload" className="btn btn-ghost" style={{ cursor: "pointer" }}>
                Select Images
              </label>
              <p style={{ fontSize: "0.9rem", marginTop: "0.75rem", color: "var(--muted)" }}>
                PNG or JPG, up to 3 images total.
              </p>
              <p style={{ fontSize: "0.8rem", marginTop: "0.25rem", color: "var(--text)" }}>
                {files.length > 0 ? `${files.length} image${files.length > 1 ? "s" : ""} selected` : "No images selected"}
              </p>
            </div>
            
            {previews.length > 0 && (
              <div className="ticket-preview-grid">
                {previews.map((preview, idx) => (
                  <img 
                    key={idx} 
                    src={preview} 
                    alt="Preview" 
                    className="ticket-preview-image"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ticket-form-actions">
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
            onClick={() => navigate(onCancelPath)}
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
