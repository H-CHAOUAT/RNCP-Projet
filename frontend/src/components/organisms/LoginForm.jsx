import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../atoms/Button";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                sessionStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                const hasSeenWelcome = localStorage.getItem(`welcome_seen_${data.user.id}`);
                if (!hasSeenWelcome) {
                    localStorage.setItem(`welcome_seen_${data.user.id}`, "1");
                    navigate("/welcome");
                } else {
                    navigate("/dashboard");
                }
            } else {
                setError(data.message || "Invalid email or password.");
            }
        } catch {
            setError("Cannot reach server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72383D]"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#72383D]"
                />
            </div>
            <Button type="submit" className="w-full bg-[#72383D] text-white hover:bg-[#5e2d31]" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
            </Button>
        </form>
    );
}
