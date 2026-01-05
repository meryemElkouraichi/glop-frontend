import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !user.roles.some(role => allowedRoles.includes(role))
  ) {
    return (
      <div className="p-6 text-red-600">
        Accès refusé pour vos rôles : <strong>{user.roles.join(", ")}</strong>
      </div>
    );
  }

  return children;
}
