import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/** Renders child routes only for logged-in users (optionally admin only). */
export function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="muted">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
