import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Logo from "../atoms/Logo";
import CreateBillModal from "./bills/CreateBillModal";
import CreateGoalModal from "./goals/CreateGoalModal";

const base      = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition";
const inactive  = "text-dark/70 hover:bg-winePale hover:text-wine";
const active    = "bg-winePale text-wine font-semibold border-l-2 border-wine";
const quickAction = "flex flex-col items-center gap-1.5 rounded-xl border border-wine/30 px-2 py-3 text-xs font-semibold text-wine transition hover:border-wine hover:bg-winePale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine";
const subBase   = "text-xs px-3 py-1.5 rounded-md transition flex items-center gap-2 w-full text-left";
const subActive   = `${subBase} text-wine font-medium bg-winePale`;
const subInactive = `${subBase} text-dark/60 hover:text-wine hover:bg-winePale`;
const TABS = ["Vue d'ensemble", "Objectifs", "Analyse"];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [billOpen, setBillOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const linkClass = ({ isActive }) => `${base} ${isActive ? active : inactive}`;
  const subLinkClass = ({ isActive }) => (isActive ? subActive : subInactive);

  const getCurrentTab = () => {
    const params = new URLSearchParams(location.search);
    const t = params.get("tab");
    if (t) return TABS.find(x => x.toLowerCase() === t.toLowerCase()) ?? "Vue d'ensemble";
    if (location.pathname === "/financial") return "Vue d'ensemble";
    return null;
  };
  const currentTab = getCurrentTab();

  const goToTab = (tab) => {
    navigate(`/financial?tab=${tab.toLowerCase()}`, { state: { tab } });
    onClose?.();
  };

  return (
      <>
        <aside className={[
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-winePale bg-white flex flex-col",
          "md:sticky md:z-10",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "transition-transform duration-200",
        ].join(" ")} aria-label="Menu latéral">

          <div className="flex h-full flex-col p-4 overflow-y-auto">

            
            <div className="mb-6 flex items-center justify-between">
              <button onClick={() => { navigate("/dashboard"); onClose?.(); }}
                      className="flex items-center gap-2 hover:opacity-80">
                <Logo size="sm" variant="dark" />
                <span className="text-base font-bold text-dark">FinFamPlan</span>
              </button>
              <button className="rounded-md p-1.5 hover:bg-winePale md:hidden text-dark/50"
                      onClick={onClose} aria-label="Fermer le menu">✕</button>
            </div>

            
            <nav className="space-y-1 flex-1">
              <NavLink to="/dashboard" className={linkClass} onClick={onClose}>
                <span>🏠</span> Tableau de bord
              </NavLink>

              <div className="!my-3 grid grid-cols-2 gap-2" role="group" aria-label="Actions rapides">
                {[
                  { icon: "🧾", label: "Facture",  onClick: () => setBillOpen(true) },
                  { icon: "🎯", label: "Objectif", onClick: () => setGoalOpen(true) },
                ].map((a) => (
                  <button key={a.label} type="button" onClick={a.onClick}
                          aria-label={`Ajouter : ${a.label.toLowerCase()}`} className={quickAction}>
                    <span className="text-lg leading-none" aria-hidden="true">{a.icon}</span>
                    <span>+ {a.label}</span>
                  </button>
                ))}
              </div>

              <NavLink to="/financial" className={linkClass} onClick={onClose}>
                <span>💰</span> Profil financier
              </NavLink>

              <div className="ml-4 space-y-0.5 border-l-2 border-winePale pl-3">
                <button onClick={() => goToTab("Vue d'ensemble")} className={currentTab === "Vue d'ensemble" ? subActive : subInactive}>
                  <span>◦</span> Vue d'ensemble
                </button>
                <button onClick={() => goToTab("Objectifs")} className={currentTab === "Objectifs" ? subActive : subInactive}>
                  <span>◦</span> Objectifs
                </button>
                <button onClick={() => goToTab("Analyse")} className={currentTab === "Analyse" ? subActive : subInactive}>
                  <span>◦</span> Analyse
                </button>
              </div>

              <NavLink to="/transactions" onClick={onClose}
                       className={() => linkClass({ isActive: ["/transactions", "/bills"].includes(location.pathname) })}>
                <span>💳</span> Opérations
              </NavLink>

              <div className="ml-4 space-y-0.5 border-l-2 border-winePale pl-3">
                <NavLink to="/transactions" className={subLinkClass} onClick={onClose}>
                  <span>◦</span> Transactions
                </NavLink>
                <NavLink to="/bills" className={subLinkClass} onClick={onClose}>
                  <span>◦</span> Factures
                </NavLink>
              </div>

              <NavLink to="/family" className={linkClass} onClick={onClose}>
                <span>👨‍👩‍👧</span> Famille
              </NavLink>
            </nav>

            
            <div className="mt-4 border-t border-winePale pt-4 space-y-1">
              <NavLink to="/settings/personal" className={linkClass} onClick={onClose}>
                <span>⚙️</span> Paramètres
              </NavLink>
              <button onClick={handleLogout}
                      className={`${base} w-full text-left hover:bg-red-50 hover:text-red-700 text-red-600`}>
                <span>🚪</span> Se déconnecter
              </button>
            </div>
          </div>
        </aside>

        
        <CreateBillModal
            open={billOpen}
            onClose={() => setBillOpen(false)}
            onCreated={() => { setBillOpen(false); navigate("/bills"); }}
        />
        <CreateGoalModal
            open={goalOpen}
            onClose={() => setGoalOpen(false)}
            onCreated={() => { setGoalOpen(false); navigate("/financial?tab=goals"); }}
        />
      </>
  );
}