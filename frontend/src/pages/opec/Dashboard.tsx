import React, { useEffect, useState } from 'react';
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Button, Card } from "../../components/ui";
import { MessageSquare, ArrowRight, Activity, TrendingUp, Sparkles, Brain, Clock } from "lucide-react";
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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-5xl mx-auto space-y-8"
            >
                {/* Header */}
                <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.firstName}</h1>
                        <p className="text-slate-600 mt-2 text-lg">Your journey to career clarity continues.</p>
                    </div>
                    <div className="flex items-center text-sm text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                        <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                        Last active: {stats?.last_active ? new Date(stats.last_active).toLocaleDateString() : 'New User'}
                    </div>
                </motion.div>

                {/* Main Action Card */}
                <motion.div variants={item}>
                    <Card className="p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-indigo-100">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg text-white">
                                    <MessageSquare className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Resume Session</h2>
                                    <p className="text-slate-600 mt-1 max-w-lg">
                                        Continue exploring your thoughts. You've sent {stats?.message_count || 0} messages so far.
                                    </p>
                                </div>
                            </div>
                            <Link to="/opec/chat">
                                <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all px-8 py-6 rounded-xl text-lg">
                                    Continue to Chat
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </motion.div>

                {/* Career Simulator Card */}
                <motion.div variants={item}>
                    <Card className="p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-blue-100">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg text-white">
                                    <TrendingUp className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Build Your Roadmap</h2>
                                    <p className="text-slate-600 mt-1 max-w-lg">
                                        Ready to take action? Use our career simulator to create a personalized roadmap with concrete next steps.
                                    </p>
                                </div>
                            </div>
                            <Link to="/opec/simulate">
                                <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all px-8 py-6 rounded-xl text-lg">
                                    Start Simulator
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </motion.div>

                {/* Stats Grid */}
                <motion.div variants={item} className="grid md:grid-cols-3 gap-6">
                    {/* Clarity Score */}
                    <Card className="p-6 relative overflow-hidden bg-white hover:shadow-lg transition-all border-slate-200">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-2xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <Activity className="w-5 h-5" />
                                </div>
                                {stats?.clarity_score && stats.clarity_score > 0 && (
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${stats.clarity_score > 50 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {stats.clarity_score > 50 ? 'On Track' : 'Starting'}
                                    </span>
                                )}
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">
                                {loading ? '...' : `${stats?.clarity_score || 0}%`}
                            </div>
                            <p className="text-sm font-medium text-slate-500">Current Clarity Score</p>
                        </div>
                    </Card>

                    {/* Insights Unlocked */}
                    <Card className="p-6 relative overflow-hidden bg-white hover:shadow-lg transition-all border-slate-200">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">
                                {loading ? '...' : stats?.patterns_count || 0}
                            </div>
                            <p className="text-sm font-medium text-slate-500">Patterns Identified</p>
                        </div>
                    </Card>

                    {/* Usage Stats */}
                    <Card className="p-6 relative overflow-hidden bg-white hover:shadow-lg transition-all border-slate-200">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">
                                {loading ? '...' : stats?.message_count || 0}
                            </div>
                            <p className="text-sm font-medium text-slate-500">Messages Exchanged</p>
                        </div>
                    </Card>
                </motion.div>

                {/* Quote / Insight Placeholder */}
                <motion.div variants={item}>
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-center text-white shadow-xl relative overflow-hidden">
                        <Brain className="w-32 h-32 text-white opacity-5 absolute -bottom-8 -left-8 rotate-12" />
                        <p className="text-xl md:text-2xl font-medium italic relative z-10">
                            "The clearer your vision, the easier your decisions becomes."
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};
