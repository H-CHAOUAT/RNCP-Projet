import { useMemo, useState, useEffect } from "react";
import Input from "../../atoms/Input";
import Select from "../../atoms/Select";
import Button from "../../atoms/Button";

export default function CreateGoalModal({ open, onClose, onCreate }) {
    const [suggestion, setSuggestion] = useState("");
    const [title, setTitle] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState(""); // YYYY-MM-DD

    const [saving, setSaving] = useState(false);

    const userId = useMemo(() => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            return u.id ?? u.userId ?? null;
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        if (!open) return;
        // reset when opening (optional)
        setSuggestion("");
        setTitle("");
        setTargetAmount("");
        setDescription("");
        setDeadline("");
    }, [open]);

    if (!open) return null;

    const handleSuggestionChange = (e) => {
        const value = e.target.value;
        setSuggestion(value);


        if (value) setTitle(value);
    };

    const handleCreate = async () => {
        if (saving) return;

        if (!userId) {
            alert("No user session found. Please login again.");
            return;
        }
        if (!title.trim()) {
            alert("Please enter a goal title.");
            return;
        }
        if (!targetAmount || Number(targetAmount) <= 0) {
            alert("Please enter a valid target amount.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                targetAmount: Number(targetAmount),
                deadline: deadline || null, // backend expects LocalDate (YYYY-MM-DD)
            };

            const res = await fetch(`http://localhost:8080/api/goals/user/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                alert("❌ Create failed: " + text);
                return;
            }

            const created = await res.json();


            onCreate?.(created);
            onClose?.();
        } catch (err) {
            console.error(err);
            alert("❌ Create failed.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Create a goal</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Choose a suggestion or type your own goal.
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-md p-2 hover:bg-slate-100" aria-label="Close">
                        ✕
                    </button>
                </div>

                <div className="mt-6 space-y-4">

                    <div>
                        <div className="mb-2 text-sm font-medium text-slate-700">Suggestions (optional)</div>
                        <Select value={suggestion} onChange={handleSuggestionChange}>
                            <option value="">— Choose a suggestion (optional) —</option>
                            <option value="Vacation">Vacation</option>
                            <option value="Family Trip">Family Trip</option>
                            <option value="Emergency fund">Emergency fund</option>
                            <option value="New car">New car</option>
                        </Select>
                    </div>

                    <div>
                        <div className="mb-2 text-sm font-medium text-slate-700">Goal title</div>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Vacation in Spain" />
                    </div>


                    <div>
                        <div className="mb-2 text-sm font-medium text-slate-700">Description (optional)</div>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Flights + hotel for 4"
                        />
                    </div>


                    <div>
                        <div className="mb-2 text-sm font-medium text-slate-700">Deadline (optional)</div>
                        <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                    </div>

                    <div>
                        <div className="mb-2 text-sm font-medium text-slate-700">Target amount</div>
                        <Input
                            type="number"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            placeholder="e.g. 2000"
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <Button type={"button"} onClick={handleCreate} disabled={saving} className="w-full">
                        {saving ? "Creating..." : "Create"}
                    </Button>
                    <Button type="button" onClick={onClose} disabled={saving} isabled={saving} className="w-full bg-slate-200 text-slate-900 hover:bg-slate-300">
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}