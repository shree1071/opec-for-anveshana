import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Users, Linkedin, Mail } from 'lucide-react';

export function MentorMatch({ field }) {
    // Mock mentor data - in production, this would come from API/database
    const mentors = [
        {
            name: 'Priya Sharma',
            role: 'Senior Marketing Manager',
            company: 'Google India',
            expertise: ['Digital Marketing', 'SEO', 'Content Strategy'],
            linkedin: 'https://linkedin.com',
            image: '👩‍💼'
        },
        {
            name: 'Rahul Verma',
            role: 'Lead Software Engineer',
            company: 'Microsoft',
            expertise: ['Full Stack', 'Cloud', 'System Design'],
            linkedin: 'https://linkedin.com',
            image: '👨‍💻'
        },
        {
            name: 'Ananya Patel',
            role: 'Product Manager',
            company: 'Amazon',
            expertise: ['Product Strategy', 'Agile', 'User Research'],
            linkedin: 'https://linkedin.com',
            image: '👩‍💼'
        }
    ];

    return (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-indigo-600" />
                <div>
                    <h3 className="text-xl font-bold text-slate-900">👥 Mentor Matching</h3>
                    <p className="text-sm text-slate-600">Connect with industry experts in your field</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentors.map((mentor, index) => (
                    <div
                        key={index}
                        className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start gap-3 mb-3">
                            <div className="text-4xl">{mentor.image}</div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900">{mentor.name}</h4>
                                <p className="text-sm text-slate-600">{mentor.role}</p>
                                <p className="text-xs text-blue-600">{mentor.company}</p>
                            </div>
                        </div>

                        <div className="mb-3">
                            <p className="text-xs text-slate-500 mb-2">Expertise:</p>
                            <div className="flex flex-wrap gap-1">
                                {mentor.expertise.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
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
                            <Button className="flex-1 text-xs">
                                <Mail className="w-3 h-3 mr-1" />
                                Connect
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Mentors are matched based on your career goals and field of interest.
                    Reach out to start building your professional network!
                </p>
            </div>
        </Card>
    );
}
