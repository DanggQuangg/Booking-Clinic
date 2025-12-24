import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function normalizeRole(r) {
  if (!r) return undefined;
  return String(r).replace("ROLE_", "").toUpperCase();
}

export default function RequireAuth({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  const role = normalizeRole(user.role);

  if (allowedRoles) {
    const allowed = allowedRoles.map(normalizeRole);
    if (!allowed.includes(role)) return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}
