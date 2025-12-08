import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-6 text-red-600">
        Accès refusé pour le rôle <strong>{user.role}</strong>.
      </div>
    );
  }

  return children;
}
