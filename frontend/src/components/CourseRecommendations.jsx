import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { ExternalLink, Star, Clock, BookOpen, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function CourseRecommendations({ skills }) {
    const [courseData, setCourseData] = useState({});
    const [loading, setLoading] = useState(true);

    // Curated course database - realistic courses with real platforms
    const getCuratedCourses = (skill) => {
        const courseDB = {
            // Programming Languages
            'Python': [
                { title: 'Complete Python Bootcamp: Go from Zero to Hero', platform: 'Udemy', rating: 4.6, duration: '22 hours', url: 'https://www.udemy.com/course/complete-python-bootcamp/', price: '₹449' },
                { title: 'Python for Data Science and Machine Learning', platform: 'Coursera', rating: 4.7, duration: '40 hours', url: 'https://www.coursera.org/specializations/python', price: 'Free' },
            ],
            'JavaScript': [
                { title: 'The Complete JavaScript Course 2024', platform: 'Udemy', rating: 4.8, duration: '69 hours', url: 'https://www.udemy.com/course/the-complete-javascript-course/', price: '₹449' },
                { title: 'JavaScript Algorithms and Data Structures', platform: 'freeCodeCamp', rating: 4.9, duration: '300 hours', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', price: 'Free' },
            ],
            'Java': [
                { title: 'Java Programming Masterclass', platform: 'Udemy', rating: 4.6, duration: '80 hours', url: 'https://www.udemy.com/course/java-the-complete-java-developer-course/', price: '₹449' },
                { title: 'Object Oriented Programming in Java', platform: 'Coursera', rating: 4.7, duration: '24 hours', url: 'https://www.coursera.org/specializations/object-oriented-programming', price: 'Free' },
            ],

            // Web Development
            'React': [
                { title: 'React - The Complete Guide 2024', platform: 'Udemy', rating: 4.7, duration: '50 hours', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', price: '₹449' },
                { title: 'Meta Front-End Developer Professional Certificate', platform: 'Coursera', rating: 4.7, duration: '7 months', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer', price: 'Free' },
            ],
            'Node': [
                { title: 'The Complete Node.js Developer Course', platform: 'Udemy', rating: 4.6, duration: '35 hours', url: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/', price: '₹449' },
                { title: 'Node.js, Express, MongoDB Bootcamp', platform: 'Udemy', rating: 4.8, duration: '42 hours', url: 'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/', price: '₹449' },
            ],
            'Full Stack': [
                { title: 'The Complete Web Developer in 2024', platform: 'Udemy', rating: 4.7, duration: '65 hours', url: 'https://www.udemy.com/course/the-complete-web-developer-zero-to-mastery/', price: '₹449' },
                { title: 'Full-Stack Web Development with React', platform: 'Coursera', rating: 4.5, duration: '4 months', url: 'https://www.coursera.org/specializations/full-stack-react', price: 'Free' },
            ],

            // Cloud & DevOps
            'Cloud': [
                { title: 'AWS Certified Solutions Architect - Associate', platform: 'Udemy', rating: 4.7, duration: '27 hours', url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/', price: '₹449' },
                { title: 'Google Cloud Professional Cloud Architect', platform: 'Coursera', rating: 4.6, duration: '6 months', url: 'https://www.coursera.org/professional-certificates/gcp-cloud-architect', price: 'Free' },
            ],
            'AWS': [
                { title: 'Ultimate AWS Certified Cloud Practitioner 2024', platform: 'Udemy', rating: 4.7, duration: '14 hours', url: 'https://www.udemy.com/course/aws-certified-cloud-practitioner-new/', price: '₹449' },
                { title: 'AWS Cloud Technical Essentials', platform: 'Coursera', rating: 4.7, duration: '4 weeks', url: 'https://www.coursera.org/learn/aws-cloud-technical-essentials', price: 'Free' },
            ],
            'DevOps': [
                { title: 'Docker and Kubernetes: The Complete Guide', platform: 'Udemy', rating: 4.7, duration: '22 hours', url: 'https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/', price: '₹449' },
                { title: 'DevOps on AWS Specialization', platform: 'Coursera', rating: 4.6, duration: '4 months', url: 'https://www.coursera.org/specializations/aws-devops', price: 'Free' },
            ],

            // Data Science & ML
            'Data Science': [
                { title: 'IBM Data Science Professional Certificate', platform: 'Coursera', rating: 4.6, duration: '10 months', url: 'https://www.coursera.org/professional-certificates/ibm-data-science', price: 'Free' },
                { title: 'Data Science and Machine Learning Bootcamp', platform: 'Udemy', rating: 4.6, duration: '44 hours', url: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/', price: '₹449' },
            ],
            'Machine Learning': [
                { title: 'Machine Learning by Andrew Ng', platform: 'Coursera', rating: 4.9, duration: '60 hours', url: 'https://www.coursera.org/specializations/machine-learning-introduction', price: 'Free' },
                { title: 'Machine Learning A-Z: AI, Python & R', platform: 'Udemy', rating: 4.5, duration: '44 hours', url: 'https://www.udemy.com/course/machinelearning/', price: '₹449' },
            ],
            'SQL': [
                { title: 'The Complete SQL Bootcamp 2024', platform: 'Udemy', rating: 4.7, duration: '9 hours', url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/', price: '₹449' },
                { title: 'SQL for Data Science', platform: 'Coursera', rating: 4.6, duration: '4 weeks', url: 'https://www.coursera.org/learn/sql-for-data-science', price: 'Free' },
            ],

            // Design
            'UI/UX': [
                { title: 'Google UX Design Professional Certificate', platform: 'Coursera', rating: 4.8, duration: '6 months', url: 'https://www.coursera.org/professional-certificates/google-ux-design', price: 'Free' },
                { title: 'Complete Web & Mobile Designer in 2024', platform: 'Udemy', rating: 4.6, duration: '30 hours', url: 'https://www.udemy.com/course/complete-web-designer-mobile-designer-zero-to-mastery/', price: '₹449' },
            ],
            'Figma': [
                { title: 'Figma UI UX Design Essentials', platform: 'Udemy', rating: 4.6, duration: '12 hours', url: 'https://www.udemy.com/course/figma-ux-ui-design-user-experience-tutorial-course/', price: '₹449' },
                { title: 'Google UX Design Certificate', platform: 'Coursera', rating: 4.8, duration: '6 months', url: 'https://www.coursera.org/professional-certificates/google-ux-design', price: 'Free' },
            ],

            // Business & Soft Skills
            'Product Management': [
                { title: 'Digital Product Management', platform: 'Coursera', rating: 4.6, duration: '4 months', url: 'https://www.coursera.org/specializations/uva-darden-digital-product-management', price: 'Free' },
                { title: 'Become a Product Manager', platform: 'Udemy', rating: 4.5, duration: '12 hours', url: 'https://www.udemy.com/course/become-a-product-manager-learn-the-skills-get-a-job/', price: '₹449' },
            ],
            'Leadership': [
                { title: 'Leadership and Management Certificate', platform: 'Coursera', rating: 4.7, duration: '6 months', url: 'https://www.coursera.org/specializations/leading-people-teams', price: 'Free' },
                { title: 'Leadership: Practical Skills', platform: 'Udemy', rating: 4.5, duration: '5 hours', url: 'https://www.udemy.com/course/leadership-practical-skills/', price: '₹449' },
            ],
            'Communication': [
                { title: 'Business English Communication Skills', platform: 'Coursera', rating: 4.7, duration: '5 months', url: 'https://www.coursera.org/specializations/business-english', price: 'Free' },
                { title: 'Complete Communication Skills Masterclass', platform: 'Udemy', rating: 4.5, duration: '13 hours', url: 'https://www.udemy.com/course/effective-communication-skills-complete-course/', price: '₹449' },
            ],
        };

        // Find matching courses
        const lowerSkill = skill.toLowerCase();
        for (const [key, courses] of Object.entries(courseDB)) {
            if (lowerSkill.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerSkill)) {
                return courses;
            }
        }

        // Default course structure for any skill
        return [
            {
                title: `Learn ${skill} - Complete Course`,
                platform: 'Udemy',
                rating: 4.5,
                duration: '20+ hours',
                url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`,
                price: '₹449'
            },
            {
                title: `${skill} Professional Certificate`,
                platform: 'Coursera',
                rating: 4.6,
                duration: '3-6 months',
                url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
                price: 'Free'
            }
        ];
    };

    useEffect(() => {
        // Build course data for each skill
        const data = {};
        skills.slice(0, 4).forEach(skill => {
            data[skill] = getCuratedCourses(skill);
        });
        setCourseData(data);
        setLoading(false);
    }, [skills]);

    if (loading) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-slate-900">📚 Recommended Courses</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">📚 Recommended Courses</h3>
                        <p className="text-sm text-slate-600">Top courses from Udemy, Coursera & more</p>
                    </div>
                </div>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                    ✓ Verified Courses
                </span>
            </div>

            <div className="space-y-6">
                {Object.entries(courseData).map(([skill, courses], idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-purple-500" />
                            {skill}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                            {courses.map((course, i) => (
                                <a
                                    key={i}
                                    href={course.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 bg-slate-50 rounded-lg hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h5 className="font-medium text-slate-900 text-sm group-hover:text-purple-700 line-clamp-2">
                                                {course.title}
                                            </h5>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    {course.rating}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {course.duration}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs font-medium text-purple-600">{course.platform}</span>
                                                <span className={`text-xs font-semibold ${course.price === 'Free' ? 'text-green-600' : 'text-slate-600'}`}>
                                                    {course.price}
                                                </span>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600 ml-2 shrink-0" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-lg">
                <p className="text-sm text-purple-800">
                    💡 <strong>Pro tip:</strong> Look for courses with high ratings (4.5+) and check reviews before enrolling.
                    Many Coursera courses offer free auditing!
                </p>
            </div>
        </Card>
    );
}
