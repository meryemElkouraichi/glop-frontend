import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 7000,
});

export const getWsUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  return apiUrl.replace('/api', '/ws');
};

// Helper générique
export async function apiFetch(path, opts = {}) {
  const isFormData = opts.body instanceof FormData || opts.data instanceof FormData;

  const headers = { ...(opts.headers || {}) };

  // Let the browser/axios set the correct Content-Type for FormData (with boundary).
  if (!isFormData) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  // Support 'body' as alias for 'data' for convenience
  let requestData = opts.data || opts.body;

  // Only parse if body is a string and not FormData
  if (typeof opts.body === "string" && !isFormData) {
    try {
      requestData = JSON.parse(opts.body);
    } catch (e) {
      requestData = opts.body;
    }
  }

  return apiClient.request({
    url: path,
    method: opts.method || "GET",
    data: requestData,
    headers,
    withCredentials: true, // Always send session cookies/credentials
    responseType: opts.responseType || "json", // Support blob for downloads
  });
}
