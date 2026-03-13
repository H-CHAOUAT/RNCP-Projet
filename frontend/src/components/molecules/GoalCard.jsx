import ProgressBar from "./ProgressBar";

export default function GoalCard({ goal }) {
    const pct =
        goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;

    return (
        <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="font-semibold text-slate-900">{goal.title}</div>

                    {goal.description ? (
                        <div className="text-sm text-slate-600 mt-1">{goal.description}</div>
                    ) : null}

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        {goal.deadline ? <span>Deadline: {goal.deadline}</span> : null}
                        {goal.createdByName ? <span>Created by: {goal.createdByName}</span> : null}
                    </div>
                </div>

                <div className="text-sm text-slate-700 text-right">
                    <div>
                        {goal.currentAmount} / {goal.targetAmount}
                    </div>
                    <div className="text-xs text-slate-500">{pct.toFixed(0)}%</div>
                </div>
            </div>

            <div className="mt-3">
                <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
            </div>
        </div>
    );
}