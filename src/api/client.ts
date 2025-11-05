import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL,
  timeout: 60_000
});

// Optional: simple logging in dev
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (import.meta.env.DEV) {
      console.error("API error:", e?.response?.status, e?.response?.data || e.message);
    }
    return Promise.reject(e);
  }
);

export default api;
