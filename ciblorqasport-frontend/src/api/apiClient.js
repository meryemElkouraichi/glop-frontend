import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 7000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper générique
export async function apiFetch(path, opts = {}) {
  return apiClient.request({
    url: path,
    method: opts.method || "GET",
    data: opts.data,
  });
}
