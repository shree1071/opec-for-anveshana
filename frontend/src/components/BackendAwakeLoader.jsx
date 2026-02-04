import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Server, Globe } from 'lucide-react';

export const BackendAwakeLoader = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        let startTime = Date.now();
        let timer;
        let elapsedTimer;

        const checkBackend = async () => {
            // If response is fast (< 1s), user won't see anything.
            timer = setTimeout(() => setShowLoader(true), 1000);

            try {
                // Simple fetch to wake up the server. Even a 404 is a response.
                // We use a no-cors mode if possible to just check connectivity, but standard fetch is fine.
                // We'll try the health endpoint if it exists, or just root.
                await fetch(`${API_URL}/`, { method: 'GET' });
            } catch (e) {
                console.warn("Backend check failed or network error", e);
                // We proceed anyway after a timeout or error, assuming app handles errors gracefully
            } finally {
                clearTimeout(timer);
                if (elapsedTimer) clearInterval(elapsedTimer);
                setIsReady(true);
            }
        };

        checkBackend();

        // Timer to update elapsed seconds for user feedback
        elapsedTimer = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(elapsedTimer);
        };
    }, []);

    if (showLoader && !isReady) {
        return (
            <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-white/10"
                >
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-pulse"></div>
                        <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Server className="w-8 h-8 text-indigo-400" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Starting Server</h2>
                    <p className="text-slate-400 mb-6">
                        Spinning up the backend services on the cloud. This usually takes about 30-60 seconds for a cold start.
                    </p>

                    <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2 overflow-hidden">
                        <motion.div
                            className="h-full bg-indigo-500"
                            initial={{ width: "0%" }}
                            animate={{ width: "90%" }}
                            transition={{ duration: 45, ease: "linear" }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                        Elapsed: {elapsed}s
                    </p>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
};
