import { useEffect, useState } from "react";
import FormField from "../../molecules/FormField";
import Input from "../../atoms/Input";
import Select from "../../atoms/Select";
import Button from "../../atoms/Button";

export default function FamilyTab() {
    const [family, setFamily] = useState({
        role: "PARENT",
        householdName: "",
    });

    useEffect(() => {
        const saved = localStorage.getItem("family");
        if (saved) {
            try {
                setFamily(JSON.parse(saved));
            } catch {}
        }
    }, []);

    const handleChange = (e) => {
        setFamily({ ...family, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        localStorage.setItem("family", JSON.stringify(family));
        alert("✅ Family settings saved (local only).");
    };

    return (
        <div className="rounded-xl border bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">
                Family & Household
            </h2>
            <p className="mt-1 text-sm text-gray-600">
                Define your role and household.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="Your role">
                    <Select
                        name="role"
                        value={family.role}
                        onChange={handleChange}
                    >
                        <option value="PARENT">Parent</option>
                        <option value="MEMBER">Member</option>
                        <option value="CHILD">Child</option>
                    </Select>
                </FormField>

                <FormField
                    label="Household name"
                    hint="Optional (e.g. Smith Family)"
                >
                    <Input
                        name="householdName"
                        value={family.householdName}
                        onChange={handleChange}
                        placeholder="Household name"
                    />
                </FormField>
            </div>

            <div className="mt-6">
                <Button onClick={handleSave}>Save</Button>
            </div>
        </div>
    );
}
