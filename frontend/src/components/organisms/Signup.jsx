import { useState } from "react";
import FormField from "../molecules/FormField";
import Button from "../atoms/Button";

export default function Signup() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, role: "PARENT" }),
        });
        if (response.ok) {
            alert("✅ Account created successfully!");
        } else {
            alert("❌ Registration failed.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormField label="First Name" type="text" value={formData.firstName} onChange={handleChange} placeholder="John" name="firstName" />
            <FormField label="Last Name" type="text" value={formData.lastName} onChange={handleChange} placeholder="Doe" name="lastName" />
            <FormField label="Email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" name="email" />
            <FormField label="Password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" name="password" />
            <Button type="submit" className="w-full mt-2">Sign Up</Button>
        </form>
    );
}
