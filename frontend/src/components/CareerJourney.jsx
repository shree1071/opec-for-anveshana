import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useAnimation } from 'framer-motion';
import { Card } from './ui/Card';
import {
    Briefcase, CheckCircle, ChevronRight, Star, Zap, Target,
    Rocket, Award, TrendingUp, Code, Users, Brain, Sparkles,
    MonitorPlay
} from 'lucide-react';

// --- Hero Section Constants ---
const stageGradients = [
    { from: '#3b82f6', to: '#06b6d4', bg: 'from-blue-500 to-cyan-500' },
    { from: '#8b5cf6', to: '#6366f1', bg: 'from-violet-500 to-indigo-500' },
    { from: '#ec4899', to: '#f43f5e', bg: 'from-pink-500 to-rose-500' },
    { from: '#f59e0b', to: '#ef4444', bg: 'from-amber-500 to-red-500' },
    { from: '#10b981', to: '#14b8a6', bg: 'from-emerald-500 to-teal-500' },
];

const getStageIcon = (index) => {
    const icons = [Rocket, Code, Users, Brain, Award, Star];
    return icons[index % icons.length];
};

export function CareerJourney({ roadmap }) {
    if (!roadmap || roadmap.length === 0) return null;

    return (
        <div className="space-y-24 pb-20">
            {/* 1. HERO PREVIEW (Refined - No Text Overlap) */}
            <HeroJourneyPreview roadmap={roadmap} />

            {/* 2. DETAILED VERTICAL TIMELINE (Restored Glowing Beam) */}
            <div className="relative max-w-5xl mx-auto px-4 md:px-8">
                <div className="text-center mb-20 relative">
                    <h3 className="text-3xl font-black text-slate-900 inline-flex items-center gap-3">
                        <MonitorPlay className="w-8 h-8 text-blue-600" />
                        Execution Roadmap
                    </h3>
                    <p className="text-slate-500 mt-3 text-lg">Detailed strategic breakdown</p>

                    {/* Floating Background Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-blue-500/10 blur-[60px] -z-10" />
                </div>

                <div className="relative">
                    {/* The Glowing Central Beam (Restored) */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 md:-translate-x-1/2 z-0">
                        {/* Base track */}
                        <div className="absolute inset-0 bg-slate-100 rounded-full" />
                        {/* Animated Fill Beam */}
                        <motion.div
                            initial={{ height: "0%" }}
                            whileInView={{ height: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="absolute top-0 w-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                        />
                    </div>

                    {roadmap.map((stage, index) => (
                        <BeamTimelineItem
                            key={index}
                            stage={stage}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- Component 1: Hero Header (Fixed overlapping text) ---
function HeroJourneyPreview({ roadmap }) {
    const [activeStage, setActiveStage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStage(prev => (prev + 1) % roadmap.length);
        }, 4000); // Slower cycle for better readability
        return () => clearInterval(timer);
    }, [roadmap.length]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-slate-950 rounded-3xl p-8 md:p-14 overflow-hidden relative shadow-2xl border border-slate-900"
        >
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-300 text-xs font-bold uppercase tracking-wider mb-12 backdrop-blur-sm">
                    <Sparkles className="w-3 h-3" />
                    Projected Career Trajectory
                </div>

                {/* Timeline Visualization */}
                <div className="w-full max-w-4xl relative mb-12">
                    {/* Base Line */}
                    <div className="absolute top-1/2 left-0 w-full h-px bg-slate-800 -translate-y-1/2" />

                    {/* Active Progress Line */}
                    <motion.div
                        className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 -translate-y-1/2 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        animate={{ width: `${(activeStage / (roadmap.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />

                    <div className="flex justify-between relative z-10">
                        {roadmap.map((stage, index) => {
                            const Icon = getStageIcon(index);
                            const isActive = index === activeStage;
                            const isPast = index < activeStage;

                            return (
                                <div key={index} className="relative group">
                                    <motion.button
                                        onClick={() => setActiveStage(index)}
                                        animate={{
                                            scale: isActive ? 1.3 : 1,
                                            backgroundColor: isActive ? '#3b82f6' : (isPast ? '#1e293b' : '#0f172a'),
                                            borderColor: isActive ? '#60a5fa' : (isPast ? '#334155' : '#1e293b')
                                        }}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300 relative z-20 ${isActive ? 'shadow-[0_0_30px_rgba(59,130,246,0.5)]' : ''
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : (isPast ? 'text-slate-400' : 'text-slate-700')
                                            }`} />
                                    </motion.button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Active Stage Label - Centered & Absolute to prevent shift/overlap */}
                <div className="h-24 w-full max-w-lg relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStage}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex flex-col items-center"
                        >
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 text-center tracking-tight">
                                {roadmap[activeStage]?.role}
                            </h2>
                            <p className="text-blue-300 font-medium">Year {roadmap[activeStage]?.year}</p>

                            {/* Small dots indicator */}
                            <div className="flex gap-1.5 mt-6">
                                {roadmap.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === activeStage ? 'bg-white' : 'bg-white/20'
                                            }`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}


// --- Component 2: Vertical Beam Timeline (Restored & Polished) ---
function BeamTimelineItem({ stage, index }) {
    const isEven = index % 2 === 0;
    const gradient = stageGradients[index % stageGradients.length];

    // Animation controls
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) controls.start("visible");
    }, [isInView, controls]);

    return (
        <div ref={ref} className={`relative flex flex-col md:flex-row items-center mb-16 md:mb-24 ${isEven ? 'md:flex-row-reverse' : ''}`}>

            {/* Spacer for opposite side */}
            <div className="hidden md:block w-1/2" />

            {/* Central Node */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={controls}
                    variants={{
                        visible: { scale: 1, transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.1 } }
                    }}
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900 border-4 border-white flex items-center justify-center shadow-lg relative z-20 overflow-hidden`}
                >
                    {/* Inner Gradient */}
                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${gradient.bg}`} />
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${gradient.bg} shadow-[0_0_10px_currentColor]`} />
                </motion.div>

                {/* Connecting horizontal beam */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={controls}
                    variants={{
                        visible: { width: "4rem", opacity: 1, transition: { duration: 0.4, delay: 0.3 } }
                    }}
                    className={`hidden md:block absolute h-0.5 bg-gradient-to-r ${gradient.bg} top-1/2 -translate-y-1/2 -z-10 ${isEven ? 'right-1/2 origin-right' : 'left-1/2 origin-left'
                        }`}
                />
            </div>

            {/* Content Card */}
            <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:pr-24' : 'md:pl-24'}`}>
                <motion.div
                    initial={{ opacity: 0, x: isEven ? -30 : 30, scale: 0.95 }}
                    animate={controls}
                    variants={{
                        visible: {
                            opacity: 1,
                            x: 0,
                            scale: 1,
                            transition: { type: "spring", stiffness: 100, damping: 20, delay: 0.2 }
                        }
                    }}
                    whileHover={{ y: -5 }}
                    className="relative bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 group overflow-hidden"
                >
                    {/* Top Accent Line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient.bg}`} />

                    {/* Hover Glow */}
                    <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br ${gradient.bg} opacity-5 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />

                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {stage.role}
                        </h3>
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">
                            Year {stage.year}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {/* Focus Area */}
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Target className={`w-4 h-4 text-blue-500`} />
                            {stage.focus}
                        </div>

                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-2">
                            {stage.skills_to_acquire?.slice(0, 4).map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>

                        {/* Milestone */}
                        <div className="pt-3 border-t border-slate-50 mt-3">
                            <p className="text-xs text-slate-500 flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 mt-0.5 text-green-500" />
                                {stage.milestones?.[0]}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
