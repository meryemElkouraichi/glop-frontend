import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 🔒 Header invisible tant que non connecté
  if (!user) return null;

  // Fonction pour rediriger vers le dashboard selon le rôle
  const goToDashboard = () => {
    const role = user.roles[0]; // rôle principal
    switch (role) {
      case ROLES.SPECTATEUR:
        navigate("/spectateur");
        break;
      case ROLES.ATHLETE:
        navigate("/athlete");
        break;
      case ROLES.COMMISSAIRE:
        navigate("/commissaire");
        break;
      case ROLES.VOLONTAIRE:
        navigate("/volontaire");
        break;
      case ROLES.ADMIN:
        navigate("/administrateur");
        break;
      default:
        navigate("/home");
    }
  };

  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white shadow mb-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={goToDashboard}
          className="font-bold text-lg hover:underline"
        >
          CiblOrgaSport
        </button>

        <nav className="space-x-3 text-sm">
          <button onClick={() => navigate("/events")}>Événements</button>
          <button onClick={() => navigate("/map")}>Carte</button>
          <button onClick={() => navigate("/security")}>Sécurité</button>


            <button onClick={() => navigate("/tickets")}>Mes billets</button>

          {user.roles.includes(ROLES.ATHLETE) && (
            <button onClick={() => navigate("/athlete")}>Espace athlète</button>
          )}
          {user.roles.includes(ROLES.COMMISSAIRE) && (
            <button onClick={() => navigate("/commissaire")}>Commissaire</button>
          )}
          {user.roles.includes(ROLES.VOLONTAIRE) && (
            <button onClick={() => navigate("/volontaire")}>Volontaire</button>
          )}
          {user.roles.includes(ROLES.ADMIN) && (
            <button onClick={() => navigate("/administrateur")}>Admin</button>
          )}
        </nav>
      </div>

      <div className="flex items-center space-x-3 text-sm">
        <span>
          Connecté : <strong>{user.email}</strong>
        </span>

        <button
          onClick={() => navigate("/profile")}
          className="underline"
        >
          Profil
        </button>

        <button
          onClick={logout}
          className="border px-2 py-1 rounded"
        >
          Se déconnecter
        </button>
      </div>
    </header>
  );
}
