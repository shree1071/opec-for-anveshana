import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { LoadingAnimation } from "../LoadingAnimation";
import { API_ENDPOINTS } from "../../config/api";

export function SimulationForm() {
    const { user } = useUser();
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
                body: JSON.stringify({
                    clerk_id: user?.id,
                    user_profile: formData
                }),
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

        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-10">
                <div className="flex justify-between text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                    <span>Step {step} of 4</span>
                    <span>{Math.round((step / 4) * 100)}% Complete</span>
                </div>
                <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-stone-900"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm min-h-[450px] flex flex-col relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1"
                    >
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-serif font-medium text-stone-900 mb-6">Education & Background</h2>
                                <div className="space-y-5">
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
                                        className="border-stone-200 focus:ring-stone-400 focus:border-stone-400 rounded-xl"
                                    />
                                    <Input
                                        label="Field of Interest / Major"
                                        name="field_of_interest"
                                        placeholder="e.g. Computer Science, Digital Marketing..."
                                        value={formData.field_of_interest}
                                        onChange={handleChange}
                                        className="border-stone-200 focus:ring-stone-400 focus:border-stone-400 rounded-xl placeholder:text-stone-400"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-serif font-medium text-stone-900 mb-6">Skills & Strengths</h2>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        Technical Skills (comma separated)
                                    </label>
                                    <textarea
                                        name="skills"
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all placeholder:text-stone-400 text-base"
                                        placeholder="e.g. React, Python, Data Analysis, Leadership..."
                                        value={formData.skills}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-serif font-medium text-stone-900 mb-6">Goals & Preferences</h2>
                                <div className="space-y-5">
                                    <Input
                                        label="Career Goal (Short term)"
                                        name="career_goals"
                                        placeholder="e.g. Become a Senior Developer"
                                        value={formData.career_goals}
                                        onChange={handleChange}
                                        className="border-stone-200 focus:ring-stone-400 focus:border-stone-400 rounded-xl"
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
                                        className="border-stone-200 focus:ring-stone-400 focus:border-stone-400 rounded-xl"
                                    />
                                    <Input
                                        label="Preferred Location"
                                        name="location"
                                        placeholder="e.g. Remote, New York, London..."
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="border-stone-200 focus:ring-stone-400 focus:border-stone-400 rounded-xl"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-serif font-medium text-stone-900 mb-2">Risk Profile</h2>
                                <p className="text-stone-500 mb-6 font-light">How do you approach your career decisions?</p>
                                <div className="grid gap-4">
                                    {[
                                        { val: "safe", title: "Safe & Steady", desc: "Prioritize job security and stable growth." },
                                        { val: "moderate", title: "Balanced", desc: "Open to calculated risks for better rewards." },
                                        { val: "aggressive", title: "High Growth / High Risk", desc: "Startup mindset, maximizing potential upside." },
                                    ].map((risk) => (
                                        <div
                                            key={risk.val}
                                            onClick={() => setFormData({ ...formData, risk_appetite: risk.val })}
                                            className={`p-5 border rounded-xl cursor-pointer transition-all ${formData.risk_appetite === risk.val
                                                ? "border-stone-900 bg-stone-50 ring-1 ring-stone-900"
                                                : "border-stone-200 hover:border-stone-400 hover:bg-white"
                                                }`}
                                        >
                                            <h3 className="font-serif font-medium text-stone-900 text-lg mb-1">{risk.title}</h3>
                                            <p className="text-sm text-stone-500">{risk.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-10 pt-6 border-t border-stone-100">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`text-stone-500 hover:text-stone-900 hover:bg-stone-50 ${step === 1 ? "invisible" : "visible"}`}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    {step < 4 ? (
                        <Button
                            onClick={handleNext}
                            className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2 h-11 rounded-xl shadow-none hover:shadow-lg transition-all"
                        >
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-2 h-11 rounded-xl shadow-lg shadow-amber-200 hover:shadow-amber-300 transition-all font-medium"
                        >
                            {isLoading ? "Analyzing..." : "Generate Roadmap"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
