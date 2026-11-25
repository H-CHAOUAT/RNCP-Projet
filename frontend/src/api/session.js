export function logout() {
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
}
