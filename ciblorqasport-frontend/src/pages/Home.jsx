import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.roles[0]) {
    case "ROLE_USER": // Spectateur
      return <Navigate to="/spectator" replace />;
    case "ROLE_ATHLETE":
      return <Navigate to="/athlete" replace />;
    case "ROLE_COMMISSAIRE":
      return <Navigate to="/commissaire" replace />;
    case "ROLE_VOLUNTEER":
      return <Navigate to="/volunteer" replace />;
    case "ROLE_ADMIN":
      return <Navigate to="/admin" replace />;
    default:
      return <div>Bienvenue sur CiblOrgaSport !</div>;
  }
}
