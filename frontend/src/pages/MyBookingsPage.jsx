import { Navigate } from "react-router-dom";

export default function MyBookingsPage() {
  return <Navigate replace to="/profile?tab=bookings" />;
}
