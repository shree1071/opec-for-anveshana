import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Newspaper, ExternalLink, TrendingUp, Clock, Calendar, ArrowRight } from 'lucide-react';
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export function IndustryNews({ field }) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (field) {
            fetchNews();
        }
    }, [field]);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/mcp/news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field, max_results: 4 })
            });
            const data = await response.json();

            if (data.success) {
                setArticles(data.articles || []);
            }
        } catch (err) {
            console.error('News fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <Card className="p-6 h-full flex flex-col justify-center items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Newspaper className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-3 w-full max-w-xs">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4 mx-auto" />
                </div>
            </Card>
        );
    }

    if (articles.length === 0) return null;

    return (
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-slate-50">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
                        <Newspaper className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Industry Pulse</h3>
                        <p className="text-xs text-slate-500 font-medium">Trending in {field}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <TrendingUp className="w-3 h-3" />
                    Live
                </div>
            </div>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="p-4 grid gap-4"
            >
                {articles.map((article, index) => (
                    <motion.a
                        key={index}
                        variants={itemVariant}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex gap-4 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100"
                    >
                        {/* Image */}
                        <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-slate-200 relative">
                            {article.image ? (
                                <img
                                    src={article.image}
                                    alt=""
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                    <Newspaper className="w-8 h-8 text-slate-300" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors">
                                    {article.title}
                                </h4>
                                {article.body && (
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                        {article.body}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/50">
                                <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
                                    {article.source && (
                                        <span className="text-slate-600 px-1.5 py-0.5 bg-slate-100 rounded">
                                            {article.source}
                                        </span>
                                    )}
                                    {article.date && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(article.date)}
                                        </span>
                                    )}
                                </div>
                                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                            </div>
                        </div>
                    </motion.a>
                ))}
            </motion.div>
        </Card>
    );
}
