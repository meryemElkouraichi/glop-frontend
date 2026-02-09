import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiClient";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    apiFetch("/notifications").then((r) => {
      if (r && Array.isArray(r.data)) {
        setNotifications(r.data);
      }
    });
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await apiFetch(`/notifications/${notificationId}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, lu: true } : n))
      );
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
    }
  };

  const getLevelStyle = (level, isLu) => {
    if (isLu) {
      return "bg-gray-100 text-gray-500";
    }
    switch (level) {
      case "CRITIQUE":
        return "bg-red-100 text-red-800";
      case "ORGANISATIONNEL":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Mes Notifications</h2>
      {notifications.length === 0 && <p className="text-gray-500">Aucune notification.</p>}
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li
            key={n.id}
            onClick={() => !n.lu && markAsRead(n.id)}
            className={`p-3 border rounded shadow-sm flex flex-col gap-1 transition-all cursor-pointer ${n.lu ? "bg-gray-50 opacity-70" : "bg-white hover:shadow-md"
              }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${getLevelStyle(n.level, n.lu)}`}>
                  {n.level}
                </span>
                {!n.lu && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    Nouveau
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(n.dateEnvoi).toLocaleString()}
              </span>
            </div>
            <p className={n.lu ? "text-gray-500" : "text-gray-900"}>{n.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
