import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Bot, User, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';
import { API_ENDPOINTS } from '../config/api';

const suggestedQuestions = [
    "How do I start learning React?",
    "What's the salary for a Junior Dev?",
    "Explain the roadmap milestones",
    "Any tips for interview prep?"
];

export function CareerCoachChat({ userRoadmap }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '👋 Hi! I\'m your AI Career Coach. Ask me anything about your roadmap!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (text = input) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(API_ENDPOINTS.chat, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: text,
                    context: userRoadmap
                })
            });

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, I couldn\'t connect. Please check your connection.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button with Pulse Effect */}
            <div className="fixed bottom-6 right-6 z-50">
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
                )}
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-4 rounded-full shadow-xl transition-shadow ${isOpen
                            ? 'bg-slate-800 text-white rotate-90'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30'
                        }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                </motion.button>
            </div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed bottom-24 right-6 w-96 h-[600px] max-h-[80vh] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-50 flex flex-col border border-white/20 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 pb-12 relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10 flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">Career Coach AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        <p className="text-xs text-blue-100 font-medium">Online & Ready</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 -mt-6 rounded-t-3xl bg-white relative z-20">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user'
                                            ? 'bg-indigo-100 text-indigo-600 border border-indigo-200'
                                            : 'bg-blue-100 text-blue-600 border border-blue-200'
                                        }`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>

                                    <div className={`max-w-[75%] space-y-1`}>
                                        <div
                                            className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                                    ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-tr-none'
                                                    : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        <div className={`text-[10px] text-slate-400 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'
                                            }`}>
                                            {idx === 0 ? 'Just now' : 'Just now'}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestions */}
                        {messages.length < 3 && !isLoading && (
                            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar mask-gradient">
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-xs font-medium border border-slate-200 hover:border-indigo-200 rounded-full transition-colors flex items-center gap-1.5"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <div className="relative flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type your question..."
                                    className="flex-1 px-3 py-2 bg-transparent text-sm focus:outline-none text-slate-700 placeholder:text-slate-400"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={isLoading || !input.trim()}
                                    className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:shadow-none"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="mt-2 text-center">
                                <p className="text-[10px] text-slate-400">
                                    AI can make mistakes. Verify important info.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
