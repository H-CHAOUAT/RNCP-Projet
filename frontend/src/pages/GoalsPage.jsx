import { useEffect, useMemo, useState } from "react";
import Button from "../components/atoms/Button";
import CreateGoalModal from "../components/organisms/goals/CreateGoalModal";
import GoalsList from "../components/organisms/goals/GoalsList";

export default function GoalsPage() {
    const [open, setOpen] = useState(false);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = useMemo(() => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            return u.id ?? u.userId ?? null;
        } catch {
            return null;
        }
    }, []);

    const loadGoals = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/goals/user/${userId}`);
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setGoals(data);
        } catch (e) {
            console.error(e);
            alert("❌ Failed to load goals.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGoals();
    }, [userId]);

    const handleCreate = async (goalPayload) => {
        if (!userId) return alert("No user session. Login again.");

        try {
            const res = await fetch(`http://localhost:8080/api/goals/user/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(goalPayload),
            });

            if (!res.ok) throw new Error(await res.text());

            setOpen(false);
            await loadGoals();
        } catch (e) {
            console.error(e);
            alert("❌ Failed to create goal.");
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Goals</h1>
                    <p className="mt-1 text-slate-600">Create savings goals and track progress.</p>
                </div>

                <Button type="button" onClick={() => setOpen(true)}>
                    + Create goal
                </Button>
            </div>

            <div className="rounded-xl border bg-white p-6">
                <GoalsList goals={goals} loading={loading} />
            </div>

            <CreateGoalModal open={open} onClose={() => setOpen(false)} onCreate={handleCreate} />
        </div>
    );
}