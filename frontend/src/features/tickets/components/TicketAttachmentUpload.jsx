import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";

/**
 * TicketAttachmentUpload - Component for uploading up to 3 image attachments
 * for a specific incident ticket.
 */
function TicketAttachmentUpload({ ticketId, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];
  const MAX_FILES = 3;

  // Clean up Object URLs when component unmounts or previews change
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setError("");
    setSuccess("");

    // 1. Check total limit
    if (files.length + selectedFiles.length > MAX_FILES) {
      setError(`You can only upload a maximum of ${MAX_FILES} images.`);
      return;
    }

    // 2. Validate types and generate previews
    const validFiles = [];
    const newPreviews = [];

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only JPG, JPEG, and PNG images are supported.");
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    
    // Reset the input so the same file can be selected again if removed
    e.target.value = "";
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setError("");
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // Loop through and upload each file individually as per backend requirements
      const uploadPromises = files.map((file) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post(`/tickets/${ticketId}/attachments`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      });

      await Promise.all(uploadPromises);
      
      setSuccess("All attachments uploaded successfully!");
      setFiles([]);
      setPreviews([]);
      
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to upload some or all attachments."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="card" style={{ marginTop: "1rem" }}>
      <div className="table-header">
        <h2>Attachments</h2>
        <p className="eyebrow">{files.length} / {MAX_FILES}</p>
      </div>

      <p className="page-subtitle" style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
        Add photos of the issue (JPG/PNG). Maximum 3 files.
      </p>

      {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{success}</div>}

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", 
          gap: "1rem", 
          marginBottom: "1.5rem" 
        }}>
          {previews.map((url, index) => (
            <div key={url} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", aspectHeight: "1/1" }}>
              <img 
                src={url} 
                alt={`Preview ${index}`} 
                style={{ width: "100%", height: "100px", objectFit: "cover" }} 
              />
              <button
                onClick={() => removeFile(index)}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  background: "rgba(220, 38, 38, 0.9)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px"
                }}
                title="Remove image"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Control Area */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <button 
            className="btn btn-secondary" 
            style={{ width: "100%", cursor: files.length >= MAX_FILES ? "not-allowed" : "pointer" }}
            disabled={files.length >= MAX_FILES || uploading}
          >
            {files.length >= MAX_FILES ? "Limit Reached" : "Select Images"}
          </button>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
              display: files.length >= MAX_FILES ? "none" : "block"
            }}
            disabled={files.length >= MAX_FILES || uploading}
          />
        </div>

        {files.length > 0 && (
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading}
            style={{ flex: 1 }}
          >
            {uploading ? "Uploading..." : `Upload ${files.length} File${files.length > 1 ? "s" : ""}`}
          </button>
        )}
      </div>
    </section>
  );
}

export default TicketAttachmentUpload;
