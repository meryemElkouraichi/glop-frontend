import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiClient";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

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
    prenom: user.prenom,
    nom: user.nom,
    telephone: user.telephone,
    disciplines: Array.isArray(user.disciplines) ? user.disciplines : []
  };
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Initialize user synchronously from localStorage to avoid flashing
  // unauthenticated state on page refresh (which caused redirects).
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    try {
      return normalizeUser(JSON.parse(stored));
    } catch (e) {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const stompClientRef = useRef(null);

  const refreshUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await apiFetch("/notifications/count-unread");
      setUnreadCount(res.data);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshUnreadCount();

      const socket = new SockJS("http://localhost:8080/ws");
      const client = Stomp.over(socket);
      client.debug = () => { };
      client.connect({}, () => {
        client.subscribe("/topic/notifications", () => {
          refreshUnreadCount();
        });
      });
      stompClientRef.current = client;

      return () => {
        if (stompClientRef.current) stompClientRef.current.disconnect();
      };
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  // Login via Spring Security session
  const login = async (email, password) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      data: { email, password },
      credentials: "include", // ← très important pour la session
    });

    const loggedUser = normalizeUser(res.data);
    setUser(loggedUser);
    localStorage.setItem("user", JSON.stringify(loggedUser));
    return loggedUser;
  };

  const logout = async () => {
    await apiFetch("/auth/logout", {
      method: "POST",
      credentials: "include", // pour supprimer la session côté serveur
    });
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, unreadCount, refreshUnreadCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
