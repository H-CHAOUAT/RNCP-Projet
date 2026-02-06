import { useEffect, useMemo, useState } from "react";
import FormField from "../../molecules/FormField";
import Input from "../../atoms/Input";
import Select from "../../atoms/Select";
import Button from "../../atoms/Button";

const CATEGORIES = [
    "RENT",
    "BILLS",
    "SUBSCRIPTIONS",
    "GROCERIES",
    "TRANSPORT",
    "SAVINGS",
    "OTHER",
];

export default function FinancialForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [monthlyIncome, setMonthlyIncome] = useState("0");
    const [currency, setCurrency] = useState("EUR");
    const [expenses, setExpenses] = useState([
        { category: "RENT", amount: "0" },
    ]);

    const userId = useMemo(() => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            return u.id ?? u.userId ?? null;
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const loadData = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/financial/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setMonthlyIncome(String(data.monthlyIncome ?? "0"));
                setCurrency(data.currency ?? "EUR");
                setExpenses(
                    (data.expenses?.length ? data.expenses : [{ category: "RENT", amount: "0" }]).map((e) => ({
                        category: e.category ?? "OTHER",
                        amount: String(e.amount ?? "0"),
                    }))
                );
            }
        } catch (e) {
            console.error(e);
            alert("Failed to load financial data.");
        } finally {
            setLoading(false);
        }
    };

    const updateExpense = (index, key, value) => {
        setExpenses((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
        );
    };

    const addExpense = () => {
        setExpenses((prev) => [...prev, { category: "OTHER", amount: "0" }]);
    };

    const removeExpense = (index) => {
        setExpenses((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!userId) {
            alert("No user session found. Please login again.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                monthlyIncome: Number(monthlyIncome || 0),
                currency,
                expenses: expenses.map((e) => ({
                    category: e.category,
                    amount: Number(e.amount || 0),
                })),
            };

            const res = await fetch(`http://localhost:8080/api/financial/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("✅ Financial info saved!");
            } else {
                const text = await res.text();
                alert("❌ Save failed: " + text);
            }
        } catch (e) {
            console.error(e);
            alert("❌ Save failed.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-xl border bg-white p-6">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white p-6 space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <FormField label="Monthly income">
                    <Input
                        type="number"
                        name="monthlyIncome"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                        placeholder="0"
                    />
                </FormField>

                <FormField label="Currency">
                    <Select
                        name="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                    >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                    </Select>
                </FormField>


            </div>

            <div>
                <h2 className="text-lg font-semibold text-slate-900">Fixed monthly expenses</h2>
                <p className="text-sm text-slate-600">Add categories and amounts.</p>

                <div className="mt-4 space-y-3">
                    {expenses.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <FormField label="Category">
                                <Select
                                    name={`category-${idx}`}
                                    value={row.category}
                                    onChange={(e) => updateExpense(idx, "category", e.target.value)}
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>

                            <FormField label="Amount">
                                <Input
                                    type="number"
                                    name={`amount-${idx}`}
                                    value={row.amount}
                                    onChange={(e) => updateExpense(idx, "amount", e.target.value)}
                                    placeholder="0"
                                />
                            </FormField>

                            <div className="flex items-end gap-2">
                                <Button type="button" onClick={() => removeExpense(idx)} className="w-full">
                                    Remove
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <Button type="button" onClick={addExpense}>
                        + Add expense
                    </Button>
                </div>
            </div>
            <div className="flex items-end">
                <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>
        </div>
    );
}
