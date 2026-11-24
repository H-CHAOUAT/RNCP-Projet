import { Outlet } from "react-router-dom";
import ProfileTabs from "../components/organisms/profile/ProfileTabs.jsx";

export default function ProfilePage() {
    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Paramètres</h1>
                <p className="mt-1 text-slate-600">
                    Gérez vos informations personnelles, préférences, sécurité et foyer.
                </p>
            </div>

            <ProfileTabs />

            <Outlet />
        </div>
    );
}
