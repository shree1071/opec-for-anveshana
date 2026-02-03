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
    { from: '#44403c', to: '#78716c', bg: 'from-stone-700 to-stone-500', text: 'text-stone-700' },
    { from: '#f59e0b', to: '#d97706', bg: 'from-amber-500 to-amber-600', text: 'text-amber-600' },
    { from: '#57534e', to: '#a8a29e', bg: 'from-stone-600 to-stone-400', text: 'text-stone-600' },
    { from: '#d97706', to: '#b45309', bg: 'from-amber-600 to-amber-700', text: 'text-amber-700' },
    { from: '#292524', to: '#57534e', bg: 'from-stone-800 to-stone-600', text: 'text-stone-800' },
];

const getStageIcon = (index) => {
    const icons = [Rocket, Code, Users, Brain, Award, Star];
    return icons[index % icons.length];
};

export function CareerJourney({ roadmap }) {
    if (!roadmap || roadmap.length === 0) return null;

    return (
        <div className="space-y-24 pb-20 font-sans">
            {/* 1. HERO PREVIEW */}
            <HeroJourneyPreview roadmap={roadmap} />

            {/* 2. DETAILED VERTICAL TIMELINE */}
            <div className="relative max-w-5xl mx-auto px-4 md:px-8">
                <div className="text-center mb-20 relative">
                    <h3 className="text-3xl font-serif font-medium text-stone-900 inline-flex items-center gap-3">
                        <MonitorPlay className="w-8 h-8 text-stone-700" />
                        Execution Roadmap
                    </h3>
                    <p className="text-stone-500 mt-3 text-lg font-light">Detailed strategic breakdown</p>
                </div>

                <div className="relative">
                    {/* The Central Beam */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2 z-0">
                        {/* Base track */}
                        <div className="absolute inset-0 bg-stone-200" />
                        {/* Animated Fill Beam */}
                        <motion.div
                            initial={{ height: "0%" }}
                            whileInView={{ height: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="absolute top-0 w-full bg-stone-900"
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

// --- Component 1: Hero Header ---
function HeroJourneyPreview({ roadmap }) {
    const [activeStage, setActiveStage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStage(prev => (prev + 1) % roadmap.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [roadmap.length]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-[#1c1917] rounded-3xl p-8 md:p-14 overflow-hidden relative shadow-2xl border border-stone-800"
        >
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-stone-800/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-stone-300 text-xs font-bold uppercase tracking-wider mb-12 backdrop-blur-sm">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Projected Career Trajectory
                </div>

                {/* Timeline Visualization */}
                <div className="w-full max-w-4xl relative mb-12">
                    {/* Base Line */}
                    <div className="absolute top-1/2 left-0 w-full h-px bg-stone-800 -translate-y-1/2" />

                    {/* Active Progress Line */}
                    <motion.div
                        className="absolute top-1/2 left-0 h-[2px] bg-stone-500 -translate-y-1/2"
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
                                            scale: isActive ? 1.2 : 1,
                                            backgroundColor: isActive ? '#f59e0b' : (isPast ? '#44403c' : '#292524'),
                                            borderColor: isActive ? '#fbbf24' : (isPast ? '#57534e' : '#44403c')
                                        }}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 relative z-20 ${isActive ? 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' : ''
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : (isPast ? 'text-stone-400' : 'text-stone-600')
                                            }`} />
                                    </motion.button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Active Stage Label */}
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
                            <h2 className="text-3xl md:text-4xl font-serif font-medium text-white mb-2 text-center tracking-tight">
                                {roadmap[activeStage]?.role}
                            </h2>
                            <p className="text-stone-400 font-medium tracking-wide">Year {roadmap[activeStage]?.year}</p>

                            {/* Small dots indicator */}
                            <div className="flex gap-1.5 mt-6">
                                {roadmap.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === activeStage ? 'bg-amber-500' : 'bg-stone-800'
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


// --- Component 2: Vertical Beam Timeline ---
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
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#faf9f7] border-4 border-stone-200 flex items-center justify-center shadow-lg relative z-20 overflow-hidden`}
                >
                    <div className={`w-3 h-3 rounded-full bg-stone-900`} />
                </motion.div>
            </div>

            {/* Content Card */}
            <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:pr-24' : 'md:pl-24'}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={controls}
                    variants={{
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.5, delay: 0.2 }
                        }
                    }}
                    whileHover={{ y: -5 }}
                    className="relative bg-white rounded-xl p-6 shadow-sm border border-stone-200 group overflow-hidden hover:shadow-md transition-all"
                >
                    {/* Top Accent Line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient.bg}`} />

                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-serif font-medium text-stone-900">
                            {stage.role}
                        </h3>
                        <span className="px-2 py-1 bg-stone-100 rounded text-xs font-bold text-stone-500">
                            Year {stage.year}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {/* Focus Area */}
                        <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
                            <Target className={`w-4 h-4 ${gradient.text}`} />
                            {stage.focus}
                        </div>

                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-2">
                            {stage.skills_to_acquire?.slice(0, 4).map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-100 rounded-md"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>

                        {/* Milestone */}
                        <div className="pt-3 border-t border-stone-50 mt-3">
                            <p className="text-xs text-stone-500 flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 mt-0.5 text-stone-400" />
                                {stage.milestones?.[0]}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
