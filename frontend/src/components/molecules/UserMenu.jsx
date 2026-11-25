import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { logout } from "../../api/session";

const item = "flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition";

/** Name and avatar in the top bar; clicking them opens the account menu. */
export default function UserMenu({ userName, initials }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
        const onKeyDown = (e) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div ref={rootRef} className="relative ml-auto">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
                    aria-label={`Menu du compte${userName ? ` de ${userName}` : ""}`}
                    className="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-winePale transition">
                <span className="hidden md:block text-sm font-medium text-dark">{userName || "—"}</span>
                <span className="h-9 w-9 rounded-full bg-wine flex items-center justify-center text-white font-semibold text-sm">
                    {initials}
                </span>
                <ChevronDown className="h-4 w-4 text-dark/40" aria-hidden="true" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-winePale bg-white py-1 shadow-lg">
                    <Link to="/settings/personal" onClick={() => setOpen(false)}
                          className={`${item} text-dark/70 hover:bg-winePale hover:text-wine`}>
                        <Settings className="h-4 w-4" aria-hidden="true" /> Paramètres
                    </Link>
                    <button type="button" onClick={handleLogout}
                            className={`${item} text-red-600 hover:bg-red-50 hover:text-red-700`}>
                        <LogOut className="h-4 w-4" aria-hidden="true" /> Se déconnecter
                    </button>
                </div>
            )}
        </div>
    );
}
