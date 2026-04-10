import { useMemo, useState, useEffect } from "react";
import Button from "../../atoms/Button";
import DateInput from "../../atoms/DateInput";
import { apiFetch } from "../../../api/apiFetch";

const SUGGESTIONS = [
    "Vacation", "Family Trip", "Emergency fund", "New car",
    "Home renovation", "Education", "Wedding", "New phone", "Medical fund",
];

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-wine outline-none";

export default function CreateGoalModal({ open, onClose, onCreated, onCreate, existingTitles = [], userId: userIdProp }) {
    const userId = useMemo(() => {
        if (userIdProp) return userIdProp;
        try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return u.id ?? u.userId ?? null; }
        catch { return null; }
    }, [userIdProp]);

    const [title,        setTitle]        = useState("");
    const [description,  setDescription]  = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [deadline,     setDeadline]     = useState("");
    const [saving,        setSaving]       = useState(false);
    const [error,         setError]        = useState("");
    const [analysis,      setAnalysis]     = useState(null);
    const [selectedPlan,  setSelectedPlan] = useState(null);

    useEffect(() => {
        if (!open) return;
        setTitle(""); setDescription(""); setTargetAmount(""); setDeadline(""); setError(""); setAnalysis(null); setSelectedPlan(null);
    }, [open]);

    useEffect(() => {
        if (!deadline || !targetAmount || Number(targetAmount) <= 0) { setAnalysis(null); return; }
        const months = Math.max(1, Math.round((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)));
        const amt = Number(targetAmount);
        setAnalysis({
            months,
            onTime:     (amt / months).toFixed(2),
            relaxed:    (amt / (months + 2)).toFixed(2),
            aggressive: (amt / Math.max(1, months - 1)).toFixed(2),
        });
    }, [deadline, targetAmount]);

    if (!open) return null;

    const handleCreate = async () => {
        if (saving) return;
        setError("");
        if (!userId)                                       { setError("No user session. Please log in again."); return; }
        if (!title.trim())                                 { setError("Please enter a goal title."); return; }
        if (!targetAmount || Number(targetAmount) <= 0)    { setError("Please enter a valid target amount."); return; }

        setSaving(true);
        try {
            const res = await apiFetch(`/api/goals/user/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title:        title.trim(),
                    description:  description.trim() || null,
                    targetAmount: Number(targetAmount),
                    deadline:     deadline || null,
                }),
            });
            if (!res.ok) { setError("❌ Create failed: " + await res.text()); return; }
            const created = await res.json();
            onCreated?.(created);
            onCreate?.(created);
            onClose?.();
        } catch { setError("❌ Network error. Please try again."); }
        finally   { setSaving(false); }
    };

    const available = SUGGESTIONS.filter((s) => !existingTitles.includes(s));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">

                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Create a goal</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Pick a suggestion or type your own.</p>
                    </div>
                    <button onClick={onClose} className="rounded-md p-2 hover:bg-slate-100 text-slate-400">✕</button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
                )}

                <div className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Quick suggestions</label>
                        <div className="flex flex-wrap gap-2">
                            {available.map((s) => (
                                <button key={s} type="button"
                                        onClick={() => setTitle(s)}
                                        className={`rounded-full border px-3 py-1 text-sm transition ${
                                            title === s
                                                ? "bg-wine text-white border-wine"
                                                : "bg-white text-slate-600 border-slate-300 hover:border-wine hover:text-wine"
                                        }`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Goal title *</label>
                        <input className={inputCls} value={title}
                               onChange={(e) => setTitle(e.target.value)}
                               placeholder="e.g. Vacation in Spain (or type anything)" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
                        <input className={inputCls} value={description}
                               onChange={(e) => setDescription(e.target.value)}
                               placeholder="e.g. Flights + hotel for 4" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Target amount (€) *</label>
                            <input type="number" min="1" className={inputCls} value={targetAmount}
                                   onChange={(e) => setTargetAmount(e.target.value)} placeholder="e.g. 2000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Deadline (optional)</label>
                            <DateInput
                                value={deadline}
                                onChange={(iso) => setDeadline(iso)}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {analysis && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
                            <div className="text-sm font-semibold text-blue-800">💡 Savings plan preview</div>
                            <div className="text-xs text-blue-600">
                                Based on your deadline ({analysis.months} month{analysis.months !== 1 ? "s" : ""} away) — click a plan to select it:
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: "Relaxed",    amount: analysis.relaxed,    sub: "May need extra later" },
                                    { label: "On time ✓",  amount: analysis.onTime,     sub: "Hits deadline"        },
                                    { label: "Aggressive", amount: analysis.aggressive, sub: "1 month early"        },
                                ].map(({ label, amount, sub }) => {
                                    const isSelected = selectedPlan === label;
                                    return (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => setSelectedPlan(isSelected ? null : label)}
                                            className={`rounded-lg p-3 text-left border transition hover:scale-[1.02] ${
                                                isSelected
                                                    ? "bg-wine text-white border-wine"
                                                    : "bg-white text-slate-800 border-blue-200 hover:border-wine"
                                            }`}
                                        >
                                            <div className={`text-xs mb-1 ${isSelected ? "text-red-100" : "text-slate-500"}`}>{label}</div>
                                            <div className="text-base font-bold">€{amount}/mo</div>
                                            <div className={`text-xs mt-1 ${isSelected ? "text-red-200" : "text-slate-400"}`}>{sub}</div>
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedPlan && (
                                <p className="text-xs text-wine font-medium">✓ Plan selected: {selectedPlan}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex gap-3">
                    <Button type="button" onClick={handleCreate} disabled={saving} className="flex-1">
                        {saving ? "Creating..." : "Create goal"}
                    </Button>
                    <button type="button" onClick={onClose} disabled={saving}
                            className="flex-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold py-2 px-4 hover:bg-slate-50 disabled:opacity-50 transition">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}