import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    const [salaryPending, setSalaryPending] = useState(false);
    const [confirmingSalary, setConfirmingSalary] = useState(false);
    const [goalIdx, setGoalIdx] = useState(0);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        Promise.all([
            fetch(`/api/financial/${userId}`).then(r => (r.ok ? r.json() : null)),
            fetch(`/api/goals/user/${userId}`).then(r => (r.ok ? r.json() : [])),
            fetch(`/api/bills/user/${userId}`).then(r => (r.ok ? r.json() : [])),
        ])
            .then(([fin, g, b]) => {
                setFinancial(fin);
                setGoals(g || []);
                setBills(b || []);
                setSalaryPending(fin?.salaryPendingConfirmation ?? false);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    const handleConfirmSalary = async () => {
        setConfirmingSalary(true);
        try {
            const res = await fetch(`/api/financial/${userId}/confirm-salary`, { method: "POST" });
            if (res.ok) {
                setFinancial(await res.json());
                setSalaryPending(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setConfirmingSalary(false);
        }
    };

    const handleDismissSalary = async () => {
        setSalaryPending(false);
        await fetch(`/api/financial/${userId}/dismiss-salary`, { method: "POST" }).catch(() => {});
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
                    <p className="text-dark/40">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 text-left">
            <div className="text-left">
                <h1 className="text-2xl font-semibold text-dark">
                    Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}! 👋
                </h1>
                <p className="mt-1 text-sm text-dark/40">
                    {new Date().toLocaleDateString("en-GB", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <StatCard
                    label="Total balance"
                    value={money(currentBalance, currency)}
                    sub={
                        lastSalaryApplied
                            ? `Salary applied ${new Date(lastSalaryApplied + "T12:00:00").toLocaleDateString("fr-FR")}`
                            : "Your real-time balance"
                    }
                    color="bg-wine"
                    onClick={() => navigate("/financial?tab=overview")}
                />
                <StatCard
                    label="Monthly expenses"
                    value={money(fixedExpensesTotal, currency)}
                    sub={`${fixedExpenses.length} fixed categories`}
                    color="bg-slate-700"
                    onClick={() => navigate("/financial?tab=expenses")}
                />
                <StatCard
                    label="Available this month"
                    value={money(available, currency)}
                    sub={
                        unpaidBillsTotal > 0
                            ? `After ${money(unpaidBillsTotal, currency)} unpaid bills`
                            : "All bills paid ✓"
                    }
                    color={available >= 0 ? "bg-emerald-600" : "bg-red-500"}
                    onClick={() => navigate("/financial?tab=analysis")}
                />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2 text-left">
                    <div className="mb-4 text-lg font-semibold text-dark">Spending breakdown</div>

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
                                            <span className="text-dark/70">{e.category}</span>
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
                            <div>No expenses yet.</div>
                            <button
                                className="mt-2 text-sm text-wine hover:underline"
                                onClick={() => navigate("/financial?tab=expenses")}
                            >
                                Add your expenses →
                            </button>
                        </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2 text-xs text-dark/40">
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                            Income: <strong>{money(monthlyIncome, currency)}</strong>
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                            Fixed costs: <strong>{money(fixedExpensesTotal, currency)}</strong>
                        </span>
                        <span
                            className={`rounded-full px-3 py-1 ${
                                available >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                        >
                            Available: <strong>{money(available, currency)}</strong>
                        </span>
                    </div>
                </div>

                <div
                    className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md text-left"
                    onClick={() => navigate("/financial?tab=goals")}
                >
                    <div className="mb-3 flex items-center justify-between">
                        <div className="text-lg font-semibold text-dark">🎯 Goals</div>
                        <div className="text-sm text-dark/40">{overallGoalPct}% overall</div>
                    </div>

                    {goals.length === 0 ? (
                        <div className="py-6 text-left text-dark/40">
                            <div className="mb-2 text-3xl">🎯</div>
                            <div className="text-sm">No goals yet.</div>
                            <div className="mt-1 text-xs text-wine">Click to create one →</div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                <div className="text-sm font-medium text-dark">{currentGoal.title}</div>
                                {currentGoal.description && (
                                    <div className="text-xs text-dark/40">{currentGoal.description}</div>
                                )}
                                <div className="flex justify-between text-xs text-dark/40">
                                    <span>{money(currentGoal.currentAmount ?? 0, currency)} saved</span>
                                    <span>Target: {money(currentGoal.targetAmount, currency)}</span>
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
                                        Deadline: {new Date(currentGoal.deadline + "T12:00:00").toLocaleDateString("fr-FR")}
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
                    content="Track income and expenses"
                    action="View all →"
                    onClick={() => navigate("/transactions")}
                />
                <BottomCard
                    title="Bills"
                    icon="🧾"
                    content="Manage your recurring bills"
                    action="View bills →"
                    onClick={() => navigate("/bills")}
                />
                <BottomCard
                    title="Analysis"
                    icon="📊"
                    content={`Savings rate: ${monthlyIncome > 0 ? ((available / monthlyIncome) * 100).toFixed(1) : 0}% of income`}
                    action="See insights →"
                    onClick={() => navigate("/financial?tab=analysis")}
                />
            </div>

            {salaryPending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl text-left">
                        <div className="mb-3 text-4xl">💰</div>
                        <h3 className="mb-2 text-xl font-semibold text-dark">Payday!</h3>
                        <p className="mb-1 text-sm text-dark/60">
                            Today is your payday (day {financial?.paydayDay}).
                        </p>
                        <p className="mb-4 text-sm text-dark/60">
                            Did you receive your salary of{" "}
                            <strong className="text-dark">{money(monthlyIncome, currency)}</strong>?
                        </p>
                        <div className="mb-5 space-y-1 rounded-lg bg-winePale p-3 text-left text-xs text-dark/60">
                            <div>
                                ✅ Salary <strong>+{money(monthlyIncome, currency)}</strong> added to balance
                            </div>
                            <div>
                                ➖ Fixed expenses <strong>-{money(fixedExpensesTotal, currency)}</strong> deducted
                            </div>
                            <div className="border-t border-wineLight/30 pt-1 font-medium text-dark">
                                Net: <strong className="text-emerald-700">+{money(monthlyIncome - fixedExpensesTotal, currency)}</strong>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleConfirmSalary}
                                disabled={confirmingSalary}
                                className="flex-1 rounded-lg bg-wine py-3 font-semibold text-white transition hover:bg-wineDark disabled:opacity-50"
                            >
                                {confirmingSalary ? "Processing..." : "✅ Yes, I got paid!"}
                            </button>
                            <button
                                onClick={handleDismissSalary}
                                className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold text-dark transition hover:bg-slate-50"
                            >
                                Not yet
                            </button>
                        </div>
                        <p className="mt-3 text-xs text-dark/30">
                            Selecting "Not yet" will remind you again tomorrow.
                        </p>
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