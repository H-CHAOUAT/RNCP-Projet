export default function Select({ children, value, onChange, name, className = "" }) {
    return (
        <select
            value={value}
            onChange={onChange}
            name={name}
            className={`border border-wineLight/40 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-wine focus:border-wine outline-none bg-white text-dark transition ${className}`}
        >
            {children}
        </select>
    );
}
