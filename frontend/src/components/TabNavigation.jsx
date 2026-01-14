import { motion } from 'framer-motion';

export function TabNavigation({ activeTab, setActiveTab, tabs }) {
    return (
        <div className="border-b border-slate-200 mb-8">
            <div className="flex gap-1 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'text-blue-600'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            {tab.icon}
                            {tab.label}
                        </span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
