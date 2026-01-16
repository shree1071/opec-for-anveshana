import { SimulationForm } from "../components/form/SimulationForm";
import { Brain } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

export function SimulationPage() {
    const { user } = useUser();
    const userName = user?.firstName || user?.fullName || "there";

    return (
        <div className="bg-[#F9F8F6] min-h-screen pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900">CareerPath Roadmap Builder</h1>
                </div>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    Hey {userName}! Let's build your personalized career roadmap based on AI-driven insights and real-world data.
                </p>
            </div>
            <SimulationForm />
        </div>
    );
}
