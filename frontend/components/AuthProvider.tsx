"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAuth, getAuth, setAuth } from "@/lib/auth";
import type { AuthResponse, UserRole } from "@/lib/types";

type Ctx = {
  auth: AuthResponse | null;
  ready: boolean;
  saveAuth: (a: AuthResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuthState] = useState<AuthResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthState(getAuth());
    setReady(true);
    const sync = () => setAuthState(getAuth());
    window.addEventListener("hasad-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hasad-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const value = useMemo<Ctx>(() => ({
    auth,
    ready,
    saveAuth(a) { setAuth(a); setAuthState(a); },
    logout() { clearAuth(); setAuthState(null); },
  }), [auth, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return {
    auth: ctx.auth,
    ready: ctx.ready,
    user: ctx.auth?.user ?? null,
    token: ctx.auth?.accessToken ?? null,
    saveAuth: ctx.saveAuth,
    logout: ctx.logout,
    hasRole: (...roles: UserRole[]) => !!ctx.auth && roles.includes(ctx.auth.user.role),
  };
}
