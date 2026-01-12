import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiClient";

export const AuthContext = createContext();

const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    roles: Array.isArray(user.roles)
      ? user.roles
      : user.roles
      ? [user.roles]
      : [],
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(normalizeUser(JSON.parse(stored)));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (email, password) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      data: { email, password },
    });

    const loggedUser = normalizeUser(res.data);
    setUser(loggedUser);
    localStorage.setItem("user", JSON.stringify(loggedUser));
    return loggedUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
