export default function Input({ type = "text", value, onChange, placeholder, className = "", min, max, name, ...props }) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            name={name}
            min={min}
            max={max}
            className={`border border-wineLight/40 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-wine focus:border-wine outline-none bg-white text-dark placeholder:text-wineLight transition ${className}`}
            {...props}
        />
    );
}
