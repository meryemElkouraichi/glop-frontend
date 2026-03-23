import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";

const NAV_ITEMS = [
    { label: "Accueil", path: "/home", icon: "🏠", roles: null },
    { label: "Événements", path: "/events", icon: "📅", roles: null },
    { label: "Carte", path: "/map", icon: "🗺️", roles: null },
    { label: "Billets", path: "/tickets", icon: "🎫", roles: null },
];

const ROLE_ITEMS = {
    [ROLES.ADMIN]: [
        { label: "Compétitions", path: "/administrateur#competition", icon: "🏆" },
        { label: "Épreuves", path: "/administrateur#epreuve", icon: "⏱️" },
        { label: "Volontaires", path: "/administrateur#volontaire", icon: "🙋" },
        { label: "Alertes", path: "/administrateur#alerte", icon: "⚠️" },
        { label: "Cérémonies", path: "/administrateur#ceremonie", icon: "🎭" },
        { label: "Statistiques", path: "/administrateur#analytics", icon: "📊" },
    ],
    [ROLES.ATHLETE]: [
        { label: "Espace Athlète", path: "/athlete", icon: "🏃" },
    ],
    [ROLES.COMMISSAIRE]: [
        { label: "Commissaire", path: "/commissaire", icon: "⚖️" },
    ],
    [ROLES.VOLONTAIRE]: [
        { label: "Planning Volontaire", path: "/volontaire", icon: "🤝" },
    ],
};

export default function Sidebar() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    const renderLink = (item) => (
        <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
        >
            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
        </button>
    );

    return (
        <aside className="w-64 fixed inset-y-0 left-0 glass-sidebar flex flex-col z-50">
            <div className="p-6">
                <div className="flex items-center space-x-3 mb-10">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        C
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">CiblOrgaSport</span>
                </div>

                <nav className="space-y-2 sidebar-scroll overflow-y-auto max-h-[calc(100vh-160px)]">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">
                        Menu Principal
                    </div>
                    {NAV_ITEMS.map(renderLink)}

                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-8 mb-4 px-4">
                        Espace {user.roles[0]}
                    </div>
                    {user.roles.map(role => ROLE_ITEMS[role]?.map(renderLink))}

                    {user.roles.includes(ROLES.SPECTATEUR) && renderLink({ label: "Mes Demandes", path: "/mes-demandes", icon: "📝" })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-white/10">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Version Pro v1.2</p>
                    <p className="text-[10px] text-slate-600">© 2026 CiblOrgaSport</p>
                </div>
            </div>
        </aside>
    );
}
