import { useState } from "react";
import Button from "../components/atoms/Button";
import CreateGoalModal from "../components/organisms/goals/CreateGoalModal";
import GoalsList from "../components/organisms/goals/GoalsList";

export default function GoalsPage() {
    const [open, setOpen] = useState(false);
    const [tempGoals, setTempGoals] = useState([]);

    const handleCreate = (goal) => {
        setTempGoals((prev) => [
            { ...goal, id: Date.now(), currentAmount: 0 },
            ...prev,
        ]);
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Goals</h1>
                    <p className="mt-1 text-slate-600">
                        Create savings goals and track progress.
                    </p>
                </div>

                <Button type="button" onClick={() => setOpen(true)}>
                    + Create goal
                </Button>
            </div>

            <div className="rounded-xl border bg-white p-6">
                <GoalsList goals={tempGoals} />
            </div>

            <CreateGoalModal
                open={open}
                onClose={() => setOpen(false)}
                onCreate={handleCreate}
            />
        </div>
    );
}