import { useState } from "react";
import CommissaireRequests from "./CommissaireRequests";

export default function CommissairePanel() {
  const [view, setView] = useState("home");

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-bold">Panel Commissaire</h3>

      <div className="space-x-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setView("pending")}
        >
          Demandes en attente
        </button>

        <button
          className="bg-gray-600 text-white px-4 py-2 rounded"
          onClick={() => setView("all")}
        >
          Toutes les demandes
        </button>
      </div>

      {view === "home" && (
        <p>Événements / épreuves du jour : (à compléter)</p>
      )}

      {view === "pending" && <CommissaireRequests onlyPending={true} />}

      {view === "all" && <CommissaireRequests onlyPending={false} />}
    </div>
  );
}
