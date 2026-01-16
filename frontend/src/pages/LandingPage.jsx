import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, MessageSquare, TrendingUp, Sparkles, Target, Zap, Users } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function LandingPage() {
    return (
        <div className="space-y-32 pb-20 bg-[#F9F8F6] min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-20 lg:pt-32 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[#F9F8F6]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6 border border-blue-100">
                            Powered by OPEC Methodology • 4 AI Agents Working Together
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8">
                            From Career Confusion to <br />
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Confident Action
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                            <strong>OPEC</strong> combines AI-powered reflection with personalized career simulation.
                            Four specialized AI agents work together to help Indian students gain clarity through conversation,
                            then build data-driven roadmaps with real salary projections in ₹ Lakhs.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/opec/onboarding">
                                <Button className="h-14 px-8 text-lg group bg-indigo-600 hover:bg-indigo-700 shadow-lg">
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button variant="secondary" className="h-14 px-8 text-lg border-slate-300">
                                Watch Demo
                            </Button>
                        </div>

                        {/* 4 AI Agents Badge */}
                        <div className="mt-12 inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md border border-slate-200">
                            <Users className="w-5 h-5 text-indigo-600" />
                            <span className="text-sm font-semibold text-slate-700">4 Specialized AI Agents:</span>
                            <div className="flex gap-2 text-xs font-medium text-slate-600">
                                <span className="px-2 py-1 bg-blue-50 rounded">Listener</span>
                                <span className="px-2 py-1 bg-indigo-50 rounded">Analyzer</span>
                                <span className="px-2 py-1 bg-purple-50 rounded">Evaluator</span>
                                <span className="px-2 py-1 bg-green-50 rounded">Planner</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Two-Phase Journey Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">Your Journey in Two Phases</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Unlike other platforms, we don't just give you answers. We help you discover them, then turn them into action — perfectly tailored for Indian students.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Phase 1: Reflection (Chat) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="p-8 relative overflow-hidden border-2 border-indigo-100 hover:shadow-2xl transition-all duration-300 group h-full">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10">
                                <div className="inline-block p-3 bg-indigo-100 rounded-2xl mb-4">
                                    <MessageSquare className="w-8 h-8 text-indigo-600" />
                                </div>
                                <div className="inline-block px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 text-sm font-semibold mb-4 ml-3">
                                    Phase 1
                                </div>

                                <h3 className="text-3xl font-bold text-slate-900 mb-4">Career Clarity Chat</h3>
                                <p className="text-lg text-slate-600 mb-6">
                                    Have honest conversations with our AI coach. No judgment, just deep questioning that reveals your true motivations and values.
                                </p>

                                <div className="space-y-3 mb-8">
                                    {[
                                        { icon: Brain, text: "AI analyzes emotional signals & patterns" },
                                        { icon: Sparkles, text: "Identifies hidden blockers & biases" },
                                        { icon: Target, text: "Clarity score tracks your progress" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                                                <item.icon className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <span className="text-slate-700">{item.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                    <p className="text-sm text-indigo-900 font-medium">
                                        💡 Perfect for: Students unsure about engineering vs. MBA, professionals considering career switch, or anyone feeling stuck after placement season.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Phase 2: Action (Simulator) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="p-8 relative overflow-hidden border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 group h-full">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10">
                                <div className="inline-block p-3 bg-blue-100 rounded-2xl mb-4">
                                    <TrendingUp className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="inline-block px-3 py-1 bg-blue-50 rounded-full text-blue-600 text-sm font-semibold mb-4 ml-3">
                                    Phase 2
                                </div>

                                <h3 className="text-3xl font-bold text-slate-900 mb-4">Career Roadmap Simulator</h3>
                                <p className="text-lg text-slate-600 mb-6">
                                    Ready to act? Input your profile and get a personalized 5-year career roadmap with concrete milestones and salary projections in ₹ Lakhs.
                                </p>

                                <div className="space-y-3 mb-8">
                                    {[
                                        { icon: Zap, text: "Skills gap analysis & learning path" },
                                        { icon: TrendingUp, text: "Salary progression (₹5L → ₹25L+)" },
                                        { icon: Target, text: "India-specific industry insights" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                                                <item.icon className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <span className="text-slate-700">{item.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                    <p className="text-sm text-blue-900 font-medium">
                                        💼 Perfect for: Those with a direction in mind who need a concrete plan, or anyone who's completed Phase 1 and ready for next steps.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Flow Indicator */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    <div className="flex items-center gap-2 text-slate-600">
                        <span className="text-sm font-medium">Start with either phase</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className="text-sm font-medium">Or combine both for maximum clarity</span>
                    </div>
                </div>
            </section>

            {/* OPEC Methodology Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">The OPEC Methodology</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Our unique four-step approach powered by 4 specialized AI agents
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {[
                        { letter: "O", title: "Observation", desc: "We listen without judgment", icon: Brain, color: "blue" },
                        { letter: "P", title: "Pattern", desc: "AI identifies recurring themes", icon: Sparkles, color: "indigo" },
                        { letter: "E", title: "Evaluation", desc: "Data-driven analysis", icon: TrendingUp, color: "purple" },
                        { letter: "C", title: "Clarity", desc: "Confident next steps", icon: Target, color: "green" }
                    ].map((step, idx) => (
                        <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
                            <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-${step.color}-100 flex items-center justify-center`}>
                                <step.icon className={`w-6 h-6 text-${step.color}-600`} />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mb-2">{step.letter}</div>
                            <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                            <p className="text-sm text-slate-600">{step.desc}</p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20" />
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold mb-4">Ready to Find Your Path?</h2>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of Indian students and professionals who've gained career clarity with OPEC.
                        </p>
                        <Link to="/opec/onboarding">
                            <Button className="h-14 px-10 text-lg bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-xl">
                                Start Your Free Journey
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </Card>
            </section>
        </div>
    );
}
