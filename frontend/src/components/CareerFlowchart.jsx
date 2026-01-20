import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { GitBranch, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export function CareerFlowchart({ flowchartSyntax }) {
    const mermaidRef = useRef(null);
    const containerRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [rendered, setRendered] = useState(false);
    const [error, setError] = useState(null);

    // Initialize mermaid once
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            securityLevel: 'loose',
            themeVariables: {
                primaryColor: '#6366f1',
                primaryTextColor: '#fff',
                primaryBorderColor: '#4f46e5',
                lineColor: '#94a3b8',
                secondaryColor: '#f1f5f9',
                tertiaryColor: '#ede9fe',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px'
            },
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis',
                padding: 20
            }
        });
    }, []);

    // Render chart when syntax changes
    useEffect(() => {
        const renderChart = async () => {
            if (!flowchartSyntax || !mermaidRef.current) {
                return;
            }

            try {
                setError(null);
                setRendered(false);

                // Clear previous content
                mermaidRef.current.innerHTML = '';

                // Generate unique ID for this render
                const id = `mermaid-${Date.now()}`;

                // Use mermaid.render instead of mermaid.run for better control
                const { svg } = await mermaid.render(id, flowchartSyntax);

                if (mermaidRef.current) {
                    mermaidRef.current.innerHTML = svg;
                    setRendered(true);
                }
            } catch (err) {
                console.error('Mermaid render error:', err);
                setError('Unable to render flowchart');
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(renderChart, 100);
        return () => clearTimeout(timer);
    }, [flowchartSyntax]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
    const handleResetZoom = () => setZoom(1);

    if (!flowchartSyntax) {
        return null;
    }

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
        >
            <Card className="p-6 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                            <GitBranch className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">📊 Career Flow Visualization</h3>
                            <p className="text-sm text-slate-600">Your path visualized as a flowchart</p>
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleZoomOut}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                            onClick={handleResetZoom}
                            className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            {Math.round(zoom * 100)}%
                        </button>
                        <button
                            onClick={handleZoomIn}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Zoom In"
                        >
                            <ZoomIn className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Flowchart Container */}
                <div
                    ref={containerRef}
                    className="relative bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-100 overflow-hidden"
                    style={{ minHeight: '300px' }}
                >
                    {/* Background Pattern */}
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)`,
                            backgroundSize: '20px 20px'
                        }}
                    />

                    {/* Loading/Error State */}
                    {!rendered && !error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                <p className="text-sm text-slate-500">Generating visualization...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                            <div className="text-center p-6">
                                <p className="text-slate-500 mb-2">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-indigo-600 hover:underline flex items-center gap-2 mx-auto"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mermaid Chart */}
                    <div
                        className="p-6 overflow-auto transition-transform duration-300 ease-out"
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top center'
                        }}
                    >
                        <div
                            ref={mermaidRef}
                            className="flex justify-center min-h-[200px]"
                        />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
