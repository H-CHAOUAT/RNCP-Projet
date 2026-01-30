export default function Button({
                                   children,
                                   onClick,
                                   type = "button",
                                   variant = "primary", // primary | secondary
                                   disabled = false,
                                   className = "",
                               }) {
    const base =
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "border border-slate-300 text-slate-700 hover:bg-slate-100",
    };

    const disabledStyles = "opacity-60 cursor-not-allowed hover:bg-transparent";

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]} ${
                disabled ? disabledStyles : ""
            } ${className}`}
        >
            {children}
        </button>
    );
}
