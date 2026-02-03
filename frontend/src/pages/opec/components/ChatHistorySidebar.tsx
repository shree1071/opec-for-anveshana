import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { PenSquare, Search, Mic, Briefcase, Sparkles, PanelRight } from "lucide-react";
import { type Conversation } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface ChatHistorySidebarProps {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onNewChat: () => void;
    onDelete: (id: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    onOpenPricing: () => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
    conversations,
    activeId,
    onSelect,
    onNewChat,
    isOpen,
    onToggle,
    onOpenPricing
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
                    {/* Toggle Button */}
                    <button
                        onClick={onToggle}
                        className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors mb-2"
                        title="Expand Sidebar"
                    >
                        <PanelRight className="w-5 h-5 transform rotate-180" />
                    </button>

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
            className="h-full bg-[#FAFAFA] border-r border-stone-200 flex flex-col flex-shrink-0 z-20 md:relative absolute"
        >
            {/* Top Navigation Section */}
            <div className="p-3 space-y-1">
                {/* Header with Toggle */}
                <div className="flex items-center justify-between px-2 mb-2">
                    <button
                        onClick={onToggle}
                        className="p-2 -ml-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Collapse Sidebar"
                    >
                        <PanelRight className="w-5 h-5" />
                    </button>
                </div>

                {/* New Chat */}
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-all text-sm group"
                >
                    <PenSquare className="w-4 h-4" />
                    <span className="font-medium">New chat</span>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 text-[10px] text-stone-400 border border-stone-200 px-1 rounded">⌘N</span>
                </button>

                {/* Search Chats */}
                <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-all text-sm group"
                >
                    <Search className="w-4 h-4" />
                    <span className="font-medium">Search chats</span>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 text-[10px] text-stone-400 border border-stone-200 px-1 rounded">⌘K</span>
                </button>

                {/* Search Input (Expandable) */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden px-1 pb-2"
                        >
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search conversations..."
                                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200 bg-white placeholder:text-stone-400 text-stone-800"
                                autoFocus
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mock Interview */}
                <button
                    onClick={() => navigate('/opec/mock-interview')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-all text-sm"
                >
                    <Mic className="w-4 h-4" />
                    <span className="font-medium">Mock Interview</span>
                </button>

                {/* Job Market */}
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-job-market'))}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-all text-sm"
                >
                    <Briefcase className="w-4 h-4" />
                    <span className="font-medium">Jobs</span>
                </button>
            </div>

            {/* Your Chats Label */}
            <div className="px-4 pt-4 pb-2 mt-2">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Your History</span>
            </div>

            {/* Scrollable History List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {sections.map(([label, items]) => (
                    <div key={label}>
                        {label !== 'Today' && (
                            <h4 className="text-[11px] font-medium text-stone-400 px-3 mb-2">{label}</h4>
                        )}
                        <div className="space-y-0.5">
                            {items.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => onSelect(conv.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 group relative
                                        ${activeId === conv.id
                                            ? 'bg-stone-100 text-stone-900 font-medium'
                                            : 'text-stone-600 hover:bg-white hover:shadow-sm hover:text-stone-900'
                                        }`}
                                >
                                    <span className="truncate flex-1">{conv.title || "New Conversation"}</span>

                                    {/* Fade effect on long titles */}
                                    <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l pointer-events-none rounded-r-lg ${activeId === conv.id ? 'from-stone-100' : 'from-transparent group-hover:from-white'
                                        }`} />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {conversations.length === 0 && (
                    <div className="text-center text-stone-400 text-sm py-8 italic">
                        No chats yet. Start a new one!
                    </div>
                )}
            </div>

            {/* User Profile Footer - CLEANED UP LAYOUT */}
            <div className="p-3 border-t border-stone-200 bg-[#FAFAFA]">
                <div
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-stone-100 rounded-xl transition-all cursor-pointer border border-transparent hover:border-stone-200"
                >
                    {/* User Avatar */}
                    <div className="w-9 h-9 bg-stone-800 rounded-full flex items-center justify-center text-white font-serif font-bold text-sm shadow-sm ring-2 ring-white">
                        {user?.firstName?.[0] || "U"}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-stone-900 truncate">
                            {user?.firstName} {user?.lastName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-stone-500 font-medium">Free Plan</span>
                        </div>
                    </div>
                </div>

                {/* Upgrade Button - Separated for cleaner look */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenPricing();
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all shadow-sm"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    Upgrade to Pro
                </button>
            </div>
        </motion.div>
    );
};
