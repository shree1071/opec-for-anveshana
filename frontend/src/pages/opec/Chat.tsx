import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui";
import { Brain, AlertCircle, PanelRight, PanelRightClose, ArrowRight, Minimize2, Maximize2, FileText, Trash2, Download, Activity, Mic, Square, Headphones, Briefcase, Globe, Zap, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./components/MessageBubble";
import { InsightsSidebar } from "./components/InsightsSidebar";
import { CommandPalette, type CommandAction } from "./components/CommandPalette";
import { VoiceMode } from "./components/VoiceMode";
import { InterviewSetupModal } from "./components/InterviewSetupModal";
import { AgentProgress } from "./components/AgentProgress";
import LiveJobMarket from "../../components/LiveJobMarket";

import { ChatHistorySidebar } from "./components/ChatHistorySidebar";
import type { Message, ToastMessage, Conversation } from "./types";

export const Chat = () => {
    const { user } = useUser();
    const { signOut } = useClerk();
    const navigate = useNavigate();
    const location = useLocation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [clarityScore, setClarityScore] = useState(0);
    const [currentMood, setCurrentMood] = useState<'happy' | 'neutral' | 'sad' | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Right Sidebar
    const [isHistoryOpen, setIsHistoryOpen] = useState(true); // Left Sidebar
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);
    const [detectedPatterns, setDetectedPatterns] = useState<string[]>([]);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [isZenMode, setIsZenMode] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
    const [isInterviewSetupOpen, setIsInterviewSetupOpen] = useState(false);
    const [isJobMarketOpen, setIsJobMarketOpen] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [isFastMode, setIsFastMode] = useState(true);
    const [currentAgent, setCurrentAgent] = useState<'observation' | 'pattern' | 'evaluation' | 'clarity' | 'complete' | null>(null);
    const [thinkingData, setThinkingData] = useState<{ observation?: string; pattern?: string; evaluation?: string }>({});
    const [voiceContext, setVoiceContext] = useState<{ interviewMode?: boolean; company?: string; role?: string }>({});

    // User Menu
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Conversation State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [forceNewChat, setForceNewChat] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    const handleInterviewStart = (company: string, role: string) => {
        setVoiceContext({
            interviewMode: true,
            company,
            role
        });
        setIsJobMarketOpen(false);
        setIsVoiceModeOpen(true);
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const recognitionRef = useRef<any>(null);

    // Scroll State
    const [isUserAtBottom, setIsUserAtBottom] = useState(true);

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const diff = scrollHeight - scrollTop - clientHeight;
            // If within 50px of bottom, consider at bottom
            setIsUserAtBottom(diff < 50);
        }
    };


    // --- Fetch Conversations ---
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/api/opec/chat/conversations?clerk_id=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                // Reverse order so newest is first
                setConversations((data.conversations || []).reverse());
            }
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    }, [user, API_URL]);

    // Fetch History
    const fetchHistory = useCallback(async () => {
        if (!user) return;
        try {
            setInitialLoading(true);
            const res = await fetch(`${API_URL}/api/opec/chat/history?clerk_id=${user.id}${activeConversationId ? `&conversation_id=${activeConversationId}` : ''}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
                if (data.conversation_id && !activeConversationId) {
                    setActiveConversationId(data.conversation_id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
            showToast("Failed to load chat history. Please refresh.", "error");
        } finally {
            setInitialLoading(false);
        }
    }, [user, activeConversationId, API_URL]);
    // NOTE: Removed useEffect([activeConversationId]) here to avoid loop if called manually, 
    // but fetchHistory logic handles both initial and switch.

    // Initial Fetch
    useEffect(() => {
        if (user) {
            fetchConversations();
            // Also fetch history for default/active chat if no ID selected yet
            if (!activeConversationId) {
                fetchHistory();
            }
        }
    }, [user, fetchConversations, fetchHistory, activeConversationId]);

    const handleSelectConversation = async (id: string) => {
        setActiveConversationId(id);
        setInitialLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/opec/chat/history?clerk_id=${user?.id}&conversation_id=${id}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
                // Close mobile menu if implemented?
            }
        } catch (error) {
            showToast("Failed to load conversation", "error");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleNewChat = useCallback(async () => {
        setMessages([]);
        setActiveConversationId(null);
        setForceNewChat(true);
        setThinkingData({});
        if (window.innerWidth < 768) setIsHistoryOpen(false); // Mobile UX
        // Reset scroll
        setIsUserAtBottom(true);
    }, []);

    const handleDeleteConversation = useCallback(async (conversationId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/opec/chat/conversations/${conversationId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clerk_id: user?.id })
            });

            if (res.ok) {
                // Remove from local state
                setConversations(prev => prev.filter(c => c.id !== conversationId));
                // If deleted conversation was active, clear chat
                if (conversationId === activeConversationId) {
                    setMessages([]);
                    setActiveConversationId(null);
                }
                showToast('Conversation deleted', 'success');
            } else {
                showToast('Failed to delete conversation', 'error');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            showToast('Network error', 'error');
        }
    }, [user?.id, activeConversationId, API_URL]);

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
            // Cmd+K / Ctrl+K for command palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
            // Cmd+N / Ctrl+N for new chat
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                handleNewChat();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNewChat]);

    // --- Offline Detection ---
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
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
    const showToast = (message: string, type: 'error' | 'success' | 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // Scroll Logic
    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    };

    // Smart Auto-Scroll
    useEffect(() => {
        // Only scroll if user is already at bottom
        if (isUserAtBottom) {
            scrollToBottom();
        }
    }, [messages, thinkingData, currentAgent, isUserAtBottom]);

    useEffect(() => {
        const handleOpenJobMarket = () => setIsJobMarketOpen(true);
        window.addEventListener('open-job-market', handleOpenJobMarket);
        return () => window.removeEventListener('open-job-market', handleOpenJobMarket);
    }, []);

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
        },
        {
            id: 'open-job-market',
            label: 'Open Live Job Market',
            icon: Briefcase,
            shortcut: 'J',
            action: () => setIsJobMarketOpen(true)
        }
    ];

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
                    await profileRes.json();
                    // Profile data fetched but not stored in local state as it's not currently used
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

        if (!navigator.onLine) {
            showToast('Cannot send message while offline', 'error');
            return;
        }

        const timestamp = Date.now();
        // Auto-scroll to bottom
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
            // Force scroll on user message
            setIsUserAtBottom(true);
            requestAnimationFrame(() => scrollToBottom(false));
        }

        setLoading(true);
        setCurrentAgent('observation'); // Start with observation agent
        abortControllerRef.current = new AbortController();

        // Simulate agent progression through O -> P -> E -> C
        const agentSequence: Array<'observation' | 'pattern' | 'evaluation' | 'clarity'> = ['observation', 'pattern', 'evaluation', 'clarity'];
        let agentIndex = 0;
        const agentIntervalId = setInterval(() => {
            agentIndex++;
            if (agentIndex < agentSequence.length) {
                setCurrentAgent(agentSequence[agentIndex]);
            }
        }, 800); // Cycle every 800ms

        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await fetch(`${API_URL}/api/opec/chat/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clerk_id: user?.id,
                    message: textToSend,
                    use_search: isSearchMode,
                    fast_mode: isFastMode,
                    conversation_id: forceNewChat ? null : activeConversationId,
                    new_chat: forceNewChat
                }),
                signal: abortControllerRef.current.signal
            });

            clearInterval(agentIntervalId);
            setCurrentAgent('complete');

            if (res.ok) {
                const data = await res.json();

                // Store thinking data from response
                if (data.thinking) {
                    setThinkingData(data.thinking);
                }

                setMessages(prev => prev.map(msg =>
                    msg.timestamp === timestamp ? { ...msg, status: 'sent' } : msg
                ));

                const assistantMsg: Message = {
                    role: 'assistant',
                    content: data.response,
                    signals: data.signals || {},
                    timestamp: Date.now(),
                    status: 'sent',
                    thinking: data.thinking || undefined
                };
                setMessages(prev => [...prev, assistantMsg]);

                // Update conversation state if we got a new conversation ID or title
                if (data.conversation_id && data.conversation_id !== activeConversationId) {
                    setActiveConversationId(data.conversation_id);
                }

                // Refresh conversation list if we got a new title
                if (data.title) {
                    fetchConversations();
                }

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
            clearInterval(agentIntervalId);
            if (error.name !== 'AbortError') {
                setMessages(prev => prev.map(msg =>
                    msg.timestamp === timestamp ? { ...msg, status: 'error' } : msg
                ));
                showToast('Network error.', 'error');
            }
        } finally {
            setLoading(false);
            setCurrentAgent(null);
            setThinkingData({});
            abortControllerRef.current = null;
            if (forceNewChat) setForceNewChat(false);
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
        <div className="flex h-screen bg-white overflow-hidden relative font-sans text-slate-800">
            {/* Left Sidebar - Chat History */}
            <ChatHistorySidebar
                conversations={conversations}
                activeId={activeConversationId}
                onSelect={handleSelectConversation}
                onNewChat={handleNewChat}
                onDelete={handleDeleteConversation}
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative z-0 min-w-0 bg-[#F9F8F6]">
                {/* Header */}
                <header className="h-16 border-b border-slate-100 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Toggle History Sidebar */}
                        <button
                            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            title="Toggle Chat History"
                        >
                            <PanelRight className={`w-5 h-5 transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-slate-800 leading-none">OPEC Agents</h1>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Career Intelligence System</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => navigate(location.pathname, { state: { showPricingOnboarding: true } })}
                            variant="secondary"
                            className="px-4 py-2.5 h-auto rounded-lg shadow-sm flex items-center gap-2"
                        >
                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                            Plans
                        </Button>
                        <Button
                            onClick={() => { window.location.href = '/simulate'; }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 h-auto rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                        >
                            Start Simulation
                        </Button>

                        <Button
                            onClick={() => { window.location.href = '/opec/mock-interview'; }}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 h-auto rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                        >
                            <Mic className="w-4 h-4" />
                            Mock Interview
                        </Button>

                        {/* Toggle Right Sidebar */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`p-2 rounded-lg transition-all ${isSidebarOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Toggle Insights"
                        >
                            <Activity className="w-5 h-5" />
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs hover:shadow-lg transition-all"
                            >
                                {user?.firstName?.[0] || "U"}
                            </button>

                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50"
                                    >
                                        <div className="p-3 border-b border-slate-100 bg-slate-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {user?.firstName?.[0] || "U"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-slate-900 text-sm truncate">
                                                        {user?.firstName} {user?.lastName}
                                                    </div>
                                                    <div className="text-xs text-slate-500 truncate">
                                                        {user?.primaryEmailAddress?.emailAddress}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-1">
                                            <button
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    signOut();
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Offline Banner */}
                <AnimatePresence>
                    {isOffline && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 40, opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-amber-50 border-b border-amber-200 flex items-center justify-center text-sm text-amber-800 font-medium overflow-hidden"
                        >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            You're offline. Messages will be sent when connection is restored.
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Voice Mode Overlay */}
                <VoiceMode
                    isOpen={isVoiceModeOpen}
                    onClose={() => {
                        setIsVoiceModeOpen(false);
                        setVoiceContext({});
                    }}
                    userData={user}
                    initialContext={voiceContext}
                />

                <InterviewSetupModal
                    isOpen={isInterviewSetupOpen}
                    onClose={() => setIsInterviewSetupOpen(false)}
                    onStart={handleInterviewStart}
                    onBrowseJobs={() => setIsJobMarketOpen(true)}
                />

                <CommandPalette
                    isOpen={isCommandPaletteOpen}
                    onClose={() => setIsCommandPaletteOpen(false)}
                    actions={powerUserActions}
                />

                {/* Zen Mode Toggle */}
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
                            <PanelRight className="w-5 h-5 text-slate-600" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col overflow-hidden relative">

                    {/* Persistent Voice Mode Toggle (Top Right) */}
                    <div className="absolute top-4 right-6 z-10 pointer-events-none">
                        {/* Wrapped in pointer-events-none container to not block clicks, button has auto */}
                        <button
                            onClick={() => setIsInterviewSetupOpen(true)}
                            className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo-100 text-indigo-600 rounded-full shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all text-sm font-medium"
                        >
                            <Headphones className="w-4 h-4" />
                            <span>Interview Mode</span>
                        </button>
                    </div>

                    {/* Messages Scroll Area */}
                    <div
                        ref={chatContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto overflow-x-hidden px-4 scroll-smooth"
                    >
                        <div className="max-w-3xl mx-auto space-y-8 py-8">
                            {/* Empty State Welcome */}
                            {messages.length === 0 && !loading && (
                                <div className="text-center py-12 space-y-4 select-none">
                                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#d97757] to-[#e89a7d] rounded-2xl flex items-center justify-center shadow-sm">
                                        <Brain className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="font-serif text-3xl text-slate-800">Hi {user?.firstName}!</h2>
                                    <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                                        I'm your OPEC Career Agent. I analyze your profile to give strategic advice.
                                        Start a new chat or continue below.
                                    </p>

                                    <motion.button
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => setIsInterviewSetupOpen(true)}
                                        className="mt-6 mx-auto flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="p-1.5 bg-indigo-50 rounded-full text-indigo-600">
                                            <Headphones className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">Try Voice Interview</span>
                                    </motion.button>
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

                            {/* Agent Progress Indicator */}
                            {loading && (
                                <AgentProgress currentAgent={currentAgent} thinking={thinkingData} />
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    </div>

                    {/* Input Area - Claude Style */}
                    <div className="w-full px-4 pb-6 pt-2">
                        <div className={`max-w-3xl mx-auto bg-white rounded-2xl border shadow-xl shadow-slate-200/50 transition-all p-3 relative ${isListening ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100/50'}`}>

                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isListening ? "Listening..." : "Message OPEC..."}
                                className={`w-full pl-3 pr-16 py-2 bg-transparent border-0 focus:ring-0 resize-none h-14 max-h-48 text-[16px] text-slate-800 placeholder:text-slate-400 leading-relaxed custom-scrollbar ${isListening ? 'placeholder:text-red-400' : ''}`}
                                disabled={!navigator.onLine}
                            />

                            <div className="flex items-center justify-between px-1 pt-2 border-t border-slate-50 mt-1">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setIsJobMarketOpen(true)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        title="Job Market"
                                    >
                                        <Briefcase className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => setIsFastMode(!isFastMode)}
                                        className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${!isFastMode
                                            ? 'bg-purple-50 text-purple-600'
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                        title={isFastMode ? "Switch to Deep Mode" : "Switch to Fast Mode"}
                                    >
                                        {isFastMode ? <Zap className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                                    </button>

                                    <button
                                        onClick={() => setIsSearchMode(!isSearchMode)}
                                        className={`p-2 rounded-lg transition-colors ${isSearchMode ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                        title="Web Search"
                                    >
                                        <Globe className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleListening}
                                        className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                        title="Voice Input"
                                    >
                                        {isListening ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                                    </button>

                                    <Button
                                        onClick={() => handleSendMessage()}
                                        disabled={!inputValue.trim() || loading || !navigator.onLine}
                                        className={`h-9 w-9 !p-0 rounded-xl flex items-center justify-center transition-all ${inputValue.trim() ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 text-slate-300'}`}
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Disclaimer */}
                        {!isListening && (
                            <div className="text-center mt-3 text-[11px] text-slate-400">
                                AI can make mistakes. Please verify important information.
                            </div>
                        )}
                    </div>
                </div>

                {/* Toasts */}
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

                {/* Live Job Market Overlay */}
                <AnimatePresence>
                    {isJobMarketOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        >
                            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
                                <button
                                    onClick={() => setIsJobMarketOpen(false)}
                                    className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
                                >
                                    <PanelRightClose className="w-5 h-5 text-slate-600" />
                                </button>
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <LiveJobMarket onInterviewStart={handleInterviewStart} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* Right Sidebar - Insights (Resizable) */}
            <AnimatePresence>
                {!isZenMode && isSidebarOpen && (
                    <div className="relative flex h-full shadow-xl z-20">
                        {/* Resizer */}
                        <div
                            className={`w-1 cursor-col-resize hover:bg-indigo-400/50 active:bg-indigo-600 z-50 flex flex-col justify-center items-center transition-colors ${isResizing ? 'bg-indigo-600' : 'bg-slate-100'}`}
                            onMouseDown={startResizing}
                        >
                            <div className="w-0.5 h-8 bg-slate-300 rounded-full" />
                        </div>

                        <InsightsSidebar
                            show={true} // Controlled by parent conditional
                            onClose={() => setIsSidebarOpen(false)}
                            messagesCount={messages.length}
                            clarityScore={clarityScore}
                            detectedPatterns={detectedPatterns}
                            onExport={exportConversation}
                            width={sidebarWidth}
                            onGenerateReport={generateReport}
                            isGeneratingReport={generatingReport}
                        />
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};
