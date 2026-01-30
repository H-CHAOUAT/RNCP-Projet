export default function Input({
  className = "",
  value,
   ...props
   }) {
    return (
        <input
            value={value ?? ""}
            className={`bg-yellow-200 border-4 border-green-500 px-3 py-2 w-full ${className}`}
            {...props}
        />
    );
}
