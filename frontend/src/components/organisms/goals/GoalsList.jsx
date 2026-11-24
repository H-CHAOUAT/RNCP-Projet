import GoalCard from "../../molecules/GoalCard";

export default function GoalsList({ goals, loading }) {
    if (loading) return <p className="text-dark/50">Chargement des objectifs...</p>;

    if (!goals?.length) {
        return <p className="text-dark/50">Aucun objectif pour l'instant. Créez le premier.</p>;
    }

    return (
        <div className="space-y-4">
            {goals.map((g) => (
                <GoalCard key={g.id} goal={g} />
            ))}
        </div>
    );
}