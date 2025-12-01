import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../routes/ProtectedRoute";

import Header from "../components/Header";


import Login from "../pages/Login";
import Events from "../pages/Events";
import EventDetail from "../pages/EventDetail";
import Notifications from "../pages/Notifications";
import Profile from "../pages/Profile";
import Tickets from "../pages/Tickets";
import SecurityAlerts from "../pages/SecurityAlerts";
import MapView from "../components/MapView";

import SpectatorDashboard from "../pages/roles/SpectatorDashboard";
import AthleteDashboard from "../pages/roles/AthleteDashboard";
import CommissairePanel from "../pages/roles/CommissairePanel";
import VolunteerSchedule from "../pages/roles/VolunteerSchedule";
import AdminPanel from "../pages/roles/AdminPanel";

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/map" element={<MapView />} />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute allowedRoles={["spectator"]}>
                <Tickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security"
            element={
              <ProtectedRoute>
                <SecurityAlerts />
              </ProtectedRoute>
            }
          />

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
