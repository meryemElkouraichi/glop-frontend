import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";

const getMainDashboard = (roles) => {
  if (roles.includes(ROLES.ADMIN)) return "/administrateur";
  if (roles.includes(ROLES.COMMISSAIRE)) return "/commissaire";
  if (roles.includes(ROLES.ATHLETE)) return "/athlete";
  if (roles.includes(ROLES.VOLONTAIRE)) return "/volontaire";
  return "/spectateur";
};

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const goToDashboard = () => {
    navigate(getMainDashboard(user.roles));
  };

  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white shadow mb-4">
      <div className="flex items-center space-x-4">
        {/* Show admin links inline in the top nav for admins */}
        <button
          onClick={goToDashboard}
          className="font-bold text-lg hover:underline"
        >
          CiblOrgaSport
        </button>

<nav className="space-x-3 text-sm">
  {user.roles.includes(ROLES.ADMIN) && (
    <>
      <button onClick={() => navigate('/administrateur#competition')}>Compétitions</button>
      <button onClick={() => navigate('/administrateur#epreuve')}>Épreuves</button>
      <button onClick={() => navigate('/administrateur#alerte')}>Alertes</button>
      <button onClick={() => navigate('/administrateur#ceremonie')}>Cérémonies</button>
      <button onClick={() => navigate('/administrateur#analytics')}>Analyses & Statistiques</button>
    </>
  )}
  {!user.roles.includes(ROLES.ADMIN) && (
    <button onClick={() => navigate("/events")}>Événements</button>
  )}
  <button onClick={() => navigate("/map")}>Carte</button>
  <button onClick={() => navigate("/tickets")}>Mes billets</button>

  {user.roles.includes(ROLES.SPECTATEUR) && (
    <button onClick={() => navigate("/mes-demandes")}>Mes demandes</button>
  )}

  {user.roles.includes(ROLES.ATHLETE) && (
    <button onClick={() => navigate("/athlete")}>Espace athlète</button>
  )}
  {user.roles.includes(ROLES.COMMISSAIRE) && (
    <button onClick={() => navigate("/commissaire")}>Demandes en attente</button>
  )}
  {user.roles.includes(ROLES.VOLONTAIRE) && (
    <button onClick={() => navigate("/volontaire")}>Volontaire</button>
  )}
  {/* Admin link removed: admins are redirected automatically to their dashboard on login */}
</nav>

      </div>

      <div className="flex items-center space-x-3 text-sm">
        <span>
          Connecté : <strong>{user.prenom} {user.nom}</strong>
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
