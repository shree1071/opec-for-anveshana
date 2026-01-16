import { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Card } from "../../components/ui";
import { ArrowRight, CheckCircle } from "lucide-react";

export const Onboarding = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate("/");
        }
    }, [isLoaded, isSignedIn, navigate]);

    if (!isLoaded) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        education_level: "", // "school" or "college"
        grade_or_year: "", // "10th", "12th", "1st Year", etc.
        stream_or_branch: "", // "PCM", "PCB", "Commerce", "CS", "Mechanical", etc.
        school_name: "",
        interests: "",
        goals: "",
        location: "",
        budget: ""
    });

    const handleNext = () => setStep(step + 1);

    const handleSubmit = async () => {
        if (!user) {
            console.error("No user found");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                clerk_id: user?.id,
                email: user?.primaryEmailAddress?.emailAddress,
                name: user?.fullName,
                ...formData,
                onboarding_completed: true
            };

            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await fetch(`${API_URL}/api/opec/student/profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                navigate("/opec/chat");
            } else {
                console.error("Failed to save profile");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Welcome! Let's build your profile</h1>
                    <p className="text-slate-600 mt-2">Step {step} of 4</p>
                    <div className="w-full h-2 bg-slate-200 rounded-full mt-4 overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                </div>

                <Card className="p-8">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="text-xl font-bold mb-6">Education Level</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">Are you in school or college?</label>
                                    <div className="grid gap-3">
                                        {[
                                            { val: "school", title: "School Student", desc: "Currently in 10th or 12th grade" },
                                            { val: "college", title: "College Student", desc: "Pursuing undergraduate or postgraduate" }
                                        ].map((level) => (
                                            <button
                                                key={level.val}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, education_level: level.val, grade_or_year: "", stream_or_branch: "" })}
                                                className={`p-4 border rounded-xl text-left transition-all ${formData.education_level === level.val
                                                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                                                    : 'border-slate-200 hover:border-blue-300'
                                                    }`}
                                            >
                                                <h3 className="font-semibold text-slate-900">{level.title}</h3>
                                                <p className="text-sm text-slate-500 mt-1">{level.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {formData.education_level === "school" && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Which grade are you in?</label>
                                        <select
                                            className="w-full p-3 border rounded-lg"
                                            value={formData.grade_or_year}
                                            onChange={(e) => setFormData({ ...formData, grade_or_year: e.target.value })}
                                        >
                                            <option value="">Select Grade</option>
                                            <option value="10th">10th Grade</option>
                                            <option value="12th">12th Grade</option>
                                        </select>
                                    </div>
                                )}

                                {formData.education_level === "school" && formData.grade_or_year === "12th" && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Your Stream</label>
                                        <select
                                            className="w-full p-3 border rounded-lg"
                                            value={formData.stream_or_branch}
                                            onChange={(e) => setFormData({ ...formData, stream_or_branch: e.target.value })}
                                        >
                                            <option value="">Select Stream</option>
                                            <option value="PCM">PCM (Physics, Chemistry, Math)</option>
                                            <option value="PCB">PCB (Physics, Chemistry, Biology)</option>
                                            <option value="Commerce">Commerce</option>
                                            <option value="Arts">Arts/Humanities</option>
                                        </select>
                                    </div>
                                )}

                                {formData.education_level === "college" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Current Year of Study</label>
                                            <select
                                                className="w-full p-3 border rounded-lg"
                                                value={formData.grade_or_year}
                                                onChange={(e) => setFormData({ ...formData, grade_or_year: e.target.value })}
                                            >
                                                <option value="">Select Year</option>
                                                <option value="1st Year">1st Year</option>
                                                <option value="2nd Year">2nd Year</option>
                                                <option value="3rd Year">3rd Year</option>
                                                <option value="4th Year">4th Year / Final Year</option>
                                                <option value="Postgraduate">Postgraduate (M.Tech/MBA/etc.)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Your Branch / Major</label>
                                            <select
                                                className="w-full p-3 border rounded-lg"
                                                value={formData.stream_or_branch}
                                                onChange={(e) => setFormData({ ...formData, stream_or_branch: e.target.value })}
                                            >
                                                <option value="">Select Branch</option>
                                                <option value="Computer Science">Computer Science / IT</option>
                                                <option value="Electronics">Electronics & Communication</option>
                                                <option value="Electrical">Electrical Engineering</option>
                                                <option value="Mechanical">Mechanical Engineering</option>
                                                <option value="Civil">Civil Engineering</option>
                                                <option value="Chemical">Chemical Engineering</option>
                                                <option value="Biotechnology">Biotechnology</option>
                                                <option value="Other Engineering">Other Engineering</option>
                                                <option value="BBA">BBA / Management</option>
                                                <option value="BCA">BCA</option>
                                                <option value="Commerce">B.Com / Commerce</option>
                                                <option value="Arts">BA / Arts</option>
                                                <option value="Science">B.Sc / Science</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                <Button
                                    className="w-full mt-4"
                                    onClick={handleNext}
                                    disabled={!formData.education_level || !formData.grade_or_year ||
                                        (formData.education_level === "college" && !formData.stream_or_branch) ||
                                        (formData.grade_or_year === "12th" && !formData.stream_or_branch)}
                                >
                                    Next <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="text-xl font-bold mb-6">College / School Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {formData.education_level === "school" ? "School Name" : "College / University Name"}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-lg"
                                        placeholder={formData.education_level === "school" ? "e.g. Delhi Public School" : "e.g. IIT Delhi, VIT, Anna University"}
                                        value={formData.school_name}
                                        onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Location (City)</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-lg"
                                        placeholder="e.g. Bangalore, Mumbai, Delhi"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="secondary" onClick={() => setStep(1)} className="w-1/3">Back</Button>
                                    <Button
                                        className="w-2/3"
                                        onClick={handleNext}
                                        disabled={!formData.school_name}
                                    >
                                        Next <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="text-xl font-bold mb-6">Your Interests & Goals</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">What interests you?</label>
                                    <textarea
                                        className="w-full p-3 border rounded-lg h-24"
                                        placeholder="e.g. AI, Web Development, Medicine, Business, Finance..."
                                        value={formData.interests}
                                        onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        What are your career goals?
                                    </label>
                                    <textarea
                                        className="w-full p-3 border rounded-lg h-24"
                                        placeholder={formData.education_level === "school"
                                            ? "e.g. Get into a good engineering college, become a doctor..."
                                            : "e.g. Get placed in FAANG, crack CAT, pursue higher studies..."}
                                        value={formData.goals}
                                        onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="secondary" onClick={() => setStep(2)} className="w-1/3">Back</Button>
                                    <Button
                                        className="w-2/3"
                                        onClick={handleNext}
                                        disabled={!formData.interests || !formData.goals}
                                    >
                                        Next <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="text-xl font-bold mb-6">Final Details</h2>
                            <div className="space-y-4">
                                <p className="text-slate-600">Almost there! Just one more thing...</p>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {formData.education_level === "school"
                                            ? "Budget for college (optional)"
                                            : "Budget for courses/certifications (optional)"}
                                    </label>
                                    <select
                                        className="w-full p-3 border rounded-lg"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    >
                                        <option value="">Prefer not to say</option>
                                        <option value="Under 5L">Under ₹5 Lakhs</option>
                                        <option value="5L-10L">₹5-10 Lakhs</option>
                                        <option value="10L-20L">₹10-20 Lakhs</option>
                                        <option value="Above 20L">Above ₹20 Lakhs</option>
                                        <option value="No constraint">No budget constraint</option>
                                    </select>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                    <h3 className="font-semibold text-blue-900 mb-2">Your Profile Summary</h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• <strong>{formData.education_level === "school" ? "School" : "College"}</strong>: {formData.grade_or_year}</li>
                                        {formData.stream_or_branch && <li>• <strong>{formData.education_level === "school" ? "Stream" : "Branch"}</strong>: {formData.stream_or_branch}</li>}
                                        <li>• <strong>Location</strong>: {formData.location || "Not specified"}</li>
                                        <li>• <strong>Goals</strong>: {formData.goals.substring(0, 50)}{formData.goals.length > 50 ? "..." : ""}</li>
                                    </ul>
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="secondary" onClick={() => setStep(3)} className="w-1/3">Back</Button>
                                    <Button
                                        className="w-2/3"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? "Starting..." : "Start Your Journey"}
                                        {!loading && <CheckCircle className="w-4 h-4 ml-2" />}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </Card>
            </div>
        </div>
    );
};
