import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Search, X, Sparkles, User, ArrowRight } from 'lucide-react';

interface InterviewSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (company: string, role: string) => void;
    onBrowseJobs: () => void;
}

export const InterviewSetupModal: React.FC<InterviewSetupModalProps> = ({ isOpen, onClose, onStart, onBrowseJobs }) => {
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [showJobSearch, setShowJobSearch] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (company && role) {
            onStart(company, role);
            onClose();
            // Reset
            setCompany('');
            setRole('');
            setShowJobSearch(false);
        }
    };

    const searchJobs = async () => {
        if (!searchQuery.trim()) return;

        setIsLoadingJobs(true);
        try {
            // Using Adzuna Jobs API
            const appId = import.meta.env.VITE_ADZUNA_APP_ID || 'YOUR_APP_ID';
            const appKey = import.meta.env.VITE_ADZUNA_APP_KEY || 'YOUR_APP_KEY';
            const country = 'in'; // India

            const response = await fetch(
                `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=10&what=${encodeURIComponent(searchQuery)}&content-type=application/json`
            );

            if (response.ok) {
                const data = await response.json();
                setJobs(data.results || []);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setIsLoadingJobs(false);
        }
    };

    const selectJob = (job: any) => {
        setCompany(job.company?.display_name || 'Unknown Company');
        setRole(job.title || searchQuery);
        setShowJobSearch(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            >
                <div
                    className="absolute inset-0"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-indigo-200" />
                                Interview Setup
                            </h2>
                            <p className="text-indigo-100/80 mt-1">Configure your AI interviewer persona.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Option 1: Custom Details */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        placeholder="e.g. Senior Product Designer"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="e.g. Google, Startup, etc."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!company || !role}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                            >
                                <span>Start Mock Interview</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">or</span>
                            </div>
                        </div>

                        {/* Option 2: Browse Jobs */}
                        {!showJobSearch ? (
                            <button
                                onClick={() => setShowJobSearch(true)}
                                className="w-full py-3 bg-white border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
                            >
                                <Search className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                                <span>Select from Live Job Market</span>
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowJobSearch(false)}
                                        className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                                    >
                                        ← Back to manual entry
                                    </button>
                                </div>

                                {/* Job Search Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && searchJobs()}
                                        placeholder="Search jobs (e.g., Software Engineer)"
                                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    />
                                    <button
                                        onClick={searchJobs}
                                        disabled={!searchQuery.trim() || isLoadingJobs}
                                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isLoadingJobs ? 'Searching...' : 'Search'}
                                    </button>
                                </div>

                                {/* Job Results */}
                                {jobs.length > 0 && (
                                    <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-2">
                                        {jobs.map((job, index) => (
                                            <button
                                                key={index}
                                                onClick={() => selectJob(job)}
                                                className="w-full text-left p-3 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors group"
                                            >
                                                <div className="font-semibold text-slate-900 group-hover:text-indigo-600 text-sm">
                                                    {job.title}
                                                </div>
                                                <div className="text-xs text-slate-600 mt-1">
                                                    {job.company?.display_name || 'Company Not Listed'}
                                                </div>
                                                {job.location && (
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        📍 {job.location.display_name}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {jobs.length === 0 && searchQuery && !isLoadingJobs && (
                                    <div className="text-center py-8 text-slate-500 text-sm">
                                        No jobs found. Try a different search term.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
