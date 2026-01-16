import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Globe, Phone, Mail, Award, BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const CollegeCard = ({ college }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5 }}
            className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'shadow-xl border-indigo-200 ring-1 ring-indigo-100' : 'shadow-sm border-gray-100 hover:shadow-md'
                }`}
        >
            <div className="p-5">
                {/* Header Section */}
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${college.type === 'government' ? 'bg-green-100 text-green-700' :
                                    college.type === 'aided' ? 'bg-blue-100 text-blue-700' :
                                        'bg-orange-100 text-orange-700'
                                }`}>
                                {college.type.charAt(0).toUpperCase() + college.type.slice(1)}
                            </span>
                            {college.autonomous && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                                    <Award size={12} /> Autonomous
                                </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Code: {college.code}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                            {college.name}
                        </h3>

                        <div className="flex items-center text-sm text-gray-500 gap-1 mb-3">
                            <MapPin size={14} className="text-gray-400" />
                            <span>{college.city}, {college.region} Region</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Preview */}
                {!isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <BookOpen size={14} />
                            <span>{college.courses?.length || 0} Courses</span>
                        </div>
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                            View Details <ChevronDown size={14} />
                        </button>
                    </div>
                )}

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 mt-2 border-t border-dashed border-gray-200 space-y-4">

                                {/* Courses */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <BookOpen size={14} /> Available Courses
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {college.courses?.map((course, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-100">
                                                {course}
                                            </span>
                                        )) || <span className="text-sm text-gray-400">No course data available</span>}
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
                                    {college.website && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Globe size={14} className="text-indigo-500" />
                                            <a
                                                href={college.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline flex items-center gap-1"
                                            >
                                                {college.website.replace(/^https?:\/\//, '')} <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    )}
                                    {college.contact_info?.email && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Mail size={14} className="text-red-400" />
                                            <a href={`mailto:${college.contact_info.email}`} className="hover:underline">
                                                {college.contact_info.email}
                                            </a>
                                        </div>
                                    )}
                                    {college.contact_info?.phone && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Phone size={14} className="text-green-500" />
                                            <span>{college.contact_info.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={() => setIsExpanded(false)}
                                        className="text-xs font-medium text-gray-400 hover:text-gray-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                                    >
                                        Show Less <ChevronUp size={12} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default CollegeCard;
