import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FinancialForm from "../components/organisms/financial/FinancialForm";
import GoalsList from "../components/organisms/goals/GoalsList";
import CreateGoalModal from "../components/organisms/goals/CreateGoalModal";
import { apiFetch } from "../api/apiFetch";

function AnalysisTab({ userId }) {
    const [financial, setFinancial] = useState(null);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("month");

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        Promise.all([
            apiFetch(`/api/financial/${userId}`).then(r => (r.ok ? r.json() : null)),
            apiFetch(`/api/goals/user/${userId}`).then(r => (r.ok ? r.json() : [])),
        ])
            .then(([fin, g]) => {
                setFinancial(fin);
                setGoals(g || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) {
        return <div className="rounded-xl border bg-white p-6 text-dark/40">Loading analysis...</div>;
    }

    const currency = financial?.currency ?? "EUR";
    const income = Number(financial?.monthlyIncome ?? 0);
    const expenses = financial?.expenses ?? [];
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount ?? 0), 0);
    const available = income - totalExpenses;
    const savingsRate = income > 0 ? ((available / income) * 100).toFixed(1) : 0;

    const fmt = (n) => {
        try {
            return new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency,
            }).format(Number(n ?? 0));
        } catch {
            return `${Number(n ?? 0).toFixed(2)} ${currency}`;
        }
    };

    const activeGoals = goals.filter(
        g => g.targetAmount > 0 && (g.currentAmount / g.targetAmount) < 1
    );

    const ICONS = {
        RENT: "🏠",
        BILLS: "📄",
        SUBSCRIPTIONS: "📱",
        GROCERIES: "🛒",
        TRANSPORT: "🚗",
        SAVINGS: "💰",
    };

    return (
        <div className="space-y-6 text-left">
            <div className="flex justify-end">
                <div className="flex overflow-hidden rounded-lg border bg-white text-sm">
                    {[["month", "This month"], ["3months", "3 months"]].map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => setPeriod(val)}
                            className={`px-4 py-2 transition ${
                                period === val
                                    ? "bg-wine text-white"
                                    : "text-dark/50 hover:bg-slate-50"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                    {
                        label: "Monthly income",
                        value: fmt(income),
                        sub: "Before expenses",
                        bg: "bg-green-50 border-green-200",
                        text: "text-green-900",
                        sub2: "text-green-600",
                    },
                    {
                        label: "Total expenses",
                        value: fmt(totalExpenses),
                        sub: `${expenses.length} categories`,
                        bg: "bg-red-50 border-red-200",
                        text: "text-red-900",
                        sub2: "text-red-600",
                    },
                    {
                        label: "Available to save",
                        value: fmt(available),
                        sub: `${savingsRate}% savings rate`,
                        bg:
                            available >= 0
                                ? "bg-blue-50 border-blue-200"
                                : "bg-amber-50 border-amber-200",
                        text: available >= 0 ? "text-blue-900" : "text-amber-900",
                        sub2: available >= 0 ? "text-blue-600" : "text-amber-600",
                    },
                ].map(c => (
                    <div key={c.label} className={`rounded-xl border p-5 text-left ${c.bg}`}>
                        <div className={`text-xs ${c.sub2}`}>{c.label}</div>
                        <div className={`mt-1 text-2xl font-semibold ${c.text}`}>{c.value}</div>
                        <div className={`mt-1 text-xs ${c.sub2}`}>{c.sub}</div>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border bg-white p-6 text-left">
                <h3 className="mb-4 font-semibold text-dark">Expense breakdown</h3>

                {expenses.length === 0 ? (
                    <p className="text-sm text-dark/40">
                        No expenses added yet — go to the Expenses tab to add them.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {[...expenses]
                            .sort((a, b) => Number(b.amount) - Number(a.amount))
                            .map((e, i) => {
                                const pct =
                                    totalExpenses > 0
                                        ? ((Number(e.amount) / totalExpenses) * 100).toFixed(1)
                                        : 0;
                                const ofIncome =
                                    income > 0
                                        ? ((Number(e.amount) / income) * 100).toFixed(1)
                                        : 0;

                                return (
                                    <div key={i} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-slate-800">
                                                {ICONS[e.category] ?? "📦"} {e.category}
                                            </span>
                                            <span className="text-slate-700">
                                                {fmt(e.amount)}{" "}
                                                <span className="text-xs text-slate-400">
                                                    ({ofIncome}% of income)
                                                </span>
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100">
                                            <div
                                                className="h-2 rounded-full bg-wine"
                                                style={{ width: `${Math.min(100, pct)}%` }}
                                            />
                                        </div>
                                        {Number(e.amount) > 0 && activeGoals.length > 0 && (
                                            <div className="flex gap-4 pl-1 text-xs text-slate-400">
                                                <span>
                                                    −10% →{" "}
                                                    <strong className="text-green-700">
                                                        +{fmt(Number(e.amount) * 0.1)}/mo
                                                    </strong>
                                                </span>
                                                <span>
                                                    −20% →{" "}
                                                    <strong className="text-green-700">
                                                        +{fmt(Number(e.amount) * 0.2)}/mo
                                                    </strong>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            {activeGoals.length > 0 && (
                <div className="rounded-xl border bg-white p-6 text-left">
                    <h3 className="mb-4 font-semibold text-dark">Goal recommendations</h3>

                    <div className="space-y-4">
                        {activeGoals.map((g) => {
                            const remaining = Number(g.targetAmount) - Number(g.currentAmount);
                            const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
                            const months = g.deadline
                                ? Math.max(
                                    1,
                                    Math.round(
                                        (new Date(g.deadline) - new Date()) /
                                        (1000 * 60 * 60 * 24 * 30)
                                    )
                                )
                                : null;
                            const needed = months ? (remaining / months).toFixed(2) : null;
                            const canAfford = needed && available > 0 && Number(needed) <= available;

                            return (
                                <div key={g.id} className="space-y-2 rounded-lg border p-4 text-left">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-slate-800">
                                            🎯 {g.title}
                                        </span>
                                        <span className="text-sm text-dark/40">
                                            {pct.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                                        <div
                                            className="h-1.5 rounded-full bg-wine"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    {needed && (
                                        <div className="text-xs text-dark/50">
                                            Save <strong className="text-wine">{fmt(needed)}/month</strong>{" "}
                                            over {months} months to reach deadline {g.deadline}
                                        </div>
                                    )}
                                    {needed && (
                                        <div
                                            className={`text-xs font-medium ${
                                                canAfford ? "text-green-700" : "text-red-600"
                                            }`}
                                        >
                                            {canAfford
                                                ? `✅ Achievable — ${fmt(
                                                    available
                                                )} available after fixed expenses.`
                                                : `⚠️ Need ${fmt(
                                                    Number(needed) - available
                                                )} more/month. Consider reducing expenses above.`}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="space-y-1 rounded-xl border bg-white p-5 text-left text-sm text-dark/50">
                <strong className="block text-dark">Savings insight</strong>
                <p>
                    You spend{" "}
                    <strong>
                        {income > 0 ? ((totalExpenses / income) * 100).toFixed(1) : 0}%
                    </strong>{" "}
                    of income on fixed costs.
                </p>
                {savingsRate < 10 && (
                    <p className="text-amber-700">
                        ⚠️ Savings rate below 10% — review your biggest expenses.
                    </p>
                )}
                {savingsRate >= 10 && savingsRate < 20 && (
                    <p className="text-blue-700">
                        💡 Good start — aim for 20%+ for solid financial health.
                    </p>
                )}
                {savingsRate >= 20 && (
                    <p className="text-green-700">✅ Great savings rate. Keep it up!</p>
                )}
            </div>
        </div>
    );
}

function GoalsTab({ userId, openModalImmediately }) {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(openModalImmediately ?? false);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        apiFetch(`/api/goals/user/${userId}`)
            .then(r => (r.ok ? r.json() : []))
            .then(setGoals)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    const handleCreated = (newGoal) => {
        setGoals(prev => [...prev, newGoal]);
        setOpen(false);
    };

    return (
        <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
                <div className="text-left">
                    <h2 className="text-lg font-semibold text-dark">Savings goals</h2>
                    <p className="text-sm text-dark/50">
                        Set targets and get smart savings suggestions.
                    </p>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="rounded-lg bg-wine px-4 py-2 text-sm font-medium text-white transition hover:bg-wineDark"
                >
                    + New goal
                </button>
            </div>

            <div className="rounded-xl border bg-white p-6 text-left">
                <GoalsList goals={goals} loading={loading} />
            </div>

            <CreateGoalModal
                open={open}
                onClose={() => setOpen(false)}
                onCreated={handleCreated}
                existingTitles={goals.map(g => g.title)}
                userId={userId}
            />
        </div>
    );
}

const TABS = ["Overview", "Goals", "Expenses", "Analysis"];

export default function FinancialPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const getTabFromSearch = () => {
        const params = new URLSearchParams(location.search);
        const t = params.get("tab");

        if (!t) return "Overview";

        const match = TABS.find(x => x.toLowerCase() === t.toLowerCase());
        return match || "Overview";
    };

    const [activeTab, setActiveTab] = useState(getTabFromSearch);
    const openModal = location.state?.openModal ?? false;

    useEffect(() => {
        setActiveTab(getTabFromSearch());
    }, [location.search]);

    const handleTabChange = (tab) => {
        navigate(`/financial?tab=${tab.toLowerCase()}`);
    };

    const userId = useMemo(() => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            return u.id ?? u.userId ?? null;
        } catch {
            return null;
        }
    }, []);

    return (
        <div className="mx-auto max-w-5xl space-y-6 text-left">
            <div className="text-left">
                <h1 className="text-2xl font-semibold text-dark">Financial profile</h1>
                <p className="mt-1 text-dark/50">
                    Manage your income, fixed expenses, goals and spending analysis.
                </p>
            </div>

            <div className="border-b">
                <nav className="flex gap-1">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-4 pb-3 text-sm font-medium transition ${
                                activeTab === tab
                                    ? "border-b-2 border-wine text-wine"
                                    : "text-dark/50 hover:text-dark"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === "Overview" && <FinancialForm />}
            {activeTab === "Goals" && (
                <GoalsTab userId={userId} openModalImmediately={openModal} />
            )}
            {activeTab === "Expenses" && <FinancialForm />}
            {activeTab === "Analysis" && <AnalysisTab userId={userId} />}
        </div>
    );
}