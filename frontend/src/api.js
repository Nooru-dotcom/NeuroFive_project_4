const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// All requests use credentials: "include" so the httpOnly auth cookie
// set by the backend is sent automatically — the frontend never touches
// the token directly (nothing to store in localStorage, nothing an XSS
// bug could steal out of JS-accessible storage).
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

export const api = {
  signup: (name, email, password) =>
    request("/api/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),
  dashboardData: () => request("/api/dashboard-data"),
};
