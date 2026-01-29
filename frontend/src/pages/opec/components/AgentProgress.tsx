import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Brain, BarChart3, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface ThinkingData {
    observation?: string;
    pattern?: string;
    evaluation?: string;
}

interface AgentProgressProps {
    currentAgent: 'observation' | 'pattern' | 'evaluation' | 'clarity' | 'complete' | null;
    thinking?: ThinkingData;
    isComplete?: boolean;
}

const agents = [
    { id: 'observation', label: 'Observing', shortLabel: 'O', icon: Eye, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
    { id: 'pattern', label: 'Analyzing Patterns', shortLabel: 'P', icon: Brain, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50' },
    { id: 'evaluation', label: 'Evaluating', shortLabel: 'E', icon: BarChart3, color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-50' },
    { id: 'clarity', label: 'Synthesizing', shortLabel: 'C', icon: Sparkles, color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-50' },
];

export const AgentProgress: React.FC<AgentProgressProps> = ({ currentAgent, thinking, isComplete }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const currentIndex = agents.findIndex(a => a.id === currentAgent);

    // Get the current thinking text based on active agent
    const getCurrentThinking = () => {
        if (!thinking) return null;
        if (currentAgent === 'observation' || currentIndex >= 0) {
            if (currentAgent === 'observation' && thinking.observation) return thinking.observation;
            if (currentAgent === 'pattern' && thinking.pattern) return thinking.pattern;
            if (currentAgent === 'evaluation' && thinking.evaluation) return thinking.evaluation;
        }
        return null;
    };

    const currentThinking = getCurrentThinking();

    return (
        <div className="flex items-start gap-2 py-4 pl-1">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-lg overflow-hidden max-w-lg"
            >
                {/* Header - Thinking... */}
                <div
                    className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100 cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 text-slate-500"
                        >
                            <Sparkles className="w-4 h-4" />
                        </motion.div>
                        <span className="font-medium text-slate-700 text-sm">Thinking...</span>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            {/* Agent Progress Bar */}
                            <div className="px-4 pt-3 pb-2">
                                <div className="flex items-center gap-1">
                                    {agents.map((agent, index) => {
                                        const Icon = agent.icon;
                                        const isActive = agent.id === currentAgent;
                                        const isCompleted = currentIndex > index || currentAgent === 'complete' || isComplete;
                                        const isPending = currentIndex < index && currentAgent !== 'complete' && !isComplete;

                                        return (
                                            <React.Fragment key={agent.id}>
                                                {/* Agent Node */}
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{
                                                        scale: isActive ? 1.1 : 1,
                                                        opacity: 1
                                                    }}
                                                    className={`
                            relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300
                            ${isActive
                                                            ? `bg-gradient-to-br ${agent.color} shadow-md`
                                                            : isCompleted
                                                                ? 'bg-emerald-100'
                                                                : 'bg-slate-100'
                                                        }
                          `}
                                                    title={agent.label}
                                                >
                                                    {isCompleted && !isActive ? (
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    ) : (
                                                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isPending ? 'text-slate-400' : 'text-slate-600'}`} />
                                                    )}

                                                    {/* Pulse ring for active agent */}
                                                    {isActive && (
                                                        <motion.div
                                                            className={`absolute inset-0 rounded-lg bg-gradient-to-br ${agent.color} opacity-30`}
                                                            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                                                            transition={{ duration: 1.2, repeat: Infinity }}
                                                        />
                                                    )}
                                                </motion.div>

                                                {/* Connector line */}
                                                {index < agents.length - 1 && (
                                                    <div className={`w-3 h-0.5 rounded transition-colors duration-300 ${currentIndex > index || currentAgent === 'complete' || isComplete
                                                            ? 'bg-emerald-400'
                                                            : 'bg-slate-200'
                                                        }`} />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Current Thinking Text - ChatGPT Style */}
                            <div className="px-4 pb-3">
                                <motion.div
                                    key={currentAgent}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-slate-500 mb-2 font-medium"
                                >
                                    {currentAgent === 'complete' || isComplete
                                        ? '✓ Complete'
                                        : agents.find(a => a.id === currentAgent)?.label || 'Starting...'}
                                </motion.div>

                                {/* Thinking content box */}
                                {currentThinking && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className={`p-3 rounded-lg ${agents.find(a => a.id === currentAgent)?.bgColor || 'bg-slate-50'} border border-slate-100`}
                                    >
                                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                                            {currentThinking}
                                        </p>
                                    </motion.div>
                                )}

                                {/* Typing indicator when no thinking text yet */}
                                {!currentThinking && currentAgent && currentAgent !== 'complete' && (
                                    <div className={`p-3 rounded-lg ${agents.find(a => a.id === currentAgent)?.bgColor || 'bg-slate-50'} border border-slate-100`}>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
