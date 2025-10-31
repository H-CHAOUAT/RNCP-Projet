export default function Heading({ level = "h1", children, className = "" }) {
    const Tag = level;
    return (
        <Tag className={`text-[#322D29] font-semibold ${level === "h1" ? "text-3xl" : "text-xl"} ${className}`}>
            {children}
        </Tag>
    );
}
