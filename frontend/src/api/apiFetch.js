const BASE = import.meta.env.VITE_API_URL || "";

export async function apiFetch(path, options = {}) {
    const token = sessionStorage.getItem("token");
    const headers = { ...(options.headers || {}) };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE}${path}`, { ...options, headers });

    // Expired or invalid token: end the session and send the user back to login.
    if (res.status === 401 && token) {
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.assign("/login");
    }

    return res;
}
