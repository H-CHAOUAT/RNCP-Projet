export default function ProgressBar({ value = 0, max = 100 }) {
    const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

    return (
        <div className="mt-2 h-2 w-full rounded bg-slate-100">
            <div
                className="h-2 rounded bg-slate-900"
                style={{ width: `${percent}%` }}
            />
        </div>
    );
}