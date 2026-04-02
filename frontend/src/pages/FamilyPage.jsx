import FamilyTab from "../components/organisms/profile/FamilyTab";

export default function FamilyPage() {
    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Family</h1>
                <p className="mt-1 text-slate-600">Manage your household members and roles.</p>
            </div>
            <FamilyTab />
        </div>
    );
}
