import {
  CreditCard,
  FileText,
  LogOut,
  Menu,
  Sparkles,
  User as UserIcon,
  X
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

/**
 * Main navigation bar with responsive mobile menu.
 * Shows different links for authenticated vs guest users.
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setMobileMenuOpen(false);
    navigate("/");
  }

  function closeMobile() {
    setMobileMenuOpen(false);
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      id="main-navbar"
      className="fixed top-0 right-0 left-0 z-40 border-b border-white/8 bg-[#0a0a1a]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2"
          onClick={closeMobile}
        >
          <Sparkles className="h-5 w-5 text-cyan-400" aria-hidden="true" />
          <span className="text-lg font-bold tracking-tight">
            Docu<span className="text-cyan-400">Mind</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hide-mobile flex items-center gap-1">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" active={isActive("/dashboard")}>
                <FileText className="h-4 w-4" />
                Documents
              </NavLink>
              <NavLink to="/pricing" active={isActive("/pricing")}>
                <CreditCard className="h-4 w-4" />
                Pricing
              </NavLink>

              <div className="mx-3 h-6 w-px bg-white/10" />

              {/* User pill */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-tight">
                      {user?.name}
                    </span>
                    <span
                      className={`text-[0.625rem] font-semibold uppercase tracking-wider ${
                        user?.plan === "pro"
                          ? "text-violet-400"
                          : "text-slate-500"
                      }`}
                    >
                      {user?.plan} plan
                    </span>
                  </div>
                </div>

                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="btn-secondary px-3 py-1.5 text-xs"
                  title="Log out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/pricing" active={isActive("/pricing")}>
                Pricing
              </NavLink>
              <div className="ml-3 flex items-center gap-2">
                <Link to="/login" className="btn-secondary py-1.5 text-sm">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary py-1.5 text-sm">
                  Sign up
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle"
          className="hide-desktop rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="hide-desktop animate-fade-in border-t border-white/8 bg-[#0a0a1a]/95 px-4 pb-6 pt-4 backdrop-blur-xl">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              {/* User info */}
              <div className="mb-3 flex items-center gap-3 rounded-lg bg-white/5 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <span
                  className={`badge ml-auto ${
                    user?.plan === "pro" ? "badge-pro" : "badge-free"
                  }`}
                >
                  {user?.plan}
                </span>
              </div>

              <MobileLink
                to="/dashboard"
                onClick={closeMobile}
                icon={<FileText className="h-4 w-4" />}
              >
                Documents
              </MobileLink>
              <MobileLink
                to="/pricing"
                onClick={closeMobile}
                icon={<CreditCard className="h-4 w-4" />}
              >
                Pricing
              </MobileLink>

              <hr className="my-2 border-white/8" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <MobileLink
                to="/pricing"
                onClick={closeMobile}
                icon={<CreditCard className="h-4 w-4" />}
              >
                Pricing
              </MobileLink>

              <hr className="my-2 border-white/8" />

              <Link
                to="/login"
                onClick={closeMobile}
                className="btn-secondary w-full justify-center py-2.5"
              >
                <UserIcon className="h-4 w-4" />
                Log in
              </Link>
              <Link
                to="/register"
                onClick={closeMobile}
                className="btn-primary w-full justify-center py-2.5"
              >
                Sign up free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

/* ── Sub-components ──────────────────────── */

interface NavLinkProps {
  to: string;
  active: boolean;
  children: ReactNode;
}

function NavLink({ to, active, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-white/8 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

interface MobileLinkProps {
  to: string;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}

function MobileLink({ to, onClick, icon, children }: MobileLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
    >
      {icon}
      {children}
    </Link>
  );
}
