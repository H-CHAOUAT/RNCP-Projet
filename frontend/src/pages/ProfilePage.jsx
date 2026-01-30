import { Outlet } from "react-router-dom";
import ProfileTabs from "../components/organisms/profile/ProfileTabs.jsx";

export default function ProfilePage() {
    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
                <p className="mt-1 text-slate-600">
                    Manage your personal info, preferences, security, and family.
                </p>
            </div>

            <ProfileTabs />

            <Outlet />
        </div>
    );
}
