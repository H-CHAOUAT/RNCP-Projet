export default function Paragraph({ children, className = "" }) {
    return (
        <p className={`text-[#322D29] text-base leading-relaxed ${className}`}>
            {children}
        </p>
    );
}
