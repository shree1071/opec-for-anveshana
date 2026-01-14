import { useState } from 'react';
import { Card } from './ui/Card';
import { CheckCircle, Circle, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProgressTracker({ roadmap }) {
    const [completedMilestones, setCompletedMilestones] = useState({});

    const toggleMilestone = (yearIndex, milestoneIndex) => {
        const key = `${yearIndex}-${milestoneIndex}`;
        setCompletedMilestones(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const calculateProgress = () => {
        const totalMilestones = roadmap.reduce((sum, year) => sum + year.milestones.length, 0);
        const completed = Object.values(completedMilestones).filter(Boolean).length;
        return Math.round((completed / totalMilestones) * 100);
    };

    const progress = calculateProgress();

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">📈 Progress Tracker</h3>
                        <p className="text-sm text-slate-600">Track your career milestones</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{progress}%</div>
                    <div className="text-xs text-slate-500">Complete</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 bg-slate-200 rounded-full h-3 overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Milestone Checklist */}
            <div className="space-y-6">
                {roadmap.map((year, yearIndex) => (
                    <div key={yearIndex} className="border-l-2 border-blue-200 pl-4">
                        <h4 className="font-semibold text-slate-800 mb-3">
                            Year {year.year}: {year.role}
                        </h4>
                        <div className="space-y-2">
                            {year.milestones.map((milestone, milestoneIndex) => {
                                const key = `${yearIndex}-${milestoneIndex}`;
                                const isCompleted = completedMilestones[key];

                                return (
                                    <button
                                        key={milestoneIndex}
                                        onClick={() => toggleMilestone(yearIndex, milestoneIndex)}
                                        className="flex items-start gap-3 w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                                        )}
                                        <span className={`text-sm ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {milestone}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {progress === 100 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg text-center"
                >
                    <p className="text-lg font-bold text-green-700">🎉 Congratulations!</p>
                    <p className="text-sm text-green-600">You've completed all milestones!</p>
                </motion.div>
            )}
        </Card>
    );
}
