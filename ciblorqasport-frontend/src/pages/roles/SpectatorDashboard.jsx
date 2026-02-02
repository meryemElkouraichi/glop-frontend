import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // pour récupérer l'email

export default function SpectatorDashboard() {
  const { user } = useAuth(); // récupère l'utilisateur connecté

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-3">Espace Spectateur</h2>
      <p className="mb-4">
        Bienvenue sur votre espace personnel. Ici, vous pouvez :
      </p>

      <ul className="list-disc list-inside space-y-1 mb-6">
        <li>
          Consulter les <Link to="/events" className="text-blue-600">compétitions</Link> disponibles
        </li>
        <li>
          Accéder à vos <Link to="/tickets" className="text-blue-600">billets numériques</Link>
        </li>
        <li>
          Suivre les <Link to="/notifications" className="text-blue-600">résultats en direct</Link>
        </li>
        <li>
          Être alerté des <Link to="/security" className="text-blue-600">alertes de sécurité</Link>
        </li>
        <li>
          Découvrir les <Link to="/map" className="text-blue-600">fan zones</Link> et itinéraires
        </li>
      </ul>

      {/* The athlete request UI has moved to its own page accessible from the header */}
      <div className="border-t pt-4 mt-6">
        <h3 className="text-xl font-semibold mb-2">Demande pour devenir Athlète</h3>
        <p>
          Gérez vos demandes pour obtenir le statut athlète depuis la page
          {' '}
          <Link to="/mes-demandes" className="text-blue-600">Mes demandes</Link>.
        </p>
      </div>
    </div>
  );
}
