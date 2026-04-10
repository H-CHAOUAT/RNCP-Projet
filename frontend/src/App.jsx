import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import WelcomePage from "./pages/WelcomePage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import AppLayout from "./layouts/AppLayout";
import PersonalTab from "./components/organisms/profile/PersonalTab";
import PreferencesTab from "./components/organisms/profile/PreferencesTab";
import SecurityTab from "./components/organisms/profile/SecurityTab";
import FamilyTab from "./components/organisms/profile/FamilyTab";
import FinancialPage from "./pages/FinancialPage.jsx";
import GoalsPage from "./pages/GoalsPage.jsx";
import TransactionsPage from "./pages/TransactionsPage.jsx";
import BillsPage from "./pages/BillsPage.jsx";
import FamilyPage from "./pages/FamilyPage.jsx";
import "./App.css";

function migrateLocalStorage() {
    try {
        const raw = localStorage.getItem("user");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.user && typeof parsed.user === "object" && parsed.user.id) {
            localStorage.setItem("user", JSON.stringify(parsed.user));
        }
    } catch {
        localStorage.removeItem("user");
    }
}
migrateLocalStorage();

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/welcome" element={<WelcomePage />} />

                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/financial" element={<FinancialPage />} />
                    <Route path="/goals" element={<GoalsPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/bills" element={<BillsPage />} />
                    <Route path="/family" element={<FamilyPage />} />

                    <Route path="/settings" element={<ProfilePage />}>
                        <Route index element={<Navigate to="personal" replace />} />
                        <Route path="personal" element={<PersonalTab />} />
                        <Route path="preferences" element={<PreferencesTab />} />
                        <Route path="security" element={<SecurityTab />} />
                        <Route path="family" element={<FamilyTab />} />
                    </Route>

                    <Route path="/profile/*" element={<Navigate to="/settings" replace />} />
                    <Route path="/analysis" element={<Navigate to="/financial" replace />} />
                </Route>
            </Routes>
        </Router>
    );
}
