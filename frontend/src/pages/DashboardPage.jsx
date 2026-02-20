import { useEffect, useMemo, useState } from "react";
import Button from "../components/atoms/Button";
import { useNavigate } from "react-router-dom";

const money = (n, currency = "EUR") => {
    const value = Number(n ?? 0);
    try {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(value);
    } catch {
        return `${value.toFixed(2)} ${currency}`;
    }
};

export default function DashboardPage() {
    const navigate = useNavigate();

    const userId = useMemo(() => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            return u.id ?? u.userId ?? null;
        } catch {
            return null;
        }
    }, []);

    const [loading, setLoading] = useState(true);
    const [financial, setFinancial] = useState(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/financial/${userId}`);
                if (!res.ok) throw new Error("Failed to load financial profile");
                const data = await res.json();
                setFinancial(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [userId]);

    const currency = financial?.currency ?? "EUR";
    const monthlyIncome = Number(financial?.monthlyIncome ?? 0);
    const currentBalance = Number(financial?.currentBalance ?? 0);
    const paydayDay = financial?.paydayDay ?? 1;
    const lastSalaryApplied = financial?.lastSalaryApplied ?? null;

    const fixedExpensesTotal = (financial?.expenses ?? []).reduce(
        (sum, e) => sum + Number(e?.amount ?? 0),
        0
    );

    // "Available after fixed" is a simple view: income - fixed.
    // You can change to (currentBalance - fixed) if you prefer.
    const availableAfterFixed = monthlyIncome - fixedExpensesTotal;

    // Placeholder values (until you connect goals/transactions)
    const goalsProgressPct = 0; // later: compute from goals

    if (loading) {
        return (
            <div className="p-8">
                <div className="rounded-xl border bg-white p-6">
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* TOP 3 CARDS (like old wireframe) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Total Balance */}
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="text-sm text-slate-500">Total Balance</div>
                    <div className="mt-3 text-4xl font-semibold text-slate-900">
                        {money(currentBalance, currency)}
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                        {lastSalaryApplied ? `Updated on ${lastSalaryApplied}` : "Updated this month"}
                    </div>
                </div>

                {/* Total Expenses */}
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="text-sm text-slate-500">Total Expenses</div>
                    <div className="mt-3 text-4xl font-semibold text-slate-900">
                        {money(fixedExpensesTotal, currency)}
                    </div>
                    <div className="mt-2 text-sm text-slate-400">Monthly spending (fixed)</div>
                </div>

                {/* Goals Progress (placeholder) */}
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="text-sm text-slate-500">Goals Progress</div>
                    <div className="mt-3 text-4xl font-semibold text-slate-900">
                        {goalsProgressPct}%
                    </div>
                    <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
                        <div
                            className="h-2 rounded-full bg-[#72383D]"
                            style={{ width: `${goalsProgressPct}%` }}
                        />
                    </div>
                    <div className="mt-2 text-sm text-slate-400">Connect goals later</div>
                </div>
            </div>

            {/* MIDDLE: big left + right column (like old wireframe) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Spending statistics (placeholder chart area) */}
                <div className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="text-lg font-semibold text-slate-900">Spending statistics</div>

                    <div className="mt-6 rounded-xl border border-dashed p-10 text-center text-slate-400">
                        Chart will appear here (later)
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Monthly income: <span className="font-semibold">{money(monthlyIncome, currency)}</span>
            </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">
              Payday: <span className="font-semibold">{paydayDay}</span>
            </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">
              Available after fixed:{" "}
                            <span className="font-semibold">{money(availableAfterFixed, currency)}</span>
            </span>
                    </div>
                </div>

                {/* Recent transactions (placeholder list like wireframe) */}
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="text-lg font-semibold text-slate-900">Recent transactions</div>

                    <div className="mt-5 space-y-4">
                        <Row label="Central Burger" right="-€189.36" rightClass="text-red-500" />
                        <Row label="The Market" right="-€92.50" rightClass="text-red-500" />
                        <Row label="Salary" right={`+${money(monthlyIncome, currency)}`} rightClass="text-green-600" />
                    </div>

                    <div className="mt-6">
                        <Button type="button" className="w-full">
                            View more
                        </Button>
                    </div>
                </div>
            </div>

            {/* BOTTOM 3 SMALL CARDS (like old wireframe) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="text-lg font-semibold text-slate-900">Goals</div>
                    <div className="mt-2 text-slate-600">Summer vacation — 0% reached</div>
                    <div className="mt-4 text-sm text-slate-400">Placeholder (connect later)</div>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="text-lg font-semibold text-slate-900">Spending overview</div>
                    <div className="mt-2 text-slate-600">
                        {financial?.expenses?.length
                            ? financial.expenses.map((e) => e.category).slice(0, 3).join(", ")
                            : "Groceries, Rent, Leisure"}
                    </div>
                    <div className="mt-4 text-sm text-slate-400">Based on fixed expenses</div>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="text-lg font-semibold text-slate-900">Insights</div>
                    <div className="mt-2 text-slate-600">
                        You spent {Math.round((fixedExpensesTotal / Math.max(monthlyIncome, 1)) * 100)}% of your income on fixed costs.
                    </div>
                    <div className="mt-4 text-sm text-slate-400">Placeholder (better insights later)</div>
                </div>
            </div>

            {/* Quick link to Financial profile (optional) */}
            <div className="pt-2">
                <button
                    className="text-sm font-medium text-[#72383D] hover:underline"
                    onClick={() => navigate("/financial")}
                >
                    Edit financial profile →
                </button>
            </div>
        </div>
    );
}

function Row({ label, right, rightClass = "text-slate-900" }) {
    return (
        <div className="flex items-center justify-between">
            <div className="text-slate-900">{label}</div>
            <div className={`font-medium ${rightClass}`}>{right}</div>
        </div>
    );
}