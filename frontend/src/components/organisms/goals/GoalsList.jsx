import GoalCard from "../../molecules/GoalCard";

export default function GoalsList({ goals }) {
    if (!goals?.length) {
        return <p className="text-slate-600">No goals yet. Create your first one.</p>;
    }

    return (
        <div className="space-y-4">
            {goals.map((g) => (
                <GoalCard key={g.id} goal={g} />
            ))}
        </div>
    );
}