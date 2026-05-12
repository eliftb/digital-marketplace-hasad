import type { AuthResponse } from "./types";

const KEY = "hasad_auth";

export function getAuth(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  } catch {
    return null;
  }
}

export function setAuth(auth: AuthResponse) {
  localStorage.setItem(KEY, JSON.stringify(auth));
  window.dispatchEvent(new Event("hasad-auth"));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("hasad-auth"));
}
