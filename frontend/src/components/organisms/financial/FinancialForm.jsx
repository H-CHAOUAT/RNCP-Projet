import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FormField from "../../molecules/FormField";
import Input from "../../atoms/Input";
import Select from "../../atoms/Select";
import Button from "../../atoms/Button";

const PRESET_CATEGORIES = ["RENT", "BILLS", "SUBSCRIPTIONS", "GROCERIES", "TRANSPORT", "SAVINGS"];

const fmtDate = (d) => {
    if (!d) return "";
    try {
        return new Date(d + "T12:00:00").toLocaleDateString("fr-FR");
    } catch {
        return String(d);
    }
};

const dedupeExpenses = (raw) => {
    const seen = new Set();
    return (raw || []).filter((e) => {
        const cat = e.category ?? "";
        const isPreset = PRESET_CATEGORIES.includes(cat);
        if (!isPreset) return true;
        if (seen.has(cat)) return false;
        seen.add(cat);
        return true;
    });
};

const toFormRows = (rawExpenses) =>
    rawExpenses.map((e) => {
        const isPreset = PRESET_CATEGORIES.includes(e.category ?? "");
        return {
            category: isPreset ? e.category : "OTHER",
            amount: String(e.amount ?? "0"),
            custom: !isPreset,
            customLabel: !isPreset ? (e.category ?? "") : "",
        };
    });

