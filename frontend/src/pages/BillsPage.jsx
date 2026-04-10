import { useEffect, useMemo, useState } from "react";
import DateInput from "../components/atoms/DateInput.jsx";
import { apiFetch } from "../api/apiFetch";

const fmtDate = (d) => {
    if (!d) return "";
    try { return new Date(d + "T12:00:00").toLocaleDateString("fr-FR"); }
    catch { return String(d); }
};

const money = (n) => {
    try { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(n ?? 0)); }
    catch { return `${Number(n ?? 0).toFixed(2)} €`; }
};

const isOverdue = (bill) =>
    bill.dueDate && !bill.paid && new Date(bill.dueDate + "T12:00:00") < new Date();

const isDueToday = (bill) => {
    if (!bill.dueDate || bill.paid) return false;
    const today = new Date().toISOString().split("T")[0];
    return bill.dueDate === today;
};

const isDueSoon = (bill) => {
    if (!bill.dueDate || bill.paid) return false;
    const diff = (new Date(bill.dueDate + "T12:00:00") - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
};

export default function BillsPage() {
    const { userId } = useMemo(() => {
        try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return { userId: u.id ?? u.userId ?? null }; }
        catch { return { userId: null }; }
    }, []);

    const [bills,      setBills]      = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [showForm,   setShowForm]   = useState(false);
    const [saving,     setSaving]     = useState(false);
    const [message,    setMessage]    = useState({ type: "", text: "" });
    const [togglingId, setTogglingId] = useState(null);
    const [form, setForm] = useState({ title: "", amount: "", dueDate: "", description: "", paid: false });

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get("new") === "1") setShowForm(true);
    }, []);

    useEffect(() => {
        if (!userId) { setLoading(false); return; }
        loadBills();
    }, [userId]);

    const loadBills = async () => {
        try {
            const res = await apiFetch(`/api/bills/user/${userId}`);
            setBills(res.ok ? await res.json() : []);
        } catch { setBills([]); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!form.title.trim()) { setMessage({ type: "error", text: "Enter a bill title." }); return; }
        if (!form.amount || Number(form.amount) <= 0) { setMessage({ type: "error", text: "Enter a valid amount." }); return; }
        setSaving(true);
        setMessage({ type: "", text: "" });
        try {
            const res = await apiFetch(`/api/bills/user/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title:       form.title.trim(),
                    amount:      Number(form.amount),
                    dueDate:     form.dueDate || null,
                    description: form.description.trim() || null,
                    paid:        form.paid,
                }),
            });
            if (res.ok) {
                const created = await res.json();
                setBills((prev) => [created, ...prev]);
                setForm({ title: "", amount: "", dueDate: "", description: "", paid: false });
                setShowForm(false);
                const msg = form.paid
                    ? `✅ Bill added and paid — ${money(form.amount)} deducted from balance.`
                    : `✅ Bill added. Balance will be updated when you mark it as paid.`;
                setMessage({ type: "success", text: msg });
            } else {
                setMessage({ type: "error", text: "❌ Failed to save." });
            }
        } catch { setMessage({ type: "error", text: "❌ Network error." }); }
        finally { setSaving(false); }
    };

    const togglePaid = async (bill) => {
        if (togglingId === bill.id) return;
        setTogglingId(bill.id);
        try {
            const res = await apiFetch(`/api/bills/${bill.id}/paid`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paid: !bill.paid }),
            });
            if (res.ok) {
                const updated = await res.json();
                setBills((prev) => prev.map((b) => b.id === bill.id ? updated : b));
                setMessage({
                    type: "success",
                    text: !bill.paid
                        ? `✅ ${bill.title} marked as paid — ${money(bill.amount)} deducted from your balance.`
                        : `↩️ ${bill.title} marked as unpaid — ${money(bill.amount)} refunded to your balance.`
                });
            } else {
                setMessage({ type: "error", text: "❌ Failed to update bill." });
            }
        } catch (e) {
            console.error("toggle paid:", e);
            setMessage({ type: "error", text: "❌ Network error." });
        } finally {
            setTogglingId(null);
        }
    };

    const unpaid = bills.filter((b) => !b.paid);
    const paid   = bills.filter((b) =>  b.paid);
    const totalUnpaid = unpaid.reduce((s, b) => s + Number(b.amount ?? 0), 0);

    const overdueBills  = bills.filter(isOverdue);
    const dueTodayBills = bills.filter(isDueToday);
    const dueSoonBills  = bills.filter(b => isDueSoon(b) && !isDueToday(b));

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-dark">Bills</h1>
                    <p className="text-sm text-dark/50">Track your upcoming and paid bills.</p>
                </div>
                <button className="rounded-lg bg-wine text-white px-4 py-2 text-sm font-medium hover:bg-wineDark transition"
                        onClick={() => { setShowForm((v) => !v); setMessage({ type: "", text: "" }); }}>
                    {showForm ? "✕ Cancel" : "+ Add bill"}
                </button>
            </div>

            
            {overdueBills.length > 0 && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4 space-y-2">
                    <div className="text-sm font-semibold text-red-800">⚠️ Overdue bills — please mark as paid</div>
                    {overdueBills.map(b => (
                        <div key={b.id} className="flex items-center justify-between text-sm">
                            <span className="text-red-700">{b.title} — due {fmtDate(b.dueDate)}</span>
                            <button onClick={() => togglePaid(b)}
                                    className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition">
                                Mark as paid ({money(b.amount)})
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {dueTodayBills.length > 0 && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2">
                    <div className="text-sm font-semibold text-amber-800">🔔 Due today — don't forget to pay</div>
                    {dueTodayBills.map(b => (
                        <div key={b.id} className="flex items-center justify-between text-sm">
                            <span className="text-amber-700">{b.title}</span>
                            <button onClick={() => togglePaid(b)}
                                    className="text-xs bg-amber-600 text-white px-3 py-1 rounded-lg hover:bg-amber-700 transition">
                                Mark as paid ({money(b.amount)})
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {dueSoonBills.length > 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="text-sm font-semibold text-blue-800">📅 Coming up in the next 3 days</div>
                    <div className="mt-1 text-xs text-blue-600">
                        {dueSoonBills.map(b => `${b.title} (${fmtDate(b.dueDate)})`).join(" · ")}
                    </div>
                </div>
            )}

            
            {message.text && !showForm && (
                <div className={`rounded-lg border p-3 text-sm ${message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                    {message.text}
                </div>
            )}

            
            {unpaid.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-amber-800">Upcoming bills</div>
                        <div className="text-xs text-amber-600">{unpaid.length} bill{unpaid.length !== 1 ? "s" : ""} pending · balance will update when paid</div>
                    </div>
                    <div className="text-xl font-semibold text-amber-800">{money(totalUnpaid)}</div>
                </div>
            )}

            
            {showForm && (
                <div className="rounded-xl border bg-white p-6 space-y-4">
                    <div>
                        <div className="font-semibold text-dark text-lg">New bill</div>
                        <p className="text-xs text-dark/40 mt-0.5">
                            Balance is only deducted when you mark a bill as paid.
                        </p>
                    </div>
                    {message.text && (
                        <div className={`rounded-lg border p-3 text-sm ${message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                            {message.text}
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-xs font-medium text-dark/60 mb-1 block">Bill title *</label>
                            <input className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine"
                                   value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                   placeholder="e.g. Electricity" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-dark/60 mb-1 block">Amount (€) *</label>
                            <input type="number" min="0"
                                   className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine"
                                   value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                   placeholder="0.00" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-dark/60 mb-1 block">Due date</label>
                            <DateInput value={form.dueDate} onChange={(iso) => setForm({ ...form, dueDate: iso })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-dark/60 mb-1 block">Description (optional)</label>
                            <input className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine"
                                   value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                   placeholder="Details..." />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-dark cursor-pointer">
                        <input type="checkbox" checked={form.paid}
                               onChange={(e) => setForm({ ...form, paid: e.target.checked })} className="rounded" />
                        Already paid (will deduct from balance immediately)
                    </label>
                    <button className="rounded-lg bg-wine text-white px-6 py-2 text-sm font-semibold hover:bg-wineDark disabled:opacity-50 transition"
                            onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Add bill"}
                    </button>
                </div>
            )}

            
            {loading ? (
                <div className="rounded-xl border bg-white p-8 text-center text-dark/40">Loading bills...</div>
            ) : bills.length === 0 ? (
                <div className="rounded-xl border bg-white p-12 text-center">
                    <div className="text-4xl mb-3">🧾</div>
                    <p className="text-dark/40">No bills yet.</p>
                    <button className="mt-2 text-sm text-wine hover:underline" onClick={() => setShowForm(true)}>Add your first bill →</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {unpaid.length > 0 && <>
                        <div className="text-xs font-semibold text-dark/40 uppercase tracking-wide">Upcoming</div>
                        {unpaid.map((b) => <BillRow key={b.id} bill={b} onToggle={togglePaid} toggling={togglingId === b.id} />)}
                    </>}
                    {paid.length > 0 && <>
                        <div className="mt-4 text-xs font-semibold text-dark/40 uppercase tracking-wide">Paid</div>
                        {paid.map((b) => <BillRow key={b.id} bill={b} onToggle={togglePaid} toggling={togglingId === b.id} />)}
                    </>}
                </div>
            )}
        </div>
    );
}

function BillRow({ bill, onToggle, toggling }) {
    const overdue = isOverdue(bill);
    const today   = isDueToday(bill);
    const soon    = isDueSoon(bill);

    return (
        <div className={`rounded-xl border bg-white p-4 flex items-center justify-between gap-4 ${bill.paid ? "opacity-60" : ""} ${overdue ? "border-red-200" : today ? "border-amber-300" : ""}`}>
            <div className="flex items-center gap-3">
                <button
                    className={`h-5 w-5 rounded-full border-2 flex-shrink-0 transition ${toggling ? "opacity-40 cursor-wait" : ""} ${bill.paid ? "bg-green-500 border-green-500" : "border-slate-300 hover:border-green-400"}`}
                    onClick={() => onToggle(bill)} disabled={toggling} title={bill.paid ? "Mark unpaid" : "Mark paid"}>
                    {bill.paid && <span className="text-white text-xs flex items-center justify-center h-full w-full leading-none">✓</span>}
                </button>
                <div>
                    <div className={`text-sm font-medium ${bill.paid ? "line-through text-dark/40" : "text-dark"}`}>{bill.title}</div>
                    {bill.description && <div className="text-xs text-dark/40">{bill.description}</div>}
                    {bill.dueDate && (
                        <div className={`text-xs mt-0.5 ${overdue ? "text-red-600 font-medium" : today ? "text-amber-600 font-medium" : soon ? "text-blue-600" : "text-dark/40"}`}>
                            {overdue ? "⚠️ Overdue · " : today ? "🔔 Due today · " : soon ? "📅 Due soon · " : "Due: "}{fmtDate(bill.dueDate)}
                        </div>
                    )}
                    {!bill.paid && (
                        <div className="text-xs text-dark/30 mt-0.5">Click ○ to mark paid — will deduct {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(bill.amount ?? 0))} from balance</div>
                    )}
                </div>
            </div>
            <div className={`text-sm font-semibold flex-shrink-0 ${bill.paid ? "text-green-600" : "text-dark"}`}>
                {bill.paid ? "+" : "-"}{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(bill.amount ?? 0))}
            </div>
        </div>
    );
}