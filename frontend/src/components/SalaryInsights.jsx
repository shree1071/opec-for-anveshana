import { Card } from './ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

export function SalaryInsights({ roadmap, salaryProjection }) {
    // Format number in Indian style (lakhs)
    const formatINR = (value) => {
        const lakhs = value / 100000;
        return `₹${lakhs.toFixed(1)}L`;
    };

    // Parse salary projection and create chart data
    const createChartData = () => {
        return roadmap.map((year, index) => {
            // Estimate salary based on progression (in INR)
            const baseSalary = 600000; // ₹6 LPA starting
            const increment = 200000; // ₹2 LPA increment per year
            const estimatedSalary = baseSalary + (index * increment);

            return {
                year: `Year ${year.year}`,
                role: year.role,
                salary: estimatedSalary,
                marketAvg: estimatedSalary * 0.95,
                topPercentile: estimatedSalary * 1.25
            };
        });
    };

    const data = createChartData();

    return (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <div>
                    <h3 className="text-xl font-bold text-slate-900">💰 Salary Progression</h3>
                    <p className="text-sm text-slate-600">Projected earnings over your career path (in INR)</p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" stroke="#64748b" />
                    <YAxis
                        stroke="#64748b"
                        tickFormatter={(value) => formatINR(value)}
                    />
                    <Tooltip
                        formatter={(value) => formatINR(value)}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="salary"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorSalary)"
                        name="Your Projection"
                    />
                    <Area
                        type="monotone"
                        dataKey="marketAvg"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorMarket)"
                        name="Market Average"
                    />
                    <Line
                        type="monotone"
                        dataKey="topPercentile"
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        name="Top 25%"
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formatINR(data[0].salary)}</div>
                    <div className="text-xs text-slate-600">Starting</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formatINR(data[data.length - 1].salary)}</div>
                    <div className="text-xs text-slate-600">Year {roadmap.length}</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                        +{(((data[data.length - 1].salary - data[0].salary) / data[0].salary) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-600">Growth</div>
                </div>
            </div>
        </Card>
    );
}
