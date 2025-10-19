import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return <div className="p-6">Aucun utilisateur connecté</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Mon profil</h2>
      <p><strong>Nom :</strong> {user.name}</p>
      <p><strong>Rôle :</strong> {user.role}</p>
      <p><strong>Email :</strong> {user.id}@ciblorgasport.com</p>
      <p className="mt-3 text-sm text-gray-500">
        Les informations personnelles sont protégées conformément au RGPD.
      </p>
    </div>
  );
}
