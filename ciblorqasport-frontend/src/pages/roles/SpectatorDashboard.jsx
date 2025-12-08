import React from "react";
import { Link } from "react-router-dom";

export default function SpectatorDashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-3">Espace Spectateur</h2>
      <p className="mb-4">
        Bienvenue sur votre espace personnel. Ici, vous pouvez :
      </p>
      <ul className="list-disc list-inside space-y-1">
        <li>Consulter les <Link to="/events" className="text-blue-600">compétitions</Link> disponibles</li>
        <li>Accéder à vos <Link to="/tickets" className="text-blue-600">billets numériques</Link></li>
        <li>Suivre les <Link to="/notifications" className="text-blue-600">résultats en direct</Link></li>
        <li>Être alerté des <Link to="/security" className="text-blue-600">alertes de sécurité</Link></li>
        <li>Découvrir les <Link to="/map" className="text-blue-600">fan zones</Link> et itinéraires</li>
      </ul>
    </div>
  );
}
