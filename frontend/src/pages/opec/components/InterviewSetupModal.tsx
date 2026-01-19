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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (company && role) {
            onStart(company, role);
            onClose();
        }
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
                        <button
                            onClick={() => {
                                onClose();
                                onBrowseJobs();
                            }}
                            className="w-full py-3 bg-white border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
                        >
                            <Search className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                            <span>Select from Live Job Market</span>
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
