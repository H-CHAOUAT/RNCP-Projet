import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/organisms/Sidebar";
import Topbar from "../components/organisms/Topbar";

export default function AppLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            navigate("/login", { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const onKeyDown = (e) => { if (e.key === "Escape") setIsSidebarOpen(false); };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    if (!sessionStorage.getItem("token")) return null;

    return (
        <div className="min-h-screen bg-cream">
            {isSidebarOpen && (
                <button aria-label="Close sidebar overlay"
                        className="fixed inset-0 z-40 bg-black/40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)} />
            )}
            <div className="flex">
                <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <div className="flex min-w-0 flex-1 flex-col">
                    <Topbar onMenuClick={() => setIsSidebarOpen((v) => !v)} />
                    <main className="min-w-0 p-4 md:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
