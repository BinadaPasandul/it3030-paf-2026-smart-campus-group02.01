import TicketListPage from "./TicketListPage";

/**
 * TicketPage - Alias route that opens the ticket hub on the creation tab.
 */
function TicketPage() {
  return <TicketListPage defaultTab="new" />;
}

export default TicketPage;
