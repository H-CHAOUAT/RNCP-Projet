import ProgressBar from "./ProgressBar";

const money = (n, currency = "EUR") => {
    try {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(Number(n ?? 0));
    } catch {
        return `${Number(n ?? 0).toFixed(2)} ${currency}`;
    }
};

export default function GoalCard({ goal, currency = "EUR" }) {
    const pct =
        goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
    const remaining = goal.remainingAmount ?? Math.max(0, goal.targetAmount - goal.currentAmount);

    return (
        <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="font-semibold text-dark">{goal.title}</div>

                    {goal.description ? (
                        <div className="text-sm text-dark/50 mt-1">{goal.description}</div>
                    ) : null}

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        {goal.deadline ? <span>Échéance : {new Date(goal.deadline + "T12:00:00").toLocaleDateString("fr-FR")}</span> : null}
                        {goal.createdByName ? <span>Créé par : {goal.createdByName}</span> : null}
                        <span>{money(remaining, currency)} restant à épargner</span>
                    </div>

                    {goal.planLabel ? (
                        <div className="mt-1 text-xs font-medium text-wine">
                            Plan : {goal.planLabel} — {money(goal.planAmountPerPayday, currency)}/paie
                        </div>
                    ) : null}
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