import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Topbar({ onMenuClick }) {
    const [userName, setUserName] = useState("");
    const { pathname } = useLocation();

    useEffect(() => {
        const u = localStorage.getItem("user");
        if (u) {
            const user = JSON.parse(u);
            setUserName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
        }
    }, []);

    const { title, subtitle } = useMemo(() => {
        if (pathname.startsWith("/dashboard"))    return { title: "Tableau de bord",    subtitle: `Bon retour, ${userName || "..."}!` };
        if (pathname.startsWith("/financial"))    return { title: "Profil financier",   subtitle: "Définissez vos revenus et charges mensuelles" };
        if (pathname.startsWith("/bills"))        return { title: "Factures",           subtitle: "Gérez vos factures récurrentes" };
        if (pathname.startsWith("/transactions")) return { title: "Transactions",       subtitle: "Suivez et gérez vos transactions" };
        if (pathname.startsWith("/family"))       return { title: "Famille",            subtitle: "Gérez votre foyer" };
        if (pathname.includes("/personal"))       return { title: "Paramètres",         subtitle: "Informations personnelles" };
        if (pathname.includes("/preferences"))    return { title: "Paramètres",         subtitle: "Préférences" };
        if (pathname.includes("/security"))       return { title: "Paramètres",         subtitle: "Sécurité" };
        if (pathname.includes("/family"))         return { title: "Paramètres",         subtitle: "Famille" };
        if (pathname.startsWith("/settings"))     return { title: "Paramètres",         subtitle: "Gérez les paramètres de votre compte" };
        return { title: "FinFamPlan", subtitle: "" };
    }, [pathname, userName]);

    const initials = userName
        ? userName.split(" ").filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join("")
        : "?";

    return (
        <header className="sticky top-0 z-30 border-b border-winePale bg-white/95 backdrop-blur-sm">
            <div className="flex h-16 items-center gap-3 px-4 md:px-6">
                <button
                    className="inline-flex items-center justify-center rounded-md p-2 hover:bg-winePale md:hidden text-dark/70"
                    onClick={onMenuClick} aria-label="Ouvrir le menu" type="button">
                    ☰
                </button>
                <div className="min-w-0 flex-1">
                    <div className="text-xl font-bold text-dark">{title}</div>
                    {subtitle && <div className="text-xs text-dark/50">{subtitle}</div>}
                </div>
                <NavLink to="/settings/personal"
                         className="ml-auto flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-winePale transition">
                    <span className="hidden md:block text-sm font-medium text-dark">{userName || "—"}</span>
                    <div className="h-9 w-9 rounded-full bg-wine flex items-center justify-center text-white font-semibold text-sm">
                        {initials}
                    </div>
                </NavLink>
            </div>
        </header>
    );
}
