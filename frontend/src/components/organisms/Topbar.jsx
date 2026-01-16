import { useEffect, useState } from "react";

export default function Topbar({ onMenuClick }) {
    const [userName, setUserName] = useState("");

    useEffect(() => {
        // Get user info from localStorage
        const userString = localStorage.getItem("user");
        if (userString) {
            const user = JSON.parse(userString);
            setUserName(`${user.firstName} ${user.lastName}`);
        }
    }, []);

    return (
        <header className="sticky top-0 z-30 border-b bg-white">
            <div className="flex h-16 items-center gap-3 px-4 md:px-6">
                {/* Burger button only on mobile */}
                <button
                    className="inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100 md:hidden"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                >
                    ☰
                </button>

                {/* Dashboard Title + Welcome Message */}
                <div className="min-w-0 flex-1">
                    <div className="text-2xl font-bold text-[#322D29]">
                        Dashboard
                    </div>
                    <div className="text-sm text-gray-600">
                        welcome back, {userName || "loading..."}!
                    </div>
                </div>

                {/* User Profile Section (right side) */}
                <div className="ml-auto flex items-center gap-3">
                    <span className="hidden md:block text-sm font-medium text-[#322D29]">
                        {userName}
                    </span>
                    <div className="h-9 w-9 rounded-full bg-[#72383D] flex items-center justify-center text-white font-semibold">
                        {userName ? userName.split(' ').map(n => n[0]).join('') : '?'}
                    </div>
                </div>
            </div>
        </header>
    );
}