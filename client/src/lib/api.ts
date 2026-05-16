import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * Axios instance pre-configured for the DocuMind backend.
 */

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

/* ── Request interceptor ─────────────────── */

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ── Response interceptor (silent refresh) ── */

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string | null) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(newToken: string | null) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function onRefreshFailed() {
  refreshSubscribers.forEach((cb) => cb(null));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retried?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

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
