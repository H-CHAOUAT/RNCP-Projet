import Heading from "../atoms/Heading";
import Paragraph from "../atoms/Paragraph";
import Button from "../atoms/Button";
import { useNavigate } from "react-router-dom";

export default function WelcomeMessage({ userName = "User" }) {
    const navigate = useNavigate();

    return (
        <div className="text-center space-y-6 max-w-lg">
            <Heading level="h1" className="text-4xl font-bold text-[#322D29]">
                Bienvenue {userName} 👋
            </Heading>
            <Paragraph>
                Bienvenue sur <span className="font-semibold">FinFamPlan</span> — votre espace tout-en-un pour planifier plus intelligemment, dépenser mieux,
                et atteindre vos objectifs financiers ensemble.
            </Paragraph>
            <Paragraph>
                Que vous gériez vos finances seul ou en famille, FinFamPlan vous aide à suivre vos dépenses,
                à construire des objectifs et à définir des budgets cohérents.
            </Paragraph>

            <div className="flex justify-center gap-4 mt-8">
                <Button
                    onClick={() => navigate("/dashboard")}
                    className="bg-[#72383D] hover:bg-[#322D29] text-white px-6 py-3 rounded-xl shadow-md transition-all"
                >
                    Aller au tableau de bord
                </Button>
                <Button
                    onClick={() => navigate("/profile")}
                    className="border-2 border-[#72383D] text-[#72383D] hover:bg-[#72383D] hover:text-white px-6 py-3 rounded-xl transition-all"
                >
                    Compléter mon profil
                </Button>
            </div>
        </div>
    );
}
