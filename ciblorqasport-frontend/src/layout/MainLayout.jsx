// src/layout/MainLayout.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "../components/Header";
import ProtectedRoute from "../routes/ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Events from "../pages/Events";
import EventDetail from "../pages/EventDetail";
import MapView from "../components/MapView";
import SecurityAlerts from "../pages/SecurityAlerts";
import Profile from "../pages/Profile";
import Notifications from "../pages/Notifications";
import Tickets from "../pages/Tickets";

// Rôles
import SpectatorDashboard from "../pages/roles/SpectatorDashboard";
import AthleteDashboard from "../pages/roles/AthleteDashboard";
import CommissairePanel from "../pages/roles/CommissairePanel";
import VolunteerSchedule from "../pages/roles/VolunteerSchedule";
import AdminPanel from "../pages/roles/AdminPanel";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/security" element={<SecurityAlerts />} />

          {/* Notifications + profil */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["spectator","athlete","commissaire","volunteer","admin"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["spectator","athlete","commissaire","volunteer","admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Spectateur */}
          <Route
            path="/tickets"
            element={
              <ProtectedRoute allowedRoles={["spectator"]}>
                <Tickets />
              </ProtectedRoute>
            }
          />

          {/* Dashboards par rôle */}
          <Route
            path="/spectator"
            element={
              <ProtectedRoute allowedRoles={["spectator"]}>
                <SpectatorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/athlete"
            element={
              <ProtectedRoute allowedRoles={["athlete"]}>
                <AthleteDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/commissaire"
            element={
              <ProtectedRoute allowedRoles={["commissaire"]}>
                <CommissairePanel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/volunteer"
            element={
              <ProtectedRoute allowedRoles={["volunteer"]}>
                <VolunteerSchedule />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
