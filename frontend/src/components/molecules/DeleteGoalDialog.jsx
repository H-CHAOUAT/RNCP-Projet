import { useEffect, useRef, useState } from "react";

const money = (n, currency) => {
    try {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(Number(n ?? 0));
    } catch {
        return `${Number(n ?? 0).toFixed(2)} ${currency}`;
    }
};

/** Confirmation before deleting a goal. `onConfirm` resolves to true on success. */
export default function DeleteGoalDialog({ goal, currency = "EUR", onConfirm, onClose }) {
    const dialogRef = useRef(null);
    const [deleting, setDeleting] = useState(false);
    const [failed, setFailed] = useState(false);
    const saved = Number(goal.currentAmount ?? 0);

    // showModal() gives focus trapping and Escape-to-close for free.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog.open) dialog.showModal();
        return () => dialog.close();
    }, []);

    const confirm = async () => {
        setDeleting(true);
        setFailed(false);
        if (await onConfirm(goal)) {
            onClose();
        } else {
            setFailed(true);
            setDeleting(false);
        }
    };

    return (
        <dialog ref={dialogRef} aria-labelledby="delete-goal-title"
                onCancel={(e) => { e.preventDefault(); if (!deleting) onClose(); }}
                className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-6 text-left shadow-lg backdrop:bg-black/40">
            <h2 id="delete-goal-title" className="text-lg font-semibold text-slate-900">
                Supprimer « {goal.title} » ?
            </h2>
            <p className="mt-2 text-sm text-slate-600">Cette action est définitive.</p>
            {saved > 0 && (
                <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    Les <strong>{money(saved, currency)}</strong> déjà épargnés sont considérés comme dépensés :
                    ils ne reviendront pas sur votre solde.
                </p>
            )}
            {failed && <p className="mt-2 text-sm text-red-700" role="alert">La suppression a échoué. Réessayez.</p>}

            <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={onClose} disabled={deleting} autoFocus
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                    Annuler
                </button>
                <button type="button" onClick={confirm} disabled={deleting}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                    {deleting ? "Suppression..." : "Supprimer"}
                </button>
            </div>
        </dialog>
    );
}
