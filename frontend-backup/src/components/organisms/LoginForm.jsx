import { useState } from "react";
import FormField from "../molecules/FormField";
import Button from "../atoms/Button";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (response.ok) {
            alert("✅ Logged in successfully!");
        } else {
            alert("❌ Login failed. Check credentials.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <FormField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" className="w-full mt-2">Sign In</Button>
        </form>
    );
}
