import Heading from "../atoms/Heading";
import Paragraph from "../atoms/Paragraph";
import Button from "../atoms/Button";
import { useNavigate } from "react-router-dom";

export default function WelcomeMessage({ userName = "User" }) {
    const navigate = useNavigate();

    return (
        <div className="text-center space-y-6 max-w-lg">
            <Heading level="h1" className="text-4xl font-bold text-[#322D29]">
                Welcome {userName} 👋
            </Heading>
            <Paragraph>
                Welcome to <span className="font-semibold">FinFamPlan</span> — your all-in-one space to plan smarter, spend better,
                and reach your financial goals together.
            </Paragraph>
            <Paragraph>
                Whether you're managing finances solo or with your family, FinFamPlan helps you track expenses,
                build goals, and set budgets that make sense.
            </Paragraph>

            <div className="flex justify-center gap-4 mt-8">
                <Button
                    onClick={() => navigate("/dashboard")}
                    className="bg-[#72383D] hover:bg-[#322D29] text-white px-6 py-3 rounded-xl shadow-md transition-all"
                >
                    Go to Dashboard
                </Button>
                <Button
                    onClick={() => navigate("/profile")}
                    className="border-2 border-[#72383D] text-[#72383D] hover:bg-[#72383D] hover:text-white px-6 py-3 rounded-xl transition-all"
                >
                    Complete My Profile
                </Button>
            </div>
        </div>
    );
}
