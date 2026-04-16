import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-center">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth?mode=login"
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
