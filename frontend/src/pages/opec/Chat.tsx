import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from "@clerk/clerk-react";
import { Button } from "../../components/ui";
import { Brain, Smile, Meh, Frown, AlertCircle, PanelRightOpen, ArrowRight, Minimize2, Maximize2, FileText, Trash2, Download, Activity, Mic, Square, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./components/MessageBubble";
import { InsightsSidebar } from "./components/InsightsSidebar";
import { CommandPalette, type CommandAction } from "./components/CommandPalette";
import { VoiceMode } from "./components/VoiceMode";

import type { Message, ToastMessage } from "./types";

export const Chat = () => {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [clarityScore, setClarityScore] = useState(0);
    const [currentMood, setCurrentMood] = useState<'happy' | 'neutral' | 'sad' | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);
    const [detectedPatterns, setDetectedPatterns] = useState<string[]>([]);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [isOnline, setIsOnline] = useState(true);
    const [isZenMode, setIsZenMode] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // --- Voice Logic ---
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(prev => prev ? prev + " " + transcript : transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                showToast("Voice input failed. Please try again.", "error");
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    // --- Command Palette Logic ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- Layout & Resizing Logic ---
    const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - mouseMoveEvent.clientX;
            if (newWidth > 250 && newWidth < 600) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    // --- Toast Logic ---
    const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    // --- Scroll Logic ---
    const scrollToBottom = (smooth = true) => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: smooth ? "smooth" : "auto",
                block: "end"
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages.length, loading]);

    // --- Actions ---
    const clearConversation = () => {
        if (confirm('Clear conversation history?')) {
            setMessages([{
                role: 'assistant',
                content: "Let's start fresh. What's on your mind?",
                signals: {},
                timestamp: Date.now(),
                status: 'sent'
            }]);
            setClarityScore(0);
            setDetectedPatterns([]);
            localStorage.clear();
            showToast('Conversation cleared', 'info');
        }
    };

    const exportConversation = () => {
        const transcript = messages.map(m =>
            `[${new Date(m.timestamp).toLocaleString()}] ${m.role.toUpperCase()}: ${m.content}`
        ).join('\n\n');

        const blob = new Blob([transcript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `opec-conversation-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const generateReport = async () => {
        setGeneratingReport(true);
        showToast("Generating comprehensive session report... tailored for you.", "info");
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await fetch(`${API_URL}/api/opec/chat/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clerk_id: user?.id })
            });

            if (res.ok) {
                const data = await res.json();
                const reportMsg: Message = {
                    role: 'assistant',
                    content: data.report || "# Session Report\n\nNo report generated.",
                    timestamp: Date.now(),
                    status: 'sent',
                    signals: { "Analysis": 1.0 }
                };
                setMessages(prev => [...prev, reportMsg]);
                showToast("Report generated successfully!", "success");
            } else {
                showToast("Failed to generate report.", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Network error generating report.", "error");
        } finally {
            setGeneratingReport(false);
        }
    };

    const powerUserActions: CommandAction[] = [
        {
            id: 'toggle-zen',
            label: isZenMode ? 'Exit Zen Mode' : 'Enter Zen Mode',
            icon: isZenMode ? Minimize2 : Maximize2,
            shortcut: '⌘+K / Toggle',
            action: () => setIsZenMode(prev => !prev)
        },
        {
            id: 'generate-report',
            label: 'Generate Session Report',
            icon: FileText,
            action: generateReport
        },
        {
            id: 'clear-chat',
            label: 'Clear Conversation History',
            icon: Trash2,
            action: clearConversation
        },
        {
            id: 'export-chat',
            label: 'Export Conversation',
            icon: Download,
            action: exportConversation
        },
        {
            id: 'toggle-sidebar',
            label: isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar',
            icon: Activity,
            action: () => setIsSidebarOpen(prev => !prev)
        }
    ];

    const [studentProfile, setStudentProfile] = useState<any>(null);

    // --- Data Loading & Smart Context ---
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.id) return;

            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

            try {
                // Fetch Profile and History in parallel
                const [historyRes, profileRes] = await Promise.all([
                    fetch(`${API_URL}/api/opec/chat/history?clerk_id=${user.id}`),
                    fetch(`${API_URL}/api/opec/student/profile?clerk_id=${user.id}`)
                ]);

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setStudentProfile(profileData);
                }

                if (historyRes.ok) {
                    const data = await historyRes.json();
                    if (data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                        setClarityScore(Math.min(data.messages.length * 5, 100));

                        const patterns = new Set<string>();
                        data.messages.forEach((m: Message) => {
                            if (m.signals) Object.keys(m.signals).forEach(s => patterns.add(s));
                        });
                        setDetectedPatterns(Array.from(patterns));

                        // Smart Context Re-entry
                        const lastMsg = data.messages[data.messages.length - 1];
                        if (Date.now() - lastMsg.timestamp > 1000 * 60 * 60) { // 1 hour gap
                            setTimeout(() => {
                                setMessages(prev => [...prev, {
                                    role: 'assistant',
                                    content: `Welcome back! We were discussing **"${lastMsg.content.slice(0, 30)}..."**. Ready to pick up where we left off?`,
                                    signals: {},
                                    timestamp: Date.now(),
                                    status: 'sent',
                                    isSystem: true
                                } as Message]);
                                scrollToBottom();
                            }, 500);
                        }

                    } else {
                        setMessages([{
                            role: 'assistant',
                            content: "Hi! I'm OPEC, your career clarity assistant. Unlike a regular chatbot, I analyze emotional signals and behavioral patterns in your responses to help you understand yourself better. Let's start - what's on your mind about your career?",
                            signals: {},
                            timestamp: Date.now(),
                            status: 'sent'
                        }]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                showToast("Failed to load user data", "error");
            } finally {
                setInitialLoading(false);
            }
        };

        fetchHistory();
    }, [user?.id]);

    useEffect(() => {
        if (!initialLoading && messages.length > 0) {
            localStorage.setItem('opec_messages', JSON.stringify(messages));
            localStorage.setItem('opec_clarity_score', clarityScore.toString());
            localStorage.setItem('opec_patterns', JSON.stringify(detectedPatterns));
        }
    }, [messages, clarityScore, detectedPatterns, initialLoading]);

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const handleSendMessage = async (messageText?: string, retryMessageIndex?: number) => {
        const textToSend = messageText || inputValue;
        if (!textToSend.trim()) return;

        if (!isOnline) {
            showToast('Cannot send message while offline', 'error');
            return;
        }

        const timestamp = Date.now();
        const userMsg: Message = {
            role: 'user',
            content: textToSend,
            signals: {},
            mood: currentMood,
            timestamp,
            status: 'sending'
        };

        if (retryMessageIndex !== undefined) {
            setMessages(prev => prev.map((msg, idx) =>
                idx === retryMessageIndex ? { ...msg, status: 'sending' } : msg
            ));
        } else {
            setMessages(prev => [...prev, userMsg]);
            setInputValue("");
            setCurrentMood(null);
            requestAnimationFrame(() => scrollToBottom(false));
        }

        setLoading(true);
        abortControllerRef.current = new AbortController();

        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await fetch(`${API_URL}/api/opec/chat/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clerk_id: user?.id,
                    message: textToSend
                }),
                signal: abortControllerRef.current.signal
            });

            if (res.ok) {
                const data = await res.json();

                setMessages(prev => prev.map(msg =>
                    msg.timestamp === timestamp ? { ...msg, status: 'sent' } : msg
                ));

                const assistantMsg: Message = {
                    role: 'assistant',
                    content: data.response,
                    signals: data.signals || {},
                    timestamp: Date.now(),
                    status: 'sent'
                };
                setMessages(prev => [...prev, assistantMsg]);

                if (data.signals && Object.keys(data.signals).length > 0) {
                    setDetectedPatterns(prev => [...new Set([...prev, ...Object.keys(data.signals).slice(0, 2)])]);
                }

                setClarityScore(prev => Math.min(prev + Math.floor(Math.random() * 3) + 1, 99));
            } else {
                setMessages(prev => prev.map(msg =>
                    msg.timestamp === timestamp ? { ...msg, status: 'error' } : msg
                ));
                showToast('Failed to send message.', 'error');
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                setMessages(prev => prev.map(msg =>
                    msg.timestamp === timestamp ? { ...msg, status: 'error' } : msg
                ));
                showToast('Network error.', 'error');
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    const retryMessage = (index: number) => {
        const message = messages[index];
        if (message.role === 'user' && message.status === 'error') {
            handleSendMessage(message.content, index);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'from-green-500 to-emerald-600';
        if (score >= 50) return 'from-blue-500 to-indigo-500';
        if (score >= 25) return 'from-yellow-500 to-orange-500';
        return 'from-slate-400 to-slate-500';
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center animate-pulse">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#F9F8F6] relative font-sans text-slate-800">
            {/* Voice Mode Overlay */}
            <VoiceMode
                isOpen={isVoiceModeOpen}
                onClose={() => setIsVoiceModeOpen(false)}
                userData={{
                    ...studentProfile,
                    name: studentProfile?.name || user?.firstName || "Student",
                    interests: studentProfile?.interests || detectedPatterns.join(", ") || "general career exploration",
                    recent_mood: currentMood
                }}
            />

            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                actions={powerUserActions}
            />

            {/* Zen Mode Toggle (only when in Zen Mode) */}
            <AnimatePresence>
                {isZenMode && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsZenMode(false)}
                        className="fixed top-4 right-4 z-50 bg-white/50 hover:bg-white/80 p-2 rounded-full transition-colors backdrop-blur-sm border border-slate-200/50"
                        title="Exit Zen Mode"
                    >
                        <PanelRightOpen className="w-5 h-5 text-slate-600" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Main Chat Column */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages Area */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto px-4 scroll-smooth"
                >
                    <div className="max-w-2xl mx-auto space-y-8 py-8">
                        {/* Empty State Welcome */}
                        {messages.length <= 1 && !loading && (
                            <div className="text-center py-12 space-y-4">
                                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#d97757] to-[#e89a7d] rounded-2xl flex items-center justify-center shadow-sm">
                                    <Brain className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="font-serif text-3xl text-slate-800">Hi! How can I help you today?</h2>
                                <p className="text-slate-500 max-w-md mx-auto">I'm here to help you gain career clarity. We can explore your strengths, options, or just chat.</p>
                            </div>
                        )}

                        <AnimatePresence initial={false}>
                            {messages.map((msg, index) => (
                                <MessageBubble
                                    key={index}
                                    msg={msg}
                                    index={index}
                                    onRetry={retryMessage}
                                    formatTimestamp={formatTimestamp}
                                />
                            ))}
                        </AnimatePresence>

                        {/* Starburst Loading Animation */}
                        {loading && (
                            <div className="flex justify-start pl-2 py-4">
                                <div className="w-14 h-14 text-[#d97757] animate-[spin_4s_linear_infinite]">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                                        <path d="M12 2L14.8 8.4L21.5 9.8L16.2 14.1L18 20.8L12 17L6 20.8L7.8 14.1L2.5 9.8L9.2 8.4L12 2Z" fill="currentColor" />
                                    </svg>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </div>

                {/* Floating Input Area - Claude Style */}
                <div className="w-full px-4 pb-8 pt-2 bg-gradient-to-t from-[#F9F8F6] via-[#F9F8F6] to-transparent">
                    <div className={`max-w-3xl mx-auto bg-white rounded-3xl border shadow-xl shadow-slate-200/50 transition-all p-2 relative ${isListening ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'}`}>

                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isListening ? "Listening..." : "Reply..."}
                            className={`w-full pl-4 pr-16 py-3 bg-transparent border-0 focus:ring-0 resize-none h-16 max-h-48 text-lg text-slate-800 placeholder:font-normal leading-relaxed scrollbar-hide ${isListening ? 'placeholder:text-red-400' : 'placeholder:text-slate-400'}`}
                            disabled={!isOnline}
                        />

                        <div className="flex items-center justify-between px-2 pb-1">
                            <div className="flex items-center gap-1">
                                {/* Mood Selectors */}
                                {[
                                    { mood: 'happy' as const, icon: Smile },
                                    { mood: 'neutral' as const, icon: Meh },
                                    { mood: 'sad' as const, icon: Frown }
                                ].map(({ mood, icon: Icon }) => (
                                    <button
                                        key={mood}
                                        onClick={() => setCurrentMood(mood)}
                                        className={`p-2 rounded-xl transition-all text-slate-400 hover:text-slate-600 hover:bg-slate-100 ${currentMood === mood ? 'bg-pink-50 text-pink-600' : ''}`}
                                        title={mood}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Mic Button - Quick Voice Input */}
                                <button
                                    onClick={toggleListening}
                                    className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                    title={isListening ? "Stop Listening" : "Voice Input"}
                                >
                                    {isListening ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                                </button>

                                {/* Divider */}
                                <div className="w-px h-6 bg-slate-200" />

                                {/* Voice Agent Button - Full Conversation */}
                                <button
                                    onClick={() => setIsVoiceModeOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                                    title="Start Voice Agent Conversation"
                                >
                                    <Headphones className="w-5 h-5 text-white" />
                                    <span className="text-white font-semibold text-sm">Voice Agent</span>
                                </button>

                                {/* Send Button */}
                                <Button
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputValue.trim() || loading || !isOnline}
                                    className={`h-10 w-10 !p-0 rounded-xl flex items-center justify-center transition-all duration-200 ${inputValue.trim() ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-md transform hover:scale-105' : 'bg-pink-100 text-pink-300 cursor-not-allowed'}`}
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {isListening && (
                        <div className="text-center mt-2 text-xs text-red-500 font-medium animate-pulse">
                            ● Listening... Speak clearly
                        </div>
                    )}
                    {!isListening && (
                        <div className="text-center mt-4 text-xs text-slate-400 font-medium tracking-wide">
                            AI can make mistakes. Please verify important information.
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Layer */}
            <div className="fixed top-20 right-4 z-[100] space-y-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 pointer-events-auto ${toast.type === 'error' ? 'bg-red-600 text-white' :
                                toast.type === 'success' ? 'bg-green-600 text-white' :
                                    'bg-slate-800 text-white'
                                }`}
                        >
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                            <span className="text-sm font-medium">{toast.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Resizer Handle */}
            <AnimatePresence>
                {!isZenMode && isSidebarOpen && (
                    <div
                        className={`w-1 cursor-col-resize hover:bg-indigo-400/50 active:bg-indigo-600 z-50 flex flex-col justify-center items-center transition-colors ${isResizing ? 'bg-indigo-600' : 'bg-slate-100'}`}
                        onMouseDown={startResizing}
                    >
                        <div className="w-0.5 h-8 bg-slate-300 rounded-full" />
                    </div>
                )}
            </AnimatePresence>

            {/* Resizable Sidebar */}
            {!isZenMode && (
                <InsightsSidebar
                    show={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    messagesCount={messages.length}
                    clarityScore={clarityScore}
                    detectedPatterns={detectedPatterns}
                    onExport={exportConversation}
                    width={sidebarWidth}
                    onGenerateReport={generateReport}
                    isGeneratingReport={generatingReport}
                />
            )}
        </div>
    );
};
