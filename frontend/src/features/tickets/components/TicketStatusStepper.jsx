/**
 * TicketStatusStepper - Visualizes the lifecycle of a ticket.
 */
function TicketStatusStepper({ currentStatus }) {
  const steps = [
    { key: "OPEN", label: "Open" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "RESOLVED", label: "Resolved" },
    { key: "CLOSED", label: "Closed" },
  ];

  if (currentStatus === "REJECTED") {
    return (
      <div className="status-stepper" style={{ justifyContent: "center" }}>
        <div className="step active" style={{ color: "var(--danger)" }}>
          <div
            className="step-circle"
            style={{ borderColor: "var(--danger)", background: "var(--danger)", color: "#fff" }}
          >
            !
          </div>
          <div className="step-label" style={{ color: "var(--danger)" }}>Rejected</div>
        </div>
      </div>
    );
  }

  const currentIdx = steps.findIndex((step) => step.key === currentStatus);

  return (
    <div className="status-stepper">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;

        return (
          <div
            key={step.key}
            className={`step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
          >
            <div className="step-circle">{isCompleted ? "OK" : idx + 1}</div>
            <div className="step-label">{step.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default TicketStatusStepper;
