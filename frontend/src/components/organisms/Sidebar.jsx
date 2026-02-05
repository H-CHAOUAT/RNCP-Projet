import { NavLink, useNavigate } from "react-router-dom";

const base =
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition";
const inactive = "text-slate-700 hover:bg-slate-100";
const active = "bg-slate-100 text-slate-900 font-medium";

export default function Sidebar({ open, onClose }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
    };

    const linkClass = ({ isActive }) => `${base} ${isActive ? active : inactive}`;

    return (
        <aside
            className={[
                "fixed left-0 top-0 z-50 h-screen w-72 border-r bg-white",
                "md:sticky md:z-10",
                open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                "transition-transform duration-200",
            ].join(" ")}
            aria-label="Sidebar"
        >
            <div className="flex h-full flex-col p-4">
                {/* Brand */}
                <div className="mb-4 flex items-center justify-between">
                    <NavLink
                        to="/dashboard"
                        className="text-lg font-bold text-slate-900 hover:opacity-80"
                        onClick={onClose}
                    >
                        FinFamPlan
                    </NavLink>

                    <button
                        className="rounded-md p-2 hover:bg-slate-100 md:hidden"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        ✕
                    </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    <NavLink to="/dashboard" className={linkClass} onClick={onClose}>
                        Dashboard
                    </NavLink>

                    <NavLink to="/financial" className={linkClass} onClick={onClose}>
                        Financial profile
                    </NavLink>

                    <NavLink to="/transactions" className={linkClass} onClick={onClose}>
                        Transactions
                    </NavLink>

                    <NavLink to="/analysis" className={linkClass} onClick={onClose}>
                        Analysis
                    </NavLink>

                    <NavLink to="/family" className={linkClass} onClick={onClose}>
                        Family
                    </NavLink>
                </nav>

                <div className="mt-6 rounded-lg border bg-slate-50 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Quick actions
                    </div>
                    <NavLink to="/bills" className={linkClass} onClick={onClose}>
                        + Add bills
                    </NavLink>
                    <div className="space-y-2">
                        <button className="w-full rounded-md bg-white px-3 py-2 text-left text-sm hover:bg-slate-100">
                            + Add expense
                        </button>
                        <button className="w-full rounded-md bg-white px-3 py-2 text-left text-sm hover:bg-slate-100">
                            + Add goal
                        </button>
                    </div>
                </div>

                <div className="mt-auto space-y-1 pt-6">
                    <NavLink to="/settings" className={linkClass} onClick={onClose}>
                        Settings
                    </NavLink>

                    <button
                        className={`${base} w-full ${inactive}`}
                        onClick={handleLogout}
                    >
                        Log out
                    </button>
                </div>
            </div>
        </aside>
    );
}
