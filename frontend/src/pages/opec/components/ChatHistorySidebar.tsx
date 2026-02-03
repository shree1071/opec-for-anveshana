import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { PenSquare, Search, Mic, Briefcase, Sparkles } from "lucide-react";
import { type Conversation } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface ChatHistorySidebarProps {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onNewChat: () => void;
    onDelete: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
    conversations,
    activeId,
    onSelect,
    onNewChat,
    isOpen,
}) => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Group conversations by date
    const sections = useMemo(() => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const groups: { [key: string]: Conversation[] } = {
            'Today': [],
            'Yesterday': [],
            'Previous 7 Days': [],
            'Older': []
        };

        const filtered = conversations.filter(c =>
            !searchQuery || c.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.forEach(conv => {
            const date = new Date(conv.created_at);
            if (date.toDateString() === today.toDateString()) {
                groups['Today'].push(conv);
            } else if (date.toDateString() === yesterday.toDateString()) {
                groups['Yesterday'].push(conv);
            } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
                groups['Previous 7 Days'].push(conv);
            } else {
                groups['Older'].push(conv);
            }
        });

        return Object.entries(groups).filter(([_, items]) => items.length > 0);
    }, [conversations, searchQuery]);

    // Collapsed Icon Strip (always visible)
    if (!isOpen) {
        return (
            <div className="h-full w-16 bg-transparent flex flex-col items-center py-4 flex-shrink-0 z-20">
                {/* Top Icons */}
                <div className="flex flex-col items-center gap-1">
                    {/* Logo */}
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                            <path d="M8 10v6a4 4 0 0 0 8 0v-6" />
                            <path d="M12 18v4" />
                        </svg>
                    </div>

                    {/* New Chat */}
                    <button
                        onClick={onNewChat}
                        className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        title="New chat"
                    >
                        <PenSquare className="w-5 h-5" />
                    </button>

                    {/* Search */}
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Search chats"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Mock Interview */}
                    <button
                        onClick={() => navigate('/opec/mock-interview')}
                        className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Mock Interview"
                    >
                        <Mic className="w-5 h-5" />
                    </button>

                    {/* Jobs */}
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-job-market'))}
                        className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Jobs"
                    >
                        <Briefcase className="w-5 h-5" />
                    </button>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom Icons */}
                <div className="flex flex-col items-center gap-2">
                    {/* Sparkles / Upgrade */}
                    <button
                        onClick={() => navigate('/opec', { state: { showPricingOnboarding: true } })}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Upgrade"
                    >
                        <Sparkles className="w-5 h-5" />
                    </button>

                    {/* User Avatar */}
                    <button className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {user?.firstName?.[0] || "U"}
                    </button>
                </div>
            </div>
        );
    }

    // Expanded Sidebar
    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-transparent flex flex-col flex-shrink-0 z-20 md:relative absolute"
        >
            {/* Top Navigation Section */}
            <div className="p-3 space-y-1">
                {/* New Chat */}
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm"
                >
                    <PenSquare className="w-5 h-5" />
                    <span className="font-medium">New chat</span>
                </button>

                {/* Search Chats */}
                <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm"
                >
                    <Search className="w-5 h-5" />
                    <span className="font-medium">Search chats</span>
                </button>

                {/* Search Input (Expandable) */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
                                autoFocus
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mock Interview */}
                <button
                    onClick={() => navigate('/opec/mock-interview')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm"
                >
                    <Mic className="w-5 h-5" />
                    <span className="font-medium">Mock Interview</span>
                </button>

                {/* Job Market */}
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-job-market'))}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm"
                >
                    <Briefcase className="w-5 h-5" />
                    <span className="font-medium">Jobs</span>
                </button>
            </div>

            {/* Your Chats Label */}
            <div className="px-4 pt-4 pb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Your chats</span>
            </div>

            {/* Scrollable History List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {sections.map(([label, items]) => (
                    <div key={label}>
                        {label !== 'Today' && (
                            <h4 className="text-xs font-medium text-slate-400 px-3 mb-1.5">{label}</h4>
                        )}
                        <div className="space-y-0.5">
                            {items.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => onSelect(conv.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 group relative
                                        ${activeId === conv.id
                                            ? 'bg-slate-100 text-slate-900'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <span className="truncate flex-1">{conv.title || "New Conversation"}</span>

                                    {/* Fade effect on long titles */}
                                    <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l pointer-events-none ${activeId === conv.id ? 'from-slate-100' : 'from-transparent group-hover:from-slate-50'
                                        }`} />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {conversations.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-8">
                        No chats yet. Start a new one!
                    </div>
                )}
            </div>

            {/* User Profile Footer */}
            <div className="p-3 border-t border-slate-100">
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors">
                    {/* User Avatar */}
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {user?.firstName?.[0] || "U"}
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-slate-800 truncate">
                            {user?.firstName} {user?.lastName?.[0]}.
                        </div>
                        <div className="text-xs text-slate-400">Free</div>
                    </div>
                    {/* Upgrade Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate('/opec', { state: { showPricingOnboarding: true } });
                        }}
                        className="px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
                    >
                        Upgrade
                    </button>
                </button>
            </div>
        </motion.div>
    );
};
