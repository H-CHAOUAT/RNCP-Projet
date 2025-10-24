export default function Input({ type = "text", value, onChange, placeholder, name, className = "" }) {
    return (
        <input
            type={type}
            name={name}                // ✅ must exist
            value={value || ""}        // ✅ controlled input safe
            onChange={onChange}        // ✅ connects typing
            placeholder={placeholder}
            className={`border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${className}`}
        />
    );
}
