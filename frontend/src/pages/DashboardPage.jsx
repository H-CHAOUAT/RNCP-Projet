import Heading from "../components/atoms/Heading";
import Paragraph from "../components/atoms/Paragraph";

export default function DashboardPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#EFE9E1]">
            <Heading level="h1" className="text-3xl mb-4">Dashboard</Heading>
            <Paragraph>Welcome to your FinFamPlan dashboard — manage your goals, budgets, and progress here.</Paragraph>
        </div>
    );
}
