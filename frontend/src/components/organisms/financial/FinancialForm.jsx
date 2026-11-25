import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FormField from "../../molecules/FormField";
import Input from "../../atoms/Input";
import Select from "../../atoms/Select";
import Button from "../../atoms/Button";
import { apiFetch } from "../../../api/apiFetch";
import { categoryLabel } from "../../../constants/labels";

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

export default function FinancialForm({ highlightField = null }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [monthlyIncome, setMonthlyIncome] = useState("0");
    const [currency, setCurrency] = useState("EUR");
    const [currentBalance, setCurrentBalance] = useState("0");
    const [paydayDay, setPaydayDay] = useState("1");
    const [alertThreshold, setAlertThreshold] = useState("0");
    const [lastSalaryApplied, setLastSalaryApplied] = useState(null);

    const [, setBalanceLocked] = useState(false);

    const [expenses, setExpenses] = useState([
        { category: "RENT", amount: "0", custom: false, customLabel: "" },
    ]);

    const prevIncomeRef = useRef("0");
    const alertThresholdRef = useRef(null);
    const [highlightAlertThreshold, setHighlightAlertThreshold] = useState(false);

    useEffect(() => {
        if (highlightField !== "alertThreshold") return;
        alertThresholdRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightAlertThreshold(true);
        const t = setTimeout(() => setHighlightAlertThreshold(false), 2500);
        return () => clearTimeout(t);
    }, [highlightField]);

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
        setAlertThreshold(String(data.alertThreshold ?? "0"));
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
            const res = await apiFetch(`/api/financial/${userId}`);
            if (res.ok) {
                applyData(await res.json());
            } else {
                setMessage({ type: "error", text: "Échec du chargement des données financières." });
            }
        } catch {
            setMessage({ type: "error", text: "Échec du chargement des données financières." });
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
        alertThreshold: Number(alertThreshold || 0),
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
            const res = await apiFetch(`/api/financial/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                setMessage({ type: "error", text: `❌ Échec de l'enregistrement : ${await res.text()}` });
                return;
            }

            const updated = await res.json();
            applyData(updated);

            if (newIncome > 0 && newIncome !== prevIncome) {
                await apiFetch(`/api/transactions/user/${userId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "INCOME",
                        category: "SALARY",
                        amount: newIncome,
                        description: `Salaire mensuel mis à jour à ${newIncome} ${currency}`,
                        date: new Date().toISOString().split("T")[0],
                    }),
                }).catch(() => {});
            }

            setMessage({ type: "success", text: "✅ Informations financières enregistrées !" });
        } catch {
            setMessage({ type: "error", text: "❌ Échec de l'enregistrement." });
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!userId) {
            setMessage({ type: "error", text: "Aucune session utilisateur." });
            return;
        }
        await doSave(buildPayload());
    };

    if (loading) {
        return <div className="rounded-xl border bg-white p-6 text-gray-500">Chargement...</div>;
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

                <div className="grid grid-cols-1 items-end gap-5 md:grid-cols-4">
                    <FormField label="Salaire mensuel">
                        <Input
                            type="number"
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(e.target.value)}
                            placeholder="0"
                        />
                    </FormField>

                    <FormField label="Devise">
                        <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                            <option value="MAD">MAD</option>
                        </Select>
                    </FormField>

                    <FormField label="Solde actuel">
                        <Input
                            type="number"
                            value={currentBalance}
                            onChange={(e) => setCurrentBalance(e.target.value)}
                            placeholder="0"
                        />
                    </FormField>

                    <FormField label="Jour de réception du salaire (1 à 28)">
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

                <section
                    ref={alertThresholdRef}
                    aria-labelledby="alert-threshold-title"
                    className={`rounded-xl border-2 border-amber-300 bg-amber-50 p-5 transition-shadow ${highlightAlertThreshold ? "ring-4 ring-wine/50" : ""}`}
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="md:max-w-xl">
                            <h2 id="alert-threshold-title" className="text-lg font-semibold text-amber-900">
                                🔔 Seuil d'alerte
                            </h2>
                            <p className="mt-1 text-sm text-slate-700">
                                Le <strong>minimum à garder sur votre compte</strong>. Vous êtes alerté si vos factures
                                à venir avant votre prochain salaire font passer votre solde en dessous.
                            </p>
                        </div>
                        <label className="block md:w-52">
                            <span className="mb-1 block text-sm font-semibold text-amber-900">Montant du seuil ({currency})</span>
                            <Input
                                type="number"
                                value={alertThreshold}
                                onChange={(e) => setAlertThreshold(e.target.value)}
                                placeholder="0"
                                className="text-lg font-semibold"
                            />
                        </label>
                    </div>
                </section>

                {lastSalaryApplied && (
                    <p className="text-sm text-slate-600">
                        Dernier salaire appliqué : <strong>{fmtDate(lastSalaryApplied)}</strong>
                    </p>
                )}

                <div>
                    <div className="mb-1 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Charges mensuelles fixes
                        </h2>
                        <span className="text-sm text-slate-500">
                            Total : <strong>€{total.toFixed(2)}</strong>
                        </span>
                    </div>

                    <p className="mb-4 text-sm text-slate-500">
                        Chaque catégorie prédéfinie ne peut apparaître qu'une fois.
                        {allPresetsUsed && " Toutes les catégories sont utilisées — ajoutez-en une personnalisée ci-dessous."}
                    </p>

                    <div className="space-y-3">
                        {expenses.map((row, idx) => (
                            <div
                                key={idx}
                                className="grid grid-cols-1 items-end gap-3 md:grid-cols-3"
                            >
                                <FormField label="Catégorie">
                                    {row.custom ? (
                                        <Input
                                            value={row.customLabel || ""}
                                            onChange={(e) =>
                                                updateExpense(idx, "customLabel", e.target.value)
                                            }
                                            placeholder="ex. Cours de piano"
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
                                                        {categoryLabel(c)}
                                                        {taken ? " (déjà ajoutée)" : ""}
                                                    </option>
                                                );
                                            })}
                                        </Select>
                                    )}
                                </FormField>

                                <FormField label="Montant">
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
                                            Personnalisée
                                        </span>
                                    )}
                                    <Button
                                        type="button"
                                        onClick={() => removeExpense(idx)}
                                        className="flex-1 bg-red-50 text-red-700 hover:bg-red-100"
                                    >
                                        Supprimer
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
                                + Ajouter une catégorie
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={addCustomExpense}
                            className="bg-purple-50 text-purple-800 hover:bg-purple-100"
                        >
                            + Ajouter une dépense personnalisée
                        </Button>
                    </div>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
            </div>

        </>
    );
}