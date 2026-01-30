import { NavLink } from "react-router-dom";

const tabs = [
    { to: "/settings/personal", label: "Personal info" },
    { to: "/settings/preferences", label: "Preferences" },
    { to: "/settings/security", label: "Security" },
    { to: "/settings/family", label: "Family" },
];

export default function ProfileTabs() {
    return (
        <div className="border-b">
            <nav className="flex gap-6">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        className={({ isActive }) =>
                            `pb-3 text-sm font-medium transition ${
                                isActive
                                    ? "border-b-2 border-slate-900 text-slate-900"
                                    : "text-slate-500 hover:text-slate-900"
                            }`
                        }
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
