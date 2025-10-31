import WelcomeMessage from "../components/molecules/WelcomeMessage";

export default function WelcomePage() {
    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{
                background: "linear-gradient(to bottom right, #EFE9E1, #D1C7BD, #AC9C8D)",
            }}
        >
            <WelcomeMessage />
        </div>
    );
}
