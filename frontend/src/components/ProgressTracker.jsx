import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { CheckCircle, Circle, Trophy, Flame, Target, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
};

const milestoneVariant = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

const checkVariant = {
    unchecked: { scale: 1 },
    checked: {
        scale: [1, 1.3, 1],
        transition: { duration: 0.3 }
    }
};

const confettiVariant = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1.2, 0],
        y: [0, -20, -30, -40],
        transition: { duration: 0.8 }
    }
};

export function ProgressTracker({ roadmap }) {
    const [completedMilestones, setCompletedMilestones] = useState({});
    const [recentComplete, setRecentComplete] = useState(null);
    const [streak, setStreak] = useState(0);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('opec_progress');
        if (saved) {
            setCompletedMilestones(JSON.parse(saved));
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('opec_progress', JSON.stringify(completedMilestones));
    }, [completedMilestones]);

    const toggleMilestone = (yearIndex, milestoneIndex) => {
        const key = `${yearIndex}-${milestoneIndex}`;
        const wasCompleted = completedMilestones[key];

        setCompletedMilestones(prev => ({
            ...prev,
            [key]: !prev[key]
        }));

        if (!wasCompleted) {
            setRecentComplete(key);
            setStreak(prev => prev + 1);
            setTimeout(() => setRecentComplete(null), 1000);
        } else {
            setStreak(prev => Math.max(0, prev - 1));
        }
    };

    const calculateProgress = () => {
        const totalMilestones = roadmap.reduce((sum, year) => sum + year.milestones.length, 0);
        const completed = Object.values(completedMilestones).filter(Boolean).length;
        return totalMilestones > 0 ? Math.round((completed / totalMilestones) * 100) : 0;
    };

    const getYearProgress = (yearIndex) => {
        const year = roadmap[yearIndex];
        const completed = year.milestones.filter((_, i) => completedMilestones[`${yearIndex}-${i}`]).length;
        return Math.round((completed / year.milestones.length) * 100);
    };

    const progress = calculateProgress();
    const completedCount = Object.values(completedMilestones).filter(Boolean).length;
    const totalMilestones = roadmap.reduce((sum, year) => sum + year.milestones.length, 0);

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            <Card className="p-6 overflow-hidden relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />

                {/* Header */}
                <motion.div variants={fadeInUp} className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg shadow-yellow-500/20">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                📈 Progress Tracker
                                {streak >= 3 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold"
                                    >
                                        <Flame className="w-3 h-3" />
                                        {streak} streak!
                                    </motion.span>
                                )}
                            </h3>
                            <p className="text-sm text-slate-600">Track your career milestones</p>
                        </div>
                    </div>

                    {/* Progress Circle */}
                    <div className="relative">
                        <svg className="w-20 h-20 -rotate-90">
                            <circle
                                cx="40"
                                cy="40"
                                r="36"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="6"
                            />
                            <motion.circle
                                cx="40"
                                cy="40"
                                r="36"
                                fill="none"
                                stroke="url(#progressGradient)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                initial={{ strokeDasharray: "0 227", strokeDashoffset: 0 }}
                                animate={{
                                    strokeDasharray: `${(progress / 100) * 227} 227`
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-slate-800">{progress}%</span>
                            <span className="text-[10px] text-slate-500">Complete</span>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Row */}
                <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3 bg-blue-50 rounded-xl text-center">
                        <div className="text-xl font-bold text-blue-600">{completedCount}</div>
                        <div className="text-[10px] text-blue-600/70 uppercase tracking-wider">Completed</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-center">
                        <div className="text-xl font-bold text-slate-600">{totalMilestones - completedCount}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Remaining</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl text-center">
                        <div className="text-xl font-bold text-green-600">{roadmap.length}</div>
                        <div className="text-[10px] text-green-600/70 uppercase tracking-wider">Years</div>
                    </div>
                </motion.div>

                {/* Linear Progress Bar */}
                <motion.div variants={fadeInUp} className="mb-6">
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>Progress</span>
                        <span>{completedCount} / {totalMilestones} milestones</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-green-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                </motion.div>

                {/* Milestone Checklist - Accordion Style */}
                <motion.div variants={staggerContainer} className="space-y-4">
                    {roadmap.map((year, yearIndex) => {
                        const yearProgress = getYearProgress(yearIndex);
                        const isComplete = yearProgress === 100;

                        return (
                            <motion.div
                                key={yearIndex}
                                variants={milestoneVariant}
                                className={`rounded-xl border transition-colors ${isComplete
                                        ? 'border-green-200 bg-green-50/50'
                                        : 'border-slate-200 bg-white'
                                    }`}
                            >
                                {/* Year Header */}
                                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${isComplete
                                                ? 'bg-green-500 text-white'
                                                : yearProgress > 0
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {isComplete ? <CheckCircle className="w-5 h-5" /> : `Y${year.year}`}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800 text-sm">
                                                {year.role}
                                            </h4>
                                            <p className="text-xs text-slate-500">Year {year.year}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-semibold ${isComplete ? 'text-green-600' : 'text-slate-500'
                                            }`}>
                                            {yearProgress}%
                                        </span>
                                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${yearProgress}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Milestones */}
                                <div className="p-3 space-y-1">
                                    {year.milestones.map((milestone, milestoneIndex) => {
                                        const key = `${yearIndex}-${milestoneIndex}`;
                                        const isCompleted = completedMilestones[key];
                                        const isRecent = recentComplete === key;

                                        return (
                                            <motion.button
                                                key={milestoneIndex}
                                                onClick={() => toggleMilestone(yearIndex, milestoneIndex)}
                                                whileHover={{ x: 4 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`flex items-center gap-3 w-full text-left p-2.5 rounded-lg transition-all ${isCompleted
                                                        ? 'bg-green-50 hover:bg-green-100'
                                                        : 'hover:bg-slate-50'
                                                    }`}
                                            >
                                                <motion.div
                                                    variants={checkVariant}
                                                    animate={isRecent ? "checked" : "unchecked"}
                                                    className="relative"
                                                >
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-slate-300" />
                                                    )}
                                                    {/* Confetti effect */}
                                                    <AnimatePresence>
                                                        {isRecent && (
                                                            <>
                                                                <motion.div
                                                                    variants={confettiVariant}
                                                                    initial="hidden"
                                                                    animate="visible"
                                                                    exit="hidden"
                                                                    className="absolute -top-1 -left-1 text-xs"
                                                                >
                                                                    ✨
                                                                </motion.div>
                                                                <motion.div
                                                                    variants={confettiVariant}
                                                                    initial="hidden"
                                                                    animate="visible"
                                                                    exit="hidden"
                                                                    style={{ animationDelay: '0.1s' }}
                                                                    className="absolute -top-1 -right-1 text-xs"
                                                                >
                                                                    🎉
                                                                </motion.div>
                                                            </>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                                <span className={`text-sm flex-1 ${isCompleted
                                                        ? 'text-green-700 line-through decoration-green-400'
                                                        : 'text-slate-700'
                                                    }`}>
                                                    {milestone}
                                                </span>
                                                <ChevronRight className={`w-4 h-4 transition-colors ${isCompleted ? 'text-green-400' : 'text-slate-300'
                                                    }`} />
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Completion Celebration */}
                <AnimatePresence>
                    {progress === 100 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="mt-6 p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-2xl text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <span className="text-[200px]">🏆</span>
                            </div>
                            <div className="relative z-10">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 0.5, repeat: 3 }}
                                >
                                    <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                                </motion.div>
                                <p className="text-2xl font-bold text-green-800 mb-1">🎉 Congratulations!</p>
                                <p className="text-green-600">You've completed all {totalMilestones} milestones!</p>
                                <p className="text-sm text-green-500 mt-2">Your dedication is inspiring. Keep going!</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tip */}
                <motion.div variants={fadeInUp} className="mt-4 text-center text-xs text-slate-400">
                    💡 Click milestones to mark them complete. Progress is saved automatically.
                </motion.div>
            </Card>
        </motion.div>
    );
}
