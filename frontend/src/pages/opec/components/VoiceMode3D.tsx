import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PhoneOff, Video, AlertCircle, Loader2 } from 'lucide-react';
import type { InterviewerAvatar } from './InterviewSetupModal';

interface VoiceMode3DProps {
    isOpen: boolean;
    onClose: () => void;
    userData?: any;
    company: string;
    role: string;
    resumeContext?: string;
    interviewer?: InterviewerAvatar;
    onSessionEnd?: (durationSeconds: number) => void;
}

interface ConversationState {
    conversationUrl: string | null;
    status: 'idle' | 'connecting' | 'active' | 'ended' | 'error';
    error: string | null;
}

export const VoiceMode3D: React.FC<VoiceMode3DProps> = ({
    isOpen,
    onClose,
    company,
    role,
    resumeContext = '',
    interviewer,
    onSessionEnd
}) => {
    const [conversation, setConversation] = useState<ConversationState>({
        conversationUrl: null,
        status: 'idle',
        error: null
    });
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    // Create Tavus conversation when modal opens
    React.useEffect(() => {
        if (isOpen && conversation.status === 'idle') {
            createConversation();
        }
    }, [isOpen]);

    const createConversation = async () => {
        setConversation(prev => ({ ...prev, status: 'connecting', error: null }));

        try {
            // Determine configuration based on interviewer (or default to Mark/Male)
            let replicaId = import.meta.env.VITE_TAVUS_REPLICA_ID || "rfe12d8b9597"; // Default (Mark)
            let context = `You are a PROFESSIONAL JOB INTERVIEWER instructions...`;
            let greeting = `Hello! I'm the interviewer for the ${role} position here at ${company}. Let's begin.`;

            if (interviewer?.id === 'sarah') {
                // High-quality Female Persona (Sarah/Jane Smith style)
                replicaId = "r9d30b0e55ac"; // Specific female replica ID

                context = `You are Sarah, a seasoned Principal Interviewer at ${company} with multiple years of experience. You're conducting a first-round interview for the ${role} position. You are professional yet approachable, aiming to assess both communication skills and fit.

Your job is to assess the candidate through a structured but conversational interview about their experience and fit for the ${role} role at ${company}.

Structure the conversation like a real human interviewer would:
1. Begin with a friendly introduction about yourself.
2. Ask background questions to learn about the candidate.
3. Ask specific behavioral and technical questions relevant to ${role}.
4. Respond thoughtfully to the candidate's answers.
5. End with time for the candidate to ask questions.

Your responses will be spoken aloud, so:
- Speak naturally as an experienced interviewer would.
- Avoid any formatting, bullet points, or stage directions.
- Use a conversational tone with appropriate pauses.
- Never refer to yourself as an AI, assistant, or language model.

Pay attention to the flow of the interview. This interview should be supportive but professional, helping the candidate showcase their potential.

${resumeContext ? `Candidate background: ${resumeContext}` : ''}`;

                greeting = `Hello, I'm Sarah, a Principal here at ${company}. Thanks for joining me today. I'm looking forward to learning more about you and discussing the ${role} position. To start, could you walk me through your background and what interests you about this opportunity?`;
            } else {
                // Default Mark/Professional context
                context = `You are a PROFESSIONAL JOB INTERVIEWER conducting a mock interview. Your role is to act as a senior hiring manager at ${company} interviewing candidates for the ${role} position. You are NOT a sales person or customer service representative.

Your behavior:
- Be professional but friendly
- Ask one question at a time
- Start with behavioral questions, then move to technical questions
- Provide brief feedback after answers
- Keep the interview focused and on-topic
${resumeContext ? `\nCandidate background: ${resumeContext}` : ''}

Remember: You are conducting a JOB INTERVIEW, not making a sales pitch.`;
                greeting = `Hello! I'm the interviewer for the ${role} position here at ${company}. Thank you for taking the time to speak with me today. Let's start with an easy one - can you briefly introduce yourself and tell me what drew you to this role?`;
            }

            // Call Tavus API directly
            const response = await fetch("https://tavusapi.com/v2/conversations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": import.meta.env.VITE_TAVUS_API_KEY || "",
                },
                body: JSON.stringify({
                    replica_id: replicaId,
                    conversation_name: `Interview: ${role} at ${company} (${interviewer?.name || 'Default'})`,
                    conversational_context: context,
                    custom_greeting: greeting,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API Error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.conversation_url) {
                throw new Error('No conversation URL received from Tavus');
            }

            setConversation({
                conversationUrl: data.conversation_url,
                status: 'active',
                error: null
            });
            setSessionStartTime(Date.now());

        } catch (error: any) {
            console.error('Failed to create Tavus conversation:', error);
            setConversation(prev => ({
                ...prev,
                status: 'error',
                error: error.message || 'Failed to start 3D interview. Check your Tavus API key in .env'
            }));
        }
    };

    const handleLeave = useCallback(() => {
        if (sessionStartTime && onSessionEnd) {
            const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
            onSessionEnd(durationSeconds);
        }

        setConversation({
            conversationUrl: null,
            status: 'idle',
            error: null
        });
        setSessionStartTime(null);
        setIframeLoaded(false);
        onClose();
    }, [sessionStartTime, onSessionEnd, onClose]);

    const handleRetry = () => {
        setConversation({
            conversationUrl: null,
            status: 'idle',
            error: null
        });
        setIframeLoaded(false);
        createConversation();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-slate-900 flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg text-2xl ${interviewer?.gender === 'female'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/30'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-500/30'
                            }`}>
                            {interviewer?.emoji || <Video className="w-5 h-5 text-white" />}
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-xl tracking-tight">
                                {interviewer ? `Interview with ${interviewer.name}` : '3D Interview'}
                            </h1>
                            <p className="text-slate-400 text-sm">{role} at {company}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLeave}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-105"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Main Content Area - Fullscreen when active */}
                <div className={`flex-1 flex items-center justify-center overflow-hidden ${conversation.status === 'active' ? '' : 'p-6'}`}>
                    {/* Connecting State */}
                    {conversation.status === 'connecting' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Preparing Your Interviewer</h2>
                            <p className="text-slate-400">Setting up 3D avatar for {role} interview...</p>
                        </motion.div>
                    )}

                    {/* Error State */}
                    {conversation.status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/20 border border-red-500/30 rounded-2xl p-8 max-w-md text-center backdrop-blur-md"
                        >
                            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <h2 className="text-white font-bold text-xl mb-2">Connection Error</h2>
                            <p className="text-white/60 text-sm mb-6">{conversation.error}</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleRetry}
                                    className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-all"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Active Conversation - Tavus Embed via iframe - FULLSCREEN */}
                    {conversation.status === 'active' && conversation.conversationUrl && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black"
                        >
                            {!iframeLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                                    <div className="text-center">
                                        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                                        <p className="text-slate-400">Loading 3D interviewer...</p>
                                    </div>
                                </div>
                            )}
                            <iframe
                                src={conversation.conversationUrl}
                                className="w-full h-full border-0"
                                style={{ minHeight: '100vh' }}
                                allow="camera; microphone; display-capture; autoplay; fullscreen"
                                onLoad={() => setIframeLoaded(true)}
                            />
                            {/* Floating End Call Button */}
                            <button
                                onClick={handleLeave}
                                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-6 py-3 bg-red-500/90 hover:bg-red-600 backdrop-blur-md rounded-full text-white font-medium transition-all shadow-2xl shadow-red-500/30 hover:scale-105"
                            >
                                <PhoneOff className="w-5 h-5" />
                                End Interview
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Controls Bar - Only show when NOT active (loading/error states) */}
                {conversation.status !== 'idle' && conversation.status !== 'active' && (
                    <div className="flex items-center justify-center gap-6 py-6 border-t border-slate-700">
                        <button
                            onClick={handleLeave}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all flex items-center justify-center shadow-xl shadow-red-500/30 group-hover:scale-105">
                                <PhoneOff className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-white/70 font-medium text-sm">Cancel</span>
                        </button>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};
