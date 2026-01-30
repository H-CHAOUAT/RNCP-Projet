export default function Select({
                                   value,
                                   onChange,
                                   name,
                                   children,
                                   className = "",
                                   ...props
                               }) {
    return (
        <select
            name={name}
            value={value ?? ""}
            onChange={onChange}
            className={`border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}
