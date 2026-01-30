import { useEffect, useState } from "react";
import FormField from "../../molecules/FormField";
import Input from "../../atoms/Input";
import Button from "../../atoms/Button";

export default function PersonalTab() {
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        loadUserProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getUserIdFromLocalStorage = () => {
        try {
            const savedUser = localStorage.getItem("user");
            if (!savedUser) return null;
            const user = JSON.parse(savedUser);
            return user.id ?? user.userId ?? null; // ✅ support both
        } catch {
            return null;
        }
    };

    const loadUserProfile = async () => {
        try {
            const userId = getUserIdFromLocalStorage();
            if (!userId) {
                setMessage({ type: "error", text: "No user session found. Please log in again." });
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                const userData = await response.json();
                setProfile({
                    firstName: userData.firstName || "",
                    lastName: userData.lastName || "",
                    email: userData.email || "",
                });
            } else {
                setMessage({ type: "error", text: "Failed to load profile data." });
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            setMessage({ type: "error", text: "Error loading profile. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
        if (message.text) setMessage({ type: "", text: "" });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const userId = getUserIdFromLocalStorage();
            if (!userId) {
                setMessage({ type: "error", text: "No user session found." });
                setSaving(false);
                return;
            }

            const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });

            if (response.ok) {
                const updatedUser = await response.json();

                // keep local storage user in sync
                try {
                    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
                    const updatedLocalUser = {
                        ...savedUser,
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        email: updatedUser.email,
                        id: savedUser.id ?? updatedUser.userId ?? savedUser.userId, // keep compatibility
                        userId: savedUser.userId ?? updatedUser.userId,
                    };
                    localStorage.setItem("user", JSON.stringify(updatedLocalUser));
                } catch {
                    // ignore
                }

                setMessage({ type: "success", text: "✅ Profile updated successfully!" });
            } else {
                const errorText = await response.text();
                setMessage({ type: "error", text: `Failed to update profile: ${errorText}` });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ type: "error", text: "Error updating profile. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-xl border bg-white p-8 text-center">
                <p className="text-gray-500">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Personal Information</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Update your name and email.
                    </p>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            {message.text && (
                <div
                    className={`mt-4 rounded-lg border p-4 ${
                        message.type === "success"
                            ? "bg-green-50 text-green-800 border-green-200"
                            : "bg-red-50 text-red-800 border-red-200"
                    }`}
                >
                    {message.text}
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="First name">
                    <Input
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                    />
                </FormField>

                <FormField label="Last name">
                    <Input
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                    />
                </FormField>

                <div className="md:col-span-2">
                    <FormField label="Email" hint="Used for login and notifications">
                        <Input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                        />
                    </FormField>
                </div>
            </div>
        </div>
    );
}
