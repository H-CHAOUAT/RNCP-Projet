import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../molecules/FormField";
import Button from "../atoms/Button";

export default function SignupForm() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, role: "PARENT" }),
            });

            if (response.ok) {
                alert("✅ Account created successfully! Redirecting to login...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                alert("❌ Registration failed.");
            }
        } catch (err) {
            console.error("SignupForm error:", err);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormField label="First Name" type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" />
            <FormField label="Last Name" type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" />
            <FormField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
            <FormField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
            <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
            </Button>
        </form>
    );
}
