
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
