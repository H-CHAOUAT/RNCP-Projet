import Label from "../atoms/Label";

export default function FormField({ label, hint, children }) {
    return (
        <div className="mb-4">
            {label && <Label>{label}</Label>}
            {children}
            {hint && (
                <p className="mt-1 text-xs text-gray-500">
                    {hint}
                </p>
            )}
        </div>
    );
}
