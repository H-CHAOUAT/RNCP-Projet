// Story 3: every screen showing a forecast/simulation must display this.
// Permanent, non-dismissible by design — no close button, no "don't show again".
export default function Disclaimer({ className = "" }) {
    return (
        <p className={`text-xs italic text-slate-400 ${className}`}>
            Estimation basée sur les données que vous avez saisies ; ceci n'est pas un conseil financier.
        </p>
    );
}
