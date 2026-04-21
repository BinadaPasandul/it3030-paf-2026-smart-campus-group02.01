import TicketForm from "../components/TicketForm";

/**
 * TicketPage - Page to host the Ticket creation flow.
 */
function TicketPage() {
  return (
    <div className="dashboard-stack" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <section className="page-header">
        <div>
          <p className="eyebrow">Smart Campus Support</p>
          <h1>Report Issue</h1>
          <p className="page-subtitle">
            Need help? Report any technical or facility issues here.
          </p>
        </div>
      </section>

      <div style={{ marginTop: "2rem" }}>
        <TicketForm />
      </div>
    </div>
  );
}

export default TicketPage;
