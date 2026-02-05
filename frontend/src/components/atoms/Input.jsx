export default function Input({
                                  type = "text",
                                  value,
                                  onChange,
                                  placeholder,
                                  name,
                                  className = "",
                              }) {
    return (
        <input
            type={type}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            placeholder={placeholder}
            className={`
        w-full
        rounded-lg
        border border-gray-300
        px-3 py-2
        text-gray-900
        placeholder-gray-400
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:border-blue-500
        ${className}
      `}
        />
    );
}
