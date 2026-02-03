import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Download, Share2, Trophy, MessageSquare,
    Brain, Zap, Target, TrendingUp, CheckCircle,
    AlertCircle, Lightbulb, ArrowRight, Sparkles,
    Building2, Briefcase, Clock, Award, Star,
    Rocket, Users, ChevronRight, BarChart3
} from 'lucide-react';

interface ReportData {
    overall_score: number;
    communication_score: number;
    technical_score: number;
    confidence_score: number;
    problem_solving_score?: number;
    cultural_fit_score?: number;
    strengths: string[];
    weaknesses: string[];
    key_insights: string;
    recommendations: string;
    interviewer_notes?: string;
    next_steps?: string[];
    estimated_readiness?: string;
}

interface SessionData {
    company: string;
    role: string;
    duration_seconds: number;
}

interface InterviewReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: ReportData | null;
    session: SessionData;
}

// Animated circular progress
const CircularProgress = ({ score, size = 120, strokeWidth = 10, color }: {
    score: number;
    size?: number;
    strokeWidth?: number;
    color: string;
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    style={{ strokeDasharray: circumference }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                    className="text-3xl font-bold text-white"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {score}
                </motion.span>
            </div>
        </div>
    );
};

// Score card component
const ScoreCard = ({ score, label, icon: Icon, gradient, delay }: {
    score: number;
    label: string;
    icon: React.ElementType;
    gradient: string;
    delay: number;
}) => {
    const getScoreColor = (score: number) => {
        if (score >= 85) return '#10b981';
        if (score >= 70) return '#3b82f6';
        if (score >= 55) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`relative overflow-hidden rounded-2xl p-6 ${gradient}`}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div
                        className="text-4xl font-bold"
                        style={{ color: getScoreColor(score) }}
                    >
                        {score}
                    </div>
                </div>
                <div className="text-white/90 font-medium">{label}</div>
                <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: getScoreColor(score) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, delay: delay + 0.3 }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

// Readiness badge
const ReadinessBadge = ({ readiness }: { readiness: string }) => {
    const config: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
        'Interview Ready': { bg: 'bg-gradient-to-r from-emerald-500 to-green-500', text: 'text-white', icon: Trophy },
        'Almost There': { bg: 'bg-gradient-to-r from-blue-500 to-cyan-500', text: 'text-white', icon: Star },
        'Keep Practicing': { bg: 'bg-gradient-to-r from-amber-500 to-orange-500', text: 'text-white', icon: Target },
        'Building Foundation': { bg: 'bg-gradient-to-r from-purple-500 to-pink-500', text: 'text-white', icon: Rocket }
    };

    const { bg, text, icon: Icon } = config[readiness] || config['Keep Practicing'];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${bg} ${text} font-semibold shadow-lg`}
        >
            <Icon className="w-5 h-5" />
            {readiness}
        </motion.div>
    );
};

export const InterviewReportModal = ({ isOpen, onClose, report, session }: InterviewReportModalProps) => {
    const [isExporting, setIsExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        setIsExporting(true);
        try {
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default as unknown;

            const opt = {
                margin: [10, 10, 10, 10] as [number, number, number, number],
                filename: `Interview_Report_${session.company}_${session.role}_${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0f0f23' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
            };

            await (html2pdf as () => { set: (opt: unknown) => { from: (el: HTMLElement) => { save: () => Promise<void> } } })().set(opt).from(reportRef.current).save();
        } catch (error) {
            console.error('PDF export error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleShare = async () => {
        const text = `🎯 Interview Report: ${session.role} at ${session.company}\n\n` +
            `📊 Overall Score: ${report?.overall_score}/100\n` +
            `💬 Communication: ${report?.communication_score}/100\n` +
            `🧠 Technical: ${report?.technical_score}/100\n` +
            `⚡ Confidence: ${report?.confidence_score}/100\n\n` +
            `Status: ${report?.estimated_readiness || 'In Progress'}\n\n` +
            `#MockInterview #CareerPrep`;

        try {
            if (navigator.share) {
                await navigator.share({ title: 'Interview Report', text });
            } else {
                await navigator.clipboard.writeText(text);
                alert('Report copied to clipboard!');
            }
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    if (!report) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] overflow-y-auto"
                    style={{
                        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
                    }}
                >
                    <div ref={reportRef} className="min-h-screen">
                        {/* Hero Header */}
                        <div className="relative overflow-hidden">
                            {/* Animated background */}
                            <div className="absolute inset-0">
                                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                            </div>

                            {/* Header content */}
                            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-12">
                                {/* Close & Actions */}
                                <div className="flex items-center justify-between mb-8">
                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={onClose}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                        Close
                                    </motion.button>

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-3"
                                    >
                                        <button
                                            onClick={handleDownloadPDF}
                                            disabled={isExporting}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
                                        >
                                            <Download className="w-4 h-4" />
                                            {isExporting ? 'Generating...' : 'Download PDF'}
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium backdrop-blur-sm transition-all"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            Share
                                        </button>
                                    </motion.div>
                                </div>

                                {/* Title Section */}
                                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                                    {/* Main Score */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex-shrink-0"
                                    >
                                        <CircularProgress
                                            score={report.overall_score}
                                            size={160}
                                            strokeWidth={12}
                                            color={report.overall_score >= 70 ? '#10b981' : report.overall_score >= 50 ? '#f59e0b' : '#ef4444'}
                                        />
                                        <div className="text-center mt-3">
                                            <span className="text-white/60 text-sm">Overall Score</span>
                                        </div>
                                    </motion.div>

                                    {/* Title & Meta */}
                                    <div className="text-center lg:text-left flex-1">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                                                Interview Report
                                            </h1>
                                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-white/70 mb-4">
                                                <span className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                                                    <Building2 className="w-4 h-4 text-blue-400" />
                                                    {session.company}
                                                </span>
                                                <span className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                                                    <Briefcase className="w-4 h-4 text-purple-400" />
                                                    {session.role}
                                                </span>
                                                <span className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                                                    <Clock className="w-4 h-4 text-emerald-400" />
                                                    {formatDuration(session.duration_seconds)}
                                                </span>
                                            </div>
                                            {report.estimated_readiness && (
                                                <ReadinessBadge readiness={report.estimated_readiness} />
                                            )}
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Score Cards Grid */}
                        <div className="max-w-6xl mx-auto px-6 py-8">
                            <motion.h2
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-2xl font-bold text-white mb-6 flex items-center gap-2"
                            >
                                <BarChart3 className="w-6 h-6 text-blue-400" />
                                Performance Breakdown
                            </motion.h2>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                <ScoreCard score={report.communication_score} label="Communication" icon={MessageSquare} gradient="bg-gradient-to-br from-blue-600/80 to-blue-800/80" delay={0.1} />
                                <ScoreCard score={report.technical_score} label="Technical Skills" icon={Brain} gradient="bg-gradient-to-br from-purple-600/80 to-purple-800/80" delay={0.2} />
                                <ScoreCard score={report.confidence_score} label="Confidence" icon={Zap} gradient="bg-gradient-to-br from-amber-600/80 to-orange-700/80" delay={0.3} />
                                <ScoreCard score={report.problem_solving_score || 70} label="Problem Solving" icon={Target} gradient="bg-gradient-to-br from-emerald-600/80 to-green-700/80" delay={0.4} />
                                <ScoreCard score={report.cultural_fit_score || 75} label="Cultural Fit" icon={Users} gradient="bg-gradient-to-br from-pink-600/80 to-rose-700/80" delay={0.5} />
                                <ScoreCard score={report.overall_score} label="Overall" icon={Trophy} gradient="bg-gradient-to-br from-violet-600/80 to-indigo-800/80" delay={0.6} />
                            </div>
                        </div>

                        {/* Insights Section */}
                        <div className="max-w-6xl mx-auto px-6 py-8">
                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* Key Insights */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-yellow-500/20">
                                            <Lightbulb className="w-5 h-5 text-yellow-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white">Key Insights</h3>
                                    </div>
                                    <p className="text-white/80 leading-relaxed text-lg">{report.key_insights}</p>
                                </motion.div>

                                {/* Interviewer Notes */}
                                {report.interviewer_notes && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-blue-500/20">
                                                <MessageSquare className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-white">Interviewer Notes</h3>
                                        </div>
                                        <p className="text-white/80 leading-relaxed text-lg italic">"{report.interviewer_notes}"</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Strengths & Improvements */}
                        <div className="max-w-6xl mx-auto px-6 py-8">
                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* Strengths */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-600/5 border border-emerald-500/20"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-emerald-500/20">
                                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white">Your Strengths</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {report.strengths.map((strength, index) => (
                                            <motion.li
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.7 + index * 0.1 }}
                                                className="flex items-start gap-3"
                                            >
                                                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-white/80">{strength}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>

                                {/* Areas to Improve */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/20"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-amber-500/20">
                                            <Target className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white">Areas to Improve</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {report.weaknesses.map((weakness, index) => (
                                            <motion.li
                                                key={index}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.7 + index * 0.1 }}
                                                className="flex items-start gap-3"
                                            >
                                                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-white/80">{weakness}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </div>
                        </div>

                        {/* Recommendations & Next Steps */}
                        <div className="max-w-6xl mx-auto px-6 py-8 pb-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-600/5 border border-violet-500/20"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-lg bg-violet-500/20">
                                        <Rocket className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Recommendations & Next Steps</h3>
                                </div>

                                <p className="text-white/80 leading-relaxed text-lg mb-6">{report.recommendations}</p>

                                {report.next_steps && report.next_steps.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                                            <ArrowRight className="w-4 h-4 text-violet-400" />
                                            Action Items
                                        </h4>
                                        <div className="grid gap-3">
                                            {report.next_steps.map((step, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.9 + index * 0.1 }}
                                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                                                >
                                                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-sm font-medium flex items-center justify-center">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-white/80">{step}</span>
                                                    <ChevronRight className="w-4 h-4 text-white/40 ml-auto" />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* AI Badge */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="flex items-center justify-center gap-2 mt-8 text-white/40"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm">AI-Powered Analysis by OPEC Interview Coach</span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InterviewReportModal;
