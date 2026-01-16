import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, Zap, X, ArrowRight, Lightbulb, Trash2, Download, Maximize2, Minimize2 } from 'lucide-react';

export interface CommandAction {
    id: string;
    label: string;
    icon: React.ElementType;
    shortcut?: string;
    action: () => void;
    group?: 'General' | 'Analysis' | 'System';
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    actions: CommandAction[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, actions }) => {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredActions = actions.filter(action =>
        action.label.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
            // Small timeout to allow render
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredActions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredActions[selectedIndex]) {
                    filteredActions[selectedIndex].action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredActions, selectedIndex, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 flex flex-col max-h-[60vh]"
                    >
                        {/* Header / Input */}
                        <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-3">
                            <Search className="w-5 h-5 text-slate-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                placeholder="Type a command..."
                                className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 placeholder:text-slate-400"
                            />
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-500 font-medium">ESC</span>
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto p-2">
                            {filteredActions.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <p>No results found.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredActions.map((action, idx) => (
                                        <button
                                            key={action.id}
                                            onClick={() => {
                                                action.action();
                                                onClose();
                                            }}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${idx === selectedIndex ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-md ${idx === selectedIndex ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                <action.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-medium">{action.label}</span>
                                            </div>
                                            {action.shortcut && (
                                                <span className="text-xs text-slate-400 font-mono bg-white px-2 py-1 rounded border border-slate-200">
                                                    {action.shortcut}
                                                </span>
                                            )}
                                            {idx === selectedIndex && (
                                                <ArrowRight className="w-4 h-4 text-indigo-400 animate-in slide-in-from-left-2" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                            <div className="flex gap-4">
                                <span><strong className="font-medium">↑↓</strong> to navigate</span>
                                <span><strong className="font-medium">↵</strong> to select</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-500" />
                                <span>Power User Mode</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
