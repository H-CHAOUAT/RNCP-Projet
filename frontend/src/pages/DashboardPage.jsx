export default function DashboardPage() {
    return (
        <div className="p-6 space-y-6">

            {/* TOP KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <p className="text-sm text-gray-500">Total Balance</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">€8,500.00</p>
                    <p className="mt-1 text-xs text-gray-400">Updated this month</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <p className="text-sm text-gray-500">Total Expenses</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">€5,000.00</p>
                    <p className="mt-1 text-xs text-gray-400">Monthly spending</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <p className="text-sm text-gray-500">Goals Progress</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">39%</p>
                    <div className="mt-3 h-2 rounded bg-slate-100">
                        <div className="h-2 w-[39%] rounded bg-[#72383D]" />
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* CHART PLACEHOLDER */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border">
                    <p className="text-sm font-medium text-slate-700 mb-4">
                        Spending statistics
                    </p>
                    <div className="flex h-64 items-center justify-center rounded-md border border-dashed text-gray-400">
                        Chart will appear here
                    </div>
                </div>

                {/* TRANSACTIONS */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <p className="text-sm font-medium text-slate-700 mb-4">
                        Recent transactions
                    </p>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span>Central Burger</span>
                            <span className="text-red-500">-€189.36</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>The Market</span>
                            <span className="text-red-500">-€92.50</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Salary</span>
                            <span className="text-green-600">+€8,500</span>
                        </div>
                    </div>

                    <button className="mt-4 w-full rounded-md bg-slate-900 py-2 text-sm text-white hover:bg-slate-800">
                        View more
                    </button>
                </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <p className="text-sm font-medium mb-2">Goals</p>
                    <p className="text-sm text-gray-500">
                        Summer vacation – 39% reached
                    </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <p className="text-sm font-medium mb-2">Spending overview</p>
                    <p className="text-sm text-gray-500">
                        Groceries, Rent, Leisure
                    </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <p className="text-sm font-medium mb-2">Insights</p>
                    <p className="text-sm text-gray-500">
                        You spent 20% more on groceries this month
                    </p>
                </div>

            </div>
        </div>
    );
}
