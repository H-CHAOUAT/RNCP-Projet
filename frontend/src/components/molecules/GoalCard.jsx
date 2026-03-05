import ProgressBar from "./ProgressBar";

export default function GoalCard({ goal }) {
    return (
        <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">{goal.title}</div>
                <div className="text-sm text-slate-600">
                    {goal.currentAmount} / {goal.targetAmount}
                </div>
            </div>

            <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
        </div>
    );
}