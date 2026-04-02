import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Logo from "../atoms/Logo";
import CreateBillModal from "./bills/CreateBillModal";

const base      = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition";
const inactive  = "text-dark/70 hover:bg-winePale hover:text-wine";
const active    = "bg-winePale text-wine font-semibold border-l-2 border-wine";
const subBase   = "text-xs px-3 py-1.5 rounded-md transition flex items-center gap-2 w-full text-left";
const subActive   = `${subBase} text-wine font-medium bg-winePale`;
const subInactive = `${subBase} text-dark/60 hover:text-wine hover:bg-winePale`;
const TABS = ["Overview", "Goals", "Expenses", "Analysis"];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [billOpen, setBillOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const linkClass = ({ isActive }) => `${base} ${isActive ? active : inactive}`;

  const getCurrentTab = () => {
    const params = new URLSearchParams(location.search);
    const t = params.get("tab");
    if (t) return TABS.find(x => x.toLowerCase() === t.toLowerCase()) ?? "Overview";
    if (location.pathname === "/financial") return "Overview";
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
        ].join(" ")} aria-label="Sidebar">

          <div className="flex h-full flex-col p-4 overflow-y-auto">

            {/* Brand */}
            <div className="mb-6 flex items-center justify-between">
              <button onClick={() => { navigate("/dashboard"); onClose?.(); }}
                      className="flex items-center gap-2 hover:opacity-80">
                <Logo size="sm" variant="dark" />
                <span className="text-base font-bold text-dark">FinFamPlan</span>
              </button>
              <button className="rounded-md p-1.5 hover:bg-winePale md:hidden text-dark/50"
                      onClick={onClose} aria-label="Close sidebar">✕</button>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
              <NavLink to="/dashboard" className={linkClass} onClick={onClose}>
                <span>🏠</span> Dashboard
              </NavLink>

              <NavLink to="/financial" className={linkClass} onClick={onClose}>
                <span>💰</span> Financial profile
              </NavLink>

              <div className="ml-4 space-y-0.5 border-l-2 border-winePale pl-3">
                <button onClick={() => goToTab("Overview")} className={currentTab === "Overview" ? subActive : subInactive}>
                  <span>◦</span> Overview
                </button>
                <button onClick={() => goToTab("Goals")} className={currentTab === "Goals" ? subActive : subInactive}>
                  <span>◦</span> Goals
                </button>
                <button onClick={() => goToTab("Expenses")} className={currentTab === "Expenses" ? subActive : subInactive}>
                  <span>◦</span> Expenses
                </button>
                <button onClick={() => goToTab("Analysis")} className={currentTab === "Analysis" ? subActive : subInactive}>
                  <span>◦</span> Analysis
                </button>
              </div>

              <NavLink to="/transactions" className={linkClass} onClick={onClose}>
                <span>💳</span> Transactions
              </NavLink>
              <NavLink to="/bills" className={linkClass} onClick={onClose}>
                <span>🧾</span> Bills
              </NavLink>
              <NavLink to="/family" className={linkClass} onClick={onClose}>
                <span>👨‍👩‍👧</span> Family
              </NavLink>
            </nav>

            {/* Quick Actions */}
            <div className="mt-4 rounded-xl border border-winePale bg-winePale/50 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-wine/70">
                Quick actions
              </div>
              <div className="space-y-1">
                {/* FIX: opens modal instead of navigating to bills page */}
                <button className={`${base} w-full text-left ${inactive}`}
                        onClick={() => setBillOpen(true)}>
                  🧾 Add bill
                </button>
                <button className={`${base} w-full text-left ${inactive}`}
                        onClick={() => goToTab("Goals")}>
                  🎯 Add goal
                </button>
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-4 border-t border-winePale pt-4 space-y-1">
              <NavLink to="/settings/personal" className={linkClass} onClick={onClose}>
                <span>⚙️</span> Settings
              </NavLink>
              <button onClick={handleLogout}
                      className={`${base} w-full text-left hover:bg-red-50 hover:text-red-700 text-red-600`}>
                <span>🚪</span> Log out
              </button>
            </div>
          </div>
        </aside>

        {/* Bill modal — renders outside sidebar so it's not clipped */}
        <CreateBillModal
            open={billOpen}
            onClose={() => setBillOpen(false)}
            onCreated={() => setBillOpen(false)}
        />
      </>
  );
}