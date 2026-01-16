export default function Topbar({ onMenuClick }) {
    return (
        <header className="sticky top-0 z-30 border-b bg-white">
            <div className="flex h-14 items-center gap-3 px-4 md:px-6">
                {/* Burger button only on mobile */}
                <button
                    className="inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100 md:hidden"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                >
                    ☰
                </button>

                <div className="min-w-0">
                    <div className="truncate text-sm text-slate-500">FinFamPlan</div>
                    <div className="truncate text-base font-semibold text-slate-900">
                        Dashboard
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                </div>
            </div>
        </header>
    );
}