export default function FinancialForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [monthlyIncome, setMonthlyIncome] = useState("0");
    const [currency, setCurrency] = useState("EUR");
    const [currentBalance, setCurrentBalance] = useState("0");
    const [paydayDay, setPaydayDay] = useState("1");
    const [lastSalaryApplied, setLastSalaryApplied] = useState(null);

    const [balanceLocked, setBalanceLocked] = useState(false);
    const [showLockConfirm, setShowLockConfirm] = useState(false);
    const [pendingPayload, setPendingPayload] = useState(null);

    const [expenses, setExpenses] = useState([
        { category: "RENT", amount: "0", custom: false, customLabel: "" },
    ]);

    const prevIncomeRef = useRef("0");

    const userId = useMemo(() => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            return u.id ?? u.userId ?? null;
        } catch {
            return null;
        }
    }, []);

    const applyData = useCallback((data) => {
        const inc = String(data.monthlyIncome ?? "0");
        setMonthlyIncome(inc);
        prevIncomeRef.current = inc;

        setCurrency(data.currency ?? "EUR");
        setCurrentBalance(String(data.currentBalance ?? "0"));
        setPaydayDay(String(data.paydayDay ?? "1"));
        setLastSalaryApplied(data.lastSalaryApplied ?? null);
        setBalanceLocked(data.balanceLocked ?? false);

        const deduped = dedupeExpenses(data.expenses);
        setExpenses(
            deduped.length
                ? toFormRows(deduped)
                : [{ category: "RENT", amount: "0", custom: false, customLabel: "" }]
        );
    }, []);

    const loadData = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/financial/${userId}`);
            if (res.ok) {
                applyData(await res.json());
            } else {
                setMessage({ type: "error", text: "Failed to load financial data." });
            }
        } catch {
            setMessage({ type: "error", text: "Failed to load financial data." });
        } finally {
            setLoading(false);
        }
    }, [userId, applyData]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const updateExpense = (index, key, value) =>
        setExpenses((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
        );

    const usedPresets = expenses.filter((e) => !e.custom).map((e) => e.category);
    const allPresetsUsed = PRESET_CATEGORIES.every((c) => usedPresets.includes(c));

    const addPresetExpense = () => {
        const unused = PRESET_CATEGORIES.find((c) => !usedPresets.includes(c));
        if (unused) {
            setExpenses((prev) => [
                ...prev,
                { category: unused, amount: "0", custom: false, customLabel: "" },
            ]);
        } else {
            setExpenses((prev) => [
                ...prev,
                { category: "OTHER", amount: "0", custom: true, customLabel: "" },
            ]);
        }
    };

    const addCustomExpense = () =>
        setExpenses((prev) => [
            ...prev,
            { category: "OTHER", amount: "0", custom: true, customLabel: "" },
        ]);

    const removeExpense = (index) =>
        setExpenses((prev) => prev.filter((_, i) => i !== index));

    const buildPayload = () => ({
        monthlyIncome: Number(monthlyIncome || 0),
        currentBalance: Number(currentBalance || 0),
        paydayDay: Number(paydayDay || 1),
        currency,
        expenses: expenses.map((e) => ({
            category: e.custom ? (e.customLabel?.trim() || "OTHER") : e.category,
            amount: Number(e.amount || 0),
        })),
    });

    const doSave = async (payload) => {
        setSaving(true);
        setMessage({ type: "", text: "" });

        const newIncome = Number(payload.monthlyIncome || 0);
        const prevIncome = Number(prevIncomeRef.current || 0);

        try {
            const res = await fetch(`/api/financial/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                setMessage({ type: "error", text: `❌ Save failed: ${await res.text()}` });
                return;
            }

            const updated = await res.json();
            applyData(updated);

            if (newIncome > 0 && newIncome !== prevIncome) {
                await fetch(`/api/transactions/user/${userId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "INCOME",
                        category: "SALARY",
                        amount: newIncome,
                        description: `Monthly salary updated to ${newIncome} ${currency}`,
                        date: new Date().toISOString().split("T")[0],
                    }),
                }).catch(() => {});
            }

            setMessage({ type: "success", text: "✅ Financial info saved!" });
        } catch {
            setMessage({ type: "error", text: "❌ Save failed." });
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!userId) {
            setMessage({ type: "error", text: "No user session." });
            return;
        }

        if (!balanceLocked && Number(currentBalance || 0) > 0) {
            setPendingPayload(buildPayload());
            setShowLockConfirm(true);
            return;
        }

        await doSave(buildPayload());
    };

    const handleLockConfirm = async () => {
        setShowLockConfirm(false);
        if (!pendingPayload) return;

        await doSave({ ...pendingPayload, balanceLocked: true });
        setPendingPayload(null);
    };

    const handleLockCancel = () => {
        setShowLockConfirm(false);
        setPendingPayload(null);
    };

    if (loading) {
        return <div className="rounded-xl border bg-white p-6 text-gray-500">Loading...</div>;
    }

    const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

    return (
        <>
            <div className="rounded-xl border bg-white p-6 space-y-6 text-left">
                {message.text && (
                    <div
                        className={`rounded-lg border p-3 text-sm ${
                            message.type === "success"
                                ? "bg-green-50 border-green-200 text-green-800"
                                : "bg-red-50 border-red-200 text-red-800"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                    <FormField label="Monthly salary">
                        <Input
                            type="number"
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(e.target.value)}
                            placeholder="0"
                        />
                    </FormField>

                    <FormField label="Currency">
                        <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                            <option value="MAD">MAD</option>
                        </Select>
                    </FormField>

                    <FormField label="Initial balance">
                        <div className="space-y-1">
                            <Input
                                type="number"
                                value={currentBalance}
                                disabled={balanceLocked}
                                onChange={(e) => setCurrentBalance(e.target.value)}
                                placeholder="0"
                            />
                            {balanceLocked && (
                                <p className="text-xs text-dark/50">
                                    🔒 This initial balance has been locked and cannot be changed.
                                </p>
                            )}
                            {!balanceLocked && (
                                <p className="text-xs text-amber-700">
                                    This amount can only be entered once. After confirmation, it will be locked.
                                </p>
                            )}
                        </div>
                    </FormField>

                    <FormField label="Payday day (1–28)">
                        <Input
                            type="number"
                            value={paydayDay}
                            min="1"
                            max="28"
                            onChange={(e) => setPaydayDay(e.target.value)}
                            placeholder="1"
                        />
                    </FormField>
                </div>

                {lastSalaryApplied && (
                    <p className="text-sm text-slate-600">
                        Last salary applied: <strong>{fmtDate(lastSalaryApplied)}</strong>
                    </p>
                )}

                <div>
                    <div className="mb-1 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Fixed monthly expenses
                        </h2>
                        <span className="text-sm text-slate-500">
                            Total: <strong>€{total.toFixed(2)}</strong>
                        </span>
                    </div>

                    <p className="mb-4 text-sm text-slate-500">
                        Each preset category can only appear once.
                        {allPresetsUsed && " All categories used — add a custom one below."}
                    </p>

                    <div className="space-y-3">
                        {expenses.map((row, idx) => (
                            <div
                                key={idx}
                                className="grid grid-cols-1 items-end gap-3 md:grid-cols-3"
                            >
                                <FormField label="Category">
                                    {row.custom ? (
                                        <Input
                                            value={row.customLabel || ""}
                                            onChange={(e) =>
                                                updateExpense(idx, "customLabel", e.target.value)
                                            }
                                            placeholder="e.g. Piano lessons"
                                        />
                                    ) : (
                                        <Select
                                            value={row.category}
                                            onChange={(e) =>
                                                updateExpense(idx, "category", e.target.value)
                                            }
                                        >
                                            {PRESET_CATEGORIES.map((c) => {
                                                const taken =
                                                    usedPresets.includes(c) && c !== row.category;
                                                return (
                                                    <option
                                                        key={c}
                                                        value={c}
                                                        disabled={taken}
                                                    >
                                                        {c}
                                                        {taken ? " (already added)" : ""}
                                                    </option>
                                                );
                                            })}
                                        </Select>
                                    )}
                                </FormField>

                                <FormField label="Amount">
                                    <Input
                                        type="number"
                                        value={row.amount}
                                        min="0"
                                        onChange={(e) =>
                                            updateExpense(idx, "amount", e.target.value)
                                        }
                                        placeholder="0"
                                    />
                                </FormField>

                                <div className="flex items-end gap-2">
                                    {row.custom && (
                                        <span className="self-center whitespace-nowrap rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                                            Custom
                                        </span>
                                    )}
                                    <Button
                                        type="button"
                                        onClick={() => removeExpense(idx)}
                                        className="flex-1 bg-red-50 text-red-700 hover:bg-red-100"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                        {!allPresetsUsed && (
                            <Button
                                type="button"
                                onClick={addPresetExpense}
                                className="bg-slate-100 text-slate-800 hover:bg-slate-200"
                            >
                                + Add category
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={addCustomExpense}
                            className="bg-purple-50 text-purple-800 hover:bg-purple-100"
                        >
                            + Add custom expense
                        </Button>
                    </div>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>

            {showLockConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-xl font-semibold text-dark">
                            Confirm initial balance
                        </h3>
                        <p className="mt-3 text-sm text-dark/60">
                            Your initial balance of{" "}
                            <strong>{Number(currentBalance || 0).toLocaleString("fr-FR")} {currency}</strong>{" "}
                            will be locked and cannot be changed later.
                        </p>
                        <p className="mt-2 text-sm text-dark/60">
                            Are you sure you want to continue?
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={handleLockCancel}
                                className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold text-dark transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLockConfirm}
                                className="flex-1 rounded-lg bg-wine py-3 font-semibold text-white transition hover:bg-wineDark"
                            >
                                Yes, confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}