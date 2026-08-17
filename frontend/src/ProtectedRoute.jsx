import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Wrap any route element in this. Unauthenticated users are redirected
// to /login, and we remember where they were headed so we can send
// them back after they sign in.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-center">Checking your session…</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
