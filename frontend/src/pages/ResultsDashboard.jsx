import { useState } from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Briefcase, TrendingUp, AlertTriangle, BarChart3, BookOpen, DollarSign, Wrench, Home } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CareerFlowchart } from "../components/CareerFlowchart";
import { CareerCoachChat } from "../components/CareerCoachChat";
import { ResumeBuilder } from "../components/ResumeBuilder";
import { CourseRecommendations } from "../components/CourseRecommendations";
import { SalaryInsights } from "../components/SalaryInsights";
import { TabNavigation } from "../components/TabNavigation";
import { ProgressTracker } from "../components/ProgressTracker";
import { SkillQuiz } from "../components/SkillQuiz";
import { MentorMatch } from "../components/MentorMatch";

export function ResultsDashboard() {
    const { state } = useLocation();
    const result = state?.result;
    const [activeTab, setActiveTab] = useState('overview');

    if (!result) {
        return <Navigate to="/simulate" replace />;
    }

    const { roadmap, analysis } = result;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
        { id: 'roadmap', label: 'Roadmap', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'skills', label: 'Skills & Courses', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'salary', label: 'Salary', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'tools', label: 'Tools', icon: <Wrench className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Your AI-Generated Career Roadmap</h1>
                    <p className="text-slate-600 mt-2">Personalized strategy for the next 6 years.</p>
                </div>

                {/* Tab Navigation */}
                <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Flowchart Visualization */}
                        {result.flowchart && <CareerFlowchart flowchartSyntax={result.flowchart} />}

                        {/* Analysis Overview Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="bg-white border-l-4 border-l-blue-500">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Market Outlook</h3>
                                <p className="text-slate-900 font-medium">{analysis.market_outlook}</p>
                            </Card>
                            <Card className="bg-white border-l-4 border-l-green-500">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Salary Projection</h3>
                                <p className="text-slate-900 font-medium">{analysis.salary_projection}</p>
                            </Card>
                            <Card className="bg-white border-l-4 border-l-orange-500">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Skill Gaps</h3>
                                <p className="text-slate-900 font-medium">{analysis.skill_gaps}</p>
                            </Card>
                            <Card className="bg-white border-l-4 border-l-purple-500">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Counselor's View</h3>
                                <p className="text-slate-900 font-medium">{analysis.counselor_view}</p>
                            </Card>
                        </div>

                        {/* Mentor Matching */}
                        <MentorMatch field={roadmap[0]?.role} />
                    </div>
                )}

                {activeTab === 'roadmap' && (
                    <div className="space-y-8">
                        {/* Timeline */}
                        <div className="relative">
                            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200" />

                            <div className="space-y-12">
                                {roadmap.map((yearItem, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                                            }`}
                                    >
                                        {/* Timeline Dot */}
                                        <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 border-4 border-white shadow-lg flex items-center justify-center z-10">
                                            <span className="text-xs font-bold text-white">{yearItem.year}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="w-full md:w-1/2 pl-20 md:pl-0">
                                            <Card className={`relative ${index % 2 === 0 ? "md:mr-12" : "md:ml-12"}`}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                        <Briefcase className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900">{yearItem.title}</h3>
                                                        <p className="text-blue-600 font-medium">{yearItem.role}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Focus Area</h4>
                                                        <p className="text-slate-600 text-sm">{yearItem.focus}</p>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Skills to Acquire</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {yearItem.skills_to_acquire.map((skill, i) => (
                                                                <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-200">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Key Milestones</h4>
                                                        <ul className="space-y-2">
                                                            {yearItem.milestones.map((ms, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                                    {ms}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Risks & Backup */}
                        <div className="grid md:grid-cols-2 gap-6 pt-12">
                            <Card className="bg-red-50 border border-red-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                    <h3 className="text-lg font-bold text-red-900">Risk Assessment</h3>
                                </div>
                                <p className="text-red-700 mb-4">{analysis.risk_assessment}</p>
                            </Card>

                            <Card className="bg-indigo-50 border border-indigo-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                                    <h3 className="text-lg font-bold text-indigo-900">Backup Paths</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.backup_paths.map((path, i) => (
                                        <span key={i} className="px-3 py-1 bg-white text-indigo-700 font-medium rounded-full shadow-sm">
                                            {path}
                                        </span>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div className="space-y-8">
                        {/* Skill Quiz */}
                        <SkillQuiz field={roadmap[0]?.role} />

                        {/* Course Recommendations */}
                        {roadmap.length > 0 && (
                            <CourseRecommendations skills={roadmap.flatMap(y => y.skills_to_acquire)} />
                        )}
                    </div>
                )}

                {activeTab === 'salary' && (
                    <div className="space-y-8">
                        {/* Salary Insights Dashboard */}
                        <SalaryInsights roadmap={roadmap} salaryProjection={analysis.salary_projection} />
                    </div>
                )}

                {activeTab === 'tools' && (
                    <div className="space-y-8">
                        {/* Progress Tracker */}
                        <ProgressTracker roadmap={roadmap} />

                        {/* Resume Builder */}
                        <ResumeBuilder roadmap={roadmap} analysis={analysis} />
                    </div>
                )}

                <div className="flex justify-center pt-8">
                    <Link to="/simulate">
                        <Button variant="outline">Start New Simulation</Button>
                    </Link>
                </div>

            </div>

            {/* Floating Chat Widget */}
            <CareerCoachChat userRoadmap={result} />
        </div>
    );
}
