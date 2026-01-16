import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

let toastId = 0;
const toastListeners: ((toast: Toast) => void)[] = [];

const addToastListener = (listener: (toast: Toast) => void) => {
    toastListeners.push(listener);
    return () => {
        const index = toastListeners.indexOf(listener);
        if (index > -1) toastListeners.splice(index, 1);
    };
};

const notifyListeners = (toast: Toast) => {
    toastListeners.forEach(listener => listener(toast));
};

// Global toast functions
export const toast = {
    success: (message: string, action?: Toast['action']) => {
        notifyListeners({ id: toastId++, type: 'success', message, action });
    },
    error: (message: string, action?: Toast['action']) => {
        notifyListeners({ id: toastId++, type: 'error', message, action });
    },
    info: (message: string, action?: Toast['action']) => {
        notifyListeners({ id: toastId++, type: 'info', message, action });
    }
};

export const ToastContainer = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const removeListener = addToastListener((newToast) => {
            setToasts(prev => [...prev, newToast]);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== newToast.id));
            }, 5000);
        });

        return removeListener;
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: () => void }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    const colors = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-blue-600 text-white'
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`${colors[toast.type]} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] pointer-events-auto`}
        >
            {icons[toast.type]}
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            {toast.action && (
                <button
                    onClick={() => {
                        toast.action!.onClick();
                        onRemove();
                    }}
                    className="text-sm font-semibold underline hover:no-underline"
                >
                    {toast.action.label}
                </button>
            )}
            <button onClick={onRemove} className="hover:bg-white/20 rounded p-1 transition">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};
