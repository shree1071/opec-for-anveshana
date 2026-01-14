import { SimulationForm } from "../components/form/SimulationForm";

export function SimulationPage() {
    return (
        <div className="bg-slate-50 min-h-screen pt-12">
            <div className="max-w-4xl mx-auto px-4 text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Design Your Future</h1>
                <p className="text-slate-600">
                    Provide your details below, and our AI agents will generate a personalized career roadmap for you.
                </p>
            </div>
            <SimulationForm />
        </div>
    );
}
