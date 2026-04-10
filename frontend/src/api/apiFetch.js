const BASE = import.meta.env.VITE_API_URL || "";

export function apiFetch(path, options = {}) {
    const token = sessionStorage.getItem("token");
    const headers = { ...(options.headers || {}) };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(`${BASE}${path}`, { ...options, headers });
}
