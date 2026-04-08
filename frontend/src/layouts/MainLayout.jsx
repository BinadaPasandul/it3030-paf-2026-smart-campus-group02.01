import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function MainLayout() {
  return (
    <div className="layout-shell">
      <Navbar />
      <main className="container page">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
