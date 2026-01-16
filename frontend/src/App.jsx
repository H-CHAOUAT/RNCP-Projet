import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import WelcomePage from "./pages/WelcomePage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import AppLayout from "./layouts/AppLayout";

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
                    <Route path="/profile" element={<ProfilePage />} />


                    <Route path="/transactions" element={<div>Transactions</div>} />
                    <Route path="/analysis" element={<div>Analysis</div>} />
                    <Route path="/family" element={<div>Family</div>} />
                    <Route path="/settings" element={<div>Settings</div>} />
                </Route>
            </Routes>
        </Router>
    );
}
