import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { VoiceMode } from './components/VoiceMode';
import { VoiceMode3D } from './components/VoiceMode3D';
import { InterviewSetupModal, type InterviewerAvatar, INTERVIEWER_AVATARS } from './components/InterviewSetupModal';
import { InterviewReportModal } from './components/InterviewReportModal';
import {
    Clock, Calendar, ChevronRight, Play, BarChart2,
    CheckCircle, MessageSquare, AlertCircle, Trash2, Video, Mic,
    History, ArrowLeft, Building2, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface VoiceContext {
    interviewMode?: boolean;
    company?: string;
    role?: string;
}

type InterviewMode = 'voice' | '3d-avatar';

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
    problem_solving_score?: number;
    cultural_fit_score?: number;
    strengths?: string[];
    weaknesses?: string[];
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

interface ReportData {
    session?: SessionData;
    report?: Report;
}

export function MockInterview() {
    const { user } = useUser();
    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [is3DActive, setIs3DActive] = useState(false);
    const [voiceContext, setVoiceContext] = useState<VoiceContext>({});
    const [currentMode, setCurrentMode] = useState<InterviewMode>('voice');
    const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerAvatar | undefined>(undefined);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<string | number | null>(null);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/interviews/sessions`, {
                headers: { 'X-Clerk-User-Id': user?.id ?? '' }
            });

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            console.log('Fetched sessions:', data);
            setSessions(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartInterview = (company: string, role: string, mode: InterviewMode, interviewer?: InterviewerAvatar) => {
        setVoiceContext({ interviewMode: true, company, role });
        setCurrentMode(mode);
        setSelectedInterviewer(interviewer);
        setIsSetupOpen(false);

        if (mode === '3d-avatar') {
            setIs3DActive(true);
        } else {
            setIsVoiceActive(true);
        }
    };

    const handleInterviewEnd = async (durationSeconds: number) => {
        console.log('Interview ended with duration:', durationSeconds);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/interviews/sessions`, {
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

            if (!response.ok) throw new Error('Failed to save session');

            const result = await response.json();
            console.log('Session saved:', result);

            // Auto-open report after interview
            if (result.session_id) {
                await handleViewReport(result.session_id);
            }

            fetchHistory();
        } catch (error) {
            console.error('Error saving session:', error);
        }

        setIsVoiceActive(false);
    };

    const handleViewReport = async (sessionId: string | number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/interviews/sessions/${sessionId}/report`, {
                headers: { 'X-Clerk-User-Id': user?.id ?? '' }
            });

            if (!response.ok) throw new Error('Failed to fetch report');

            const data = await response.json();
            console.log('Report data:', data);
            setReportData(data);
            setSelectedSession(sessionId);
            setIsReportModalOpen(true);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSession = async (sessionId: string | number) => {
        if (!confirm('Delete this interview session?')) return;

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/interviews/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'X-Clerk-User-Id': user?.id ?? '' }
            });

            setSessions(sessions.filter(s => s.id !== sessionId));
            if (selectedSession === sessionId) {
                setSelectedSession(null);
                setReportData(null);
            }
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const totalMinutes = Math.floor(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60);

    return (
        <div className="min-h-screen bg-[#faf9f7]">
            {/* Minimal Header */}
            <header className="sticky top-0 z-40 bg-[#faf9f7]/80 backdrop-blur-lg border-b border-stone-200/60">
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/opec/dashboard"
                            className="p-2 -ml-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <Mic className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-stone-900">Mock Interview</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsSetupOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-sm font-medium transition-colors"
                    >
                        <Play className="w-4 h-4" />
                        New Interview
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <div className="inline-block relative group cursor-pointer" onClick={() => setIsSetupOpen(true)}>
                        <div className="absolute inset-0 bg-stone-900/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-stone-800 to-stone-900 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300 ring-4 ring-white">
                            <Mic className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Play className="w-4 h-4 text-white ml-0.5" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-semibold text-stone-900 mt-6 mb-2">
                        Ready to practice?
                    </h1>
                    <p className="text-stone-500 text-lg max-w-md mx-auto">
                        Click the microphone to start a realistic AI mock interview
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-4 mb-10"
                >
                    <div className="bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm">
                        <div className="text-3xl font-semibold text-stone-900 mb-1">{sessions.length}</div>
                        <div className="text-sm text-stone-500">Interviews Completed</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm">
                        <div className="text-3xl font-semibold text-stone-900 mb-1">{totalMinutes}</div>
                        <div className="text-sm text-stone-500">Minutes Practiced</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200/60">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <span className="text-lg font-semibold text-amber-700">AI Coach</span>
                        </div>
                        <div className="text-sm text-amber-600">Real-time feedback</div>
                    </div>
                </motion.div>

                {/* Quick Start */}
                {sessions.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-8 border border-stone-200/60 shadow-sm text-center mb-10"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <Mic className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-stone-900 mb-2">Start your first interview</h2>
                        <p className="text-stone-500 mb-6 max-w-md mx-auto">
                            Choose a company and role to practice. Our AI interviewer will guide you through realistic questions.
                        </p>
                        <button
                            onClick={() => setIsSetupOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full font-medium transition-colors"
                        >
                            <Play className="w-5 h-5" />
                            Start Interview
                        </button>
                    </motion.div>
                )}

                {/* Interview History */}
                {sessions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <History className="w-5 h-5 text-stone-400" />
                            <h2 className="text-lg font-semibold text-stone-900">Recent Sessions</h2>
                        </div>

                        <div className="space-y-3">
                            {isLoading && sessions.length === 0 ? (
                                <div className="bg-white rounded-xl p-8 text-center border border-stone-200/60">
                                    <div className="animate-spin w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full mx-auto" />
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {sessions.map((session, index) => (
                                        <motion.div
                                            key={session.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleViewReport(session.id)}
                                            className="group bg-white rounded-xl p-4 border border-stone-200/60 hover:border-stone-300 hover:shadow-md cursor-pointer transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-stone-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-stone-900">{session.company}</div>
                                                        <div className="text-sm text-stone-500">{session.role}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1 text-sm text-stone-600">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {formatDuration(session.duration_seconds)}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-stone-400">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDistanceToNow(new Date(session.session_date), { addSuffix: true })}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSession(session.id);
                                                        }}
                                                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>

                                                    <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500 transition-colors" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Modals */}
            <InterviewSetupModal
                isOpen={isSetupOpen}
                onClose={() => setIsSetupOpen(false)}
                onStart={handleStartInterview}
                onBrowseJobs={() => { }}
            />

            <VoiceMode
                isOpen={isVoiceActive}
                onClose={() => setIsVoiceActive(false)}
                userData={user}
                initialContext={voiceContext}
                onSessionEnd={handleInterviewEnd}
            />

            <VoiceMode3D
                isOpen={is3DActive}
                onClose={() => setIs3DActive(false)}
                userData={user}
                company={voiceContext.company || ''}
                role={voiceContext.role || ''}
                interviewer={selectedInterviewer}
                onSessionEnd={handleInterviewEnd}
            />

            {/* Interview Report Modal */}
            <InterviewReportModal
                isOpen={isReportModalOpen}
                onClose={() => {
                    setIsReportModalOpen(false);
                    setSelectedSession(null);
                    setReportData(null);
                }}
                report={reportData?.report ? {
                    ...reportData.report,
                    strengths: reportData.report.strengths || [],
                    weaknesses: reportData.report.weaknesses || []
                } : null}
                session={{
                    company: reportData?.session?.company || voiceContext.company || '',
                    role: reportData?.session?.role || voiceContext.role || '',
                    duration_seconds: reportData?.session?.duration_seconds ||
                        sessions.find(s => s.id === selectedSession)?.duration_seconds || 0
                }}
            />
        </div>
    );
}
