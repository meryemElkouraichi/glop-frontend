import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, login, logout } = useAuth();
  const [mockId, setMockId] = useState("suzanne");

  return (
    <header className="flex justify-between p-4 bg-white shadow">
      <div>
        <Link to="/" className="font-bold">CiblOrgaSport</Link>
        <nav className="ml-4 inline-block space-x-2">
          <Link to="/events">Événements</Link>
          {user?.role === "commissaire" && <Link to="/commissaire">Commissaire</Link>}
          {user?.role === "athlete" && <Link to="/athlete">Athlète</Link>}
          {user?.role === "volunteer" && <Link to="/volunteer">Volontaire</Link>}
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        </nav>
      </div>
      <div>
        {user ? (
          <>
            <span>{user.name} ({user.role})</span>
            <button onClick={logout} className="ml-2 btn">Déconnexion</button>
          </>
        ) : (
          <div>
            <select value={mockId} onChange={(e) => setMockId(e.target.value)}>
              <option value="suzanne">Spectateur</option>
              <option value="leon">Athlète</option>
              <option value="arthur">Commissaire</option>
              <option value="hector">Volontaire</option>
              <option value="marius">Admin</option>
            </select>
            <button onClick={() => login(mockId)} className="ml-2 btn">Se connecter</button>
          </div>
        )}
      </div>
    </header>
  );
}
