import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Server, Globe } from 'lucide-react';
import { ServerStartingOverlay } from './loader/ServerStartingOverlay';

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

    return (
        <>
            <ServerStartingOverlay isVisible={showLoader && !isReady} elapsed={elapsed} />
            {/* When not ready, we might want to hide children or show them underneath. 
                The original code didn't render children until ready if showLoader was true? 
                Actually, looking at original: if (showLoader && !isReady) return loader;
                So it blocked children.
            */}
            {(!showLoader || isReady) && children}
        </>
    );

    return <>{children}</>;
};
