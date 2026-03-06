import { useEffect, useState } from "react";
import Button from "../../atoms/Button";
import Input from "../../atoms/Input";
import Select from "../../atoms/Select";
import FormField from "../../molecules/FormField";

const SUGGESTIONS = [
    { label: "— Choose a suggestion (optional) —", value: "" },
    { label: "Emergency fund", value: "Emergency fund" },
    { label: "Vacation", value: "Vacation" },
    { label: "New car", value: "New car" },
    { label: "Home project", value: "Home project" },
    { label: "Education", value: "Education" },
    { label: "Wedding", value: "Wedding" },
    { label: "Other", value: "Other" },
];

export default function CreateGoalModal({ open, onClose, onCreate }) {
    const [suggestion, setSuggestion] = useState("");
    const [title, setTitle] = useState("");
    const [targetAmount, setTargetAmount] = useState("");

    useEffect(() => {
        if (open) {
            setSuggestion("");
            setTitle("");
            setTargetAmount("");
        }
    }, [open]);

    // When user picks a suggestion, fill title (but allow manual edit after)
    const handleSuggestionChange = (e) => {
        const value = e.target.value;
        setSuggestion(value);

        if (value) {
            setTitle(value === "Other" ? "" : value);
        }
    };

    const handleCreate = () => {
        const cleanTitle = title.trim();
        const amount = Number(targetAmount);

        if (!cleanTitle) {
            alert("Please enter a goal title.");
            return;
        }
        if (!amount || amount <= 0) {
            alert("Please enter a target amount > 0.");
            return;
        }

        // For now: just return data to parent (backend hookup Step 2)
        onCreate?.({
            title: cleanTitle,
            targetAmount: amount,
        });

        onClose?.();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* overlay */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* modal */}
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Create a goal</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Choose a suggestion or type your own goal.
                        </p>
                    </div>

                    <button
                        className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-6 space-y-4">
                    <FormField label="Suggestions (optional)">
                        <Select value={suggestion} onChange={handleSuggestionChange}>
                            {SUGGESTIONS.map((s) => (
                                <option key={s.label} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="Goal title">
                        <Input
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Vacation in Spain"
                        />
                    </FormField>

                    <FormField label="Target amount">
                        <Input
                            type="number"
                            name="targetAmount"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            placeholder="e.g. 2000"
                            min="1"
                        />
                    </FormField>
                </div>

                <div className="mt-6 flex gap-3">
                    <Button type="button" className="w-full" onClick={handleCreate}>
                        Create
                    </Button>
                    <Button
                        type="button"
                        className="w-full bg-slate-200 text-slate-900 hover:bg-slate-300"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}