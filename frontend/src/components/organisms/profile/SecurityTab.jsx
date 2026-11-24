import { useState } from "react";
import Button from "../../atoms/Button";
import Input from "../../atoms/Input";
import FormField from "../../molecules/FormField";
import { apiFetch } from "../../../api/apiFetch";

export default function SecurityTab() {
    const lastLogin = localStorage.getItem("lastLogin") || new Date().toLocaleString("fr-FR");

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMessage, setPwMessage] = useState({ type: "", text: "" });

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
        if (!passwords.current) { setPwMessage({ type: "error", text: "Saisissez votre mot de passe actuel." }); return; }
        if (passwords.newPass.length < 8) { setPwMessage({ type: "error", text: "Le nouveau mot de passe doit contenir au moins 8 caractères." }); return; }
        if (passwords.newPass !== passwords.confirm) { setPwMessage({ type: "error", text: "Les mots de passe ne correspondent pas." }); return; }

        const userId = getUserId();
        if (!userId) { setPwMessage({ type: "error", text: "Aucune session trouvée. Veuillez vous reconnecter." }); return; }

        setPwSaving(true);
        try {
            const res = await apiFetch(`/api/users/${userId}/password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.newPass,
                }),
            });

            if (res.ok) {
                setPwMessage({ type: "success", text: "Mot de passe modifié avec succès !" });
                setPasswords({ current: "", newPass: "", confirm: "" });
                setShowPasswordForm(false);
            } else {
                const text = await res.text();
                setPwMessage({ type: "error", text: text || "Échec de la modification du mot de passe." });
            }
        } catch {
            setPwMessage({ type: "error", text: "Erreur réseau. Veuillez réessayer." });
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
            const res = await apiFetch(`/api/users/${userId}/logout-all`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                setSessionMessage({ type: "success", text: "Toutes les autres sessions ont été fermées." });
                sessionStorage.removeItem("token");
            } else {
                setSessionMessage({ type: "error", text: "Échec de la fermeture des sessions." });
            }
        } catch {
            setSessionMessage({ type: "error", text: "Erreur réseau." });
        } finally {
            setSessionLoading(false);
        }
    };

    return (
        <div className="rounded-xl border bg-white p-6">
            <h2 className="text-xl font-semibold text-dark">Sécurité</h2>
            <p className="mt-1 text-sm text-gray-600">Gérez la sécurité de votre compte.</p>

            <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-slate-800">Dernière connexion</p>
                        <p className="text-sm text-gray-500">{lastLogin}</p>
                    </div>
                </div>

                <hr />

                <div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800">Mot de passe</p>
                            <p className="text-sm text-gray-500">Modifiez le mot de passe de votre compte</p>
                        </div>
                        <Button onClick={() => { setShowPasswordForm((v) => !v); setPwMessage({ type: "", text: "" }); }}>
                            {showPasswordForm ? "Annuler" : "Changer le mot de passe"}
                        </Button>
                    </div>

                    {showPasswordForm && (
                        <div className="mt-4 space-y-3 rounded-lg border bg-slate-50 p-4">
                            {pwMessage.text && (
                                <div className={`rounded-lg border p-3 text-sm ${pwMessage.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                                    {pwMessage.text}
                                </div>
                            )}
                            <FormField label="Mot de passe actuel">
                                <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="••••••••" />
                            </FormField>
                            <FormField label="Nouveau mot de passe">
                                <Input type="password" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="Min. 8 caractères" />
                            </FormField>
                            <FormField label="Confirmer le nouveau mot de passe">
                                <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Répétez le nouveau mot de passe" />
                            </FormField>
                            <Button onClick={handlePasswordChange} disabled={pwSaving} className="w-full">
                                {pwSaving ? "Enregistrement..." : "Mettre à jour le mot de passe"}
                            </Button>
                        </div>
                    )}
                </div>

                <hr />

                <div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800">Sessions actives</p>
                            <p className="text-sm text-gray-500">Déconnexion de tous les autres appareils</p>
                        </div>
                        <Button onClick={handleLogoutAll} disabled={sessionLoading}>
                            {sessionLoading ? "Déconnexion..." : "Tout déconnecter"}
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
