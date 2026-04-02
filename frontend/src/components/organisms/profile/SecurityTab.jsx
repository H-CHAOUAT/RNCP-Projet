import { useState } from "react";
import Button from "../../atoms/Button";
import Input from "../../atoms/Input";
import FormField from "../../molecules/FormField";

export default function SecurityTab() {
    const lastLogin = localStorage.getItem("lastLogin") || new Date().toLocaleString();

    // Change password state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMessage, setPwMessage] = useState({ type: "", text: "" });

    // Sessions state
    const [sessionLoading, setSessionLoading] = useState(false);
    const [sessionMessage, setSessionMessage] = useState({ type: "", text: "" });

    const getUserId = () => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            return u.id ?? u.userId ?? null;
        } catch { return null; }
    };

    const handlePasswordChange = async () => {
        setPwMessage({ type: "", text: "" });
        if (!passwords.current) { setPwMessage({ type: "error", text: "Enter your current password." }); return; }
        if (passwords.newPass.length < 8) { setPwMessage({ type: "error", text: "New password must be at least 8 characters." }); return; }
        if (passwords.newPass !== passwords.confirm) { setPwMessage({ type: "error", text: "Passwords do not match." }); return; }

        const userId = getUserId();
        if (!userId) { setPwMessage({ type: "error", text: "No session found. Please login again." }); return; }

        setPwSaving(true);
        try {
            const res = await fetch(`http://localhost:8080/api/users/${userId}/password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.newPass,
                }),
            });

            if (res.ok) {
                setPwMessage({ type: "success", text: "✅ Password changed successfully!" });
                setPasswords({ current: "", newPass: "", confirm: "" });
                setShowPasswordForm(false);
            } else {
                const text = await res.text();
                setPwMessage({ type: "error", text: `❌ ${text || "Failed to change password."}` });
            }
        } catch (e) {
            console.error(e);
            setPwMessage({ type: "error", text: "❌ Network error. Please try again." });
        } finally {
            setPwSaving(false);
        }
    };

    const handleLogoutAll = async () => {
        const userId = getUserId();
        if (!userId) return;

        setSessionLoading(true);
        setSessionMessage({ type: "", text: "" });
        try {
            const res = await fetch(`http://localhost:8080/api/users/${userId}/logout-all`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                setSessionMessage({ type: "success", text: "✅ All other sessions have been terminated." });
            } else {
                setSessionMessage({ type: "error", text: "❌ Failed to terminate sessions." });
            }
        } catch (e) {
            console.error(e);
            setSessionMessage({ type: "error", text: "❌ Network error." });
        } finally {
            setSessionLoading(false);
        }
    };

    return (
        <div className="rounded-xl border bg-white p-6">
            <h2 className="text-xl font-semibold text-dark">Security</h2>
            <p className="mt-1 text-sm text-gray-600">Manage your account security.</p>

            <div className="mt-6 space-y-6">
                {/* Last login */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-slate-800">Last login</p>
                        <p className="text-sm text-gray-500">{lastLogin}</p>
                    </div>
                </div>

                <hr />

                {/* Change password */}
                <div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800">Password</p>
                            <p className="text-sm text-gray-500">Change your account password</p>
                        </div>
                        <Button onClick={() => { setShowPasswordForm((v) => !v); setPwMessage({ type: "", text: "" }); }}>
                            {showPasswordForm ? "Cancel" : "Change password"}
                        </Button>
                    </div>

                    {showPasswordForm && (
                        <div className="mt-4 space-y-3 rounded-lg border bg-slate-50 p-4">
                            {pwMessage.text && (
                                <div className={`rounded-lg border p-3 text-sm ${pwMessage.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                                    {pwMessage.text}
                                </div>
                            )}
                            <FormField label="Current password">
                                <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="••••••••" />
                            </FormField>
                            <FormField label="New password">
                                <Input type="password" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="Min 8 characters" />
                            </FormField>
                            <FormField label="Confirm new password">
                                <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Repeat new password" />
                            </FormField>
                            <Button onClick={handlePasswordChange} disabled={pwSaving} className="w-full">
                                {pwSaving ? "Saving..." : "Update password"}
                            </Button>
                        </div>
                    )}
                </div>

                <hr />

                {/* Active sessions */}
                <div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800">Active sessions</p>
                            <p className="text-sm text-gray-500">Log out from all other devices</p>
                        </div>
                        <Button onClick={handleLogoutAll} disabled={sessionLoading}>
                            {sessionLoading ? "Logging out..." : "Log out all"}
                        </Button>
                    </div>
                    {sessionMessage.text && (
                        <div className={`mt-3 rounded-lg border p-3 text-sm ${sessionMessage.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                            {sessionMessage.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
