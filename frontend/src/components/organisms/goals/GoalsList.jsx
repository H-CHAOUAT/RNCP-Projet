import { useState } from "react";
import GoalCard from "../../molecules/GoalCard";
import DeleteGoalDialog from "../../molecules/DeleteGoalDialog";

const HORIZONS = [
    ["", "Tous"],
    ["SHORT", "Court terme"],
    ["MEDIUM", "Moyen terme"],
    ["LONG", "Long terme"],
];

export default function GoalsList({
    goals,
    loading,
    currency = "EUR",
    emptyMessage = "Aucun objectif pour l'instant. Créez le premier.",
    canDelete = () => false,
    onDelete,
}) {
    const [horizonFilter, setHorizonFilter] = useState("");
    const [goalToDelete, setGoalToDelete] = useState(null);

    if (loading) return <p className="text-dark/50">Chargement des objectifs...</p>;

    if (!goals?.length) {
        return <p className="text-dark/50">{emptyMessage}</p>;
    }

    const filtered = horizonFilter
        ? goals.filter((g) => g.horizon === horizonFilter)
        : goals;

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {HORIZONS.map(([value, label]) => (
                    <button
                        key={value || "all"}
                        type="button"
                        onClick={() => setHorizonFilter(value)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            horizonFilter === value
                                ? "bg-wine text-white"
                                : "bg-white border text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <p className="text-dark/50">Aucun objectif pour cet horizon.</p>
            ) : (
                filtered.map((g) => (
                    <GoalCard key={g.id} goal={g} currency={currency}
                              onDelete={canDelete(g) ? setGoalToDelete : undefined} />
                ))
            )}

            {goalToDelete && (
                <DeleteGoalDialog goal={goalToDelete} currency={currency}
                                  onConfirm={onDelete} onClose={() => setGoalToDelete(null)} />
            )}
        </div>
    );
}