import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiFetch";
import { categoryLabel } from "../constants/labels";

const money = (n, currency = "EUR") => {
    try {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(Number(n ?? 0));
    } catch {
        return `${Number(n ?? 0).toFixed(2)} ${currency}`;
    }
};

export default function DashboardPage() {
    const navigate = useNavigate();

    const { userId, userName } = useMemo(() => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            return {
                userId: u.id ?? u.userId ?? null,
                userName: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
            };
        } catch {
            return { userId: null, userName: "" };
        }
    }, []);

    const [loading, setLoading] = useState(true);
    const [financial, setFinancial] = useState(null);
    const [goals, setGoals] = useState([]);
    const [bills, setBills] = useState([]);
    const [forecast, setForecast] = useState(null);
    const [salaryPending, setSalaryPending] = useState(false);
    const [confirmingSalary, setConfirmingSalary] = useState(false);
    const [goalIdx, setGoalIdx] = useState(0);

    // Step shown right after confirming salary: optionally fund goals with the
    // balance that was just topped up.
    const [contributeStep, setContributeStep] = useState(false);
    const [contribAmounts, setContribAmounts] = useState({}); // goalId -> string
    const [contributing, setContributing] = useState(false);
    const [contribError, setContribError] = useState("");

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        Promise.all([
            apiFetch(`/api/financial/${userId}`).then(r => (r.ok ? r.json() : null)),
            apiFetch(`/api/goals/user/${userId}`).then(r => (r.ok ? r.json() : [])),
            apiFetch(`/api/bills/user/${userId}`).then(r => (r.ok ? r.json() : [])),
            apiFetch(`/api/financial/${userId}/forecast`).then(r => (r.ok ? r.json() : null)),
        ])
            .then(([fin, g, b, fc]) => {
                setFinancial(fin);
                setGoals(g || []);
                setBills(b || []);
                setForecast(fc);
                setSalaryPending(fin?.salaryPendingConfirmation ?? false);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [userId]);

    const handleConfirmSalary = async () => {
        setConfirmingSalary(true);
        try {
            const res = await apiFetch(`/api/financial/${userId}/confirm-salary`, { method: "POST" });
            if (res.ok) {
                setFinancial(await res.json());
                setSalaryPending(false);

                const prefill = {};
                goals.forEach((g) => {
                    prefill[g.id] = g.planAmountPerPayday != null ? String(g.planAmountPerPayday) : "";
                });
                setContribAmounts(prefill);
                setContribError("");
                setContributeStep(true);
            }
        } catch {} finally {
            setConfirmingSalary(false);
        }
    };

    const handleDismissSalary = async () => {
        setSalaryPending(false);
        await apiFetch(`/api/financial/${userId}/dismiss-salary`, { method: "POST" }).catch(() => {});
    };

    const refreshFinancialAndGoals = async () => {
        const [fin, g] = await Promise.all([
            apiFetch(`/api/financial/${userId}`).then((r) => (r.ok ? r.json() : null)),
            apiFetch(`/api/goals/user/${userId}`).then((r) => (r.ok ? r.json() : [])),
        ]);
        setFinancial(fin);
        setGoals(g || []);
    };

    const finishContributeStep = () => {
        setContributeStep(false);
        setContribAmounts({});
        setContributing(false);
        setContribError("");
    };

    const handleConfirmContributions = async () => {
        const entries = Object.entries(contribAmounts).filter(([, v]) => Number(v) > 0);
        if (entries.length === 0) {
            finishContributeStep();
            return;
        }

        setContributing(true);
        setContribError("");
        const results = [];

        for (const [goalId, amountStr] of entries) {
            const amount = Number(amountStr);
            try {
                const res = await apiFetch(`/api/goals/${goalId}/contribute/user/${userId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount }),
                });
                if (!res.ok) {
                    results.push({ goalId, ok: false, error: await res.text() });
                    break; // stop at the first failure — further calls would likely fail too
                }
                results.push({ goalId, ok: true });
            } catch {
                results.push({ goalId, ok: false, error: "Erreur réseau" });
                break;
            }
        }

        setContributing(false);
        await refreshFinancialAndGoals(); // reflect server truth, whatever succeeded

        if (results.every((r) => r.ok)) {
            finishContributeStep();
        } else {
            const okCount = results.filter((r) => r.ok).length;
            const lastError = results[results.length - 1]?.error || "Erreur inconnue";
            setContribError(
                `Contribution effectuée pour ${okCount} objectif${okCount !== 1 ? "s" : ""} sur ${entries.length} avant qu'une erreur ne survienne : ${lastError}. Votre solde et vos objectifs reflètent ce qui a réussi.`
            );
        }
    };

    const currency = financial?.currency ?? "EUR";
    const monthlyIncome = Number(financial?.monthlyIncome ?? 0);
    const currentBalance = Number(financial?.currentBalance ?? 0);
    const lastSalaryApplied = financial?.lastSalaryApplied ?? null;
    const fixedExpenses = financial?.expenses ?? [];
    const fixedExpensesTotal = fixedExpenses.reduce((s, e) => s + Number(e.amount ?? 0), 0);
    const unpaidBillsTotal = bills.filter((b) => !b.paid).reduce((s, b) => s + Number(b.amount ?? 0), 0);
    const available = currentBalance - unpaidBillsTotal;

    const currentGoal = goals[goalIdx] ?? null;
    const goalPct =
        currentGoal?.targetAmount > 0
            ? Math.min(100, (Number(currentGoal.currentAmount ?? 0) / currentGoal.targetAmount) * 100)
            : 0;

    const contribTotal = Object.values(contribAmounts).reduce((s, v) => s + (Number(v) || 0), 0);
    const contribOverBalance = contribTotal > Number(financial?.currentBalance ?? 0);

    const overallGoalPct =
        goals.length > 0
            ? Math.round(
                goals.reduce((s, g) => {
                    const p =
                        g.targetAmount > 0
                            ? Math.min(100, (Number(g.currentAmount ?? 0) / g.targetAmount) * 100)
                            : 0;
                    return s + p;
                }, 0) / goals.length
            )
            : 0;

    if (loading) {
        return (
            <div className="p-8">
                <div className="rounded-xl border bg-white p-6 text-left">
                    <p className="text-dark/40">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 text-left">
            <div className="text-left">
                <h1 className="text-2xl font-semibold text-dark">
                    Bon retour{userName ? `, ${userName.split(" ")[0]}` : ""} ! 👋
                </h1>
                <p className="mt-1 text-sm text-dark/40">
                    {new Date().toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <StatCard
                    label="Solde total"
                    value={money(currentBalance, currency)}
                    sub={
                        lastSalaryApplied
                            ? `Salaire appliqué le ${new Date(lastSalaryApplied + "T12:00:00").toLocaleDateString("fr-FR")}`
                            : "Votre solde en temps réel"
                    }
                    color="bg-wine"
                    onClick={() => navigate("/financial?tab=overview")}
                />
                <StatCard
                    label="Dépenses mensuelles"
                    value={money(fixedExpensesTotal, currency)}
                    sub={`${fixedExpenses.length} catégories fixes`}
                    color="bg-slate-700"
                    onClick={() => navigate("/financial?tab=expenses")}
                />
                <StatCard
                    label="Disponible ce mois-ci"
                    value={money(available, currency)}
                    sub={
                        unpaidBillsTotal > 0
                            ? `Après ${money(unpaidBillsTotal, currency)} de factures impayées`
                            : "Toutes les factures sont payées ✓"
                    }
                    color={available >= 0 ? "bg-emerald-600" : "bg-red-500"}
                    onClick={() => navigate("/financial?tab=analysis")}
                />
            </div>

            {forecast && (
                <div
                    className={`cursor-pointer rounded-2xl border p-5 shadow-sm transition hover:shadow-md text-left ${
                        forecast.atRisk
                            ? "border-red-300 bg-red-50"
                            : forecast.belowThreshold
                                ? "border-amber-300 bg-amber-50"
                                : "bg-white"
                    }`}
                    onClick={() => navigate("/financial?tab=overview", { state: { highlightField: "alertThreshold" } })}
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <div className="text-sm font-semibold text-dark">
                                {forecast.atRisk ? "⚠️ Risque de découvert" : forecast.belowThreshold ? "⚠️ Sous votre seuil d'alerte" : "✅ Seuil d'alerte"}
                            </div>
                            <div className="mt-1 text-xs text-dark/50">
                                Seuil actuel : <strong>{money(forecast.alertThreshold, currency)}</strong>
                                {" · "}Prévu au {new Date(forecast.nextPayday + "T12:00:00").toLocaleDateString("fr-FR")} :{" "}
                                <strong>{money(forecast.forecastBalance, currency)}</strong>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-wine">Ajuster le seuil →</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2 text-left">
                    <div className="mb-4 text-lg font-semibold text-dark">Répartition des dépenses</div>

                    {fixedExpenses.length ? (
                        <div className="space-y-3">
                            {fixedExpenses.slice(0, 5).map((e, i) => {
                                const pct =
                                    fixedExpensesTotal > 0
                                        ? ((Number(e.amount) / fixedExpensesTotal) * 100).toFixed(1)
                                        : 0;
                                return (
                                    <div key={i}>
                                        <div className="mb-1 flex justify-between text-sm">
                                            <span className="text-dark/70">{categoryLabel(e.category)}</span>
                                            <span className="font-medium text-dark">
                                                {money(e.amount, currency)}
                                                <span className="ml-1 text-xs text-dark/40">({pct}%)</span>
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-slate-100">
                                            <div
                                                className="h-1.5 rounded-full bg-wine transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed p-8 text-left text-dark/40">
                            <div className="mb-2 text-3xl">💸</div>
                            <div>Aucune dépense pour l'instant.</div>
                            <button
                                className="mt-2 text-sm text-wine hover:underline"
                                onClick={() => navigate("/financial?tab=expenses")}
                            >
                                Ajoutez vos dépenses →
                            </button>
                        </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2 text-xs text-dark/40">
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                            Revenus : <strong>{money(monthlyIncome, currency)}</strong>
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                            Charges fixes : <strong>{money(fixedExpensesTotal, currency)}</strong>
                        </span>
                        <span
                            className={`rounded-full px-3 py-1 ${
                                available >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                        >
                            Disponible : <strong>{money(available, currency)}</strong>
                        </span>
                    </div>
                </div>

                <div
                    className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md text-left"
                    onClick={() => navigate("/financial?tab=goals")}
                >
                    <div className="mb-3 flex items-center justify-between">
                        <div className="text-lg font-semibold text-dark">🎯 Objectifs</div>
                        <div className="text-sm text-dark/40">{overallGoalPct} % au global</div>
                    </div>

                    {goals.length === 0 ? (
                        <div className="py-6 text-left text-dark/40">
                            <div className="mb-2 text-3xl">🎯</div>
                            <div className="text-sm">Aucun objectif pour l'instant.</div>
                            <div className="mt-1 text-xs text-wine">Cliquez pour en créer un →</div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                <div className="text-sm font-medium text-dark">{currentGoal.title}</div>
                                {currentGoal.description && (
                                    <div className="text-xs text-dark/40">{currentGoal.description}</div>
                                )}
                                <div className="flex justify-between text-xs text-dark/40">
                                    <span>{money(currentGoal.currentAmount ?? 0, currency)} épargnés</span>
                                    <span>Objectif : {money(currentGoal.targetAmount, currency)}</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100">
                                    <div
                                        className="h-2 rounded-full bg-wine transition-all"
                                        style={{ width: `${goalPct}%` }}
                                    />
                                </div>
                                <div className="text-right text-xs text-dark/40">{goalPct.toFixed(0)}%</div>
                                {currentGoal.deadline && (
                                    <div className="text-xs text-dark/40">
                                        Échéance : {new Date(currentGoal.deadline + "T12:00:00").toLocaleDateString("fr-FR")}
                                    </div>
                                )}
                            </div>

                            {goals.length > 1 && (
                                <div
                                    className="mt-4 flex items-center justify-between"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        className="rounded-full border p-1.5 hover:bg-slate-100 disabled:opacity-30"
                                        onClick={() => setGoalIdx((v) => Math.max(0, v - 1))}
                                        disabled={goalIdx === 0}
                                    >
                                        ←
                                    </button>
                                    <div className="flex gap-1">
                                        {goals.map((_, i) => (
                                            <button
                                                key={i}
                                                className={`h-1.5 rounded-full transition-all ${
                                                    i === goalIdx ? "w-4 bg-wine" : "w-1.5 bg-slate-300"
                                                }`}
                                                onClick={() => setGoalIdx(i)}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        className="rounded-full border p-1.5 hover:bg-slate-100 disabled:opacity-30"
                                        onClick={() => setGoalIdx((v) => Math.min(goals.length - 1, v + 1))}
                                        disabled={goalIdx === goals.length - 1}
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <BottomCard
                    title="Transactions"
                    icon="💳"
                    content="Suivez vos revenus et dépenses"
                    action="Voir tout →"
                    onClick={() => navigate("/transactions")}
                />
                <BottomCard
                    title="Factures"
                    icon="🧾"
                    content="Gérez vos factures récurrentes"
                    action="Voir les factures →"
                    onClick={() => navigate("/bills")}
                />
                <BottomCard
                    title="Analyse"
                    icon="📊"
                    content={`Taux d'épargne : ${monthlyIncome > 0 ? (((monthlyIncome - fixedExpensesTotal) / monthlyIncome) * 100).toFixed(1) : 0} % du revenu`}
                    action="Voir les analyses →"
                    onClick={() => navigate("/financial?tab=analysis")}
                />
            </div>

            {salaryPending && !contributeStep && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl text-left">
                        <div className="mb-3 text-4xl">💰</div>
                        <h3 className="mb-2 text-xl font-semibold text-dark">Jour de paie !</h3>
                        <p className="mb-1 text-sm text-dark/60">
                            Aujourd'hui est votre jour de paie (le {financial?.paydayDay}).
                        </p>
                        <p className="mb-4 text-sm text-dark/60">
                            Avez-vous reçu votre salaire de{" "}
                            <strong className="text-dark">{money(monthlyIncome, currency)}</strong> ?
                        </p>
                        <div className="mb-5 space-y-1 rounded-lg bg-winePale p-3 text-left text-xs text-dark/60">
                            <div>
                                ✅ Salaire <strong>+{money(monthlyIncome, currency)}</strong> ajouté au solde
                            </div>
                            <div>
                                ➖ Charges fixes <strong>-{money(fixedExpensesTotal, currency)}</strong> déduites
                            </div>
                            <div className="border-t border-wineLight/30 pt-1 font-medium text-dark">
                                Solde net : <strong className="text-emerald-700">+{money(monthlyIncome - fixedExpensesTotal, currency)}</strong>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleConfirmSalary}
                                disabled={confirmingSalary}
                                className="flex-1 rounded-lg bg-wine py-3 font-semibold text-white transition hover:bg-wineDark disabled:opacity-50"
                            >
                                {confirmingSalary ? "Traitement..." : "✅ Oui, je l'ai reçu !"}
                            </button>
                            <button
                                onClick={handleDismissSalary}
                                className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold text-dark transition hover:bg-slate-50"
                            >
                                Pas encore
                            </button>
                        </div>
                        <p className="mt-3 text-xs text-dark/30">
                            En sélectionnant "Pas encore", vous serez rappelé demain.
                        </p>
                    </div>
                </div>
            )}

            {contributeStep && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl text-left">
                        <div className="mb-3 text-4xl">🎯</div>
                        <h3 className="mb-2 text-xl font-semibold text-dark">Alimenter vos objectifs ?</h3>
                        <p className="mb-4 text-sm text-dark/60">
                            Votre salaire est arrivé. Allouez-en une partie à vos objectifs maintenant, ou passez cette fois-ci.
                        </p>

                        {contribError && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {contribError}
                            </div>
                        )}

                        {goals.length === 0 ? (
                            <p className="mb-5 text-sm text-dark/60">Vous n'avez pas encore d'objectif.</p>
                        ) : (
                            <div className="mb-4 space-y-3">
                                {goals.map((g) => (
                                    <div key={g.id} className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium text-dark">{g.title}</div>
                                            <div className="text-xs text-dark/40">
                                                {money(g.currentAmount, currency)} / {money(g.targetAmount, currency)}
                                            </div>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-wine"
                                            value={contribAmounts[g.id] ?? ""}
                                            onChange={(e) =>
                                                setContribAmounts((prev) => ({ ...prev, [g.id]: e.target.value }))
                                            }
                                            placeholder="0"
                                        />
                                    </div>
                                ))}

                                <div
                                    className={`flex justify-between border-t pt-2 text-xs ${
                                        contribOverBalance ? "text-red-600" : "text-dark/40"
                                    }`}
                                >
                                    <span>Total à allouer</span>
                                    <span className="font-medium">
                                        {money(contribTotal, currency)} / {money(financial?.currentBalance ?? 0, currency)} disponibles
                                    </span>
                                </div>
                                {contribOverBalance && (
                                    <p className="text-xs text-red-600">Ce montant dépasse votre solde actuel.</p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleConfirmContributions}
                                disabled={contributing || contribOverBalance || goals.length === 0}
                                className="flex-1 rounded-lg bg-wine py-3 font-semibold text-white transition hover:bg-wineDark disabled:opacity-50"
                            >
                                {contributing ? "Traitement..." : "Confirmer les contributions"}
                            </button>
                            <button
                                onClick={finishContributeStep}
                                disabled={contributing}
                                className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold text-dark transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Passer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, sub, color, onClick }) {
    return (
        <div
            className={`cursor-pointer rounded-2xl p-6 text-white shadow-sm transition hover:opacity-90 ${color}`}
            onClick={onClick}
        >
            <div className="text-sm opacity-80">{label}</div>
            <div className="mt-2 text-3xl font-semibold">{value}</div>
            <div className="mt-1 text-xs opacity-70">{sub}</div>
        </div>
    );
}

function BottomCard({ title, icon, content, action, onClick }) {
    return (
        <div
            className="cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md text-left"
            onClick={onClick}
        >
            <div className="mb-2 text-2xl">{icon}</div>
            <div className="font-semibold text-dark">{title}</div>
            <div className="mt-1 text-sm text-dark/40">{content}</div>
            <div className="mt-3 text-sm font-medium text-wine">{action}</div>
        </div>
    );
}