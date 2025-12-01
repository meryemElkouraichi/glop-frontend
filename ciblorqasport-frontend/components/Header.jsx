import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex justify-between p-4 bg-white shadow">
      <Link to="/" className="text-xl font-bold">
        CiblOrgaSport
      </Link>

      <div>
        {user ? (
          <>
            <span className="mr-4 font-semibold">
              Bonjour, {user.username} !
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Se déconnecter
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Connexion
          </Link>
        )}
      </div>
    </header>
  );
}
