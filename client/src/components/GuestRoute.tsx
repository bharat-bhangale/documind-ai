import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "./LoadingScreen";

/**
 * Wraps routes that should only be accessible to guests (login/register).
 * Redirects to /dashboard if user is already authenticated.
 */
export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
