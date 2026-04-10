import { useEffect, useMemo, useState } from "react";
import DateInput from "../components/atoms/DateInput.jsx";
import { apiFetch } from "../api/apiFetch";

const money = (n, currency = "EUR") => {
    try { return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(Number(n ?? 0)); }
    catch { return `${Number(n ?? 0).toFixed(2)} ${currency}`; }
};

const EXPENSE_CATEGORIES = ["GROCERIES", "TRANSPORT", "RENT", "BILLS", "SUBSCRIPTIONS", "SAVINGS", "OTHER"];
const INCOME_TYPES = ["SALARY", "ALLOWANCE", "FREELANCE", "GIFT", "SALE", "OTHER"];

export default function TransactionsPage() {
    const { userId, userRole } = useMemo(() => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            return { userId: u.id ?? u.userId ?? null, userRole: u.role };
        } catch { return { userId: null, userRole: null }; }
    }, []);

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState("all");
    const [currency, setCurrency] = useState("EUR");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [form, setForm] = useState({
        type: "expense",
        category: "GROCERIES",
        customCategory: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get("type");
        if (t === "expense" || t === "income") {
            setForm(prev => ({ ...prev, type: t, category: t === "income" ? "SALARY" : "GROCERIES" }));
            setShowForm(true);
        }
    }, []);

    useEffect(() => {
        if (!userId) { setLoading(false); return; }
        loadTransactions();
        apiFetch(`/api/financial/${userId}`).then(r => r.ok ? r.json() : null).then(d => { if (d?.currency) setCurrency(d.currency); }).catch(() => {});
    }, [userId]);

    const loadTransactions = async () => {
        try {
            const res = await apiFetch(`/api/transactions/user/${userId}`);
            setTransactions(res.ok ? await res.json() : []);
        } catch { setTransactions([]); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!form.amount || Number(form.amount) <= 0) { setMessage({ type: "error", text: "Enter a valid amount." }); return; }
        setSaving(true);
        setMessage({ type: "", text: "" });
        try {
            const finalCategory = (form.category === "OTHER" && form.customCategory.trim())
                ? form.customCategory.trim()
                : form.category;

            const res = await apiFetch(`/api/transactions/user/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    type: form.type.toUpperCase(),
                    category: finalCategory,
                    amount: Number(form.amount),
                    description: form.description.trim() || null,
                    date: form.date,
                }),
            });
            if (res.ok) {
                const created = await res.json();
                setTransactions(prev => [created, ...prev]);
                setMessage({ type: "success", text: "✅ Saved!" });
                setForm({ type: "expense", category: "GROCERIES", customCategory: "", amount: "", description: "", date: new Date().toISOString().split("T")[0] });
                setShowForm(false);
            } else {
                setMessage({ type: "error", text: "❌ Failed to save transaction." });
            }
        } catch { setMessage({ type: "error", text: "❌ Network error." }); }
        finally { setSaving(false); }
    };

    const categories = form.type === "income" ? INCOME_TYPES : EXPENSE_CATEGORIES;
    const filtered = transactions.filter(t => filter === "all" || t.type?.toLowerCase() === filter);
    const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + Number(t.amount ?? 0), 0);
    const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount ?? 0), 0);
    const net = totalIncome - totalExpense;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Transactions</h1>
                    <p className="text-sm text-slate-600">Track income and expenses.{userRole === "CHILD" ? " (Your transactions only)" : ""}</p>
                </div>
                <button className="rounded-lg bg-wine text-white px-4 py-2 text-sm font-medium hover:bg-wineDark transition" onClick={() => setShowForm(v => !v)}>
                    {showForm ? "✕ Cancel" : "+ Add transaction"}
                </button>
            </div>

            
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border bg-green-50 p-4"><div className="text-xs text-green-600">Income</div><div className="text-xl font-semibold text-green-800 mt-1">+{money(totalIncome, currency)}</div></div>
                <div className="rounded-xl border bg-red-50 p-4"><div className="text-xs text-red-600">Expenses</div><div className="text-xl font-semibold text-red-800 mt-1">-{money(totalExpense, currency)}</div></div>
                <div className={`rounded-xl border p-4 ${net >= 0 ? "bg-blue-50" : "bg-amber-50"}`}><div className={`text-xs ${net >= 0 ? "text-blue-600" : "text-amber-600"}`}>Net</div><div className={`text-xl font-semibold mt-1 ${net >= 0 ? "text-blue-800" : "text-amber-800"}`}>{net >= 0 ? "+" : ""}{money(net, currency)}</div></div>
            </div>

            
            {showForm && (
                <div className="rounded-xl border bg-white p-6 space-y-4">
                    <div className="font-semibold text-slate-800">New transaction</div>
                    {message.text && <div className={`rounded-lg border p-3 text-sm ${message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>{message.text}</div>}

                    
                    <div className="flex rounded-lg border overflow-hidden w-fit">
                        <button className={`px-5 py-2 text-sm font-medium transition ${form.type === "expense" ? "bg-red-500 text-white" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setForm({ ...form, type: "expense", category: "GROCERIES", customCategory: "" })}>− Expense</button>
                        <button className={`px-5 py-2 text-sm font-medium transition ${form.type === "income" ? "bg-green-500 text-white" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setForm({ ...form, type: "income", category: "SALARY", customCategory: "" })}>+ Income</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Category</label>
                            <select className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine" value={form.category} onChange={e => setForm({ ...form, category: e.target.value, customCategory: "" })}>
                                {categories.map(c => <option key={c} value={c}>{c === "OTHER" ? "Other (custom)" : c}</option>)}
                            </select>
                        </div>

                        
                        {form.category === "OTHER" && (
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Describe it</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine"
                                    value={form.customCategory}
                                    onChange={e => setForm({ ...form, customCategory: e.target.value })}
                                    placeholder={form.type === "income" ? "e.g. Sold laptop" : "e.g. Dentist"}
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Amount ({currency})</label>
                            <input type="number" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" min="0" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Date</label>
                            <DateInput value={form.date} onChange={(iso) => setForm({ ...form, date: iso })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Note (optional)</label>
                            <input type="text" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional note" />
                        </div>
                    </div>
                    <button className="rounded-lg bg-wine text-white px-6 py-2 text-sm font-medium hover:bg-wineDark disabled:opacity-50 transition" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save transaction"}
                    </button>
                </div>
            )}

            
            <div className="flex gap-2">
                {["all", "income", "expense"].map(f => (
                    <button key={f} className={`rounded-full px-4 py-1.5 text-sm font-medium transition capitalize ${filter === f ? "bg-wine text-white" : "bg-white border text-slate-600 hover:bg-slate-50"}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
            </div>

            
            <div className="rounded-xl border bg-white overflow-hidden">
                {loading ? <div className="p-6 text-center text-slate-500">Loading...</div> :
                    filtered.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="text-3xl mb-2">💳</div>
                            <p className="text-slate-500">No transactions yet.</p>
                            <button className="mt-2 text-sm text-wine hover:underline" onClick={() => setShowForm(true)}>Add your first →</button>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filtered.map((t, i) => {
                                const isIncome = t.type === "INCOME";
                                return (
                                    <div key={t.id ?? i} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold ${isIncome ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{isIncome ? "↑" : "↓"}</div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-800">{t.description || t.category}</div>
                                                <div className="text-xs text-slate-400">{t.date} · {t.category}</div>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-semibold ${isIncome ? "text-green-600" : "text-red-500"}`}>{isIncome ? "+" : "−"}{money(t.amount, currency)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
            </div>
        </div>
    );
}