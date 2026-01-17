import React, { useEffect, useState } from 'react';
import { useConversation } from '@11labs/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { X, PhoneOff, Mic, AlertCircle } from 'lucide-react';

interface VoiceModeProps {
    isOpen: boolean;
    onClose: () => void;
    userData?: any;
}

export const VoiceMode: React.FC<VoiceModeProps> = ({ isOpen, onClose, userData }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [connectionId, setConnectionId] = useState<string | null>(null);

    const {
        status,
        isSpeaking,
        startSession,
        endSession,
    } = useConversation({
        onConnect: () => {
            console.log('Connected to ElevenLabs Agent');
            setError(null);
        },
        onDisconnect: () => {
            console.log('Disconnected from ElevenLabs Agent');
            setConnectionId(null);
        },
        onError: (err: any) => {
            console.error('ElevenLabs Error:', err);
            setError(err?.message || 'Connection failed. Please try again.');
        },
        onMessage: (message: any) => {
            console.log('Agent message:', message);
        },
    });

    // Request microphone permissions
    useEffect(() => {
        if (isOpen) {
            setError(null);
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => setHasPermission(true))
                .catch((err) => {
                    console.error("Microphone permission denied:", err);
                    setHasPermission(false);
                    setError("Microphone access denied. Please allow microphone access to use Voice Agent.");
                });
        }
    }, [isOpen]);

    // Auto-start session when ready
    useEffect(() => {
        const connectToAgent = async () => {
            if (isOpen && hasPermission && status === 'disconnected' && !error) {
                const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
                console.log('Environment check - VITE_ELEVENLABS_AGENT_ID:', agentId);

                if (!agentId || agentId === 'undefined') {
                    setError("Voice Agent not configured. Add VITE_ELEVENLABS_AGENT_ID to .env and restart the server.");
                    return;
                }

                try {
                    console.log('Starting ElevenLabs session with agentId:', agentId);

                    // Prepare dynamic context matching ElevenLabs variables
                    const conversationConfig = {
                        agentId,
                        dynamicVariables: {
                            userName: userData?.name || "Student",
                            userInterests: userData?.interests || "general career exploration",
                            educationLevel: userData?.education_level || "unknown",
                            grade: userData?.grade_or_year || "unknown",
                            stream: userData?.stream_or_branch || "unknown",
                            careerGoals: userData?.goals || "undecided",
                            recent_mood: userData?.recent_mood || "neutral",
                        }
                    };

                    console.log('Injecting context:', conversationConfig);

                    // The SDK startSession accepts options object
                    await startSession(conversationConfig as any);

                    console.log('Session start initiated');

                } catch (err: any) {
                    console.error('Failed to start session:', err);
                    setError(err?.message || 'Failed to connect to Voice Agent. Please try again.');
                }
            }
        };

        connectToAgent();
    }, [isOpen, hasPermission, status, startSession, error, userData]);

    // Cleanup on close
    useEffect(() => {
        if (!isOpen && status === 'connected') {
            endSession();
        }
    }, [isOpen, status, endSession]);

    const handleRetry = () => {
        setError(null);
        setHasPermission(false);
        // Re-trigger permission request
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => setHasPermission(true))
            .catch(() => setError("Microphone access denied."));
    };

    const visualizerVariants: Variants = {
        idle: {
            scale: [1, 1.08, 1],
            opacity: 0.6,
            transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
        },
        listening: {
            scale: [1, 1.15, 1],
            opacity: 0.9,
            transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
        },
        speaking: {
            scale: [1, 1.3, 0.95, 1.25, 1],
            opacity: 1,
            transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
        }
    };

    const getVisualState = () => {
        if (status !== 'connected') return 'idle';
        if (isSpeaking) return 'speaking';
        return 'listening';
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-6"
            >
                {/* Header with Logo */}
                <div className="absolute top-6 left-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-xl tracking-tight">Voice Agent</h1>
                        <p className="text-white/50 text-xs text-emerald-200/70">Powered by OPEC AI</p>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-105"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Error State */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 max-w-md text-center backdrop-blur-md"
                    >
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <p className="text-white font-medium mb-2">Connection Error</p>
                        <p className="text-white/60 text-sm mb-4">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-all"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* Main Visualizer Area - Only show when no error */}
                {!error && (
                    <>
                        <div className="relative w-80 h-80 flex items-center justify-center">
                            {/* Outer Glow Rings */}
                            <motion.div
                                className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 blur-3xl"
                                animate={getVisualState()}
                                variants={visualizerVariants}
                            />
                            <motion.div
                                className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-white/10 to-emerald-400/20 blur-2xl"
                                animate={getVisualState()}
                                variants={visualizerVariants}
                            />

                            {/* Inner Core - ChatGPT Style Bright Circle */}
                            <motion.div
                                className="w-40 h-40 rounded-full bg-gradient-to-br from-white via-emerald-100 to-cyan-100 shadow-[0_0_80px_rgba(52,211,153,0.5)] flex items-center justify-center z-10"
                                animate={getVisualState()}
                                variants={visualizerVariants}
                            >
                                {status === 'connected' ? (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-white to-emerald-50 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent animate-shimmer" />
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 animate-pulse shadow-inner" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                )}
                            </motion.div>
                        </div>

                        {/* Status Text */}
                        <motion.div
                            className="mt-8 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <p className="text-white text-3xl font-bold tracking-tight drop-shadow-lg">
                                {status === 'connected'
                                    ? (isSpeaking ? "Speaking..." : "Listening...")
                                    : "Connecting..."}
                            </p>
                            <p className="text-white/60 text-base mt-3 font-medium">
                                {status === 'connected'
                                    ? `Hey ${userData?.name || "there"}! Let's talk about your future.`
                                    : "Establishing secure voice channel..."}
                            </p>
                        </motion.div>

                        {/* Hint Text */}
                        {status === 'connected' && !isSpeaking && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 1.5 } }}
                                className="absolute top-32 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                            >
                                <p className="text-emerald-200/90 text-sm font-medium">
                                    💡 Try: "Review my career plan" or "What jobs suit me?"
                                </p>
                            </motion.div>
                        )}
                    </>
                )}

                {/* Controls Bar */}
                <div className="absolute bottom-16 flex items-center gap-8">
                    <button
                        onClick={() => {
                            if (status === 'connected') endSession();
                            onClose();
                        }}
                        className="flex flex-col items-center gap-3 group"
                    >
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all flex items-center justify-center shadow-xl shadow-red-500/30 group-hover:scale-105 group-hover:shadow-red-500/50 border-4 border-red-400/20">
                            <PhoneOff className="w-9 h-9 text-white" />
                        </div>
                        <span className="text-white/70 font-medium text-sm group-hover:text-white transition-colors">End Session</span>
                    </button>
                </div>

                {/* Bottom Attribution */}
                <div className="absolute bottom-4 text-white/20 text-xs font-mono">
                    SESSION ID: {connectionId || "INIT..."}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
