
export interface Message {
    role: 'user' | 'assistant';
    content: string;
    signals?: Record<string, number>;
    mood?: 'happy' | 'neutral' | 'sad' | null;
    timestamp: number;
    status?: 'sending' | 'sent' | 'error';
    isSystem?: boolean;
    thinking?: {
        observation?: string;
        pattern?: string;
        evaluation?: string;
    };
}

export interface ToastMessage {
    id: number;
    message: string;
    type: 'error' | 'success' | 'info';
}
export interface Conversation {
    id: string;
    title: string;
    created_at: string;
    updated_at?: string;
    is_active?: boolean;
}
