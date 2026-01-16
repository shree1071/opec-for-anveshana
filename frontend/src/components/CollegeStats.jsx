import React from 'react';
import { motion } from 'framer-motion';
import { School, Award, Building, Users } from 'lucide-react';

const CollegeStats = ({ stats }) => {
    if (!stats) return null;

    const items = [
        { label: 'Total Colleges', value: stats.total_colleges || 0, icon: School, color: 'bg-indigo-100 text-indigo-600' },
        { label: 'Autonomous', value: stats.autonomous_count || 0, icon: Award, color: 'bg-purple-100 text-purple-600' },
        { label: 'Private', value: stats.by_type?.private || 0, icon: Building, color: 'bg-orange-100 text-orange-600' },
        { label: 'Bangalore Region', value: stats.by_region?.Bangalore || 0, icon: Users, color: 'bg-blue-100 text-blue-600' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {items.map((item, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
                >
                    <div className={`p-3 rounded-lg ${item.color}`}>
                        <item.icon size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                        <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default CollegeStats;
