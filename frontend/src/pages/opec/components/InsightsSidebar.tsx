import React from 'react';
import { Button } from "../../../components/ui";
import { Download, TrendingUp, Activity, CheckCircle2, Lightbulb, PanelRightClose } from "lucide-react";

interface InsightsSidebarProps {
    show: boolean;
    onClose: () => void;
    messagesCount: number;
    clarityScore: number;
    detectedPatterns: string[];
    onExport: () => void;
    width: number;
    onGenerateReport?: () => void;
    isGeneratingReport?: boolean;
}

export const InsightsSidebar: React.FC<InsightsSidebarProps> = ({
    show,
    onClose,
    messagesCount,
    clarityScore,
    detectedPatterns,
    onExport,
    width,
    onGenerateReport,
    isGeneratingReport
}) => {
    if (!show) return null;

    return (
        <div
            className="flex flex-col bg-white border-l border-slate-200 h-full shadow-xl md:shadow-none absolute md:relative right-0 z-40 md:z-auto"
            style={{ width: `${width}px` }}
        >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Workspace
                </h3>
                <button
                    onClick={onClose}
                    className="h-8 w-8 flex items-center justify-center hover:bg-slate-200 rounded-lg transition-colors"
                    aria-label="Close sidebar"
                >
                    <PanelRightClose className="w-5 h-5 text-slate-600 hover:text-slate-900" />
                </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="space-y-6">
                    {/* Action Items Card */}
                    <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 rounded-xl border border-violet-100 shadow-sm">
                        <h4 className="font-semibold text-violet-900 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Action Items
                        </h4>
                        <ul className="space-y-2">
                            <li className="text-sm text-slate-700 flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                                <span>Reflect on your core values</span>
                            </li>
                            <li className="text-sm text-slate-700 flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                                <span>Complete the skills assessment</span>
                            </li>
                        </ul>
                    </div>

                    {/* Recent Patterns Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Detected Patterns
                        </h4>
                        {detectedPatterns.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {detectedPatterns.slice(0, 6).map((pattern, idx) => (
                                    <div key={idx} className="group relative">
                                        <span className="cursor-help px-2 py-1 bg-white/60 text-blue-700 rounded-md text-xs font-medium border border-blue-100 hover:bg-white hover:border-blue-300 transition-colors">
                                            {pattern.replace(/_/g, ' ')}
                                        </span>
                                        {/* Simple Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                                            <div className="font-semibold mb-1">{pattern.replace(/_/g, ' ')}</div>
                                            <div className="text-slate-300">
                                                Detected based on your language choices and emotional signals.
                                            </div>
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-blue-600/70 italic">
                                Chat more to reveal patterns in your thinking...
                            </p>
                        )}
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Session Stats
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="text-2xl font-bold text-indigo-600">{messagesCount}</div>
                                <div className="text-xs text-slate-500 font-medium">Messages</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="text-2xl font-bold text-green-600">{clarityScore}%</div>
                                <div className="text-xs text-slate-500 font-medium">Clarity</div>
                            </div>
                        </div>
                    </div>

                    {/* Generate Report Button */}
                    {onGenerateReport && (
                        <Button
                            onClick={onGenerateReport}
                            disabled={isGeneratingReport}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
                        >
                            {isGeneratingReport ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Lightbulb className="w-4 h-4" />
                                    Generate Session Report
                                </>
                            )}
                        </Button>
                    )}

                    {/* Export Button */}
                    <Button
                        onClick={onExport}
                        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export Journey
                    </Button>
                </div>
            </div>
        </div>
    );
};
