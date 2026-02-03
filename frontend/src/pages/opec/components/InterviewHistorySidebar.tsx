import { motion } from 'framer-motion';
import {
    History, Trash2, ChevronRight, Building2,
    Briefcase, Clock, Trophy, X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface InterviewSession {
    id: string;
    company: string;
    role: string;
    duration_seconds: number;
    session_date?: string;
    created_at?: string;
}

interface InterviewHistorySidebarProps {
    sessions: InterviewSession[];
    onSelectSession: (sessionId: string | number) => void;
    onDeleteSession: (sessionId: string | number) => void;
    onClose?: () => void;
}

export const InterviewHistorySidebar = ({
    sessions,
    onSelectSession,
    onDeleteSession,
    onClose
}: InterviewHistorySidebarProps) => {
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimeAgo = (dateString?: string) => {
        if (!dateString) return 'Recently';
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return 'Recently';
        }
    };

    return (
        <div className="w-80 h-[80vh] bg-[#1a1b1e] rounded-2xl border border-[#2a2b32] shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2a2b32]">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                        <History className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Interview History</h3>
                        <p className="text-xs text-gray-500">{sessions.length} sessions</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2b32] rounded-lg transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <div className="p-4 rounded-full bg-[#2a2b32] mb-4">
                            <Briefcase className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-400 font-medium">No interviews yet</p>
                        <p className="text-gray-500 text-sm mt-1">
                            Complete a mock interview to see your history
                        </p>
                    </div>
                ) : (
                    sessions.map((session, index) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group p-4 bg-[#2a2b32] hover:bg-[#3a3b42] rounded-xl cursor-pointer transition-all border border-transparent hover:border-[#4a4b52]"
                            onClick={() => onSelectSession(session.id)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    {/* Company & Role */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                        <span className="font-medium text-white truncate">
                                            {session.company}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Briefcase className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-300 truncate">
                                            {session.role}
                                        </span>
                                    </div>

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDuration(session.duration_seconds)}
                                        </span>
                                        <span>•</span>
                                        <span>{getTimeAgo(session.session_date || session.created_at)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteSession(session.id);
                                        }}
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Footer */}
            {sessions.length > 0 && (
                <div className="p-4 border-t border-[#2a2b32]">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Trophy className="w-4 h-4" />
                        <span>Click any session to view detailed report</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewHistorySidebar;
