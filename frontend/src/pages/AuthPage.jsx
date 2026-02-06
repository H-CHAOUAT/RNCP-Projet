import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import LoginForm from "../components/organisms/LoginForm";
import SignupForm from "../components/organisms/SignupForm";

export default function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);

    useEffect(() => {
        if(location.pathname === "/signup") {
            setIsLogin(false);
        }else {
            setIsLogin(true);
        }
    }, [location.pathname]);

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <div className="bg-[#322D29] text-white flex flex-col items-center justify-center w-full md:w-1/2 p-10">
                <div className="bg-[#8B8878] w-48 h-48 mb-6"></div> {/* Placeholder for logo */}
                <h1 className="text-2xl font-bold">FinFamPlan</h1>
                <p className="text-sm mt-2 opacity-80">Plan together. Grow together.</p>
            </div>

            <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-[#EFE9E1] p-10">
                <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
                    <h2 className="text-2xl font-semibold text-center text-[#322D29] mb-6">
                        {isLogin ? "Log In" : "Sign Up"}
                    </h2>
                    {isLogin ? <LoginForm /> : <SignupForm />}

                    <p className="text-center text-sm text-gray-600 mt-6">
                        {isLogin ? (
                            <>
                                Don’t have an account?{" "}
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="text-[#72383D] hover:underline"
                                >
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <button
                                    onClick={() => navigate("/login")}
                                    className="text-[#72383D] hover:underline"
                                >
                                    Log In
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
