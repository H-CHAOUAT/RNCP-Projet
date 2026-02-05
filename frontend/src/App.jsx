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

                    {/* ✅ SETTINGS area (tabs via nested routes) */}
                    <Route path="/settings" element={<ProfilePage />}>
                        <Route index element={<Navigate to="personal" replace />} />
                        <Route path="personal" element={<PersonalTab />} />
                        <Route path="preferences" element={<PreferencesTab />} />
                        <Route path="security" element={<SecurityTab />} />
                        <Route path="family" element={<FamilyTab />} />
                    </Route>
                    <Route path="/financial" element={<FinancialPage />} />
                    {/* ✅ Backward compatibility */}
                    <Route path="/profile/*" element={<Navigate to="/settings" replace />} />

                    <Route path="/transactions" element={<div>Transactions</div>} />
                    <Route path="/analysis" element={<div>Analysis</div>} />
                    <Route path="/family" element={<div>Family</div>} />
                    <Route path="/financial" element={<div>Financial profile</div>} />
                    <Route path="/bills" element={<div>Bills</div>} />
                </Route>
            </Routes>
        </Router>
    );
}
