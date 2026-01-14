import { motion } from 'framer-motion';
import { Sparkles, Brain, Rocket, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LoadingAnimation() {
    const [seconds, setSeconds] = useState(0);
    const [currentTip, setCurrentTip] = useState(0);

    const tips = [
        "🤖 AI agents are analyzing your profile...",
        "📊 Calculating market trends...",
        "💡 Identifying skill gaps...",
        "💰 Projecting salary growth...",
        "🎯 Creating your personalized roadmap...",
        "✨ Almost there! Finalizing details..."
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);

        const tipTimer = setInterval(() => {
            setCurrentTip(prev => (prev + 1) % tips.length);
        }, 3000);

        return () => {
            clearInterval(timer);
            clearInterval(tipTimer);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 text-center"
                >
                    {/* Animated Icon */}
                    <div className="relative mb-6">
                        <motion.div
                            animate={{
                                rotate: 360,
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                                scale: { duration: 2, repeat: Infinity }
                            }}
                            className="inline-block"
                        >
                            <div className="relative">
                                <Brain className="w-20 h-20 text-blue-600" />
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-blue-400 rounded-full blur-xl"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Generating Your Career Path
                    </h2>

                    {/* Timer */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="flex items-center gap-1 text-blue-600">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                ⏱️
                            </motion.div>
                            <span className="text-3xl font-bold">{seconds}s</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 15, ease: "linear" }}
                            />
                        </div>
                    </div>

                    {/* Animated Tip */}
                    <motion.div
                        key={currentTip}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-slate-600 mb-6"
                    >
                        {tips[currentTip]}
                    </motion.div>

                    {/* Floating Icons */}
                    <div className="flex justify-center gap-4">
                        {[Sparkles, Rocket, TrendingUp].map((Icon, index) => (
                            <motion.div
                                key={index}
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.3
                                }}
                            >
                                <Icon className="w-6 h-6 text-indigo-400" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Fun Fact */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="mt-6 text-xs text-slate-400"
                    >
                        💡 Did you know? Our AI analyzes 1000+ career paths per second!
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}
