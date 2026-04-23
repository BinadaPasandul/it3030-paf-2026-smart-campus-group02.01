import { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiClipboard, FiClock } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";
import { useAuth } from "../../auth/context/useAuth";
import AdminTicketManagementPage from "./AdminTicketManagementPage";
import TicketList from "../components/TicketList";
import TicketForm from "../components/TicketForm";

/**
 * TicketListPage - Student-centric ticket hub with overview, creation, and personal history.
 */
function TicketListPage({ defaultTab = "overview" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isTechnician } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");

    if (isTechnician) {
      return tab === "assigned" ? "assigned" : "overview";
    }

    if (location.pathname === "/tickets/new") {
      return "new";
    }

    return tab || defaultTab;
  }, [defaultTab, isTechnician, location.pathname, location.search]);

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }

    const loadTickets = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(isTechnician ? "/tickets/assigned" : "/tickets/mine");
        setTickets(response.data || []);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load incident tickets."));
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [isAdmin, isTechnician]);

  const myTickets = useMemo(() => tickets, [tickets]);

  const stats = useMemo(() => {
    return {
      total: myTickets.length,
      open: myTickets.filter((ticket) => ticket.status === "OPEN").length,
      inProgress: myTickets.filter((ticket) => ticket.status === "IN_PROGRESS").length,
      resolved: myTickets.filter((ticket) => ticket.status === "RESOLVED").length,
    };
  }, [myTickets]);

  const recentTickets = useMemo(() => {
    return [...myTickets]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  }, [myTickets]);

  const handleTabChange = (tab) => {
    if (isTechnician) {
      navigate(tab === "assigned" ? "/tickets?tab=assigned" : "/tickets");
      return;
    }

    if (tab === "new") {
      navigate("/tickets/new");
      return;
    }

    if (tab === "overview") {
      navigate("/tickets");
      return;
    }

    navigate(`/tickets?tab=${tab}`);
  };

  const handleTicketCreated = (createdTicket) => {
    setTickets((currentTickets) => [createdTicket, ...currentTickets]);
  };

  const dashboardCards = [
    { key: "total", label: "Total Tickets", value: stats.total, accent: "indigo", icon: <FiClipboard /> },
    { key: "open", label: "Open Tickets", value: stats.open, accent: "red", icon: <FiAlertCircle /> },
    { key: "in-progress", label: "In Progress", value: stats.inProgress, accent: "amber", icon: <FiClock /> },
    { key: "resolved", label: "Resolved", value: stats.resolved, accent: "green", icon: <FiCheckCircle /> },
  ];

  if (isAdmin) {
    return <AdminTicketManagementPage />;
  }

  return (
    <div className="container page ticket-hub-page">
      <div className="dashboard-stack ticket-hub-shell">
        <section className="ticket-hero">
          <div>
            <p className="eyebrow">{isTechnician ? "Technician Workspace" : "Smart Campus Support"}</p>
            <h1>{isTechnician ? "Assigned ticket queue" : "Student incident ticket system"}</h1>
            <p className="page-subtitle ticket-hero-copy">
              {isTechnician
                ? "Track assigned support work, update progress, and record clear resolution notes from one workspace."
                : "Stay on top of reports, create new issues quickly, and follow every update from one responsive workspace."}
            </p>
          </div>
        </section>

        <section className="ticket-hub-nav" aria-label="Ticket sections">
          <button
            type="button"
            className={`ticket-hub-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => handleTabChange("overview")}
          >
            Overview
          </button>
          {!isTechnician ? (
            <button
              type="button"
              className={`ticket-hub-tab ${activeTab === "new" ? "active" : ""}`}
              onClick={() => handleTabChange("new")}
            >
              New Ticket
            </button>
          ) : null}
          <button
            type="button"
            className={`ticket-hub-tab ${activeTab === (isTechnician ? "assigned" : "my") ? "active" : ""}`}
            onClick={() => handleTabChange(isTechnician ? "assigned" : "my")}
          >
            {isTechnician ? "Assigned Tickets" : "My Tickets"}
          </button>
        </section>

        {activeTab === "overview" ? (
          <div className="dashboard-stack">
            <section className="dashboard-grid ticket-summary-grid">
              {dashboardCards.map((card) => (
                <article key={card.key} className={`card ticket-summary-card ticket-accent-${card.accent}`}>
                  <div className="ticket-summary-icon" aria-hidden="true">
                    {card.icon}
                  </div>
                  <div>
                    <p className="eyebrow">{card.label}</p>
                    <h2>{card.value}</h2>
                  </div>
                </article>
              ))}
            </section>

            <section className="ticket-overview-grid">
              <article className="card ticket-overview-panel">
                <div className="ticket-list-header">
                  <div>
                    <p className="eyebrow">{isTechnician ? "Technician Overview" : "Student Overview"}</p>
                    <h2>{isTechnician ? "Assigned support activity" : "Your support activity"}</h2>
                    <p className="page-subtitle">
                      {isTechnician
                        ? "Monitor the tickets assigned to you and keep resolution progress current."
                        : "Monitor how quickly requests are moving through the support workflow."}
                    </p>
                  </div>
                </div>
                <div className="ticket-insight-grid">
                  <div className="ticket-insight-card">
                    <span className="ticket-insight-label">{isTechnician ? "Latest assignment" : "Latest request"}</span>
                    <strong>{recentTickets[0]?.title || "No tickets yet"}</strong>
                    <p>
                      {recentTickets[0]?.status?.replaceAll("_", " ") ||
                        (isTechnician ? "No assigned tickets yet" : "Create your first incident report")}
                    </p>
                  </div>
                  <div className="ticket-insight-card">
                    <span className="ticket-insight-label">Response health</span>
                    <strong>{stats.open + stats.inProgress}</strong>
                    <p>Active tickets currently awaiting support progress.</p>
                  </div>
                  <div className="ticket-insight-card">
                    <span className="ticket-insight-label">Resolved outcomes</span>
                    <strong>{stats.resolved}</strong>
                    <p>Tickets marked resolved and ready for final confirmation.</p>
                  </div>
                </div>
              </article>

              <article className="card ticket-overview-panel ticket-cta-panel">
                <p className="eyebrow">Quick Action</p>
                <h2>{isTechnician ? "Ready for the queue?" : "Need help right now?"}</h2>
                <p className="page-subtitle">
                  {isTechnician
                    ? "Open your assigned list to update progress, resolve completed work, and add resolution notes."
                    : "Open a new support ticket with details, location, contact information, and image evidence in a few steps."}
                </p>
                <button className="btn btn-primary" onClick={() => handleTabChange(isTechnician ? "assigned" : "new")}>
                  {isTechnician ? "Open Assigned Tickets" : "Create Ticket"}
                </button>
              </article>
            </section>

            <TicketList
              tickets={recentTickets}
              loading={loading}
              error={error}
              title={isTechnician ? "Recently Assigned Tickets" : "Recent Tickets"}
              subtitle={
                isTechnician
                  ? "Your latest assigned incidents with status and priority at a glance."
                  : "Your latest incident submissions with status and priority at a glance."
              }
              emptyTitle={isTechnician ? "No assigned tickets yet" : "No student tickets yet"}
              emptySubtitle={
                isTechnician
                  ? "Tickets assigned by an administrator will appear here."
                  : "Your submitted tickets will appear here as soon as you create one."
              }
              actionLabel={isTechnician ? null : "Create Your First Ticket"}
              showCreatedBy={false}
            />
          </div>
        ) : null}

        {activeTab === "new" ? (
          <TicketForm onCreated={handleTicketCreated} />
        ) : null}

        {activeTab === "my" || activeTab === "assigned" ? (
          <TicketList
            tickets={myTickets}
            loading={loading}
            error={error}
            title={isTechnician ? "Assigned Tickets" : "My Tickets"}
            subtitle={
              isTechnician
                ? "A focused view of tickets assigned to your technician account."
                : "A focused view of tickets reported from your account."
            }
            emptyTitle={isTechnician ? "No tickets assigned to you" : "You have not submitted any tickets"}
            emptySubtitle={
              isTechnician
                ? "An administrator can assign tickets to you from the ticket management hub."
                : "Once you report an incident, you can track it here with status, priority, and submission time."
            }
            actionLabel={isTechnician ? null : "Submit a Ticket"}
            showCreatedBy={false}
          />
        ) : null}
      </div>
    </div>
  );
}

export default TicketListPage;
