
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, TrendingUp, DollarSign, ExternalLink, Clock } from 'lucide-react';

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
        <div className={`w-full ${compact ? 'p-0' : 'p-6 bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl'}`}>

            {/* Header */}
            {!compact && (
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                            Live Job Market
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Real-time opportunities from across the web</p>
                    </div>
                    {liveData && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium animate-pulse">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            LIVE DATA
                        </div>
                    )}
                </div>
            )}

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Job role (e.g. React Developer)"
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                    />
                </div>
                <div className="relative w-1/3">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City"
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {/* Stats Cards (Only in full view) */}
            {!compact && jobs.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="text-blue-500 text-xs font-semibold mb-1 uppercase tracking-wider">Total Openings</div>
                        <div className="text-2xl font-bold text-slate-800">{stats.total.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="text-emerald-500 text-xs font-semibold mb-1 uppercase tracking-wider">Avg Salary</div>
                        <div className="text-2xl font-bold text-slate-800">{stats.avgSalary}</div>
                    </div>
                    <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                        <div className="text-violet-500 text-xs font-semibold mb-1 uppercase tracking-wider">Top Skill</div>
                        <div className="text-2xl font-bold text-slate-800">React.js</div>
                    </div>
                </div>
            )}

            {/* Job List */}
            <div className="space-y-3">
                {loading ? (
                    // Skeleton Loader
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
                    ))
                ) : jobs.length > 0 ? (
                    jobs.map((job) => (
                        <div key={job.id} className="group p-4 bg-white border border-slate-100 hover:border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                        <span className="font-medium text-slate-700">{job.company}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
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

                            <div className="flex items-center gap-4 mt-3 text-xs font-medium text-slate-600">
                                <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                                    <DollarSign className="w-3 h-3 text-slate-500" />
                                    {job.salary_display}
                                </div>
                                <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    {new Date(job.posted_date).toLocaleDateString()}
                                </div>
                                <div className="hidden sm:flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                                    {job.contract_type}
                                </div>
                                {/* Prep Button */}
                                {onInterviewStart && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onInterviewStart(job.company, job.title);
                                        }}
                                        className="ml-auto flex items-center gap-1 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors"
                                    >
                                        <Briefcase className="w-3 h-3" />
                                        Prep for Interview
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        No active jobs found. Try a different search.
                    </div>
                )}
            </div>

            {!compact && jobs.length > 0 && (
                <div className="mt-4 text-center">
                    <button className="text-sm text-blue-600 font-medium hover:underline">
                        View all {stats.total.toLocaleString()} jobs on Adzuna &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default LiveJobMarket;
