import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import { TrendingUp, Sparkles, IndianRupee, Target, Loader2, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Animation variants matching landing page
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const countUp = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 200, damping: 20 }
    }
};

export function SalaryInsights({ roadmap, salaryProjection }) {
    const [realSalaryData, setRealSalaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dataSource, setDataSource] = useState('projected');

    // Format number in Indian style (lakhs)
    const formatINR = (value) => {
        const lakhs = value / 100000;
        return `₹${lakhs.toFixed(1)}L`;
    };

    // Fetch real salary data from MCP
    useEffect(() => {
        const fetchSalaryData = async () => {
            if (!roadmap || roadmap.length === 0) return;

            try {
                // Get role from first year of roadmap
                const targetRole = roadmap[0]?.role || 'Software Engineer';

                const response = await fetch(`${API_URL}/api/mcp/salary?job_title=${encodeURIComponent(targetRole)}&location=india`);
                const data = await response.json();

                if (data.success || data.salary_min || data.avg_salary) {
                    setRealSalaryData(data);
                    setDataSource('live');
                }
            } catch (err) {
                console.log('Using projected data for salary');
            } finally {
                setLoading(false);
            }
        };

        fetchSalaryData();
    }, [roadmap]);

    // Create enhanced chart data with real data integration
    const chartData = useMemo(() => {
        const baseMultiplier = realSalaryData?.avg_salary
            ? realSalaryData.avg_salary / 100000
            : 6; // 6 LPA default

        return roadmap.map((year, index) => {
            // Progressive salary growth with experience multipliers
            const growthFactors = [1, 1.25, 1.5, 1.9, 2.4, 3.2]; // Realistic growth curve
            const factor = growthFactors[Math.min(index, growthFactors.length - 1)];

            const estimatedSalary = (baseMultiplier * factor) * 100000;
            const marketAvg = estimatedSalary * 0.9;
            const topPercentile = estimatedSalary * 1.35;

            return {
                year: `Year ${year.year}`,
                shortYear: `Y${year.year}`,
                role: year.role,
                salary: Math.round(estimatedSalary),
                marketAvg: Math.round(marketAvg),
                topPercentile: Math.round(topPercentile)
            };
        });
    }, [roadmap, realSalaryData]);

    const startSalary = chartData[0]?.salary || 600000;
    const endSalary = chartData[chartData.length - 1]?.salary || 1400000;
    const growthPercent = Math.round(((endSalary - startSalary) / startSalary) * 100);
    const topEarning = chartData[chartData.length - 1]?.topPercentile || 1800000;

    if (loading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-slate-500">Fetching salary insights...</span>
                </div>
            </Card>
        );
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            <Card className="p-6 overflow-hidden relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />

                {/* Header */}
                <motion.div variants={fadeInUp} className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                💰 Salary Progression
                                {dataSource === 'live' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        Live Data
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-slate-600">Projected earnings over your career path (in INR)</p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards - Animated */}
                <motion.div
                    variants={staggerContainer}
                    className="grid grid-cols-4 gap-4 mb-6"
                >
                    <motion.div
                        variants={countUp}
                        className="relative p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200/50 overflow-hidden group hover:shadow-lg transition-shadow"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <IndianRupee className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Starting</div>
                        <div className="text-2xl font-bold text-blue-700">{formatINR(startSalary)}</div>
                        <div className="text-[10px] text-blue-500 mt-1">Year 1</div>
                    </motion.div>

                    <motion.div
                        variants={countUp}
                        className="relative p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200/50 overflow-hidden group hover:shadow-lg transition-shadow"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Target className="w-12 h-12 text-green-600" />
                        </div>
                        <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Year {roadmap.length}</div>
                        <div className="text-2xl font-bold text-green-700">{formatINR(endSalary)}</div>
                        <div className="text-[10px] text-green-500 mt-1">Projected</div>
                    </motion.div>

                    <motion.div
                        variants={countUp}
                        className="relative p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200/50 overflow-hidden group hover:shadow-lg transition-shadow"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-12 h-12 text-purple-600" />
                        </div>
                        <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Growth</div>
                        <div className="text-2xl font-bold text-purple-700">+{growthPercent}%</div>
                        <div className="text-[10px] text-purple-500 mt-1">Over {roadmap.length} years</div>
                    </motion.div>

                    <motion.div
                        variants={countUp}
                        className="relative p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200/50 overflow-hidden group hover:shadow-lg transition-shadow"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="w-12 h-12 text-amber-600" />
                        </div>
                        <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Top 25%</div>
                        <div className="text-2xl font-bold text-amber-700">{formatINR(topEarning)}</div>
                        <div className="text-[10px] text-amber-500 mt-1">Potential</div>
                    </motion.div>
                </motion.div>

                {/* Chart with animation */}
                <motion.div
                    variants={fadeInUp}
                    className="bg-gradient-to-b from-slate-50 to-white rounded-xl p-4 border border-slate-100"
                >
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSalaryHero" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMarketHero" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                                dataKey="shortYear"
                                stroke="#94a3b8"
                                tick={{ fontSize: 12 }}
                                axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => formatINR(value)}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                formatter={(value, name) => [formatINR(value), name]}
                                labelFormatter={(label) => chartData.find(d => d.shortYear === label)?.role || label}
                                contentStyle={{
                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="salary"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorSalaryHero)"
                                name="Your Path"
                                animationDuration={1500}
                                animationEasing="ease-out"
                            />
                            <Area
                                type="monotone"
                                dataKey="marketAvg"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorMarketHero)"
                                name="Market Avg"
                                animationDuration={1500}
                                animationEasing="ease-out"
                            />
                            <Line
                                type="monotone"
                                dataKey="topPercentile"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                strokeDasharray="6 4"
                                name="Top 25%"
                                dot={false}
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-xs text-slate-600">Your Path</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-xs text-slate-600">Market Average</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-amber-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 6px, transparent 6px, transparent 10px)' }} />
                            <span className="text-xs text-slate-600">Top Performers</span>
                        </div>
                    </div>
                </motion.div>

                {/* Insight Box */}
                <motion.div
                    variants={fadeInUp}
                    className="mt-6 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-indigo-900 mb-1">
                                💡 Salary Insight
                            </p>
                            <p className="text-sm text-indigo-700">
                                Following this roadmap, you could earn <span className="font-bold">{formatINR(endSalary - startSalary)}</span> more
                                annually by Year {roadmap.length} compared to your starting salary.
                                Top performers in this path often reach <span className="font-bold">{formatINR(topEarning)}</span>+.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </Card>
        </motion.div>
    );
}
