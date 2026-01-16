import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Loader2 } from 'lucide-react';
import CollegeCard from '../components/CollegeCard';
import CollegeFilters from '../components/CollegeFilters';
import CollegeStats from '../components/CollegeStats';
import { Layout } from '../components/Layout';

const CollegeDirectory = () => {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');
    const [filters, setFilters] = useState({
        region: '',
        type: '',
        autonomous: false
    });
    const [stats, setStats] = useState(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchColleges = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('colleges')
                .select('*');

            // Apply Search
            if (searchDebounce) {
                query = query.ilike('name', `%${searchDebounce}%`);
            }

            // Apply Filters
            if (filters.region) {
                query = query.eq('region', filters.region);
            }
            if (filters.type) {
                query = query.eq('type', filters.type);
            }
            if (filters.autonomous) {
                query = query.eq('autonomous', true);
            }

            const { data, error } = await query.order('name');

            if (error) throw error;
            setColleges(data || []);

            // Calculate Stats if not present
            if (!stats && data) {
                // In a real app, this might come from a separate RPC or stats endpoint
                // For now, we'll calculate from the first fetch if minimal filtering
                // Or just fallback to client side calc on filtered data
                calculateClientStats(data);
            }
        } catch (error) {
            console.error('Error fetching colleges:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateClientStats = (data) => {
        // Simple client side stats derived from current view/or preferably a separate full fetch
        // For this demo, let's just count what we have or skip if filtered too much
        const statsObj = {
            total_colleges: data.length,
            autonomous_count: data.filter(c => c.autonomous).length,
            by_type: {
                private: data.filter(c => c.type === 'private').length
            },
            by_region: {
                Bangalore: data.filter(c => c.region === 'Bangalore').length
            }
        };
        setStats(statsObj);
    };

    useEffect(() => {
        fetchColleges();
    }, [searchDebounce, filters]);

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50/50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">VTU College Directory</h1>
                        <p className="text-gray-600">Discover engineering colleges across Karnataka affiliated with Visvesvaraya Technological University.</p>
                    </div>

                    <CollegeStats stats={stats} />

                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Sidebar Filters */}
                        <div className="w-full lg:w-64 flex-shrink-0">
                            <CollegeFilters
                                filters={filters}
                                setFilters={setFilters}
                                onReset={() => setFilters({ region: '', type: '', autonomous: false })}
                            />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">

                            {/* Search Bar */}
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by college name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                                />
                            </div>

                            {/* Results */}
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                                </div>
                            ) : colleges.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {colleges.map(college => (
                                        <CollegeCard key={college.id} college={college} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-500">No colleges found matching your criteria.</p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilters({ region: '', type: '', autonomous: false });
                                        }}
                                        className="mt-2 text-indigo-600 hover:underline text-sm font-medium"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CollegeDirectory;
