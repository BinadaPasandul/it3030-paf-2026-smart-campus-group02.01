/**
 * TicketGallery - Displays a grid of image attachments for a ticket
 */
function TicketGallery({ attachments }) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const getAttachmentUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }

    return `http://localhost:8080${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
  };

  return (
    <section className="card" style={{ marginTop: "1rem" }}>
      <div className="table-header">
        <h2>Evidence & Photos</h2>
        <p className="eyebrow">{attachments.length} file{attachments.length > 1 ? "s" : ""}</p>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", 
        gap: "1rem" 
      }}>
        {attachments.map((file) => (
          <a 
            key={file.id} 
            href={getAttachmentUrl(file.filePath)}
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              borderRadius: "12px", 
              overflow: "hidden", 
              border: "1px solid var(--border)",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <img 
              src={getAttachmentUrl(file.filePath)}
              alt={file.fileName} 
              style={{ width: "100%", height: "120px", objectFit: "cover" }} 
              onError={(e) => {
                e.target.src = "https://placehold.co/150x120?text=No+Preview";
              }}
            />
            <div style={{ padding: "8px", background: "rgba(15, 23, 42, 0.92)" }}>
              <p className="eyebrow" style={{ fontSize: "0.65rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {file.fileName}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default TicketGallery;
