import React, { useEffect, useState } from 'react';
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import {
    MessageSquare, ArrowRight, Activity, TrendingUp,
    Sparkles, Brain, Clock, Mic, Play
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardStats {
    message_count: number;
    clarity_score: number;
    patterns_count: number;
    last_active: string | null;
}

export const Dashboard = () => {
    const { user } = useUser();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id) return;
            try {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
                const res = await fetch(`${API_URL}/api/opec/chat/stats?clerk_id=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user?.id]);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="min-h-screen bg-[#faf9f7] font-sans text-stone-900">
            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">

                {/* Greeting Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <div className="w-16 h-16 mx-auto mb-6 bg-stone-200 rounded-2xl flex items-center justify-center overflow-hidden">
                        {user?.imageUrl ? (
                            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl text-stone-500 font-serif">
                                {user?.firstName?.charAt(0) || "U"}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-medium text-stone-900 mb-4 tracking-tight">
                        {greeting()}, {user?.firstName}
                    </h1>
                    <p className="text-xl text-stone-500 font-light">
                        Ready to continue your career journey?
                    </p>
                </motion.div>

                {/* Primary Actions Grid - Claude Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="grid md:grid-cols-3 gap-6 mb-16"
                >
                    {/* AI Interview Partner */}
                    <Link to="/opec/mock-interview" className="group">
                        <div className="bg-white border border-stone-200 rounded-2xl p-6 h-full hover:border-amber-400 hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 p-4 opacity-50 text-stone-300 group-hover:text-amber-200 transition-colors">
                                <Mic className="w-20 h-20 -mr-6 -mt-6 rotate-12" />
                            </div>

                            <div className="relative z-10 flex-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded-full mb-4">
                                    <Sparkles className="w-3 h-3" />
                                    New
                                </span>
                                <h2 className="text-xl font-serif font-medium text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
                                    AI Interview Partner
                                </h2>
                                <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                                    Realistic voice mock interviews with instant feedback on tone and content.
                                </p>
                            </div>
                            <div className="flex items-center text-amber-600 text-sm font-medium group-hover:translate-x-1 transition-transform mt-auto">
                                Start Practice <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                        </div>
                    </Link>

                    {/* Chat with OPEC */}
                    <Link to="/opec/chat" className="group">
                        <div className="bg-white border border-stone-200 rounded-2xl p-6 h-full hover:border-stone-400 hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 p-4 opacity-50 text-stone-300 group-hover:text-stone-200 transition-colors">
                                <MessageSquare className="w-20 h-20 -mr-6 -mt-6 rotate-12" />
                            </div>

                            <div className="relative z-10 flex-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-semibold rounded-full mb-4">
                                    Core
                                </span>
                                <h2 className="text-xl font-serif font-medium text-stone-900 mb-2 group-hover:text-stone-700 transition-colors">
                                    Career Clarity Chat
                                </h2>
                                <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                                    Deep dive into your goals and patterns with your personal AI guide.
                                </p>
                            </div>
                            <div className="flex items-center text-stone-900 text-sm font-medium group-hover:translate-x-1 transition-transform mt-auto">
                                Resume Session <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                        </div>
                    </Link>

                    {/* Career Simulator */}
                    <Link to="/opec/simulate" className="group">
                        <div className="bg-white border border-stone-200 rounded-2xl p-6 h-full hover:border-blue-400 hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 p-4 opacity-50 text-stone-300 group-hover:text-blue-200 transition-colors">
                                <TrendingUp className="w-20 h-20 -mr-6 -mt-6 rotate-12" />
                            </div>

                            <div className="relative z-10 flex-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full mb-4">
                                    Strategic
                                </span>
                                <h2 className="text-xl font-serif font-medium text-stone-900 mb-2 group-hover:text-blue-700 transition-colors">
                                    Career Simulator
                                </h2>
                                <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                                    Visualize your path and build a concrete roadmap for next steps.
                                </p>
                            </div>
                            <div className="flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform mt-auto">
                                Build Roadmap <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-white border border-stone-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-around gap-6"
                >
                    <div className="text-center">
                        <div className="text-3xl font-serif font-medium text-stone-900 mb-1">
                            {loading ? '...' : `${stats?.clarity_score || 0}%`}
                        </div>
                        <div className="text-xs font-medium text-stone-400 uppercase tracking-widest">Clarity Score</div>
                    </div>
                    <div className="h-px w-full md:w-px md:h-12 bg-stone-100"></div>
                    <div className="text-center">
                        <div className="text-3xl font-serif font-medium text-stone-900 mb-1">
                            {loading ? '...' : stats?.patterns_count || 0}
                        </div>
                        <div className="text-xs font-medium text-stone-400 uppercase tracking-widest">Patterns Found</div>
                    </div>
                    <div className="h-px w-full md:w-px md:h-12 bg-stone-100"></div>
                    <div className="text-center">
                        <div className="text-3xl font-serif font-medium text-stone-900 mb-1">
                            {loading ? '...' : stats?.message_count || 0}
                        </div>
                        <div className="text-xs font-medium text-stone-400 uppercase tracking-widest">Messages</div>
                    </div>
                </motion.div>

                {/* Quote Footer - Minimal */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 text-center"
                >
                    <p className="text-stone-400 italic text-sm font-serif">
                        "The clearer your vision, the easier your decisions become."
                    </p>
                </motion.div>

            </div>
        </div>
    );
};
