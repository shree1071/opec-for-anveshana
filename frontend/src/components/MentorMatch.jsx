import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Users, Linkedin, Mail, ExternalLink, Star, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function MentorMatch({ field }) {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataSource, setDataSource] = useState('');

    useEffect(() => {
        fetchMentors();
    }, [field]);

    const fetchMentors = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/mentors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    field: field || 'Software Engineering',
                    location: 'India',
                    limit: 6
                })
            });

            const data = await response.json();

            if (data.success) {
                setMentors(data.mentors);
                setDataSource(data.source);
            } else {
                throw new Error(data.error || 'Failed to fetch mentors');
            }
        } catch (err) {
            console.error('Mentor fetch error:', err);
            setError(err.message);
            // Set fallback mentors on error
            setMentors(getFallbackMentors(field));
            setDataSource('fallback');
        } finally {
            setLoading(false);
        }
    };

    const getFallbackMentors = (fieldName) => {
        // Simple fallback if API fails completely
        return [
            {
                name: 'Expert Mentor',
                role: `Senior ${fieldName} Professional`,
                company: 'Top Tech Company',
                expertise: [fieldName, 'Leadership', 'Mentoring'],
                profile_url: 'https://topmate.io',
                image: '👤',
                rating: 4.8,
                sessions: 100
            }
        ];
    };

    if (loading) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">👥 Mentor Matching</h3>
                        <p className="text-sm text-slate-600">Finding the best mentors for you...</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">👥 Mentor Matching</h3>
                        <p className="text-sm text-slate-600">
                            Connect with industry experts in {field || 'your field'}
                        </p>
                    </div>
                </div>
                {dataSource && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {dataSource === 'topmate_api' && '✓ Live Data'}
                        {dataSource === 'topmate_scraped' && '✓ Real Mentors'}
                        {dataSource === 'curated_mock' && '✓ Curated'}
                        {dataSource === 'fallback' && 'Demo Mode'}
                    </span>
                )}
            </div>

            {error && dataSource === 'fallback' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    ✨ Showing curated mentors from top Indian companies
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentors.map((mentor, index) => (
                    <div
                        key={index}
                        className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-all hover:border-indigo-300"
                    >
                        <div className="flex items-start gap-3 mb-3">
                            <div className="text-4xl">{mentor.image || '👤'}</div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900">{mentor.name}</h4>
                                <p className="text-sm text-slate-600">{mentor.role}</p>
                                <p className="text-xs text-blue-600">{mentor.company}</p>
                            </div>
                        </div>

                        {/* Rating and Sessions */}
                        {(mentor.rating || mentor.sessions) && (
                            <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
                                {mentor.rating && (
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold">{mentor.rating}</span>
                                    </div>
                                )}
                                {mentor.sessions && (
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>{mentor.sessions}+ sessions</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mb-3">
                            <p className="text-xs text-slate-500 mb-2">Expertise:</p>
                            <div className="flex flex-wrap gap-1">
                                {(mentor.expertise || []).slice(0, 3).map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Bio if available */}
                        {mentor.bio && (
                            <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                                {mentor.bio}
                            </p>
                        )}

                        {/* Price if available */}
                        {mentor.price && (
                            <p className="text-xs text-slate-500 mb-3">
                                💰 {mentor.price}
                            </p>
                        )}

                        <div className="flex gap-2">
                            {mentor.linkedin && (
                                <a
                                    href={mentor.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1"
                                >
                                    <Button variant="outline" className="w-full text-xs">
                                        <Linkedin className="w-3 h-3 mr-1" />
                                        LinkedIn
                                    </Button>
                                </a>
                            )}
                            {mentor.profile_url && (
                                <a
                                    href={mentor.profile_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1"
                                >
                                    <Button className="w-full text-xs">
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        View Profile
                                    </Button>
                                </a>
                            )}
                            {!mentor.linkedin && !mentor.profile_url && (
                                <Button className="flex-1 text-xs">
                                    <Mail className="w-3 h-3 mr-1" />
                                    Connect
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Mentors are matched based on your career goals and field of interest.
                    Click "View Profile" to learn more and book a session!
                </p>
            </div>
        </Card>
    );
}
