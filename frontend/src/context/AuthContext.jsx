import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

const AuthContext = createContext(null);
const LS_KEY = "cb_user";

function normalizeRole(r) {
  if (!r) return undefined;
  return String(r).replace("ROLE_", "").toUpperCase();
}

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (u) => {
    setUser(u);
    if (!u) localStorage.removeItem(LS_KEY);
    else localStorage.setItem(LS_KEY, JSON.stringify(u));
  };

  const login = async ({ phone, password }) => {
    const res = await http.post("/api/auth/login", { phone, password });
    const payload = res.data;

    const jwt = payload?.token;
    const decoded = decodeJwtPayload(jwt);

    const role =
      normalizeRole(payload?.role) ||
      normalizeRole(payload?.user?.role) ||
      normalizeRole(decoded?.role) ||
      normalizeRole(decoded?.roles?.[0]) ||
      normalizeRole(decoded?.authorities?.[0]) ||
      normalizeRole(decoded?.scope);

    const userToPersist = { ...payload, role };
    persist(userToPersist);
    return userToPersist;
  };

  const register = async ({ fullName, phone, email, password }) => {
    const res = await http.post("/api/auth/register", {
      fullName,
      phone,
      email,
      password,
    });

    // Nếu backend register có trả role thì normalize luôn cho đồng bộ
    const payload = res.data;
    const role = normalizeRole(payload?.role);
    const userToPersist = { ...payload, role };

    persist(userToPersist);
    return userToPersist;
  };

  const logout = () => persist(null);

  const value = useMemo(() => ({ user, login, register, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
