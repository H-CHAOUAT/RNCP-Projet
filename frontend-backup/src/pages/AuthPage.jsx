import { useState } from "react";
import LoginForm from "../components/organisms/LoginForm";
import Signup from "../components/organisms/Signup";
import AuthCard from "../components/molecules/AuthCard";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <AuthCard title={isLogin ? "Welcome Back 👋" : "Create Account 📝"}>
                {isLogin ? <LoginForm /> : <Signup />}
                <p className="text-center mt-4 text-sm">
                    {isLogin ? (
                        <>
                            Don’t have an account?{" "}
                            <button onClick={() => setIsLogin(false)} className="text-blue-600 hover:underline">
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button onClick={() => setIsLogin(true)} className="text-blue-600 hover:underline">
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </AuthCard>
        </div>
    );
}
