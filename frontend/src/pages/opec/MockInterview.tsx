import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { VoiceMode } from './components/VoiceMode';
import { InterviewSetupModal } from './components/InterviewSetupModal';
import { Mic, History, ArrowLeft, Calendar, Clock, Building2, Trash2, TrendingUp, Award, Target, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface VoiceContext {
    interviewMode?: boolean;
    company?: string;
    role?: string;
}

interface Session {
    id: string | number;
    company: string;
    role: string;
    duration_seconds: number;
    session_date: string;
}

interface Report {
    overall_score: number;
    communication_score: number;
    technical_score: number;
    confidence_score: number;
    strengths?: string[];
    weaknesses?: string[];
    key_insights: string;
    recommendations: string;
}

interface ReportData {
    session?: {
        company: string;
        role: string;
    };
    report?: Report;
}

export function MockInterview() {
    const { user } = useUser();
    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [voiceContext, setVoiceContext] = useState<VoiceContext>({});
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<string | number | null>(null);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [showHistory, setShowHistory] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews/sessions`, {
                headers: { 'X-Clerk-User-Id': user?.id ?? '' }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch history: ${response.statusText}`);
            }

            const data = await response.json();
            setSessions(data);
            console.log('Fetched sessions:', data);
        } catch (error) {
            console.error('Error fetching history:', error);
            setError('Failed to load interview history. Please check if database tables exist.');
            showToast('Failed to load history', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartInterview = (company: string, role: string) => {
        setVoiceContext({ interviewMode: true, company, role });
        setIsVoiceActive(true);
    };

    const handleInterviewEnd = async (durationSeconds: number) => {
        try {
            console.log('Saving session:', { company: voiceContext.company, role: voiceContext.role, duration: durationSeconds });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Clerk-User-Id': user?.id ?? ''
                },
                body: JSON.stringify({
                    company: voiceContext.company,
                    role: voiceContext.role,
                    duration: durationSeconds
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to save session: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Session saved:', result);
            showToast('Interview session saved successfully!', 'success');
            fetchHistory();
        } catch (error) {
            console.error('Error saving session:', error);
            showToast('Failed to save interview. Check database setup.', 'error');
        }

        setIsVoiceActive(false);
    };

    const handleViewReport = async (sessionId: string | number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews/sessions/${sessionId}/report`, {
                headers: { 'X-Clerk-User-Id': user?.id ?? '' }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch report: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Report data:', data);
            setReportData(data);
            setSelectedSession(sessionId);
        } catch (error) {
            console.error('Error fetching report:', error);
            showToast('Failed to load report', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDeleteSession = async (sessionId: string | number) => {
        if (!confirm('Delete this interview session?')) return;

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/interviews/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'X-Clerk-User-Id': user?.id ?? '' }
            });
            fetchHistory();
            if (selectedSession === sessionId) {
                setSelectedSession(null);
                setReportData(null);
            }
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 relative">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 right-4 z-50"
                    >
                        <div className={`px-6 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white font-medium flex items-center gap-2`}>
                            {toast.type === 'success' ? '✓' : '✗'} {toast.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/opec/dashboard" className="text-slate-600 hover:text-slate-900">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Mock Interview</h1>
                            <p className="text-sm text -slate-600">AI-powered placement preparation</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                        <History className="w-4 h-4" />
                        {showHistory ? 'Hide' : 'Show'} History
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 flex gap-6">
                {/* Main Content */}
                <div className="flex-1">
                    {selectedSession && reportData ? (
                        /* Report View */
                        <div className="bg-white rounded-2xl p-8">
                            <button
                                onClick={() => { setSelectedSession(null); setReportData(null); }}
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Interviews
                            </button>

                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">{reportData.session?.role}</h2>
                                <p className="text-slate-600">{reportData.session?.company}</p>
                            </div>

                            {reportData.report ? (
                                <>
                                    {/* Score Cards */}
                                    <div className="grid grid-cols-4 gap-4 mb-8">
                                        {[
                                            { label: 'Overall', score: reportData.report.overall_score, icon: Award, color: 'indigo' },
                                            { label: 'Communication', score: reportData.report.communication_score, icon: TrendingUp, color: 'blue' },
                                            { label: 'Technical', score: reportData.report.technical_score, icon: Target, color: 'purple' },
                                            { label: 'Confidence', score: reportData.report.confidence_score, icon: Lightbulb, color: 'emerald' }
                                        ].map(({ label, score, icon: Icon, color }) => (
                                            <div key={label} className={`bg-${color}-50 p-6 rounded-xl border border-${color}-100`}>
                                                <Icon className={`w-6 h-6 text-${color}-600 mb-2`} />
                                                <div className={`text-4xl font-bold text-${color}-600 mb-1`}>{score}</div>
                                                <div className="text-sm text-slate-600">{label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Strengths */}
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-slate-900 mb-4">✅ Strengths</h3>
                                        <ul className="space-y-2">
                                            {reportData.report.strengths?.map((strength, i) => (
                                                <li key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                                    <span className="text-green-600 font-bold">•</span>
                                                    <span className="text-slate-700">{strength}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Weaknesses */}
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-slate-900 mb-4">🎯 Areas to Improve</h3>
                                        <ul className="space-y-2">
                                            {reportData.report.weaknesses?.map((weakness, i) => (
                                                <li key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                                    <span className="text-amber-600 font-bold">•</span>
                                                    <span className="text-slate-700">{weakness}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Insights */}
                                    <div className="bg-indigo-50 p-6 rounded-xl mb-8 border border-indigo-100">
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">💡 Key Insights</h3>
                                        <p className="text-slate-700 leading-relaxed">{reportData.report.key_insights}</p>
                                    </div>

                                    {/* Recommendations */}
                                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">🚀 Next Steps</h3>
                                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{reportData.report.recommendations}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    Report is being generated. Check back in a moment!
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Landing View */
                        <div className="bg-white rounded-2xl p-12 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Mic className="w-12 h-12 text-white" />
                            </div>

                            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                Ready for Your Interview?
                            </h2>
                            <p className="text-slate-600 mb-8 max-w-md mx-auto">
                                Practice with our AI interviewer. Get real-time conversation and detailed feedback after each session.
                            </p>

                            <button
                                onClick={() => setIsSetupOpen(true)}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-indigo-500/30 transition"
                            >
                                Start New Interview
                            </button>

                            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                                <div>
                                    <div className="text-3xl font-bold text-indigo-600">{sessions.length}</div>
                                    <div className="text-sm text-slate-600">Interviews Done</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-indigo-600">
                                        {Math.floor(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60) || 0}
                                    </div>
                                    <div className="text-sm text-slate-600">Minutes Practiced</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-indigo-600">AI</div>
                                    <div className="text-sm text-slate-600">Powered Analysis</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* History Sidebar */}
                {showHistory && (
                    <div className="w-80 bg-white rounded-2xl p-6 h-fit max-h-[800px] overflow-y-auto shadow-lg">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-600" />
                            Interview History
                        </h3>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <div className="text-red-500 text-sm mb-2">❌ {error}</div>
                                <button
                                    onClick={fetchHistory}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 underline"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Mic className="w-8 h-8 text-indigo-400" />
                                </div>
                                <p className="text-slate-500 text-sm">
                                    No interviews yet.<br />Start your first one!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="group p-4 bg-slate-50 hover:bg-indigo-50 rounded-xl cursor-pointer transition border border-transparent hover:border-indigo-200 relative"
                                        onClick={() => handleViewReport(session.id)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="font-semibold text-slate-900 text-sm mb-1">
                                                    {session.role}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                                    <Building2 className="w-3 h-3" />
                                                    {session.company}
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteSession(session.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {Math.floor((session.duration_seconds || 0) / 60)}m
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(session.session_date), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <InterviewSetupModal
                isOpen={isSetupOpen}
                onClose={() => setIsSetupOpen(false)}
                onStart={handleStartInterview}
                onBrowseJobs={() => {/* TODO: Implement job browsing */ }}
            />

            <VoiceMode
                isOpen={isVoiceActive}
                onClose={() => setIsVoiceActive(false)}
                userData={user}
                initialContext={voiceContext}
                onSessionEnd={handleInterviewEnd}
            />
        </div>
    );
}
