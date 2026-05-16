import { BrowserRouter, Route, Routes } from "react-router-dom";

import GuestRoute from "./components/GuestRoute";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import DocumentViewer from "./pages/DocumentViewer";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PricingPage from "./pages/PricingPage";
import RegisterPage from "./pages/RegisterPage";

/**
 * Root application component.
 *
 * Route structure:
 * - /              → Landing page (public)
 * - /login         → Login (guest-only, redirects to dashboard if authed)
 * - /register      → Register (guest-only, redirects to dashboard if authed)
 * - /pricing       → Pricing page (public)
 * - /dashboard     → Document list (protected)
 * - /documents/:id → Document viewer + chat (protected)
 * - *              → 404
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Guest-only routes (redirect to dashboard if logged in) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected routes (redirect to login if not logged in) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents/:documentId" element={<DocumentViewer />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
