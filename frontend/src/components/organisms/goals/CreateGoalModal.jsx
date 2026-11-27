import { useMemo, useState, useEffect } from "react";
import Button from "../../atoms/Button";
import DateInput from "../../atoms/DateInput";
import { todayISO } from "../../../utils/date";
import { apiFetch } from "../../../api/apiFetch";

const SUGGESTIONS = [
    "Vacances", "Voyage en famille", "Fonds d'urgence", "Nouvelle voiture",
    "Rénovation", "Études", "Mariage", "Nouveau téléphone", "Fonds médical",
];

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-wine outline-none";

const money = (n, currency = "EUR") => {
    try {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(Number(n ?? 0));
    } catch {
        return `${Number(n ?? 0).toFixed(2)} ${currency}`;
    }
};

// Spells out what each plan means for the deadline, using the real amounts.
const planExplanation = (plan, remaining, months, currency) => {
    // Work in cents so that rounding errors don't add a month.
    const left = Math.round(Number(remaining) * 100);
    const monthly = Math.round(Number(plan.amountPerPayday) * 100);
    if (monthly <= 0 || months <= 0) return plan.note;

    const needed = Math.ceil(left / monthly);
    const gap = (monthly * months - left) / 100;

    if (plan.label === "Rapide") {
        const effect = needed < months
            ? `Objectif atteint en ${needed} mois, soit ${months - needed} mois avant l'échéance.`
            : `D'ici l'échéance, vous épargnez ${money(gap, currency)} de plus que nécessaire.`;
        return `20 % de plus par mois que « Dans les temps ». ${effect}`;
    }
    if (plan.label === "Souple" && gap < 0) {
        return `20 % de moins par mois que « Dans les temps ». ⚠️ Il manquera ${money(-gap, currency)} à l'échéance ; à ce rythme, il faudra ${needed} mois.`;
    }
    if (plan.label === "Dans les temps") {
        return `Objectif atteint en ${Math.min(needed, months)} mois, à l'échéance.`;
    }
    return plan.note;
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

    const fetchSuggestions = async (goalId, savedPlanLabel) => {
        setSuggestionsLoading(true);
        setSuggestionsError("");
        try {
            const res = await apiFetch(`/api/goals/${goalId}/suggestions/user/${userId}`);
            if (!res.ok) {
                setSuggestionsError(await res.text());
                return;
            }
            const data = await res.json();
            setSuggestions(data);
            // Show the plan the goal already has ("Dans les temps" by default).
            setChosenPlan(data.suggestions.find((s) => s.label === savedPlanLabel) ?? null);
        } catch {
            setSuggestionsError("Erreur réseau lors du chargement des suggestions.");
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (saving) return;
        setError("");
        if (!userId)                                       { setError("Aucune session utilisateur. Veuillez vous reconnecter."); return; }
        if (!title.trim())                                 { setError("Veuillez saisir un titre d'objectif."); return; }
        if (!targetAmount || Number(targetAmount) <= 0)    { setError("Veuillez saisir un montant cible valide."); return; }
        if (!deadline || Number.isNaN(new Date(deadline).getTime())) { setError("Veuillez saisir une date limite valide (jj/mm/aaaa)."); return; }

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
            if (!res.ok) { setError("❌ Échec de la création : " + await res.text()); return; }
            const created = await res.json();
            setCreatedGoal(created);
            setStep("plan");
            fetchSuggestions(created.id, created.planLabel);
        } catch { setError("❌ Erreur réseau. Veuillez réessayer."); }
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
            if (!res.ok) { setPlanError("❌ Impossible d'enregistrer le plan : " + await res.text()); return; }
            finishWith(await res.json());
        } catch { setPlanError("❌ Erreur réseau. Veuillez réessayer."); }
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
                                <h2 className="text-xl font-semibold text-slate-900">Créer un objectif</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Choisissez une suggestion ou écrivez la vôtre.</p>
                            </div>
                            <button onClick={handleClose} className="rounded-md p-2 hover:bg-slate-100 text-slate-400">✕</button>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
                        )}

                        <div className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Suggestions rapides</label>
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">Titre de l'objectif *</label>
                                <input className={inputCls} value={title}
                                       onChange={(e) => setTitle(e.target.value)}
                                       placeholder="ex. Vacances en Espagne (ou autre chose)" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description (facultatif)</label>
                                <input className={inputCls} value={description}
                                       onChange={(e) => setDescription(e.target.value)}
                                       placeholder="ex. Vols + hôtel pour 4" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Montant cible (€) *</label>
                                    <input type="number" min="1" className={inputCls} value={targetAmount}
                                           onChange={(e) => setTargetAmount(e.target.value)} placeholder="ex. 2000" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date limite *</label>
                                    <DateInput
                                        value={deadline}
                                        onChange={(iso) => setDeadline(iso)}
                                        min={todayISO()}
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <Button type="button" onClick={handleCreate} disabled={saving} className="flex-1">
                                {saving ? "Création..." : "Créer l'objectif"}
                            </Button>
                            <button type="button" onClick={handleClose} disabled={saving}
                                    className="flex-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold py-2 px-4 hover:bg-slate-50 disabled:opacity-50 transition">
                                Annuler
                            </button>
                        </div>
                    </>
                )}

                {step === "plan" && (
                    <>
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Choisissez un plan d'épargne</h2>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Combien mettre de côté chaque mois pour « {createdGoal?.title} » ?
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
                            <div className="text-sm text-slate-500 py-6 text-center">Chargement de votre plan…</div>
                        )}

                        {!suggestionsLoading && suggestions && (
                            <div className="space-y-3">
                                <div className="text-xs text-slate-500">
                                    {money(suggestions.remainingAmount, suggestions.currency)} à épargner,
                                    {" "}{suggestions.paydaysToDeadline} mois restant{suggestions.paydaysToDeadline !== 1 ? "s" : ""}
                                    {" "}avant le {deadline.split("-").reverse().join("/")}.
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {suggestions.suggestions.map((s) => {
                                        const isSelected = chosenPlan?.label === s.label;
                                        return (
                                            <button
                                                key={s.label}
                                                type="button"
                                                onClick={() => setChosenPlan(s)}
                                                aria-pressed={isSelected}
                                                className={`flex flex-col justify-start rounded-lg p-3 text-left border transition hover:scale-[1.02] ${
                                                    isSelected
                                                        ? "bg-wine text-white border-wine"
                                                        : "bg-white text-slate-800 border-blue-200 hover:border-wine"
                                                }`}
                                            >
                                                <div className={`text-xs mb-1 ${isSelected ? "text-red-100" : "text-slate-500"}`}>{s.label}</div>
                                                <div className="text-base font-bold">{money(s.amountPerPayday, suggestions.currency)}/mois</div>
                                                <div className={`text-xs mt-1 ${isSelected ? "text-red-100" : "text-slate-500"}`}>
                                                    {planExplanation(s, suggestions.remainingAmount, suggestions.paydaysToDeadline, suggestions.currency)}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {!suggestionsLoading && !suggestions && (
                            <p className="text-sm text-slate-500 py-2">
                                Votre objectif a été créé, mais nous n'avons pas pu charger de plan d'épargne pour l'instant. Vous pouvez fermer cette fenêtre.
                            </p>
                        )}

                        <div className="mt-6 flex gap-3">
                            <Button type="button" onClick={handleSavePlan} disabled={!chosenPlan || planSaving} className="flex-1">
                                {planSaving ? "Enregistrement..." : "Enregistrer le plan"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
