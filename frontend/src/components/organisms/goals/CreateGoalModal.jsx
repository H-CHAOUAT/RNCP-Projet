import { useMemo, useState, useEffect } from "react";
import Button from "../../atoms/Button";
import DateInput from "../../atoms/DateInput";
import { apiFetch } from "../../../api/apiFetch";

const SUGGESTIONS = [
    "Vacation", "Family Trip", "Emergency fund", "New car",
    "Home renovation", "Education", "Wedding", "New phone", "Medical fund",
];

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-wine outline-none";

const money = (n, currency = "EUR") => {
    try {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(Number(n ?? 0));
    } catch {
        return `${Number(n ?? 0).toFixed(2)} ${currency}`;
    }
};

export default function CreateGoalModal({ open, onClose, onCreated, onCreate, existingTitles = [], userId: userIdProp }) {
    const userId = useMemo(() => {
        if (userIdProp) return userIdProp;
        try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return u.id ?? u.userId ?? null; }
        catch { return null; }
    }, [userIdProp]);

    const [step,          setStep]          = useState("form"); // "form" | "plan"

    const [title,        setTitle]        = useState("");
    const [description,  setDescription]  = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [deadline,     setDeadline]     = useState("");
    const [saving,        setSaving]       = useState(false);
    const [error,         setError]        = useState("");

    // Step 2: real savings plan, fetched from the backend once the goal exists.
    const [createdGoal,      setCreatedGoal]      = useState(null);
    const [suggestions,      setSuggestions]      = useState(null);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [suggestionsError, setSuggestionsError] = useState("");
    const [chosenPlan,       setChosenPlan]       = useState(null);
    const [planSaving,       setPlanSaving]       = useState(false);
    const [planError,        setPlanError]        = useState("");

    useEffect(() => {
        if (!open) return;
        setStep("form");
        setTitle(""); setDescription(""); setTargetAmount(""); setDeadline(""); setError("");
        setCreatedGoal(null); setSuggestions(null); setSuggestionsLoading(false); setSuggestionsError("");
        setChosenPlan(null); setPlanSaving(false); setPlanError("");
    }, [open]);

    if (!open) return null;

    const fetchSuggestions = async (goalId) => {
        setSuggestionsLoading(true);
        setSuggestionsError("");
        try {
            const res = await apiFetch(`/api/goals/${goalId}/suggestions/user/${userId}`);
            if (!res.ok) {
                setSuggestionsError(await res.text());
                return;
            }
            setSuggestions(await res.json());
        } catch {
            setSuggestionsError("Network error while loading suggestions.");
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (saving) return;
        setError("");
        if (!userId)                                       { setError("No user session. Please log in again."); return; }
        if (!title.trim())                                 { setError("Please enter a goal title."); return; }
        if (!targetAmount || Number(targetAmount) <= 0)    { setError("Please enter a valid target amount."); return; }
        if (!deadline || Number.isNaN(new Date(deadline).getTime())) { setError("Please enter a valid deadline (dd/mm/yyyy)."); return; }

        setSaving(true);
        try {
            const res = await apiFetch(`/api/goals/user/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title:        title.trim(),
                    description:  description.trim() || null,
                    targetAmount: Number(targetAmount),
                    deadline,
                }),
            });
            if (!res.ok) { setError("❌ Create failed: " + await res.text()); return; }
            const created = await res.json();
            setCreatedGoal(created);
            setStep("plan");
            fetchSuggestions(created.id);
        } catch { setError("❌ Network error. Please try again."); }
        finally   { setSaving(false); }
    };

    // The goal already exists once we reach step "plan" — skipping or closing
    // from there must still hand it back to the parent, or it would be stuck
    // in the DB but missing from the list until the next full reload.
    const finishWith = (goal) => {
        onCreated?.(goal);
        onCreate?.(goal);
        onClose?.();
    };

    const handleSkip = () => finishWith(createdGoal);

    const handleClose = () => {
        if (step === "plan") { handleSkip(); return; }
        onClose?.();
    };

    const handleSavePlan = async () => {
        if (!chosenPlan || planSaving) return;
        setPlanSaving(true);
        setPlanError("");
        try {
            const res = await apiFetch(`/api/goals/${createdGoal.id}/plan/user/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    label: chosenPlan.label,
                    amountPerPayday: chosenPlan.amountPerPayday,
                }),
            });
            if (!res.ok) { setPlanError("❌ Could not save plan: " + await res.text()); return; }
            finishWith(await res.json());
        } catch { setPlanError("❌ Network error. Please try again."); }
        finally   { setPlanSaving(false); }
    };

    const available = SUGGESTIONS.filter((s) => !existingTitles.includes(s));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">

                {step === "form" && (
                    <>
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Create a goal</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Pick a suggestion or type your own.</p>
                            </div>
                            <button onClick={handleClose} className="rounded-md p-2 hover:bg-slate-100 text-slate-400">✕</button>
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Deadline *</label>
                                    <DateInput
                                        value={deadline}
                                        onChange={(iso) => setDeadline(iso)}
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <Button type="button" onClick={handleCreate} disabled={saving} className="flex-1">
                                {saving ? "Creating..." : "Create goal"}
                            </Button>
                            <button type="button" onClick={handleClose} disabled={saving}
                                    className="flex-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold py-2 px-4 hover:bg-slate-50 disabled:opacity-50 transition">
                                Cancel
                            </button>
                        </div>
                    </>
                )}

                {step === "plan" && (
                    <>
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Choose a savings plan</h2>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Based on your payday and what's left to save for "{createdGoal?.title}".
                                </p>
                            </div>
                            <button onClick={handleClose} className="rounded-md p-2 hover:bg-slate-100 text-slate-400">✕</button>
                        </div>

                        {(planError || suggestionsError) && (
                            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                                {planError || suggestionsError}
                            </div>
                        )}

                        {suggestionsLoading && (
                            <div className="text-sm text-slate-500 py-6 text-center">Loading your plan…</div>
                        )}

                        {!suggestionsLoading && suggestions && (
                            <div className="space-y-3">
                                <div className="text-xs text-slate-500">
                                    {money(suggestions.remainingAmount, suggestions.currency)} left to save,
                                    {" "}{suggestions.paydaysToDeadline} payday{suggestions.paydaysToDeadline !== 1 ? "s" : ""} to go.
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {suggestions.suggestions.map((s) => {
                                        const isSelected = chosenPlan?.label === s.label;
                                        return (
                                            <button
                                                key={s.label}
                                                type="button"
                                                onClick={() => setChosenPlan(isSelected ? null : s)}
                                                className={`rounded-lg p-3 text-left border transition hover:scale-[1.02] ${
                                                    isSelected
                                                        ? "bg-wine text-white border-wine"
                                                        : "bg-white text-slate-800 border-blue-200 hover:border-wine"
                                                }`}
                                            >
                                                <div className={`text-xs mb-1 ${isSelected ? "text-red-100" : "text-slate-500"}`}>{s.label}</div>
                                                <div className="text-base font-bold">{money(s.amountPerPayday, suggestions.currency)}/payday</div>
                                                <div className={`text-xs mt-1 ${isSelected ? "text-red-200" : "text-slate-400"}`}>{s.note}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {!suggestionsLoading && !suggestions && (
                            <p className="text-sm text-slate-500 py-2">
                                Your goal was created, but we couldn't load a savings plan right now. You can skip this for now.
                            </p>
                        )}

                        <div className="mt-6 flex gap-3">
                            <Button type="button" onClick={handleSavePlan} disabled={!chosenPlan || planSaving} className="flex-1">
                                {planSaving ? "Saving..." : "Save plan"}
                            </Button>
                            <button type="button" onClick={handleSkip} disabled={planSaving}
                                    className="flex-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold py-2 px-4 hover:bg-slate-50 disabled:opacity-50 transition">
                                Skip for now
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
