import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { PlayCircle, ExternalLink, Clock, Eye, MonitorPlay, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariant = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
};

export function LearningVideos({ skill }) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (skill) {
            fetchVideos();
        }
    }, [skill]);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/mcp/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill, max_results: 4 })
            });
            const data = await response.json();

            if (data.success) {
                setVideos(data.videos || []);
            }
        } catch (err) {
            console.error('Video fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="p-6 h-full flex flex-col justify-center items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <PlayCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="space-y-3 w-full max-w-xs">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                        <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                    </div>
                </div>
            </Card>
        );
    }

    if (videos.length === 0) return null;

    return (
        <Card className="overflow-hidden border-none shadow-lg bg-white">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-500/20">
                        <MonitorPlay className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Recommended Learning</h3>
                        <p className="text-xs text-slate-500 font-medium">Top tutorials for {skill}</p>
                    </div>
                </div>
                <button className="text-xs text-red-600 font-bold hover:underline">
                    View All
                </button>
            </div>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
                {videos.map((video, index) => (
                    <motion.a
                        key={index}
                        variants={itemVariant}
                        href={video.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -4 }}
                        className="group block bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all border border-slate-100"
                    >
                        {/* Thumbnail Container */}
                        <div className="relative aspect-video bg-slate-100 overflow-hidden">
                            {video.thumbnail ? (
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                    <PlayCircle className="w-12 h-12 text-white/50" />
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300">
                                    <PlayCircle className="w-6 h-6 text-white ml-0.5" />
                                </div>
                            </div>

                            {/* Duration Badge */}
                            {video.duration && (
                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-bold text-white flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {video.duration}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-3">
                            <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2 mb-2 group-hover:text-red-600 transition-colors h-8">
                                {video.title}
                            </h4>

                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                                {video.channel && (
                                    <span className="font-medium truncate max-w-[60%]">
                                        {video.channel}
                                    </span>
                                )}
                                {video.views && (
                                    <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded-full">
                                        <Eye className="w-3 h-3" />
                                        {video.views}
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.a>
                ))}
            </motion.div>

            <div className="p-3 bg-red-50/50 border-t border-red-100/50 text-center">
                <p className="text-[10px] text-red-600/80 font-medium flex items-center justify-center gap-1.5">
                    <Zap className="w-3 h-3 fill-current" />
                    Video tutorials accelerate learning by 60%
                </p>
            </div>
        </Card>
    );
}
