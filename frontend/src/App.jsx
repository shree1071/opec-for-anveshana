import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { SimulationPage } from "./pages/SimulationPage";
import { ResultsDashboard } from "./pages/ResultsDashboard";
import { Onboarding } from "./pages/opec/Onboarding";
import { Dashboard } from "./pages/opec/Dashboard";
import { Chat } from "./pages/opec/Chat";
import { MockInterview } from "./pages/opec/MockInterview";
import CollegeDirectory from "./pages/CollegeDirectory";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastContainer } from "./components/Toast";
import { PricingPage } from "./pages/PricingPage";

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/simulate" element={<SimulationPage />} />
                        <Route path="/results" element={<ResultsDashboard />} />
                        <Route path="/colleges" element={<CollegeDirectory />} />
                        <Route path="/pricing" element={<PricingPage />} />

                        {/* OPEC Routes */}
                        <Route path="/opec/onboarding" element={<Onboarding />} />
                        <Route path="/opec/dashboard" element={<Dashboard />} />
                        <Route path="/opec/chat" element={<Chat />} />
                        <Route path="/opec/mock-interview" element={<MockInterview />} />
                        <Route path="/opec/simulate" element={<SimulationPage />} />

                        <Route path="/login" element={<div className="text-center pt-20">Login Page Coming Soon</div>} />
                    </Routes>
                </Layout>
                <ToastContainer />
            </Router>
        </ErrorBoundary>
    );
}

export default App;
