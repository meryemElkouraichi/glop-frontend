import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../api/apiClient";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

import { useAuth } from "../context/AuthContext";

export default function Notifications() {
  const { refreshUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const r = await apiFetch("/notifications");
      if (r && Array.isArray(r.data)) {
        setNotifications(r.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);
    client.debug = () => { };
    client.connect({}, () => {
      client.subscribe("/topic/notifications", () => {
        fetchNotifications();
      });
    });

    return () => {
      if (client) client.disconnect();
    };
  }, []);

  const markAsRead = async (notificationId) => {
    // Mise à jour optimiste (visuelle immédiate)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, lu: true } : n))
    );

    try {
      await apiFetch(`/notifications/${notificationId}/read`, { method: "PUT" });
      refreshUnreadCount(); // <-- Synchronisation immédiate avec le Header
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
      alert("Erreur technique : la notification n'a pas pu être marquée comme lue.");
      // En cas d'erreur, on rafraîchit pour revenir à l'état réel
      fetchNotifications();
    }
  };

  const getLevelStyle = (level, isLu) => {
    if (isLu) {
      return "bg-gray-200 text-gray-500";
    }
    switch (level) {
      case "CRITIQUE":
        return "bg-red-100 text-red-800 border boder-red-200";
      case "ORGANISATIONNEL":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "bg-blue-100 text-blue-800 border border-blue-200";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mes Notifications</h2>
        <span className="text-sm text-gray-500">{notifications.length} notification(s)</span>
      </div>

      {notifications.length === 0 && (
        <div className="bg-white p-10 rounded-lg text-center shadow-inner border border-dashed border-gray-300">
          <p className="text-gray-400">Aucune notification pour le moment.</p>
        </div>
      )}

      <ul className="space-y-4">
        {notifications.map((n) => (
          <li
            key={n.id}
            onClick={() => markAsRead(n.id)}
            className={`p-4 border rounded-lg shadow-sm flex flex-col gap-2 transition-all cursor-pointer relative ${n.lu
              ? "bg-gray-100 opacity-60 grayscale-[0.3]"
              : "bg-white border-l-4 border-l-blue-600 hover:shadow-lg translate-y-[-2px]"
              }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm ${getLevelStyle(n.level, n.lu)}`}>
                  {n.level}
                </span>
                {!n.lu && (
                  <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full animate-pulse" >
                    NOUVEAU
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400">
                {new Date(n.dateEnvoi).toLocaleString("en-US")}
              </span>
            </div>

            <div className={`text-sm ${n.lu ? "text-gray-500" : "text-gray-700 font-medium"} whitespace-pre-wrap`}>
              {n.message}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
