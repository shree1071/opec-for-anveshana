import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { SimulationPage } from "./pages/SimulationPage";
import { ResultsDashboard } from "./pages/ResultsDashboard";
import { ChatAssistant } from "./components/ChatAssistant";

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/simulate" element={<SimulationPage />} />
                    <Route path="/results" element={<ResultsDashboard />} />
                    <Route path="/login" element={<div className="text-center pt-20">Login Page Coming Soon</div>} />
                </Routes>
            </Layout>
            <ChatAssistant />
        </Router>
    );
}

export default App;
