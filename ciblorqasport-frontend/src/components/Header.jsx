// src/components/Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, loginWithId, logout } = useAuth();
  const [mockId, setMockId] = useState("suzanne");

  const handleLogin = async () => {
    try {
      await loginWithId(mockId);
    } catch (e) {
      console.error(e);
      alert("Erreur de connexion mock");
    }
  };

  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white shadow mb-4">
      <div className="flex items-center space-x-4">
        <Link to="/" className="font-bold text-lg">CiblOrgaSport</Link>

        <nav className="space-x-3 text-sm">
          <Link to="/events">Événements</Link>
          <Link to="/map">Carte</Link>
          <Link to="/security">Sécurité</Link>
          {user?.role === "spectator" && <Link to="/tickets">Mes billets</Link>}
          {user?.role === "athlete" && <Link to="/athlete">Espace athlète</Link>}
          {user?.role === "commissaire" && <Link to="/commissaire">Commissaire</Link>}
          {user?.role === "volunteer" && <Link to="/volunteer">Volontaire</Link>}
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        </nav>
      </div>

      <div className="flex items-center space-x-3 text-sm">
        {user ? (
          <>
            <span>
              Connecté en tant que <strong>{user.name}</strong> ({user.role})
            </span>

            <Link to="/profile" className="underline">Profil</Link>

            <button onClick={logout} className="border px-2 py-1 rounded">
              Se déconnecter
            </button>
          </>
        ) : (
          <>
            <select
              value={mockId}
              onChange={(e) => setMockId(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="suzanne">Spectateur (Suzanne)</option>
              <option value="leon">Athlète (Léon)</option>
              <option value="arthur">Commissaire (Arthur)</option>
              <option value="hector">Volontaire (Hector)</option>
              <option value="marius">Admin (Marius)</option>
            </select>

            <button
              onClick={handleLogin}
              className="border px-2 py-1 rounded bg-blue-600 text-white"
            >
              Se connecter
            </button>
          </>
        )}
      </div>
    </header>
  );
}
