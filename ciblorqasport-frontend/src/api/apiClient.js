import axios from "axios";

const USE_MOCK = true;

export const apiClient = axios.create({
  baseURL: USE_MOCK ? "/" : "http://localhost:8080/api",
  timeout: 7000,
});

const MOCK = {
  users: [
    { id: "suzanne", name: "Suzanne", role: "spectator" },
    { id: "leon", name: "Léon", role: "athlete" },
    { id: "arthur", name: "Arthur", role: "commissaire" },
    { id: "marius", name: "Marius", role: "admin" },
    { id: "hector", name: "Hector", role: "volunteer" },
  ],

  events: [
    {
      id: 1,
      title: "200m 4 nages",
      type: "competition",
      location: { name: "Centre Aquatique Olympique - Paris" },
      date: "2026-08-12",
      time: "10:00",
    },
  ],

  notifications: [
    { id: 1, type: "result", text: "Médaille d'or sur 200m 4 nages !" },
  ],
};

export async function apiFetch(path, opts = {}) {
  if (USE_MOCK) {
    if (path === "/auth/login") {
      const { userId } = opts.data;
      const user = MOCK.users.find((u) => u.id === userId);
      if (!user) throw new Error("Utilisateur inconnu");
      return { data: { user, token: "mock-" + user.id } };
    }

    if (path === "/events") return { data: MOCK.events };
    if (path === "/notifications") return { data: MOCK.notifications };

    // Détail d'une épreuve : /events/ID
    if (path.startsWith("/events/")) {
      const idStr = path.split("/")[2];
      const event = MOCK.events.find((e) => String(e.id) === idStr);
      return { data: event || null };
    }

    // Données analytiques
    if (path === "/analytics") {
      // Retourne un objet d'analyse factice
      return {
        data: {
          dailyActive: MOCK.users.map((u) => u.name),
          avgSession: 15,
        },
      };
    }

    return { data: null };
  }

  return apiClient.request({
    url: path,
    method: opts.method || "GET",
    data: opts.data,
  });
}
