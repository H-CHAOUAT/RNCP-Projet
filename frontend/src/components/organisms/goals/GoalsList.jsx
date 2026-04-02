import GoalCard from "../../molecules/GoalCard";

export default function GoalsList({ goals, loading }) {
    if (loading) return <p className="text-dark/50">Loading goals...</p>;

    if (!goals?.length) {
        return <p className="text-dark/50">No goals yet. Create your first one.</p>;
    }

    return (
        <div className="space-y-4">
            {goals.map((g) => (
                <GoalCard key={g.id} goal={g} />
            ))}
        </div>
    );
}