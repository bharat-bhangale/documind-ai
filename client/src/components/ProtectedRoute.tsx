import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "./LoadingScreen";

/**
 * Wraps routes that require authentication.
 * Redirects to /login if user is not logged in.
 * Shows a loading screen while auth state is bootstrapping.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Checking authentication…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
