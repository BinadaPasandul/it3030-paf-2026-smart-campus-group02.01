import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="layout-shell">
      <Navbar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((current) => !current)} />
      <main className={`container page app-main-content ${menuOpen ? "menu-open" : "menu-closed"}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
