import React from 'react';
import { Filter, X } from 'lucide-react';

const CollegeFilters = ({ filters, setFilters, onReset }) => {
    const regions = ['Bangalore', 'Mysore', 'Belgaum', 'Gulbarga'];
    const types = ['Private', 'Government', 'Aided'];

    const handleRegionChange = (region) => {
        setFilters(prev => ({ ...prev, region: prev.region === region ? '' : region }));
    };

    const handleTypeChange = (type) => {
        const value = type.toLowerCase();
        setFilters(prev => ({ ...prev, type: prev.type === value ? '' : value }));
    };

    const handleAutonomousToggle = () => {
        setFilters(prev => ({ ...prev, autonomous: !prev.autonomous }));
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Filter size={18} /> Filters
                </h3>
                {(filters.region || filters.type || filters.autonomous) && (
                    <button
                        onClick={onReset}
                        className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                    >
                        <X size={12} /> Reset
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Region Filter */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Region
                    </label>
                    <div className="space-y-2">
                        {regions.map(region => (
                            <label key={region} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="region"
                                    checked={filters.region === region}
                                    onChange={() => handleRegionChange(region)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                />
                                <span className={`text-sm group-hover:text-indigo-600 transition-colors ${filters.region === region ? 'text-gray-900 font-medium' : 'text-gray-600'
                                    }`}>
                                    {region} Region
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Type Filter */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Institution Type
                    </label>
                    <div className="space-y-2">
                        {types.map(type => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={filters.type === type.toLowerCase()}
                                    onChange={() => handleTypeChange(type)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className={`text-sm group-hover:text-indigo-600 transition-colors ${filters.type === type.toLowerCase() ? 'text-gray-900 font-medium' : 'text-gray-600'
                                    }`}>
                                    {type}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Autonomous Toggle */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Only Autonomous</span>
                        <button
                            onClick={handleAutonomousToggle}
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${filters.autonomous ? 'bg-indigo-600' : 'bg-gray-200'
                                }`}
                        >
                            <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${filters.autonomous ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollegeFilters;
