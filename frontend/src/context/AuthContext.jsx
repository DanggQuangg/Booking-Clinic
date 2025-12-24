import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

const AuthContext = createContext(null);
const LS_KEY = "cb_user";

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
    persist(res.data); // {fullName, phone, email, token}
    return res.data;
  };

  const register = async ({ fullName, phone, email, password }) => {
    const res = await http.post("/api/auth/register", { fullName, phone, email, password });
    persist(res.data);
    return res.data;
  };
  const updateLocalUser = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const logout = () => persist(null);

  const value = useMemo(() => ({ user, login, register, logout, updateLocalUser }), [user]);
  

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
