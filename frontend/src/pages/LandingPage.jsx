import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, TrendingUp, ShieldCheck, Users } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function LandingPage() {
    return (
        <div className="space-y-24 pb-20">
            {/* Hero Section */}
            <section className="relative pt-20 lg:pt-32 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6 border border-blue-100">
                            Powered by Multi-Agent AI
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8">
                            Your Career Path, <br />
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Simulated.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Stop guessing. Let our 5 specialized AI agents simulate your next 6 years
                            based on real-time market data, skills analysis, and your personal goals.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/simulate">
                                <Button className="h-14 px-8 text-lg group">
                                    Start Simulation
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button variant="secondary" className="h-14 px-8 text-lg">
                                View Sample Roadmap
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: "AI Agents", value: "5", icon: Brain },
                        { label: "Years Planned", value: "6", icon: TrendingUp },
                        { label: "Success Rate", value: "94%", icon: ShieldCheck },
                        { label: "Users Helped", value: "10k+", icon: Users },
                    ].map((stat, index) => (
                        <Card key={index} delay={index * 0.1} className="text-center hover:shadow-md transition-shadow">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-blue-50 rounded-full">
                                    <stat.icon className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                            <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Agents Showcase (Brief) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet Your Personal Career Board</h2>
                    <p className="text-slate-600">Five specialist AI agents working in parallel to design your future.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1 bg-gradient-to-br from-white to-slate-50">
                        <h3 className="text-lg font-bold mb-2">The Strategist</h3>
                        <p className="text-slate-600">Maps out the most efficient path to your goal.</p>
                    </Card>
                    <Card className="md:col-span-1 bg-gradient-to-br from-white to-slate-50">
                        <h3 className="text-lg font-bold mb-2">The Analyst</h3>
                        <p className="text-slate-600">Predicts market trends and salary benchmarks.</p>
                    </Card>
                    <Card className="md:col-span-1 bg-gradient-to-br from-white to-slate-50">
                        <h3 className="text-lg font-bold mb-2">The Mentor</h3>
                        <p className="text-slate-600">Identifies skill gaps and recommends resources.</p>
                    </Card>
                </div>
            </section>
        </div>
    );
}
