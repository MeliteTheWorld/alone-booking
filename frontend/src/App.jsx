import { Navigate, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import MyBookingsPage from "./pages/MyBookingsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />} path="/">
        <Route index element={<HomePage />} />
        <Route element={<AuthPage />} path="auth" />
        <Route element={<Navigate replace to="/auth?mode=login" />} path="login" />
        <Route
          element={<Navigate replace to="/auth?mode=register" />}
          path="register"
        />
        <Route element={<ServicesPage />} path="services" />
        <Route element={<BookingPage />} path="bookings/new" />
        <Route
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
          path="my-bookings"
        />
        <Route
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
          path="profile"
        />
        <Route
          element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          }
          path="admin"
        />
        <Route
          element={<Navigate replace to="/admin?tab=bookings" />}
          path="admin/bookings"
        />
        <Route
          element={<Navigate replace to="/admin?tab=services" />}
          path="admin/services"
        />
        <Route
          element={<Navigate replace to="/admin?tab=calendar" />}
          path="admin/calendar"
        />
        <Route element={<Navigate replace to="/" />} path="home" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  );
}
