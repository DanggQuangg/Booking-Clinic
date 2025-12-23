export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Lấy token theo chuẩn cb_user (fallback key token cũ nếu còn)
 */
function getToken() {
  const raw = localStorage.getItem("cb_user");
  if (raw) {
    try {
      const u = JSON.parse(raw);
      if (u?.token) return u.token;
    } catch {}
  }
  return localStorage.getItem("token");
}

async function apiFetch(path, { method = "GET", body, headers } = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    credentials: "omit",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    let msg = "";
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => null);
      msg = j?.message || j?.error || (j ? JSON.stringify(j) : "");
    } else {
      msg = await res.text().catch(() => "");
      try {
        const j = JSON.parse(msg);
        msg = j?.message || j?.error || msg;
      } catch {}
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export function apiGet(path) {
  return apiFetch(path, { method: "GET" });
}
export function apiPost(path, body) {
  return apiFetch(path, { method: "POST", body });
}
export function apiPut(path, body) {
  return apiFetch(path, { method: "PUT", body });
}
export function apiDelete(path) {
  return apiFetch(path, { method: "DELETE" });
}
