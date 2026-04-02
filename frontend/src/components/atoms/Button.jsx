export default function Button({ children, onClick, type = "button", className = "", disabled = false }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`bg-wine hover:bg-wineDark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition ${className}`}
        >
            {children}
        </button>
    );
}
