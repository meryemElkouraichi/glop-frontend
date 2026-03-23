import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  if (!user) return null;

  // Récupération du rôle principal (affiche le premier si plusieurs)
  const mainRole = user.roles && user.roles.length > 0 ? user.roles[0] : "Utilisateur";

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 scale-105 animate-fadeIn"
        style={{
          backgroundImage: "url('/home_bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.6)"
        }}
      />

      {/* Dynamic Shapes Decor */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Main Content Card */}
      <div className="relative z-10 max-w-2xl w-full mx-4 glass-card p-10 md:p-16 text-center shadow-2xl animate-slideUp">
        <div className="space-y-6">
          <div className="inline-block p-1 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 mb-4 animate-fadeIn">
            <div className="bg-white/10 rounded-full px-4 py-1">
              <span className="text-white text-sm font-medium tracking-wider uppercase">Plateforme Officielle</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">{user.prenom} {user.nom}</span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-100/90 font-light max-w-lg mx-auto leading-relaxed">
            Bienvenue sur <span className="font-bold text-white">CiblOrgaSport</span> en tant que <span className="inline-flex items-center px-3 py-1 rounded-md bg-white/10 text-white font-semibold border border-white/20">{mainRole}</span>.
          </p>

          <div className="pt-10 flex justify-center space-x-4">
            <div className="h-1 w-20 bg-gradient-to-r from-transparent to-blue-400 rounded-full" />
            <div className="h-1 w-1 bg-blue-300 rounded-full" />
            <div className="h-1 w-20 bg-gradient-to-l from-transparent to-blue-400 rounded-full" />
          </div>

          <div className="pt-6 animate-pulse">
            <p className="text-blue-200/60 text-sm italic">Utilisez le menu latéral pour naviguer dans vos fonctionnalités.</p>
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </div>
  );
}
