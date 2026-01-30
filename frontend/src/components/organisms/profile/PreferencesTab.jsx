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
        language: "EN", // UI is English for now
        timezone: detectedTimezone,
    });

    // Load saved prefs (if any)
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
                // ignore corrupted localStorage
            }
        }
    }, [detectedTimezone]);

    const handleChange = (e) => {
        setPrefs({ ...prefs, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        localStorage.setItem("preferences", JSON.stringify(prefs));
        alert("✅ Preferences saved (local only for now).");
    };

    return (
        <div className="rounded-xl border bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Preferences</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Currency can be chosen. Timezone is auto-detected. Language is English for now.
                    </p>
                </div>

                <Button onClick={handleSave}>Save</Button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Default currency">
                    <Select name="currency" value={prefs.currency} onChange={handleChange}>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                        <option value="MAD">MAD</option>
                        <option value="JPY">JPY</option>
                        <option value="CAD">CAD</option>
                    </Select>
                </FormField>

                <FormField label="Language">
                    <Select name="language" value={prefs.language} onChange={handleChange}>
                        <option value="EN">English (EN)</option>
                    </Select>
                </FormField>

                <div className="md:col-span-2">
                    <FormField label="Timezone (auto-detected)">
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
