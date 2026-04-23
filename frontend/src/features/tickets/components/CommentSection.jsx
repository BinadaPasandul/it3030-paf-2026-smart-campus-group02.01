import { useState } from "react";
import api from "../../../api/axios";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import { useAuth } from "../../../features/auth/context/useAuth";

/**
 * CommentSection - Managed component for viewing, posting, editing, and deleting ticket comments
 */
function CommentSection({ ticketId, comments, onCommentAdded }) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      setError("");
      
      const response = await api.post(`/tickets/${ticketId}/comments`, {
        content: newComment
      });

      if (response.status === 201) {
        setNewComment("");
        if (onCommentAdded) onCommentAdded();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to post comment."));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editValue.trim()) return;

    try {
      setLoading(true);
      setError("");
      
      const response = await api.put(`/comments/${id}`, {
        content: editValue
      });

      if (response.status === 200) {
        setEditingId(null);
        setEditValue("");
        if (onCommentAdded) onCommentAdded();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update comment."));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      setLoading(true);
      setError("");
      
      const response = await api.delete(`/comments/${id}`);

      if (response.status === 204) {
        if (onCommentAdded) onCommentAdded();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete comment."));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="card" style={{ marginTop: "1rem" }}>
      <div className="table-header">
        <h2>Communications</h2>
        <p className="eyebrow">{comments?.length || 0} comment{comments?.length !== 1 ? "s" : ""}</p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Comment List */}
      <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
        {comments && comments.length > 0 ? (
          comments.map((comment) => {
            const isOwner = user && user.id === comment.createdById;
            const isEditing = editingId === comment.id;

            return (
              <div key={comment.id} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "50%", 
                  background: isOwner ? "var(--primary)" : "var(--primary-soft)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: isOwner ? "white" : "var(--primary)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  flexShrink: 0
                }}>
                  {comment.createdByName?.charAt(0) || "?"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      {comment.createdByName} {isOwner && <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>(You)</span>}
                    </p>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <p className="eyebrow" style={{ fontSize: "0.7rem" }}>{formatDate(comment.createdAt)}</p>
                      {isOwner && !isEditing && (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button 
                            onClick={() => { setEditingId(comment.id); setEditValue(comment.content); }}
                            style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.7rem", cursor: "pointer", fontWeight: 600 }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(comment.id)}
                            style={{ background: "none", border: "none", color: "var(--danger)", fontSize: "0.7rem", cursor: "pointer", fontWeight: 600 }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="dashboard-stack">
                      <textarea
                        className="input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows="2"
                        style={{ fontSize: "0.95rem" }}
                      />
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                        <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(comment.id)}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="info-panel" style={{ padding: "10px 14px", border: "none" }}>
                      <p style={{ fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>{comment.content}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="page-subtitle" style={{ textAlign: "center", fontStyle: "italic" }}>
            No comments yet. Start a conversation with the operations team!
          </p>
        )}
      </div>

      {/* New Comment Form */}
      {!editingId && (
        <form onSubmit={handleSubmit} className="dashboard-stack">
          <div className="input-group">
            <label htmlFor="comment" className="eyebrow">Post an Update</label>
            <textarea
              id="comment"
              className="input"
              rows="3"
              placeholder="Tell us more about the issue or ask for an update..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={loading}
              style={{ minHeight: "80px" }}
            />
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button 
              type="submit" 
              className="btn btn-secondary" 
              disabled={loading || !newComment.trim()}
            >
              {loading ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default CommentSection;
