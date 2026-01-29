import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { User as UserIcon, Sparkles, RefreshCw, Volume2, Square, ChevronDown, ChevronUp, Eye, Brain, BarChart3 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import type { Message } from "../types";

interface MessageBubbleProps {
    msg: Message;
    index: number;
    onRetry: (index: number) => void;
    formatTimestamp: (timestamp: number) => string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ msg, index, onRetry, formatTimestamp }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);

    const hasThinking = msg.thinking && (msg.thinking.observation || msg.thinking.pattern || msg.thinking.evaluation);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isSpeaking]);

    const toggleSpeech = () => {
        if (!('speechSynthesis' in window)) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            window.speechSynthesis.cancel(); // Stop any other speech
            const utterance = new SpeechSynthesisUtterance(msg.content);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3 items-start`}>
                {/* Avatar - Hidden for AI (Claude style) or minimal */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                    ? 'bg-slate-200' // User avatar background (neutral)
                    : 'hidden' // Hide AI avatar completely
                    }`} aria-hidden="true">
                    {msg.role === 'user' ? <UserIcon className="w-5 h-5 text-slate-600" /> : null}
                </div>

                {/* Message Content */}
                <div className="flex flex-col gap-2 flex-1">

                    {/* Thinking Section - ChatGPT Style */}
                    {msg.role === 'assistant' && hasThinking && (
                        <div className="mb-2">
                            <button
                                onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                                className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors group"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span className="font-medium">Thought for a moment</span>
                                {isThinkingExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                ) : (
                                    <ChevronDown className="w-3 h-3" />
                                )}
                            </button>

                            <AnimatePresence>
                                {isThinkingExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden mt-2"
                                    >
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-3">
                                            {/* Observation */}
                                            {msg.thinking?.observation && (
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 mb-1">
                                                        <Eye className="w-3 h-3" />
                                                        <span>Observation</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                        {msg.thinking.observation}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Pattern */}
                                            {msg.thinking?.pattern && (
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 mb-1">
                                                        <Brain className="w-3 h-3" />
                                                        <span>Pattern Analysis</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                        {msg.thinking.pattern}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Evaluation */}
                                            {msg.thinking?.evaluation && (
                                                <div>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 mb-1">
                                                        <BarChart3 className="w-3 h-3" />
                                                        <span>Evaluation</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                        {msg.thinking.evaluation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    <div className={`py-2 px-1 rounded-2xl ${msg.role === 'user'
                        ? 'bg-indigo-50 text-slate-800 p-4 shadow-sm border border-indigo-100'
                        : 'bg-transparent text-slate-800' // No background, no shadow for AI
                        } ${msg.status === 'error' ? 'border-2 border-red-500' : ''}`}>
                        {/* Render as markdown for AI, plain text for user */}
                        {msg.role === 'assistant' ? (
                            <div className="prose prose-slate max-w-none leading-relaxed text-[16px] font-serif
                                prose-headings:font-serif prose-headings:font-semibold
                                prose-p:my-2 prose-p:leading-relaxed
                                prose-strong:font-bold prose-strong:text-slate-900
                                prose-ul:my-2 prose-ul:list-disc prose-ul:pl-6
                                prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-6
                                prose-li:my-1
                                prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm">
                                <ReactMarkdown>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap leading-relaxed text-[16px]">{msg.content}</p>
                        )}

                        {/* Footer: Timestamp & Status */}
                        <div className={`flex items-center gap-2 mt-2 ${msg.role === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">{formatTimestamp(msg.timestamp)}</span>
                            {msg.status === 'sending' && (
                                <span className="text-xs opacity-80">Sending...</span>
                            )}
                            {msg.status === 'error' && msg.role === 'user' && (
                                <button
                                    onClick={() => onRetry(index)}
                                    className="text-xs flex items-center gap-1 hover:underline text-red-500 font-medium"
                                    aria-label="Retry sending message"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    Retry
                                </button>
                            )}

                            {/* Text-to-Speech Button (AI only) */}
                            {msg.role === 'assistant' && (
                                <button
                                    onClick={toggleSpeech}
                                    className={`ml-2 transition-colors ${isSpeaking ? 'text-indigo-600 animate-pulse' : 'text-slate-300 hover:text-indigo-600'}`}
                                    title={isSpeaking ? "Stop Reading" : "Read Aloud"}
                                >
                                    {isSpeaking ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3 h-3" />}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Detected Signals (Assistant Only) */}
                    {msg.role === 'assistant' && msg.signals && Object.keys(msg.signals).length > 0 && (
                        <div className="flex flex-wrap gap-2 ml-2">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Sparkles className="w-3 h-3" />
                                <span className="font-medium">Detected:</span>
                            </div>
                            {Object.entries(msg.signals).slice(0, 3).map(([signal]) => (
                                <span
                                    key={signal}
                                    className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100"
                                >
                                    {signal.replace(/_/g, ' ')}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

MessageBubble.displayName = 'MessageBubble';

