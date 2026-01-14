import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoadingAnimation } from "../LoadingAnimation";
import { API_ENDPOINTS } from "../../config/api";

export function SimulationForm() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        education: "",
        field_of_interest: "",
        skills: "",
        career_goals: "",
        salary_range: "",
        location: "",
        risk_appetite: "moderate",
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleNext = () => setStep((prev) => Math.min(prev + 1, 4));
    const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.simulate, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_profile: formData }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/results', { state: { result: data } });
            } else {
                console.error("Simulation failed:", data);
                alert("Simulation failed. Please try again.");
            }
        } catch (error) {
            console.error("Error connecting to server:", error);
            // For demo purposes if backend is down, use mock data
            alert("Backend not reachable. Ensure Flask is running on port 5000.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingAnimation />;
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-20">
            <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
                    <span>Step {step} of 4</span>
                    <span>{Math.round((step / 4) * 100)}% Completed</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <Card className="relative overflow-hidden min-h-[400px] flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1"
                    >
                        {step === 1 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Education & Background</h2>
                                <Select
                                    label="Current Education Level"
                                    name="education"
                                    value={formData.education}
                                    onChange={handleChange}
                                    options={[
                                        { value: "high_school", label: "High School" },
                                        { value: "undergrad", label: "Undergraduate" },
                                        { value: "graduate", label: "Graduate (Masters/PhD)" },
                                        { value: "bootcamp", label: "Bootcamp / Self-Taught" },
                                    ]}
                                />
                                <Input
                                    label="Field of Interest / Major"
                                    name="field_of_interest"
                                    placeholder="e.g. Computer Science, Digital Marketing..."
                                    value={formData.field_of_interest}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Skills & Strengths</h2>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Technical Skills (comma separated)
                                    </label>
                                    <textarea
                                        name="skills"
                                        rows={4}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g. React, Python, Data Analysis, Leadership..."
                                        value={formData.skills}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Goals & Preferences</h2>
                                <Input
                                    label="Career Goal (Short term)"
                                    name="career_goals"
                                    placeholder="e.g. Become a Senior Developer"
                                    value={formData.career_goals}
                                    onChange={handleChange}
                                />
                                <Select
                                    label="Target Salary Range"
                                    name="salary_range"
                                    value={formData.salary_range}
                                    onChange={handleChange}
                                    options={[
                                        { value: "0-50k", label: "< $50,000" },
                                        { value: "50k-80k", label: "$50,000 - $80,000" },
                                        { value: "80k-120k", label: "$80,000 - $120,000" },
                                        { value: "120k+", label: "$120,000+" },
                                    ]}
                                />
                                <Input
                                    label="Preferred Location"
                                    name="location"
                                    placeholder="e.g. Remote, New York, London..."
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Risk Profile</h2>
                                <p className="text-slate-600 mb-4">How do you approach your career decisions?</p>
                                <div className="grid gap-4">
                                    {[
                                        { val: "safe", title: "Safe & Steady", desc: "Prioritize job security and stable growth." },
                                        { val: "moderate", title: "Balanced", desc: "Open to calculated risks for better rewards." },
                                        { val: "aggressive", title: "High Growth / High Risk", desc: "Startup mindset, maximizing potential upside." },
                                    ].map((risk) => (
                                        <div
                                            key={risk.val}
                                            onClick={() => setFormData({ ...formData, risk_appetite: risk.val })}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all ${formData.risk_appetite === risk.val
                                                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                                : "border-slate-200 hover:border-blue-300"
                                                }`}
                                        >
                                            <h3 className="font-semibold text-slate-900">{risk.title}</h3>
                                            <p className="text-sm text-slate-500">{risk.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`${step === 1 ? "invisible" : "visible"}`}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    {step < 4 ? (
                        <Button onClick={handleNext}>
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? "Simulating..." : "Start Simulation"}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
