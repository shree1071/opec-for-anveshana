import { SimulationForm } from "../components/form/SimulationForm";
import { useUser } from "@clerk/clerk-react";
import { Sparkles, Map } from "lucide-react";

export function SimulationPage() {
    const { user } = useUser();
    const userName = user?.firstName || user?.fullName || "there";

    return (
        <div className="bg-[#faf9f7] min-h-screen pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white border border-stone-200 rounded-xl flex items-center justify-center shadow-sm">
                        <Map className="w-6 h-6 text-stone-700" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 text-amber-700 text-xs font-semibold uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        AI Powered
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-serif font-medium text-stone-900 mb-4 tracking-tight">
                    Career Roadmap Builder
                </h1>

                <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed font-light">
                    Hey <span className="text-stone-800 font-medium">{userName}</span>. Let's design a strategic career path tailored to your unique potential.
                </p>
            </div>
            <SimulationForm />
        </div>
    );
}
