import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = [
    {
        value: "PARENT",
        label: "👨‍👩‍👧 Parent",
        desc: "Main account manager — full access to all budgets, goals and family members",
    },
    {
        value: "PARTNER",
        label: "🤝 Partner",
        desc: "Co-manages finances — same access as Parent, different label",
    },
    {
        value: "CHILD",
        label: "🧒 Child",
        desc: "Limited access — sees own goals and allowance only",
    },
];

export default function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "PARENT" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.firstName.trim()) { setError("First name is required."); return; }
        if (!form.email.trim())     { setError("Email is required.");       return; }
        if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                navigate("/login");
            } else {
                const text = await res.text();
                setError(text || "Registration failed. Try a different email.");
            }
        } catch { setError("Network error. Please try again."); }
        finally   { setLoading(false); }
    };

    const inp = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">First name *</label>
                    <input className={inp} value={form.firstName} onChange={set("firstName")} placeholder="Hala" required />
                </div>
                <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Last name</label>
                    <input className={inp} value={form.lastName} onChange={set("lastName")} placeholder="Chaouat" />
                </div>
            </div>

            <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Email *</label>
                <input type="email" className={inp} value={form.email} onChange={set("email")} placeholder="you@example.com" required />
            </div>

            <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Password * <span className="text-slate-400 font-normal">(min. 8 characters)</span></label>
                <input type="password" className={inp} value={form.password} onChange={set("password")} placeholder="••••••••" required />
            </div>

            <div>
                <label className="text-xs font-medium text-slate-600 mb-2 block">
                    Your role in the family *
                </label>
                <div className="space-y-2">
                    {ROLES.map(({ value, label, desc }) => (
                        <button key={value} type="button"
                                onClick={() => setForm((f) => ({ ...f, role: value }))}
                                className={`w-full text-left rounded-xl border p-3 transition ${
                                    form.role === value
                                        ? "border-wine bg-wine text-white"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-wine"
                                }`}>
                            <div className="text-sm font-semibold">{label}</div>
                            <div className={`text-xs mt-0.5 leading-tight ${form.role === value ? "text-red-100" : "text-slate-400"}`}>
                                {desc}
                            </div>
                        </button>
                    ))}
                </div>
                {form.role !== "PARENT" && (
                    <p className="mt-2 text-xs text-slate-400">
                        💡 You can join an existing family group in <strong>Settings → Family</strong> using an invite code.
                    </p>
                )}
            </div>

            <button type="submit" disabled={loading}
                    className="w-full rounded-lg bg-wine text-white font-semibold py-2 px-4 hover:bg-wineDark disabled:opacity-50 transition">
                {loading ? "Creating account..." : "Create account"}
            </button>
        </form>
    );
}
