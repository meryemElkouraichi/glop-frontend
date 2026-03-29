import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiClient";
import { ROLES } from "../constants/roles";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    prenom: "",
    nom: "",
    telephone: "",
    role: ROLES.SPECTATEUR,
    consentement: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false); // État pour la modale

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.consentement) {
      setError("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        data: form,
      });

      setSuccess("Compte créé avec succès ! Bienvenue.");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch {
      setError("Erreur lors de la création du compte. Vérifiez vos informations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 mb-12 bg-white/80 backdrop-blur-md p-8 shadow-2xl rounded-3xl border border-white/40">
      <h1 className="text-3xl font-bold mb-8 text-slate-800 font-outfit text-center">Créer un compte</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Email</label>
          <input
            type="email"
            name="email"
            placeholder="votre@email.com"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border-slate-200 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Mot de passe</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full border-slate-200 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Prénom</label>
            <input
              type="text"
              name="prenom"
              placeholder="Prénom"
              required
              value={form.prenom}
              onChange={handleChange}
              className="w-full border-slate-200 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Nom</label>
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              required
              value={form.nom}
              onChange={handleChange}
              className="w-full border-slate-200 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Téléphone</label>
          <input
            type="tel"
            name="telephone"
            placeholder="06 -- -- -- --"
            required
            value={form.telephone}
            onChange={handleChange}
            className="w-full border-slate-200 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            disabled={loading}
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center space-x-3 text-sm cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                name="consentement"
                checked={form.consentement}
                onChange={handleChange}
                disabled={loading}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:bg-blue-600 checked:border-blue-600 focus:outline-none"
              />
              <span className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <span className="text-slate-600">
              J'accepte les{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-blue-600 font-bold hover:underline"
              >
                conditions d'utilisation
              </button>
            </span>
          </label>
        </div>

        {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
        {success && <p className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-xl border border-green-100">{success}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-200 flex items-center justify-center space-x-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Création en cours...</span>
            </>
          ) : (
            "Créer mon compte"
          )}
        </button>

        <p className="text-center text-sm text-slate-500 pt-4">
          Vous avez déjà un compte ?{" "}
          <button type="button" onClick={() => navigate("/login")} className="text-blue-600 font-bold hover:underline">
            Se connecter
          </button>
        </p>
      </form>

      {/* MODALE CGU */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Conditions d'Utilisation (CGU)</h2>
              <button
                onClick={() => setShowTerms(false)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                title="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar text-slate-600 leading-relaxed text-sm space-y-4">
              <section>
                <h3 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-widest">1. Acceptation des conditions</h3>
                <p>En créant un compte sur la plateforme CiblOrgaSport, vous acceptez sans réserve les présentes conditions générales d'utilisation. Ces conditions visent à définir les modalités de mise à disposition des services du site.</p>
              </section>

              <section>
                <h3 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-widest">2. Accès au service</h3>
                <p>Le service est accessible gratuitement à tout utilisateur disposant d'un accès à internet. Tous les frais supportés par l'utilisateur pour accéder au service (matériel informatique, logiciels, connexion Internet, etc.) sont à sa charge.</p>
              </section>

              <section>
                <h3 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-widest">3. Données personnelles</h3>
                <p>Conformément au RGPD, la plateforme CiblOrgaSport s'engage à protéger la vie privée de ses utilisateurs. Les données collectées (Email, Nom, Prénom, Téléphone) sont nécessaires à la gestion des inscriptions et à la sécurité des épreuves.</p>
              </section>

              <section>
                <h3 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-widest">4. Responsabilité de l'utilisateur</h3>
                <p>L'utilisateur est responsable des risques liés à l'utilisation de son identifiant de connexion et de son mot de passe. Le mot de passe de l'utilisateur doit rester secret.</p>
              </section>

              <section>
                <h3 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-widest">5. Modification des CGU</h3>
                <p>Le site se réserve le droit de modifier les clauses des présentes conditions générales d'utilisation à tout moment et sans justification.</p>
              </section>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start space-x-3">
                <span className="text-xl">ℹ️</span>
                <p className="text-blue-800 text-xs italic">Pour toute question relative aux CGU, vous pouvez contacter le support technique via le formulaire de contact officiel.</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all shadow-md"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
