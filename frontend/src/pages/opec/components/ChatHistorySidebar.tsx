import React, { useMemo } from 'react';
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { type Conversation } from "../types";
import { motion } from "framer-motion";

interface ChatHistorySidebarProps {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onNewChat: () => void;
    onDelete: (id: string) => void;
    isOpen: boolean;
    onClose: () => void; // Mobile close
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
    conversations,
    activeId,
    onSelect,
    onNewChat,
    onDelete,
    isOpen,
    onClose
}) => {
    // Group conversations by date logic
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

        conversations.forEach(conv => {
            const date = new Date(conv.created_at); // Assuming ISO string

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
    }, [conversations]);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0 z-20 md:relative absolute"
        >
            {/* New Chat Button */}
            <div className="p-4">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-3 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    New Chat
                </button>
            </div>

            {/* Scrollable History List */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {sections.map(([label, items]) => (
                    <div key={label}>
                        <h4 className="text-xs font-semibold text-slate-500 px-3 mb-2 uppercase tracking-wider">{label}</h4>
                        <div className="space-y-0.5">
                            {items.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => {
                                        onSelect(conv.id);
                                    }}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 group relative
                                        ${activeId === conv.id
                                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                >
                                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeId === conv.id ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                    <span className="truncate flex-1">{conv.title || "New Conversation"}</span>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Delete "${conv.title || 'this conversation'}"?`)) {
                                                onDelete(conv.id);
                                            }
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity"
                                        title="Delete conversation"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                                    </button>

                                    {/* Fade effect on long titles */}
                                    {activeId !== conv.id && (
                                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none group-hover:from-slate-100" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* User/Footer Area (Optional) */}
            <div className="p-4 border-t border-slate-200 text-xs text-slate-400 text-center">
                OPEC Intelligence
            </div>
        </motion.div>
    );
};
