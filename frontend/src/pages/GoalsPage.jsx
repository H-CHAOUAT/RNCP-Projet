import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import CreateGoalModal from "../components/organisms/goals/CreateGoalModal";
import GoalsList from "../components/organisms/goals/GoalsList";
import { apiFetch } from "../api/apiFetch";

export default function GoalsPage() {
    const [open, setOpen] = useState(false);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const userId = useMemo(() => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            return u.id ?? u.userId ?? null;
        } catch {
            return null;
        }
    }, []);

    const loadGoals = async () => {
        if (!userId) { setLoading(false); return; }
        try {
            const res = await apiFetch(`/api/goals/user/${userId}`);
            if (!res.ok) throw new Error(await res.text());
            setGoals(await res.json());
        } catch {} finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadGoals(); }, [userId]);

    const handleCreated = (newGoal) => {
        setGoals((prev) => [...prev, newGoal]);
        setOpen(false);
    };

    const existingTitles = goals.map((g) => g.title);

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Goals</h1>
                    <p className="mt-1 text-slate-600">Create savings goals and track your progress.</p>
                </div>
                <Button type="button" onClick={() => setOpen(true)}>
                    + Create goal
                </Button>
            </div>

            <div className="rounded-xl border bg-white p-6">
                <GoalsList goals={goals} loading={loading} onRefresh={loadGoals} />
            </div>

            <CreateGoalModal
                open={open}
                onClose={() => setOpen(false)}
                onCreated={handleCreated}
                existingTitles={existingTitles}
                userId={userId}
            />
        </div>
    );
}
