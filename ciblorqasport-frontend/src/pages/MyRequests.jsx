import React from "react";
import { useAuth } from "../context/AuthContext";
import AthleteRequestSection from "../components/AthleteRequestSection";
import VolunteerRequestSection from "../components/VolunteerRequestSection";

export default function MyRequestsPage() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-3">Mes demandes</h2>
      <p className="mb-4">Gérez vos demandes pour devenir athlète ou volontaire depuis cette page.</p>
      <AthleteRequestSection />
      <VolunteerRequestSection />
    </div>
  );
}
