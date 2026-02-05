import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Topbar({ onMenuClick }) {
    const [userName, setUserName] = useState("");
    const { pathname } = useLocation();

    useEffect(() => {
        const userString = localStorage.getItem("user");
        if (userString) {
            const user = JSON.parse(userString);
            const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
            setUserName(full);
        } else {
            setUserName("");
        }
    }, []);

    const { title, subtitle } = useMemo(() => {

        if (pathname.startsWith("/dashboard")) {
            return {
                title: "Dashboard",
                subtitle: `welcome back, ${userName || "loading..."}!`,
            };
        }

        if (pathname.startsWith("/settings")) {
            if (pathname.includes("/personal"))
                return { title: "Settings", subtitle: "Personal information" };
            if (pathname.includes("/preferences"))
                return { title: "Settings", subtitle: "Preferences" };
            if (pathname.includes("/security"))
                return { title: "Settings", subtitle: "Security" };
            if (pathname.includes("/family"))
                return { title: "Settings", subtitle: "Family" };

            return { title: "Settings", subtitle: "Manage your account settings" };
        }

        if (pathname.startsWith("/financial")) {
            return { title: "Financial profile", subtitle: "Set your income and monthly expenses" };
        }

        if (pathname.startsWith("/bills")) {
            return { title: "Bills", subtitle: "Manage recurring bills" };
        }

        if (pathname.startsWith("/transactions")) {
            return { title: "Transactions", subtitle: "Track and manage your transactions" };
        }

        if (pathname.startsWith("/analysis")) {
            return { title: "Analysis", subtitle: "Insights and reports" };
        }

        if (pathname.startsWith("/family")) {
            return { title: "Family", subtitle: "Manage your household" };
        }

        // Backward compatibility (if you still have /profile)
        if (pathname.startsWith("/profile")) {
            return { title: "Settings", subtitle: "Personal information" };
        }

        return { title: "FinFamPlan", subtitle: "" };
    }, [pathname, userName]);

    const initials =
        userName
            ? userName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0].toUpperCase())
                .join("")
            : "?";

    return (
        <header className="sticky top-0 z-30 border-b bg-white">
            <div className="flex h-16 items-center gap-3 px-4 md:px-6">
                {/* Burger button only on mobile */}
                <button
                    className="inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100 md:hidden"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                    type="button"
                >
                    ☰
                </button>

                <div className="min-w-0 flex-1">
                    <div className="text-2xl font-bold text-[#322D29]">{title}</div>
                    {subtitle ? <div className="text-sm text-gray-600">{subtitle}</div> : null}
                </div>

                <NavLink
                    to="/settings/personal"
                    className="ml-auto flex items-center gap-3 rounded-md px-2 py-1 hover:bg-slate-50"
                    aria-label="Open account settings"
                >
          <span className="hidden md:block text-sm font-medium text-[#322D29]">
            {userName || "—"}
          </span>

                    <div className="h-9 w-9 rounded-full bg-[#72383D] flex items-center justify-center text-white font-semibold">
                        {initials}
                    </div>
                </NavLink>
            </div>
        </header>
    );
}
