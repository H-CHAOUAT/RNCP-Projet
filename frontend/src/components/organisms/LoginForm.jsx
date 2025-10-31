import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../molecules/FormField";
import Button from "../atoms/Button";

export default function LoginForm() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();

                // If backend sends token, store it
                if (data.token) localStorage.setItem("token", data.token);

                const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");

                alert("✅ Login successful!");

                // If it's the first login, show the Welcome page
                if (!hasSeenWelcome) {
                    localStorage.setItem("hasSeenWelcome", "true");
                    setTimeout(() => navigate("/welcome"), 1000);
                } else {
                    // Otherwise go directly to dashboard/home
                    setTimeout(() => navigate("/dashboard"), 1000);
                }
            } else {
                alert("❌ Invalid email or password.");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("⚠️ Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
            />
            <FormField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
            />
            <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </Button>
        </form>
    );
}
