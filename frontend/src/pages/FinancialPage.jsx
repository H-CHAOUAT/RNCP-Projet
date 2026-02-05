import FinancialForm from "../components/organisms/financial/FinancialForm";

export default function FinancialPage() {
    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Financial information</h1>
                <p className="mt-1 text-slate-600">
                    Set your monthly income and fixed expenses.
                </p>
            </div>

            <FinancialForm />
        </div>
    );
}
