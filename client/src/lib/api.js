import axios from "axios";

/**
 * Axios instance pre-configured for the DocuMind backend.
 *
 * – Attaches the access token from localStorage on every request.
 * – On a 401 response, attempts a silent token refresh via /api/auth/refresh.
 * – If the refresh succeeds, retries the original request once.
 * – If the refresh fails, clears auth state and redirects to /login.
 */

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

/* ── Request interceptor ─────────────────── */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ── Response interceptor (silent refresh) ── */

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function onRefreshFailed() {
  refreshSubscribers.forEach((cb) => cb(null));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    /* Only attempt refresh for 401 errors that haven't already been retried */
    if (error.response?.status !== 401 || originalRequest._retried) {
      return Promise.reject(error);
    }

    /* Don't try to refresh if the failing request IS the refresh endpoint */
    if (originalRequest.url === "/auth/refresh") {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      /* Another refresh is already in-flight — wait for it */
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    isRefreshing = true;
    originalRequest._retried = true;

    try {
      const { data } = await api.post("/auth/refresh");
      const newToken = data.data.accessToken;

      localStorage.setItem("accessToken", newToken);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      onTokenRefreshed(newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch {
      onRefreshFailed();
      localStorage.removeItem("accessToken");

      /* Only redirect if not already on login or landing page */
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register" &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
