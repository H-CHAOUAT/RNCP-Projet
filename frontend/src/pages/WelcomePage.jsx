import { useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
export default function WelcomePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EFE9E1] to-[#CFCCC0] p-6">

            <div className="bg-white shadow-xl rounded-3xl p-10 max-w-xl w-full text-center">

                <h1 className="text-4xl font-bold text-[#322D29] mb-4">
                    Bienvenue sur <span className="text-[#72383D]">FinFamPlan</span> !
                </h1>

                <p className="text-gray-700 text-lg leading-relaxed mb-8">
                    Votre espace tout-en-un pour planifier plus intelligemment, dépenser mieux,
                    et atteindre vos objectifs financiers — ensemble.
                </p>

                <p className="text-gray-600 text-md mb-10">
                    Commençons à construire votre feuille de route financière étape par étape.
                </p>

                <button
                    onClick={() => window.location.href = "/dashboard"}
                    className="bg-[#72383D] text-white py-3 px-6 rounded-xl shadow-md hover:bg-[#5d2f34] transition duration-200"
                >
                    Aller au tableau de bord
                </button>
            </div>

        </div>
    );
}
