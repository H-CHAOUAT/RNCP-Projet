export default function AuthCard({ title, children }) {
    return (
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold text-center mb-6">{title}</h2>
            {children}
        </div>
    );
}
