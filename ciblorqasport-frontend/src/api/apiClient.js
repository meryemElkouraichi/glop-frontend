import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 7000,
});

// Helper générique
export async function apiFetch(path, opts = {}) {
  const isFormData = !!opts.isFormData;

  const headers = { ...(opts.headers || {}) };

  // Let the browser/axios set the correct Content-Type for FormData (with boundary).
  if (!isFormData) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  return apiClient.request({
    url: path,
    method: opts.method || "GET",
    data: opts.data,
    headers,
    withCredentials: opts.credentials === "include",
  });
}
