import axios from "axios";

export const http = axios.create({
  baseURL: "", // dùng Vite proxy => để rỗng
  headers: { "Content-Type": "application/json" },
});

// tự gắn token nếu có
http.interceptors.request.use((config) => {
  const raw = localStorage.getItem("cb_user");
  if (raw) {
    const u = JSON.parse(raw);
    if (u?.token) config.headers.Authorization = `Bearer ${u.token}`;
  }
  return config;
});
