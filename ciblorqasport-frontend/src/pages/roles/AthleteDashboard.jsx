import AthleteRequestSection from "../../components/AthleteRequestSection";

export default function AthleteDashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-3">Espace Athlète</h2>
      <p className="mb-4">
        Visualisez vos épreuves, résultats et lieux de rendez-vous privés.
      </p>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Mes Demandes de Disciplines</h3>
        <p className="text-sm text-gray-600 mb-6">
          En tant qu'athlète, vous pouvez postuler pour participer à de nouvelles disciplines olympiques.
        </p>
        <AthleteRequestSection />
      </div>
    </div>
  );
}
