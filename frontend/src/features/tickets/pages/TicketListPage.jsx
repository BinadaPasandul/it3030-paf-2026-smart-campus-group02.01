import { useNavigate } from "react-router-dom";
import api from '../../../api/axios';
import TicketList from "../components/TicketList";

/**
 * TicketListPage - Central dashboard for viewing and managing incident reports.
 */
function TicketListPage() {
  const navigate = useNavigate();

  const handleCreateTicket = () => {
    navigate("/tickets/new");
  };

  return (
    <div className="container page">
      <div className="dashboard-stack">
        <section className="page-header">
          <div>
            <p className="eyebrow">Smart Campus Support</p>
            <h1>Incident Dashboard</h1>
            <p className="page-subtitle">
              Track the status of your reported issues and campus maintenance tasks.
            </p>
          </div>
          <button onClick={handleCreateTicket} className="btn btn-primary">
            Report New Issue
          </button>
        </section>

        <section style={{ marginTop: "1rem" }}>
          <TicketList />
        </section>
      </div>
    </div>
  );
}

export default TicketListPage;
