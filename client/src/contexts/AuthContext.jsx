import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import api from "../lib/api";

const AuthContext = createContext(null);

/**
 * Custom hook to consume auth context.
 * Throws if used outside of AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

/**
 * AuthProvider manages:
 * – user state (null = not logged in)
 * – accessToken in localStorage
 * – register / login / logout actions
 * – initial session bootstrap via GET /auth/me
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ── Bootstrap: check existing session on mount ── */
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");

        if (!cancelled) {
          setUser(data.data.user);
        }
      } catch {
        /* Token is invalid or expired — clear it silently */
        localStorage.removeItem("accessToken");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Register ─────────────────────────── */
  const register = useCallback(async ({ name, email, password }) => {
    const { data } = await api.post("/auth/register", { name, email, password });

    localStorage.setItem("accessToken", data.data.accessToken);
    setUser(data.data.user);
    toast.success("Account created successfully!");

    return data.data.user;
  }, []);

  /* ── Login ────────────────────────────── */
  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });

    localStorage.setItem("accessToken", data.data.accessToken);
    setUser(data.data.user);
    toast.success(`Welcome back, ${data.data.user.name}!`);

    return data.data.user;
  }, []);

  /* ── Logout ───────────────────────────── */
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* Ignore — we clear local state regardless */
    }

    localStorage.removeItem("accessToken");
    setUser(null);
    toast.success("Logged out successfully.");
  }, []);

  /* ── Refresh user data (e.g. after plan upgrade) ── */
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data.user);
      return data.data.user;
    } catch {
      return null;
    }
  }, []);

  /* ── Memoized value to prevent unnecessary re-renders ── */
  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      register,
      login,
      logout,
      refreshUser
    }),
    [user, isLoading, register, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
