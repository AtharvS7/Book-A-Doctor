import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Shared axios instance. Injects the Bearer token from localStorage on every request.
// timeout: Render's free tier can cold-start for ~30-50s, so give the first request room.
const api = axios.create({ baseURL: API_URL, timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On auth failure, clear the session so guards redirect to login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;
