import { useEffect, useMemo, useState } from "react";
import DateInput from "../components/atoms/DateInput.jsx";
import { apiFetch } from "../api/apiFetch";
import { categoryLabel } from "../constants/labels";

const monthLabel = (m) => {
    try {
        const [y, mo] = m.split("-").map(Number);
        return new Date(y, mo - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    } catch { return m; }
};

const MONTH_NAMES = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

// <input type="month"> renders as a plain text field on Firefox/Linux (no
// native picker), so we build an equivalent month+year pair of <select>s
// that look and behave the same on every browser.
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

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
    const [totalsByCategory, setTotalsByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState("all");
    const [monthFilter, setMonthFilter] = useState(""); // "" = all months, else "2026-11"
    const [categoryFilter, setCategoryFilter] = useState(""); // "" = all categories
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
        apiFetch(`/api/financial/${userId}`).then(r => r.ok ? r.json() : null).then(d => { if (d?.currency) setCurrency(d.currency); }).catch(() => {});
    }, [userId]);

    useEffect(() => {
        if (!userId) { setLoading(false); return; }
        loadTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, monthFilter, categoryFilter]);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (monthFilter) params.set("month", monthFilter);
            if (categoryFilter) params.set("category", categoryFilter);
            const qs = params.toString();
            const res = await apiFetch(`/api/transactions/user/${userId}${qs ? `?${qs}` : ""}`);
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.transactions ?? []);
                setTotalsByCategory(data.totalsByCategory ?? {});
            } else {
                setTransactions([]);
                setTotalsByCategory({});
            }
        } catch { setTransactions([]); setTotalsByCategory({}); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!form.amount || Number(form.amount) <= 0) { setMessage({ type: "error", text: "Entrez un montant valide." }); return; }
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
                await res.json();
                await loadTransactions();
                setMessage({ type: "success", text: "✅ Enregistré !" });
                setForm({ type: "expense", category: "GROCERIES", customCategory: "", amount: "", description: "", date: new Date().toISOString().split("T")[0] });
                setShowForm(false);
            } else {
                setMessage({ type: "error", text: "❌ Échec de l'enregistrement de la transaction." });
            }
        } catch { setMessage({ type: "error", text: "❌ Erreur réseau. Veuillez réessayer." }); }
        finally { setSaving(false); }
    };

    const categories = form.type === "income" ? INCOME_TYPES : EXPENSE_CATEGORIES;
    const filtered = transactions.filter(t => filter === "all" || t.type?.toLowerCase() === filter);
    const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + Number(t.amount ?? 0), 0);
    const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount ?? 0), 0);
    const net = totalIncome - totalExpense;

    const [selectedYear, selectedMonth] = monthFilter ? monthFilter.split("-") : ["", ""];
    const buildMonthFilter = (month, year) => (month && year ? `${year}-${month}` : "");

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Transactions</h1>
                    <p className="text-sm text-slate-600">Suivez vos revenus et dépenses.{userRole === "CHILD" ? " (Vos transactions uniquement)" : ""}</p>
                </div>
                <button className="rounded-lg bg-wine text-white px-4 py-2 text-sm font-medium hover:bg-wineDark transition" onClick={() => setShowForm(v => !v)}>
                    {showForm ? "✕ Annuler" : "+ Ajouter une transaction"}
                </button>
            </div>

            
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border bg-green-50 p-4"><div className="text-xs text-green-600">Revenus</div><div className="text-xl font-semibold text-green-800 mt-1">+{money(totalIncome, currency)}</div></div>
                <div className="rounded-xl border bg-red-50 p-4"><div className="text-xs text-red-600">Dépenses</div><div className="text-xl font-semibold text-red-800 mt-1">-{money(totalExpense, currency)}</div></div>
                <div className={`rounded-xl border p-4 ${net >= 0 ? "bg-blue-50" : "bg-amber-50"}`}><div className={`text-xs ${net >= 0 ? "text-blue-600" : "text-amber-600"}`}>Solde</div><div className={`text-xl font-semibold mt-1 ${net >= 0 ? "text-blue-800" : "text-amber-800"}`}>{net >= 0 ? "+" : ""}{money(net, currency)}</div></div>
            </div>

            
            {showForm && (
                <div className="rounded-xl border bg-white p-6 space-y-4">
                    <div className="font-semibold text-slate-800">Nouvelle transaction</div>
                    {message.text && <div className={`rounded-lg border p-3 text-sm ${message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>{message.text}</div>}

                    
                    <div className="flex rounded-lg border overflow-hidden w-fit">
                        <button className={`px-5 py-2 text-sm font-medium transition ${form.type === "expense" ? "bg-red-500 text-white" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setForm({ ...form, type: "expense", category: "GROCERIES", customCategory: "" })}>− Dépense</button>
                        <button className={`px-5 py-2 text-sm font-medium transition ${form.type === "income" ? "bg-green-500 text-white" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setForm({ ...form, type: "income", category: "SALARY", customCategory: "" })}>+ Revenu</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Catégorie</label>
                            <select className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine" value={form.category} onChange={e => setForm({ ...form, category: e.target.value, customCategory: "" })}>
                                {categories.map(c => <option key={c} value={c}>{c === "OTHER" ? "Autre (personnalisée)" : categoryLabel(c)}</option>)}
                            </select>
                        </div>


                        {form.category === "OTHER" && (
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1 block">Décrivez-la</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine"
                                    value={form.customCategory}
                                    onChange={e => setForm({ ...form, customCategory: e.target.value })}
                                    placeholder={form.type === "income" ? "ex. Vente d'un ordinateur" : "ex. Dentiste"}
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Montant ({currency})</label>
                            <input type="number" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" min="0" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Date</label>
                            <DateInput value={form.date} onChange={(iso) => setForm({ ...form, date: iso })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1 block">Note (facultatif)</label>
                            <input type="text" className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Note facultative" />
                        </div>
                    </div>
                    <button className="rounded-lg bg-wine text-white px-6 py-2 text-sm font-medium hover:bg-wineDark disabled:opacity-50 transition" onClick={handleSave} disabled={saving}>
                        {saving ? "Enregistrement..." : "Enregistrer la transaction"}
                    </button>
                </div>
            )}


            <div className="flex flex-wrap items-end gap-3">
                <div className="flex gap-2">
                    {[["all", "Toutes"], ["income", "Revenus"], ["expense", "Dépenses"]].map(([f, label]) => (
                        <button key={f} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === f ? "bg-wine text-white" : "bg-white border text-slate-600 hover:bg-slate-50"}`} onClick={() => setFilter(f)}>{label}</button>
                    ))}
                </div>
                <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Mois</label>
                    <div className="flex gap-1.5">
                        <select
                            className="rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-wine"
                            value={selectedMonth}
                            onChange={e => setMonthFilter(buildMonthFilter(e.target.value, selectedYear))}
                        >
                            <option value="">Mois</option>
                            {MONTH_NAMES.map((name, i) => (
                                <option key={name} value={String(i + 1).padStart(2, "0")}>{name}</option>
                            ))}
                        </select>
                        <select
                            className="rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-wine"
                            value={selectedYear}
                            onChange={e => setMonthFilter(buildMonthFilter(selectedMonth, e.target.value))}
                        >
                            <option value="">Année</option>
                            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Catégorie</label>
                    <select className="rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-wine"
                            value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                        <option value="">Toutes les catégories</option>
                        {[...new Set([...EXPENSE_CATEGORIES, ...INCOME_TYPES])].map(c => (
                            <option key={c} value={c}>{categoryLabel(c)}</option>
                        ))}
                    </select>
                </div>
                {(monthFilter || categoryFilter) && (
                    <button className="text-sm text-wine hover:underline pb-1.5" onClick={() => { setMonthFilter(""); setCategoryFilter(""); }}>
                        Réinitialiser
                    </button>
                )}
            </div>

            {Object.keys(totalsByCategory).length > 0 && (
                <div className="rounded-xl border bg-white p-5">
                    <div className="mb-3 text-sm font-semibold text-slate-800">
                        Total par catégorie{monthFilter ? ` — ${monthLabel(monthFilter)}` : ""}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(totalsByCategory).map(([cat, total]) => (
                            <span key={cat} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                                {categoryLabel(cat)} : <strong>{money(total, currency)}</strong>
                            </span>
                        ))}
                    </div>
                </div>
            )}


            <div className="rounded-xl border bg-white overflow-hidden">
                {loading ? <div className="p-6 text-center text-slate-500">Chargement...</div> :
                    filtered.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="text-3xl mb-2">💳</div>
                            <p className="text-slate-500">Aucune transaction pour l'instant.</p>
                            <button className="mt-2 text-sm text-wine hover:underline" onClick={() => setShowForm(true)}>Ajoutez la première →</button>
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
                                                <div className="text-xs text-slate-400">{new Date(t.date + "T12:00:00").toLocaleDateString("fr-FR")} · {categoryLabel(t.category)}</div>
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