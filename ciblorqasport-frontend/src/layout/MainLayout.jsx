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
import SpectatorDashboard from "../pages/roles/SpectatorDashboard";
import AthleteDashboard from "../pages/roles/AthleteDashboard";
import CommissairePanel from "../pages/roles/CommissairePanel";
import VolontaireSchedule from "../pages/roles/VolunteerSchedule";
import AdministrateurPanel from "../pages/roles/AdminPanel";

import { ROLES } from "../constants/roles";

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full">
        <Routes>
          {/* Route par défaut */}
          <Route
            path="/"
            element={
              user ? <Navigate to="/home" replace /> : <Login />
            }
          />

          {/* Public */}
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/security" element={<SecurityAlerts />} />

          {/* Notifications + profil (tous les rôles connectés) */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SPECTATEUR,
                  ROLES.ATHLETE,
                  ROLES.COMMISSAIRE,
                  ROLES.VOLONTAIRE,
                  ROLES.ADMIN,
                ]}
              >
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute
                allowedRoles={[
                  ROLES.SPECTATEUR,
                  ROLES.ATHLETE,
                  ROLES.COMMISSAIRE,
                  ROLES.VOLONTAIRE,
                  ROLES.ADMIN,
                ]}
              >
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Spectateur */}
          <Route
            path="/tickets"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SPECTATEUR]}>
                <Tickets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/spectateur"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SPECTATEUR]}>
                <SpectatorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Athlete */}
          <Route
            path="/athlete"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ATHLETE]}>
                <AthleteDashboard />
              </ProtectedRoute>
            }
          />

          {/* Commissaire */}
          <Route
            path="/commissaire"
            element={
              <ProtectedRoute allowedRoles={[ROLES.COMMISSAIRE]}>
                <CommissairePanel />
              </ProtectedRoute>
            }
          />

          {/* Volontaire */}
          <Route
            path="/volontaire"
            element={
              <ProtectedRoute allowedRoles={[ROLES.VOLONTAIRE]}>
                <VolontaireSchedule />
              </ProtectedRoute>
            }
          />

          {/* Administrateur */}
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
