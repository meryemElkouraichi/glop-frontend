import axios from "axios";

const USE_MOCK = true;
const baseURL = USE_MOCK ? "/" : "http://localhost:8080/api";

export const apiClient = axios.create({ baseURL, timeout: 5000 });

const MOCK = {
  users: [
    { id: "suzanne", name: "Suzanne", role: "spectator" },
    { id: "leon", name: "Léon", role: "athlete" },
    { id: "arthur", name: "Arthur", role: "commissaire" },
    { id: "marius", name: "Marius", role: "admin" },
    { id: "hector", name: "Hector", role: "volunteer" },
  ],
  events: [
    { id: 1, title: "200m 4 nages", date: "2026-08-12", location: "Paris" },
    { id: 2, title: "Plongeon - Finale", date: "2026-08-14", location: "Dijon" },
  ],
  analytics: { dailyActive: [100, 120, 200], avgSession: 7.8 },
};

export async function apiFetch(path, opts = {}) {
  if (USE_MOCK) {
    if (path === "/auth/login") {
      const { userId } = opts.data;
      const user = MOCK.users.find((u) => u.id === userId);
      return { data: { token: "mock-" + user.id, user } };
    }
    if (path === "/events") return { data: MOCK.events };
    if (path === "/analytics") return { data: MOCK.analytics };
  } else {
    return apiClient.request({ url: path, ...opts });
  }
}