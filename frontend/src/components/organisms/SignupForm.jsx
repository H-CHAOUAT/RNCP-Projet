import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../molecules/FormField";
import Button from "../atoms/Button";

export default function SignupForm() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
                alert("✅ Account created! Redirecting to login...");
                setTimeout(() => {
                    navigate("/login");
                }, 700);
            } else {
                alert("❌ Registration failed.");
            }
        } catch (error) {
            console.error(error);
            alert("⚠️ Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
            <FormField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
            <FormField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
            <FormField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />

            <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
            </Button>
        </form>
    );
}
