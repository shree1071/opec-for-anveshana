import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Mic, Volume2, Square } from "lucide-react";
import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", text: "Hi! I'm your AI Career Coach. Ask me anything about your career path!" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const messagesEndRef = useRef(null);

    // Voice Recognition Setup
    const recognitionRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
                // Optional: Auto-submit after voice
                // handleSubmit(null, transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
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

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => setIsSpeaking(false);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e, overrideInput) => {
        if (e) e.preventDefault();
        const userMsg = overrideInput || input.trim();

        if (!userMsg || isLoading) return;

        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setInput("");
        setIsLoading(true);

        try {
            // Use config for API URL
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

            const response = await fetch(`${API_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: userMsg })
            });
            const data = await response.json();
            const aiResponse = data.answer;
            setMessages(prev => [...prev, { role: "assistant", text: aiResponse }]);

            // Auto-speak response if voice was used (optional, maybe distracting)
            // speakText(aiResponse); 
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", text: "Sorry, I can't connect right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Avatar Button */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors flex items-center justify-center"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-8 w-8" />}
                </button>
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Bot className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold">AI Career Coach</h3>
                                <p className="text-xs text-blue-100">Always here to help</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                                        <div
                                            className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm prose prose-sm max-w-none'
                                                }`}
                                        >
                                            {msg.role === 'user' ? (
                                                msg.text
                                            ) : (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.text}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                    </div>
                                    {/* Text to Speech Button for AI messages */}
                                    {msg.role === 'assistant' && (
                                        <button
                                            onClick={() => speakText(msg.text)}
                                            className="mt-1 ml-1 text-slate-400 hover:text-blue-600 transition-colors"
                                            title="Read aloud"
                                        >
                                            {isSpeaking && window.speechSynthesis.speaking ? (
                                                <Square className="h-3 w-3 fill-current" />
                                            ) : (
                                                <Volume2 className="h-3 w-3" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area - Integrated Design */}
                        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100">
                            <div className="flex gap-2 items-center">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={isListening ? "Listening..." : "Ask anything..."}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isListening ? "ring-2 ring-red-400 placeholder-red-400 bg-red-50" : ""
                                            }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={toggleListening}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${isListening
                                                ? "text-red-500 bg-red-100 animate-pulse"
                                                : "text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                                            }`}
                                        title={isListening ? "Stop Listening" : "Start Voice Input"}
                                    >
                                        {isListening ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
                                    </button>
                                </div>

                                <Button type="submit" size="icon" disabled={isLoading || (!input.trim() && !isListening)}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            {isListening && (
                                <p className="text-xs text-red-500 mt-1 animate-pulse ml-1">
                                    ● Listening... Speak now
                                </p>
                            )}
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
