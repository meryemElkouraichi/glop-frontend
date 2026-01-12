import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return <div className="p-6">Aucun utilisateur connecté</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Mon profil</h2>

      <p><strong>Identifiant :</strong> {user.email}</p>
      <p><strong>Prénom :</strong> {user.prenom}</p>
      <p><strong>Nom :</strong> {user.nom}</p>
      <p><strong>Rôles :</strong> {user.roles.join(", ")}</p>

      <p className="mt-3 text-sm text-gray-500">
        Vos informations personnelles sont traitées conformément au RGPD.
        Vous pouvez à tout moment consulter et gérer vos préférences de confidentialité.
      </p>
    </div>
  );
}
