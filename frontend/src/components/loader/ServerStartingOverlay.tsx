import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server } from 'lucide-react';

interface ServerStartingOverlayProps {
    isVisible: boolean;
    elapsed: number;
    progress?: number;
}

export const ServerStartingOverlay: React.FC<ServerStartingOverlayProps> = ({ isVisible, elapsed, progress = 90 }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="max-w-md w-full bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl"
                    >
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-pulse"></div>
                            <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Server className="w-8 h-8 text-indigo-400" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Starting Server</h2>
                        <p className="text-slate-400 mb-6 font-light">
                            Spinning up the backend services on the cloud. This usually takes about 30-60 seconds for a cold start.
                        </p>

                        <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2 overflow-hidden relative">
                            <motion.div
                                className="h-full bg-indigo-500 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 45, ease: "linear" }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                            Elapsed: {elapsed}s
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
