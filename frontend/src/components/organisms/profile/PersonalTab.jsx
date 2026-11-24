import { useEffect, useState } from "react";
import FormField from "../../molecules/FormField";
import Input from "../../atoms/Input";
import Button from "../../atoms/Button";
import { apiFetch } from "../../../api/apiFetch";

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
    }, []);

    const getUserIdFromLocalStorage = () => {
        try {
            const savedUser = localStorage.getItem("user");
            if (!savedUser) return null;
            const user = JSON.parse(savedUser);
            return user.id ?? user.userId ?? null;
        } catch {
            return null;
        }
    };

    const loadUserProfile = async () => {
        try {
            const userId = getUserIdFromLocalStorage();
            if (!userId) {
                setMessage({ type: "error", text: "Aucune session utilisateur trouvée. Veuillez vous reconnecter." });
                setLoading(false);
                return;
            }

            const response = await apiFetch(`/api/users/${userId}`, {
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
                setMessage({ type: "error", text: "Échec du chargement du profil." });
            }
        } catch {
            setMessage({ type: "error", text: "Erreur lors du chargement du profil. Veuillez réessayer." });
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
                setMessage({ type: "error", text: "Aucune session utilisateur trouvée." });
                setSaving(false);
                return;
            }

            const response = await apiFetch(`/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });

            if (response.ok) {
                const updatedUser = await response.json();

                try {
                    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
                    const updatedLocalUser = {
                        ...savedUser,
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        email: updatedUser.email,
                        id: savedUser.id ?? updatedUser.userId ?? savedUser.userId,
                        userId: savedUser.userId ?? updatedUser.userId,
                    };
                    localStorage.setItem("user", JSON.stringify(updatedLocalUser));
                } catch {}

                setMessage({ type: "success", text: "Profil mis à jour avec succès !" });
            } else {
                const errorText = await response.text();
                setMessage({ type: "error", text: `Échec de la mise à jour du profil : ${errorText}` });
            }
        } catch {
            setMessage({ type: "error", text: "Erreur lors de la mise à jour du profil. Veuillez réessayer." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-xl border bg-white p-8 text-left">
                <p className="text-gray-500">Chargement du profil...</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-dark">Informations personnelles</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Mettez à jour votre nom et votre e-mail.
                    </p>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Enregistrement..." : "Enregistrer les modifications"}
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
                <FormField label="Prénom">
                    <Input
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                        placeholder="Saisissez votre prénom"
                    />
                </FormField>

                <FormField label="Nom">
                    <Input
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                        placeholder="Saisissez votre nom"
                    />
                </FormField>

                <div className="md:col-span-2">
                    <FormField label="E-mail" hint="Utilisé pour la connexion et les notifications">
                        <Input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            placeholder="votre.email@exemple.com"
                        />
                    </FormField>
                </div>
            </div>
        </div>
    );
}
