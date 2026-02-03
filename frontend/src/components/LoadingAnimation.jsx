import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    Sparkles, Brain, Target, TrendingUp,
    Globe, Zap, Search, Briefcase
} from 'lucide-react';

export function LoadingAnimation() {
    const [statusIndex, setStatusIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const statuses = [
        "Initializing neural handshake...",
        "Scanning 50,000+ job market datapoints...",
        "Aligning skills with salary trajectories...",
        "Detecting high-growth industry patterns...",
        "Simulating 1,000 career futures...",
        "Optimizing your personal success path...",
        "Finalizing strategic blueprint..."
    ];

    useEffect(() => {
        // cycling statuses every 1.5s for "busy" feel
        const statusTimer = setInterval(() => {
            setStatusIndex(prev => (prev + 1) % statuses.length);
        }, 1800);

        // smooth progress bar
        const progressTimer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 0;
                return prev + 0.5; // 200 ticks = ~3-4 seconds loop for demo, or linear
            });
        }, 50);

        return () => {
            clearInterval(statusTimer);
            clearInterval(progressTimer);
        };
    }, []);

    // Satellite icons that orbit the central brain
    const Satellites = [
        { Icon: Globe, color: "text-blue-500", delay: 0 },
        { Icon: Target, color: "text-red-500", delay: 1.5 },
        { Icon: TrendingUp, color: "text-green-500", delay: 3 },
        { Icon: Zap, color: "text-amber-500", delay: 4.5 },
    ];

    return (
        <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4 font-sans overflow-hidden relative">

            {/* Background Mesh (Optional subtle texture) */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#44403c_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="max-w-xl w-full relative z-10 flex flex-col items-center">

                {/* --- CENTRAL VISUALIZATION: The Neural Core --- */}
                <div className="relative w-64 h-64 mb-12 flex items-center justify-center">

                    {/* 1. Pulse Rings */}
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute inset-0 border border-stone-200 rounded-full"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: [0.8, 1.5],
                                opacity: [0.5, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.8,
                                ease: "easeOut"
                            }}
                        />
                    ))}

                    {/* 2. Rotating Orbit Rings */}
                    <motion.div
                        className="absolute inset-4 border border-dashed border-stone-300 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute inset-12 border border-stone-200 rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    />

                    {/* 3. Orbiting Satellites (Data Points) */}
                    {Satellites.map((sat, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-full h-full"
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "linear",
                                delay: sat.delay
                            }}
                        >
                            {/* The icon sits at the "top" of the rotating container */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg border border-stone-100">
                                <sat.Icon className={`w-5 h-5 ${sat.color}`} />
                            </div>
                        </motion.div>
                    ))}

                    {/* 4. Central Brain Core */}
                    <div className="relative z-20 bg-white p-6 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Brain className="w-12 h-12 text-stone-800" />
                        </motion.div>
                        {/* Scanning beam overlay */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-100/30 to-transparent"
                            animate={{ y: [-50, 50] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                </div>

                {/* --- INTELLIGENT STATUS TEXT --- */}
                <div className="text-center space-y-6 max-w-md w-full">
                    <motion.div
                        key={statusIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="h-16 flex items-center justify-center"
                    >
                        <h2 className="text-xl md:text-2xl font-serif text-stone-800 font-medium">
                            {statuses[statusIndex]}
                        </h2>
                    </motion.div>

                    {/* Technical "Processing" Bar */}
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden relative">
                        <motion.div
                            className="absolute top-0 bottom-0 left-0 bg-stone-800"
                            style={{ width: `${progress}%` }}
                        />
                        {/* "Data Packet" moving across */}
                        <motion.div
                            className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            animate={{ x: ["-100%", "500%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>

                    <div className="flex justify-between text-xs font-semibold text-stone-400 uppercase tracking-widest px-1">
                        <span>AI Cortex Active</span>
                        <span>{Math.round(progress)}% Processed</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
