import { useMemo, useState } from "react";
import Button from "../../atoms/Button";
import DateInput from "../../atoms/DateInput";
import { apiFetch } from "../../../api/apiFetch";

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-wine outline-none";

export default function CreateBillModal({ open, onClose, onCreated }) {
    const userId = useMemo(() => {
        try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return u.id ?? u.userId ?? null; }
        catch { return null; }
    }, []);

    const [form, setForm] = useState({ title: "", amount: "", dueDate: "", description: "", paid: false });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const reset = () => {
        setForm({ title: "", amount: "", dueDate: "", description: "", paid: false });
        setError("");
    };

    const handleClose = () => { reset(); onClose?.(); };

    const handleSave = async () => {
        setError("");
        if (!form.title.trim()) { setError("Entrez un titre de facture."); return; }
        if (!form.amount || Number(form.amount) <= 0) { setError("Entrez un montant valide."); return; }

        setSaving(true);
        try {
            const res = await apiFetch(`/api/bills/user/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title:       form.title.trim(),
                    amount:      Number(form.amount),
                    dueDate:     form.dueDate || null,
                    description: form.description.trim() || null,
                    paid:        form.paid,
                }),
            });
            if (res.ok) {
                const created = await res.json();
                onCreated?.(created);
                reset();
                onClose?.();
            } else {
                setError("❌ Échec de l'enregistrement. Veuillez réessayer.");
            }
        } catch { setError("❌ Erreur réseau. Veuillez réessayer."); }
        finally { setSaving(false); }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">

                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-semibold text-dark">Ajouter une facture</h2>
                        <p className="text-sm text-dark/50 mt-0.5">
                            Le montant sera déduit de votre solde.
                        </p>
                    </div>
                    <button onClick={handleClose}
                            className="rounded-md p-2 hover:bg-winePale text-dark/40">✕</button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark mb-1">Titre de la facture *</label>
                        <input className={inputCls} value={form.title}
                               onChange={e => setForm({ ...form, title: e.target.value })}
                               placeholder="ex. Électricité" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-dark mb-1">Montant (€) *</label>
                            <input type="number" min="0" className={inputCls}
                                   value={form.amount}
                                   onChange={e => setForm({ ...form, amount: e.target.value })}
                                   placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark mb-1">Date d'échéance</label>
                            <DateInput
                                value={form.dueDate}
                                onChange={(iso) => setForm({ ...form, dueDate: iso })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark mb-1">Description (facultatif)</label>
                        <input className={inputCls} value={form.description}
                               onChange={e => setForm({ ...form, description: e.target.value })}
                               placeholder="Ajouter des détails..." />
                    </div>

                    <label className="flex items-center gap-2 text-sm text-dark cursor-pointer">
                        <input type="checkbox" checked={form.paid}
                               onChange={e => setForm({ ...form, paid: e.target.checked })}
                               className="rounded" />
                        Déjà payée
                    </label>
                </div>

                <div className="mt-6 flex gap-3">
                    <Button type="button" onClick={handleSave} disabled={saving} className="flex-1">
                        {saving ? "Enregistrement..." : "Ajouter une facture"}
                    </Button>
                    <button type="button" onClick={handleClose} disabled={saving}
                            className="flex-1 rounded-lg border border-slate-300 bg-white text-dark font-semibold py-2 px-4 hover:bg-slate-50 disabled:opacity-50 transition">
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}