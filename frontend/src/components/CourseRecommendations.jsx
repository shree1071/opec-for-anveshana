import { Card } from './ui/Card';
import { ExternalLink, Star, Clock } from 'lucide-react';

export function CourseRecommendations({ skills }) {
    // Mock course data - in production, this would call an API
    const getCourses = (skill) => {
        const mockCourses = {
            'React': [
                { title: 'Advanced React & Redux', platform: 'Udemy', rating: 4.7, duration: '40 hours', url: 'https://udemy.com' },
                { title: 'React - The Complete Guide', platform: 'Udemy', rating: 4.8, duration: '48 hours', url: 'https://udemy.com' }
            ],
            'Python': [
                { title: 'Complete Python Bootcamp', platform: 'Udemy', rating: 4.6, duration: '22 hours', url: 'https://udemy.com' },
                { title: 'Python for Data Science', platform: 'Coursera', rating: 4.7, duration: '30 hours', url: 'https://coursera.org' }
            ],
            'Cloud': [
                { title: 'AWS Certified Solutions Architect', platform: 'Udemy', rating: 4.7, duration: '25 hours', url: 'https://udemy.com' },
                { title: 'Azure Fundamentals', platform: 'Microsoft Learn', rating: 4.5, duration: '15 hours', url: 'https://learn.microsoft.com' }
            ]
        };

        // Find matching courses
        for (const [key, courses] of Object.entries(mockCourses)) {
            if (skill.toLowerCase().includes(key.toLowerCase())) {
                return courses;
            }
        }

        // Default generic courses
        return [
            { title: `Master ${skill}`, platform: 'Udemy', rating: 4.5, duration: '20 hours', url: 'https://udemy.com' }
        ];
    };

    const allSkills = skills.slice(0, 3); // Show top 3 skills

    return (
        <Card className="p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">📚 Recommended Courses</h3>
            <p className="text-sm text-slate-600 mb-6">Top courses to acquire your target skills</p>

            <div className="space-y-6">
                {allSkills.map((skill, idx) => {
                    const courses = getCourses(skill);
                    return (
                        <div key={idx}>
                            <h4 className="font-semibold text-slate-800 mb-3">{skill}</h4>
                            <div className="space-y-3">
                                {courses.map((course, i) => (
                                    <div key={i} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div className="flex-1">
                                            <h5 className="font-medium text-slate-900 text-sm">{course.title}</h5>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    {course.rating}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {course.duration}
                                                </span>
                                                <span className="text-blue-600">{course.platform}</span>
                                            </div>
                                        </div>
                                        <a
                                            href={course.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-3 text-blue-600 hover:text-blue-700"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
