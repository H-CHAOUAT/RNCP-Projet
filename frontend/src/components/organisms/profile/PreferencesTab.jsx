import { useEffect, useState } from "react";
import FormField from "../../molecules/FormField";
import Select from "../../atoms/Select";
import Input from "../../atoms/Input";
import Button from "../../atoms/Button";

export default function PreferencesTab() {
    const detectedTimezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const [prefs, setPrefs] = useState({
        currency: "EUR",
        language: "FR", // UI is French
        timezone: detectedTimezone,
    });

    useEffect(() => {
        const saved = localStorage.getItem("preferences");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setPrefs((prev) => ({
                    ...prev,
                    ...parsed,
                    timezone: parsed.timezone || detectedTimezone,
                }));
            } catch {
            }
        }
    }, [detectedTimezone]);

    const handleChange = (e) => {
        setPrefs({ ...prefs, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        localStorage.setItem("preferences", JSON.stringify(prefs));
        alert("✅ Préférences enregistrées (stockage local pour l'instant).");
    };

    return (
        <div className="rounded-xl border bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Préférences</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        La devise peut être choisie. Le fuseau horaire est détecté automatiquement.
                    </p>
                </div>

                <Button onClick={handleSave}>Enregistrer</Button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Devise par défaut">
                    <Select name="currency" value={prefs.currency} onChange={handleChange}>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                        <option value="MAD">MAD</option>
                        <option value="JPY">JPY</option>
                        <option value="CAD">CAD</option>
                    </Select>
                </FormField>

                <FormField label="Langue">
                    <Select name="language" value={prefs.language} onChange={handleChange}>
                        <option value="FR">Français (FR)</option>
                    </Select>
                </FormField>

                <div className="md:col-span-2">
                    <FormField label="Fuseau horaire (détection automatique)">
                        <Input
                            name="timezone"
                            value={prefs.timezone}
                            onChange={() => {}}
                            disabled
                        />
                    </FormField>
                </div>
            </div>
        </div>
    );
}
