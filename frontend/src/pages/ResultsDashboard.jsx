import { useState } from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Briefcase, TrendingUp, AlertTriangle, BarChart3, BookOpen, DollarSign, Wrench, Home, Sparkles, Target, Zap, ArrowRight } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CareerFlowchart } from "../components/CareerFlowchart";
import { CareerJourney } from "../components/CareerJourney";

import { ResumeBuilder } from "../components/ResumeBuilder";
import { CourseRecommendations } from "../components/CourseRecommendations";
import { SalaryInsights } from "../components/SalaryInsights";
import { TabNavigation } from "../components/TabNavigation";
import { ProgressTracker } from "../components/ProgressTracker";
import { SkillQuiz } from "../components/SkillQuiz";
import { MentorMatch } from "../components/MentorMatch";
import { LearningVideos } from "../components/LearningVideos";
import { IndustryNews } from "../components/IndustryNews";

// Animation variants matching landing page
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const cardVariant = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

const pulseGlow = {
    initial: { boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)" },
    animate: {
        boxShadow: ["0 0 0 0 rgba(99, 102, 241, 0.4)", "0 0 0 20px rgba(99, 102, 241, 0)", "0 0 0 0 rgba(99, 102, 241, 0)"],
        transition: { duration: 2, repeat: Infinity }
    }
};

export function ResultsDashboard() {
    const { state } = useLocation();
    const result = state?.result;
    const [activeTab, setActiveTab] = useState('overview');

    if (!result) {
        return <Navigate to="/simulate" replace />;
    }

    const { roadmap, analysis } = result;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
        { id: 'roadmap', label: 'Roadmap', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'skills', label: 'Skills & Courses', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'salary', label: 'Salary', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'tools', label: 'Tools', icon: <Wrench className="w-4 h-4" /> },
    ];

    const analysisCards = [
        { key: 'market_outlook', title: 'Market Outlook', icon: TrendingUp, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
        { key: 'salary_projection', title: 'Salary Projection', icon: DollarSign, color: 'green', gradient: 'from-green-500 to-emerald-500' },
        { key: 'skill_gaps', title: 'Skill Gaps', icon: Target, color: 'orange', gradient: 'from-orange-500 to-amber-500' },
        { key: 'counselor_view', title: "Counselor's View", icon: Sparkles, color: 'purple', gradient: 'from-purple-500 to-pink-500' },
    ];

    return (
        <div className="min-h-screen bg-[#faf9f7] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-stone-900">
            {/* Background decoration - Minimal */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/30 rounded-full blur-3xl -z-10 opacity-50" />

            <div className="max-w-7xl mx-auto space-y-8">

                {/* Animated Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center relative mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-stone-200 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                            Analysis Complete
                        </span>
                    </motion.div>

                    <h1 className="text-4xl sm:text-5xl font-serif font-medium text-stone-900 mb-4 tracking-tight">
                        Your Career Roadmap
                    </h1>
                    <p className="text-xl text-stone-500 max-w-2xl mx-auto font-light leading-relaxed">
                        A personalized {roadmap.length}-year strategic path tailored to your unique potential.
                    </p>
                </motion.div>

                {/* Tab Navigation */}
                <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

                {/* Tab Content with AnimatePresence */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            {/* Quick Journey Preview */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#1c1917] rounded-2xl p-8 overflow-hidden relative shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-serif font-medium text-white mb-2">Your {roadmap.length}-Year Journey</h3>
                                            <p className="text-stone-400 text-sm font-light">Click on Roadmap tab for detailed view</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('roadmap')}
                                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            View Full Journey
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Journey Path Preview */}
                                    <div className="flex items-center justify-between overflow-x-auto pb-4 scrollbar-hide">
                                        {roadmap.map((stage, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-center group min-w-[100px]"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold border transition-all ${index === 0
                                                        ? 'bg-amber-500 border-amber-400 text-stone-900 shadow-lg shadow-amber-900/20'
                                                        : index === roadmap.length - 1
                                                            ? 'bg-stone-100 border-stone-200 text-stone-900'
                                                            : 'bg-stone-800 border-stone-700 text-stone-300 group-hover:bg-stone-700'
                                                        }`}>
                                                        Y{stage.year}
                                                    </div>
                                                    <p className="text-xs text-stone-500 mt-3 text-center max-w-[100px] truncate font-medium">
                                                        {stage.role}
                                                    </p>
                                                </div>
                                                {index < roadmap.length - 1 && (
                                                    <div className="w-12 h-px bg-stone-800 mx-4" />
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Analysis Overview Grid - Animated */}
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                            >
                                {analysisCards.map((card, index) => {
                                    const Icon = card.icon;
                                    return (
                                        <motion.div
                                            key={card.key}
                                            variants={cardVariant}
                                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        >
                                            <Card className="bg-white border text-left border-stone-200 shadow-card hover:shadow-lg transition-all p-6 h-full relative overflow-hidden group rounded-xl">
                                                <div className="relative z-10">
                                                    <div className={`w-10 h-10 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center mb-4`}>
                                                        <Icon className="w-5 h-5 text-stone-700" />
                                                    </div>
                                                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                                                        {card.title}
                                                    </h3>
                                                    <p className="text-stone-900 font-medium text-lg leading-relaxed font-serif">
                                                        {analysis[card.key]}
                                                    </p>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>

                            {/* Mentor Matching */}
                            <MentorMatch field={roadmap[0]?.role} />

                            {/* Industry News */}
                            <IndustryNews field={roadmap[0]?.role} />
                        </motion.div>
                    )}


                    {activeTab === 'roadmap' && (
                        <motion.div
                            key="roadmap"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CareerJourney roadmap={roadmap} analysis={analysis} />
                        </motion.div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="space-y-8">
                            {/* Skill Quiz */}
                            <SkillQuiz field={roadmap[0]?.role} />

                            {/* Learning Videos */}
                            {roadmap[0]?.skills_to_acquire?.[0] && (
                                <LearningVideos skill={roadmap[0].skills_to_acquire[0]} />
                            )}

                            {/* Course Recommendations */}
                            {roadmap.length > 0 && (
                                <CourseRecommendations skills={roadmap.flatMap(y => y.skills_to_acquire)} />
                            )}
                        </div>
                    )}


                    {activeTab === 'salary' && (
                        <div className="space-y-8">
                            {/* Salary Insights Dashboard */}
                            <SalaryInsights roadmap={roadmap} salaryProjection={analysis.salary_projection} />
                        </div>
                    )}

                    {activeTab === 'tools' && (
                        <div className="space-y-8">
                            {/* Progress Tracker */}
                            <ProgressTracker roadmap={roadmap} />

                            {/* Resume Builder */}
                            <ResumeBuilder roadmap={roadmap} analysis={analysis} />
                        </div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center pt-8"
                >
                    <Link to="/simulate">
                        <Button variant="outline" className="hover:bg-slate-100">
                            Start New Simulation
                        </Button>
                    </Link>
                </motion.div>

            </div>

            {/* Floating Chat Widget Removed */}
        </div>
    );
}
