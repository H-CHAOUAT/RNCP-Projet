import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../components/organisms/LoginForm";
import Signup from "../components/organisms/SignupForm";
import AuthCard from "../components/molecules/AuthCard";
import Logo from "../components/atoms/Logo";

export default function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const isLogin = location.pathname !== "/signup";

    return (
        <div className="min-h-screen flex">
            <div className="hidden md:flex w-2/5 bg-wine flex-col items-center justify-center p-12 text-white">
                <div className="mb-6">
                    <Logo size="xl" variant="light" />
                </div>
                <h1 className="text-3xl font-bold mb-3">FinFamPlan</h1>
                <p className="text-white/70 text-center text-sm leading-relaxed max-w-xs">
                    Planifiez ensemble. Progressez ensemble.
                </p>

                <div className="mt-12 space-y-4 w-full max-w-xs">
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                        <span className="text-2xl">🎯</span>
                        <div>
                            <div className="text-sm font-semibold">Objectifs d'épargne</div>
                            <div className="text-xs text-white/60">Suivez vos progrès ensemble</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                        <span className="text-2xl">📊</span>
                        <div>
                            <div className="text-sm font-semibold">Analyse des dépenses</div>
                            <div className="text-xs text-white/60">Voyez où va votre argent</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                        <span className="text-2xl">👨‍👩‍👧</span>
                        <div>
                            <div className="text-sm font-semibold">Espace familial partagé</div>
                            <div className="text-xs text-white/60">Adulte, parent, enfant</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center bg-cream p-6">
                <div className="w-full max-w-md">
                    <div className="md:hidden text-center mb-8">
                        <div className="flex justify-center mb-3">
                            <Logo size="lg" variant="dark" />
                        </div>
                        <div className="text-xl font-bold text-dark">FinFamPlan</div>
                    </div>

                    <AuthCard title={isLogin ? "Se connecter" : "Créer un compte"}>
                        {isLogin ? <LoginForm /> : <Signup />}
                        <p className="text-center mt-4 text-sm text-dark/60">
                            {isLogin ? (
                                <>
                                    Vous n'avez pas de compte ?{" "}
                                    <button onClick={() => navigate("/signup")}
                                            className="text-wine font-medium hover:text-wineDark hover:underline bg-transparent border-none p-0">
                                        Créer un compte
                                    </button>
                                </>
                            ) : (
                                <>
                                    Vous avez déjà un compte ?{" "}
                                    <button onClick={() => navigate("/login")}
                                            className="text-wine font-medium hover:text-wineDark hover:underline bg-transparent border-none p-0">
                                        Se connecter
                                    </button>
                                </>
                            )}
                        </p>
                    </AuthCard>
                </div>
            </div>
        </div>
    );
}
