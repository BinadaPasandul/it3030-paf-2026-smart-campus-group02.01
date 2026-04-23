import { useDeferredValue, useEffect, useEffectEvent, useMemo, useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiShield,
  FiTool,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { getApiErrorMessage } from "../../../api/getApiErrorMessage";

const FIRST_RESPONSE_SLA_MS = 2 * 60 * 60 * 1000;
const RESOLUTION_SLA_MS = 24 * 60 * 60 * 1000;
const STATUS_OPTIONS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const PRIORITY_OPTIONS = ["ALL", "HIGH", "MEDIUM", "LOW"];

function formatStatus(status = "") {
  return status.replaceAll("_", " ");
}

function formatDuration(ms) {
  if (ms == null || Number.isNaN(ms) || ms < 0) {
    return "Not available";
  }

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function getStatusClass(status) {
  switch (status) {
    case "OPEN":
      return "status-open";
    case "IN_PROGRESS":
      return "status-progress";
    case "RESOLVED":
      return "status-resolved";
    case "REJECTED":
      return "status-rejected";
    case "CLOSED":
      return "status-closed";
    default:
      return "status-inactive";
  }
}

function getPriorityClass(priority) {
  switch (priority) {
    case "HIGH":
      return "ticket-priority-high";
    case "LOW":
      return "ticket-priority-low";
    default:
      return "ticket-priority-medium";
  }
}

function getPriorityBorderClass(priority) {
  switch (priority) {
    case "HIGH":
      return "admin-priority-border-high";
    case "LOW":
      return "admin-priority-border-low";
    default:
      return "admin-priority-border-medium";
  }
}

function getFirstResponseAt(ticket) {
  const firstResponse = ticket.comments?.find(
    (comment) => comment.createdById && comment.createdById !== ticket.createdById,
  );
  return firstResponse ? new Date(firstResponse.createdAt).getTime() : null;
}

function getResolutionAt(ticket) {
  if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
    return new Date(ticket.updatedAt).getTime();
  }

  return null;
}

function getSlaMetrics(ticket, now) {
  const createdAt = new Date(ticket.createdAt).getTime();
  const firstResponseAt = getFirstResponseAt(ticket);
  const resolutionAt = getResolutionAt(ticket);
  const liveUntil = resolutionAt || now;
  const elapsed = liveUntil - createdAt;
  const firstResponseElapsed = firstResponseAt ? firstResponseAt - createdAt : now - createdAt;
  const resolutionElapsed = resolutionAt ? resolutionAt - createdAt : now - createdAt;

  return {
    elapsed,
    firstResponseElapsed,
    resolutionElapsed,
    firstResponseDelayed: firstResponseElapsed > FIRST_RESPONSE_SLA_MS,
    resolutionDelayed: resolutionElapsed > RESOLUTION_SLA_MS,
    hasFirstResponse: Boolean(firstResponseAt),
    isResolved: Boolean(resolutionAt),
    isOverdue: !resolutionAt && now - createdAt > RESOLUTION_SLA_MS,
  };
}

function AdminTicketManagementPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [assigningTicketId, setAssigningTicketId] = useState(null);
  const [now, setNow] = useState(Date.now());
  const deferredSearch = useDeferredValue(search);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const refreshData = useEffectEvent(async () => {
    try {
      setLoading(true);
      setError("");
      const [ticketResponse, userResponse] = await Promise.all([
        api.get("/tickets"),
        api.get("/users"),
      ]);
      setTickets(ticketResponse.data || []);
      setTechnicians((userResponse.data || []).filter((user) => user.role === "TECHNICIAN" && user.active));
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load admin ticket workspace."));
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const counts = {
      total: tickets.length,
      open: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
    };

    tickets.forEach((ticket) => {
      if (ticket.status === "OPEN") counts.open += 1;
      if (ticket.status === "IN_PROGRESS") counts.inProgress += 1;
      if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") counts.resolved += 1;
      if (ticket.status === "REJECTED") counts.rejected += 1;
    });

    return counts;
  }, [tickets]);

  const slaTickets = useMemo(() => {
    return tickets.map((ticket) => ({
      ticket,
      metrics: getSlaMetrics(ticket, now),
    }));
  }, [now, tickets]);

  const delayedFirstResponse = useMemo(
    () => slaTickets.filter(({ metrics }) => !metrics.hasFirstResponse && metrics.firstResponseDelayed).length,
    [slaTickets],
  );

  const delayedResolution = useMemo(
    () => slaTickets.filter(({ metrics }) => !metrics.isResolved && metrics.resolutionDelayed).length,
    [slaTickets],
  );

  const filteredTickets = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "ALL" || ticket.priority === priorityFilter;
      const matchesSearch = !normalizedSearch || ticket.title?.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [deferredSearch, priorityFilter, statusFilter, tickets]);

  const handleAssign = async (ticketId, technicianId) => {
    if (!technicianId) return;

    try {
      setAssigningTicketId(ticketId);
      const response = await api.patch(`/tickets/${ticketId}/assign`, {
        technicianId: Number(technicianId),
      });

      setTickets((currentTickets) =>
        currentTickets.map((ticket) => (ticket.id === ticketId ? response.data : ticket)),
      );
      showToast("Technician assigned and ticket moved to in progress.");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Failed to assign technician."));
    } finally {
      setAssigningTicketId(null);
    }
  };

  const statCards = [
    { label: "Total Tickets", value: stats.total, icon: <FiShield />, accent: "indigo" },
    { label: "Open Tickets", value: stats.open, icon: <FiAlertTriangle />, accent: "red" },
    { label: "In Progress", value: stats.inProgress, icon: <FiClock />, accent: "amber" },
    { label: "Resolved", value: stats.resolved, icon: <FiCheckCircle />, accent: "green" },
    { label: "Rejected", value: stats.rejected, icon: <FiXCircle />, accent: "slate" },
  ];

  if (loading) {
    return (
      <div className="admin-ticket-page">
        <article className="card loading-card ticket-panel">
          <span className="ticket-spinner" aria-hidden="true" />
          <p className="page-subtitle">Loading admin incident command center...</p>
        </article>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-ticket-page">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-ticket-page">
      {toast ? <div className="admin-toast">{toast}</div> : null}

      <section className="admin-ticket-hero">
        <div>
          <p className="eyebrow">Admin Incident Operations</p>
          <h1>Ticket management command center</h1>
          <p className="page-subtitle">
            Monitor campus incidents, technician workloads, live SLA risk, and resolution quality from one enterprise workspace.
          </p>
        </div>
        <div className="admin-live-pill">
          <span className="admin-live-dot" />
          Live SLA timers active
        </div>
      </section>

      <nav className="admin-mini-header" aria-label="Admin ticket sections">
        {[
          ["dashboard", "Dashboard"],
          ["tickets", "All Tickets"],
          ["technicians", "Technicians"],
          ["sla", "SLA Monitor"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`admin-mini-link ${activeSection === key ? "active" : ""}`}
            onClick={() => setActiveSection(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeSection === "dashboard" ? (
        <div className="dashboard-stack">
          <section className="admin-stat-grid">
            {statCards.map((card) => (
              <article key={card.label} className={`card admin-stat-card ticket-accent-${card.accent}`}>
                <div className="ticket-summary-icon">{card.icon}</div>
                <div>
                  <p className="eyebrow">{card.label}</p>
                  <h2>{card.value}</h2>
                </div>
              </article>
            ))}
          </section>

          <section className="admin-dashboard-grid">
            <article className="card admin-sla-alert-card">
              <div className="ticket-list-header">
                <div>
                  <p className="eyebrow">SLA Alerts</p>
                  <h2>Attention required</h2>
                </div>
                <FiActivity />
              </div>
              <div className="admin-alert-list">
                <div className={delayedFirstResponse > 0 ? "admin-alert-row danger" : "admin-alert-row success"}>
                  <span>Delayed first response</span>
                  <strong>{delayedFirstResponse}</strong>
                </div>
                <div className={delayedResolution > 0 ? "admin-alert-row danger" : "admin-alert-row success"}>
                  <span>Exceeding resolution time</span>
                  <strong>{delayedResolution}</strong>
                </div>
              </div>
            </article>

            <article className="card admin-sla-alert-card">
              <div className="ticket-list-header">
                <div>
                  <p className="eyebrow">Technician Coverage</p>
                  <h2>{technicians.length} active technicians</h2>
                </div>
                <FiUsers />
              </div>
              <p className="page-subtitle">
                {tickets.filter((ticket) => ticket.assignedToId).length} tickets are assigned, and{" "}
                {tickets.filter((ticket) => !ticket.assignedToId && ticket.status !== "REJECTED").length} need ownership.
              </p>
            </article>
          </section>

          <TicketTable
            tickets={filteredTickets.slice(0, 8)}
            technicians={technicians}
            assigningTicketId={assigningTicketId}
            onAssign={handleAssign}
            onOpen={(ticketId) => navigate(`/tickets/${ticketId}`)}
            compact
          />
        </div>
      ) : null}

      {activeSection === "tickets" ? (
        <div className="dashboard-stack">
          <section className="card admin-filter-card">
            <div className="admin-search-box">
              <FiSearch />
              <input
                className="input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by ticket title..."
              />
            </div>
            <select className="input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Statuses" : formatStatus(status)}
                </option>
              ))}
            </select>
            <select className="input" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === "ALL" ? "All Priorities" : priority}
                </option>
              ))}
            </select>
          </section>

          <TicketTable
            tickets={filteredTickets}
            technicians={technicians}
            assigningTicketId={assigningTicketId}
            onAssign={handleAssign}
            onOpen={(ticketId) => navigate(`/tickets/${ticketId}`)}
          />
        </div>
      ) : null}

      {activeSection === "technicians" ? (
        <section className="admin-technician-grid">
          {technicians.length === 0 ? (
            <article className="card empty-state">
              <FiTool className="admin-empty-icon" />
              <h2>No active technicians found</h2>
              <p className="page-subtitle">Create or update technician users from the admin user area before assigning tickets.</p>
            </article>
          ) : (
            technicians.map((technician) => {
              const assignedTickets = tickets.filter((ticket) => ticket.assignedToId === technician.id);
              return (
                <article key={technician.id} className="card admin-tech-card">
                  <div className="admin-tech-avatar">{technician.fullName?.charAt(0) || "T"}</div>
                  <div>
                    <p className="eyebrow">Technician</p>
                    <h2>{technician.fullName || technician.email}</h2>
                    <p className="page-subtitle">{technician.email}</p>
                  </div>
                  <div className="admin-tech-assigned">
                    <strong>{assignedTickets.length}</strong>
                    <span>Assigned tickets</span>
                  </div>
                  <div className="admin-tech-ticket-list">
                    {assignedTickets.slice(0, 4).map((ticket) => (
                      <button key={ticket.id} type="button" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                        #{ticket.id} {ticket.title}
                      </button>
                    ))}
                    {assignedTickets.length === 0 ? <p className="page-subtitle">No tickets assigned yet.</p> : null}
                  </div>
                </article>
              );
            })
          )}
        </section>
      ) : null}

      {activeSection === "sla" ? (
        <section className="card admin-sla-monitor">
          <div className="ticket-list-header">
            <div>
              <p className="eyebrow">Innovation Feature</p>
              <h2>Real-time SLA monitoring panel</h2>
              <p className="page-subtitle">Live timers stop when tickets are resolved and highlight overdue operational risk.</p>
            </div>
          </div>

          <div className="admin-sla-list">
            {slaTickets.map(({ ticket, metrics }) => (
              <button
                key={ticket.id}
                type="button"
                className={`admin-sla-row ${metrics.isOverdue || metrics.firstResponseDelayed ? "danger" : "success"}`}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <div>
                  <p className="ticket-card-id">Ticket #{ticket.id}</p>
                  <h3>{ticket.title}</h3>
                  <span className={`status-badge ${getStatusClass(ticket.status)}`}>{formatStatus(ticket.status)}</span>
                </div>
                <div>
                  <span>Live timer</span>
                  <strong>{formatDuration(metrics.elapsed)}</strong>
                </div>
                <div>
                  <span>First response</span>
                  <strong>{metrics.hasFirstResponse ? formatDuration(metrics.firstResponseElapsed) : "Awaiting"}</strong>
                </div>
                <div>
                  <span>Resolution</span>
                  <strong>{metrics.isResolved ? formatDuration(metrics.resolutionElapsed) : formatDuration(metrics.resolutionElapsed)}</strong>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function TicketTable({ tickets, technicians, assigningTicketId, onAssign, onOpen, compact = false }) {
  return (
    <article className="card admin-ticket-table-card">
      <div className="ticket-list-header">
        <div>
          <p className="eyebrow">All Tickets Management</p>
          <h2>{compact ? "Latest operational queue" : "Ticket queue"}</h2>
        </div>
        <div className="ticket-list-meta">{tickets.length} visible</div>
      </div>

      <div className="table-wrapper">
        <table className="table admin-ticket-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Assigned Technician</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => {
              const assignedTechnicianIsVisible = technicians.some(
                (technician) => technician.id === ticket.assignedToId,
              );

              return (
                <tr key={ticket.id} className={getPriorityBorderClass(ticket.priority)}>
                  <td>
                    <button type="button" className="admin-ticket-title-button" onClick={() => onOpen(ticket.id)}>
                      <span>#{ticket.id}</span>
                      {ticket.title}
                    </button>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(ticket.status)}`}>{formatStatus(ticket.status)}</span>
                  </td>
                  <td>
                    <span className={`ticket-priority ${getPriorityClass(ticket.priority)}`}>{ticket.priority || "MEDIUM"}</span>
                  </td>
                  <td>{ticket.category || "General"}</td>
                  <td>
                    <select
                      className="input admin-table-select"
                      value={ticket.assignedToId || ""}
                      onChange={(event) => onAssign(ticket.id, event.target.value)}
                      disabled={assigningTicketId === ticket.id || technicians.length === 0}
                    >
                      <option value="">{ticket.assignedToName || "Unassigned"}</option>
                      {ticket.assignedToId && !assignedTechnicianIsVisible ? (
                        <option value={ticket.assignedToId}>{ticket.assignedToName || "Current technician"}</option>
                      ) : null}
                      {technicians.map((technician) => (
                        <option key={technician.id} value={technician.id}>
                          {technician.fullName || technician.email}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onOpen(ticket.id)}>
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <p className="page-subtitle" style={{ textAlign: "center" }}>
                    No tickets match the selected filters.
                  </p>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default AdminTicketManagementPage;
