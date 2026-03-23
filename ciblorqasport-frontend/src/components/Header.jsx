import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../api/apiClient";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const getMainDashboard = (roles) => {
  if (roles.includes(ROLES.ADMIN)) return "/administrateur";
  if (roles.includes(ROLES.COMMISSAIRE)) return "/commissaire";
  if (roles.includes(ROLES.ATHLETE)) return "/athlete";
  if (roles.includes(ROLES.VOLONTAIRE)) return "/volontaire";
  return "/spectateur";
};

export default function Header() {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white/40 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
      <div>
        <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
          Tableau de Bord
        </h2>
      </div>

      <div className="flex items-center space-x-6">
        <button
          onClick={() => navigate("/notifications")}
          className="relative group p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <span className="text-xl opacity-70 group-hover:opacity-100 transition-opacity">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center space-x-3 pl-6 border-l border-slate-200">
          <div className="flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-slate-800">
              {user.prenom} {user.nom}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
              {user.roles[0]}
            </span>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold hover:bg-primary/20 transition-colors"
          >
            {user.prenom[0]}{user.nom[0]}
          </button>

          <button
            onClick={logout}
            className="p-2 ml-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Se déconnecter"
          >
            🚪
          </button>
        </div>
      </div>
    </header>
  );
}
