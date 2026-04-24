import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import CompleteProfilePage from "../features/auth/pages/CompleteProfilePage";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";
import HomePage from "../pages/HomePage";
import ProfilePage from "../features/auth/pages/ProfilePage";
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";
import CreateBookingPage from "../features/booking/pages/CreateBookingPage";
import MyBookingsPage from "../features/booking/pages/MyBookingsPage";
import AdminBookingReview from "../features/booking/pages/AdminBookingReview";
import ResourceListPage from "../features/resources/pages/ResourceListPage";
import ResourceDetailsPage from "../features/resources/pages/ResourceDetailsPage";
import AdminResourcesPage from "../features/resources/pages/AdminResourcesPage";
import TicketListPage from "../features/tickets/pages/TicketListPage";
import TicketPage from "../features/tickets/pages/TicketPage";
import TicketDetailsPage from "../features/tickets/pages/TicketDetailsPage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/" element={<ResourceListPage />} />
        <Route path="/home" element={<ResourceListPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute allowIncomplete={true} incompleteOnly={true}>
              <CompleteProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/new"
          element={
            <ProtectedRoute>
              <CreateBookingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/my"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminBookingReview />
            </ProtectedRoute>
          }
        />

        <Route path="/resources" element={<ResourceListPage />} />
        <Route path="/resources/:id" element={<ResourceDetailsPage />} />

        <Route
          path="/admin/resources"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminResourcesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <TicketListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/new"
          element={
            <ProtectedRoute>
              <TicketPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <TicketDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
