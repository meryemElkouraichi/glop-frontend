// src/layout/MainLayout.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Header from "../components/Header";
import ProtectedRoute from "../routes/ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Events from "../pages/Events";
import EventDetail from "../pages/EventDetail";
import MapView from "../components/MapView";
import SecurityAlerts from "../pages/SecurityAlerts";
import Profile from "../pages/Profile";
import Notifications from "../pages/Notifications";
import Tickets from "../pages/Tickets";

// Dashboards par rôle
import AthleteDashboard from "../pages/roles/AthleteDashboard";
import SpectatorDashboard from "../pages/roles/SpectatorDashboard";
import CommissairePanel from "../pages/roles/CommissairePanel";
import VolontaireSchedule from "../pages/roles/VolunteerSchedule";
import AdministrateurPanel from "../pages/roles/AdminPanel";

import { ROLES } from "../constants/roles";

const getMainDashboard = (roles) => {
  if (!roles) return "/home";
  if (roles.includes(ROLES.ADMIN)) return "/administrateur";
  if (roles.includes(ROLES.COMMISSAIRE)) return "/commissaire";
  if (roles.includes(ROLES.ATHLETE)) return "/athlete";
  if (roles.includes(ROLES.VOLONTAIRE)) return "/volontaire";
  return "/spectateur";
};

export default function MainLayout() {
  const { user } = useAuth();

  const allRoles = [
    ROLES.SPECTATEUR,
    ROLES.ATHLETE,
    ROLES.COMMISSAIRE,
    ROLES.VOLONTAIRE,
    ROLES.ADMIN,
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full">
        <Routes>
          {/* Route par défaut */}
          <Route
            path="/"
            element={user ? <Navigate to={getMainDashboard(user.roles)} replace /> : <Login />}
          />

          {/* Pages publiques */}
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/security" element={<SecurityAlerts />} />

          {/* Notifications et profil (tous les rôles connectés) */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={allRoles}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={allRoles}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Section Spectateur (accessible à tous les rôles) */}
          <Route
            path="/tickets"
            element={
              <ProtectedRoute allowedRoles={allRoles}>
                <Tickets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/spectateur"
            element={
              <ProtectedRoute allowedRoles={allRoles}>
                <SpectatorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Athlète */}
          <Route
            path="/athlete"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ATHLETE]}>
                <AthleteDashboard />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Commissaire */}
          <Route
            path="/commissaire"
            element={
              <ProtectedRoute allowedRoles={[ROLES.COMMISSAIRE]}>
                <CommissairePanel />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Volontaire */}
          <Route
            path="/volontaire"
            element={
              <ProtectedRoute allowedRoles={[ROLES.VOLONTAIRE]}>
                <VolontaireSchedule />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Administrateur */}
          <Route
            path="/administrateur"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdministrateurPanel />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
