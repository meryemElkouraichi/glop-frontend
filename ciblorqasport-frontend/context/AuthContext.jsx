import { createContext, useContext, useState } from "react";
import { apiFetch } from "../api/apiClient";

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (userId) => {
    const resp = await apiFetch("/auth/login", { method: "POST", data: { userId } });
    setUser(resp.data.user);
  };
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}