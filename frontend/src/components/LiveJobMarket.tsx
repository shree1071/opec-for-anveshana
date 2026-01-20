import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, TrendingUp, DollarSign, ExternalLink, Clock, Building, Zap, ArrowRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary_display: string;
    description: string;
    url: string;
    posted_date: string;
    category: string;
    contract_type?: string;
}

interface LiveJobMarketProps {
    initialQuery?: string;
    compact?: boolean;
    onInterviewStart?: (company: string, role: string) => void;
}

// Animation variants
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

const LiveJobMarket: React.FC<LiveJobMarketProps> = ({ initialQuery = "Software Engineer", compact = false, onInterviewStart }) => {
    const [query, setQuery] = useState(initialQuery);
    const [location, setLocation] = useState("Bangalore");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [liveData, setLiveData] = useState(false);
    const [stats, setStats] = useState({ total: 0, avgSalary: "₹6L - ₹12L" });

    const fetchJobs = async () => {
        setLoading(true);
        try {
            // Direct call to backend MCP endpoint
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/mcp/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, location, max_results: compact ? 3 : 10 })
            });

            const result = await response.json();
            if (result.status === 'success') {
                const data = result.data;
                setJobs(data.jobs || []);
                setLiveData(data.is_live_data);
                setStats({
                    total: data.total_available,
                    avgSalary: "₹8L - ₹18L" // Mock for now, or fetch from salary tool
                });
            }
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [initialQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchJobs();
    };

    return (
        <div className={`w-full ${compact ? 'p-0' : 'p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl relative overflow-hidden'}`}>
            {/* Background decoration for full mode */}
            {!compact && (
                <>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10" />
                </>
            )}

            {/* Header */}
            {!compact && (
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                            Live Job Market
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Real-time opportunities from top platforms</p>
                    </div>
                    {liveData && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100/80 backdrop-blur-sm text-green-700 rounded-full text-xs font-semibold border border-green-200 shadow-sm animate-pulse">
                            <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            LIVE FEED
                        </div>
                    )}
                </div>
            )}

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6 group">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Job role (e.g. React Developer)"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-sm shadow-sm"
                    />
                </div>
                <div className="relative w-1/3 hidden sm:block">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-sm shadow-sm"
                    />
                </div>
                <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2 font-medium"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Search
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            {/* Stats Cards (Only in full view) */}
            {!compact && jobs.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Briefcase className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="text-blue-600 text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
                            Total Openings
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stats.total.toLocaleString()}</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-100 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <DollarSign className="w-12 h-12 text-emerald-600" />
                        </div>
                        <div className="text-emerald-600 text-xs font-bold mb-1 uppercase tracking-wider">Avg Salary</div>
                        <div className="text-2xl font-bold text-slate-900">{stats.avgSalary}</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl border border-violet-100 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <TrendingUp className="w-12 h-12 text-violet-600" />
                        </div>
                        <div className="text-violet-600 text-xs font-bold mb-1 uppercase tracking-wider">Demand Trend</div>
                        <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            High <span className="text-xs bg-violet-200 text-violet-700 px-1.5 py-0.5 rounded text-center">+12%</span>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Job List */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-3"
            >
                {loading ? (
                    // Skeleton Loader
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse border border-slate-200/50"></div>
                    ))
                ) : jobs.length > 0 ? (
                    jobs.map((job) => (
                        <motion.div
                            key={job.id}
                            variants={itemVariant}
                            whileHover={{ y: -2, scale: 1.01 }}
                            className="group p-4 bg-white border border-slate-100 hover:border-blue-200/60 rounded-xl shadow-sm hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                        <Building className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{job.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span className="font-medium text-slate-700">{job.company}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={job.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                                    <DollarSign className="w-3 h-3" />
                                    {job.salary_display}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100">
                                    <Clock className="w-3 h-3" />
                                    {new Date(job.posted_date).toLocaleDateString()}
                                </span>
                                {job.contract_type && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                                        {job.contract_type}
                                    </span>
                                )}

                                {/* Prep Button */}
                                {onInterviewStart && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onInterviewStart(job.company, job.title);
                                        }}
                                        className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all active:scale-95"
                                    >
                                        <Zap className="w-3 h-3 fill-current" />
                                        AI Prep
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-10 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                        <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No active jobs found for "{query}"</p>
                        <p className="text-slate-400 text-sm mt-1">Try adjusting your search terms</p>
                    </div>
                )}
            </motion.div>

            {!compact && jobs.length > 0 && (
                <div className="mt-6 text-center">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-sm font-medium rounded-lg transition-colors shadow-sm">
                        View more jobs <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default LiveJobMarket;
