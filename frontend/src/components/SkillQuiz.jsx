import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Brain, CheckCircle, XCircle, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export function SkillQuiz({ field }) {
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [quizComplete, setQuizComplete] = useState(false);

    // Better quiz questions based on field
    const getQuestions = () => {
        const baseQuestions = [
            {
                question: `What is your current experience level in ${field || 'your field'}?`,
                options: [
                    'Complete beginner - just starting out',
                    'Some experience - 6 months to 1 year',
                    'Intermediate - 1-3 years of practice',
                    'Advanced - 3+ years of expertise'
                ],
                correct: 2
            },
            {
                question: 'How do you prefer to learn new skills?',
                options: [
                    'Hands-on projects and building things',
                    'Structured courses and tutorials',
                    'Reading documentation and books',
                    'Learning from mentors and peers'
                ],
                correct: 0
            },
            {
                question: 'What motivates you most in your career?',
                options: [
                    'High salary and financial growth',
                    'Creative freedom and innovation',
                    'Making a positive impact',
                    'Job security and stability'
                ],
                correct: 1
            },
            {
                question: 'How comfortable are you with taking on new challenges?',
                options: [
                    'I prefer staying in my comfort zone',
                    'I take calculated risks when necessary',
                    'I actively seek challenging opportunities',
                    'I thrive on constant change and uncertainty'
                ],
                correct: 2
            },
            {
                question: 'What is your biggest career obstacle right now?',
                options: [
                    'Lack of technical skills',
                    'Limited networking opportunities',
                    'Unclear career direction',
                    'Work-life balance issues'
                ],
                correct: 2
            }
        ];
        return baseQuestions;
    };

    const questions = getQuestions();

    // Save quiz results
    const saveQuizResults = async (score, level) => {
        try {
            // Save to localStorage for persistence
            const quizResult = {
                field,
                score,
                level,
                answers,
                completedAt: new Date().toISOString()
            };
            localStorage.setItem('opec_skill_quiz', JSON.stringify(quizResult));

            // Optionally save to backend
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await fetch(`${API_URL}/api/skill-assessment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quizResult)
            }).catch(() => { }); // Silent fail if API not available
        } catch (e) {
            console.log('Quiz save to localStorage');
        }
    };

    const handleAnswer = (optionIndex) => {
        const newAnswers = [...answers, optionIndex];
        setAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setQuizComplete(true);
        }
    };

    const calculateScore = () => {
        const correct = answers.filter((ans, idx) => ans === questions[idx].correct).length;
        return Math.round((correct / questions.length) * 100);
    };

    const getSkillLevel = (score) => {
        if (score >= 80) return { level: 'Advanced', color: 'text-green-600', bg: 'bg-green-50', icon: '🏆' };
        if (score >= 50) return { level: 'Intermediate', color: 'text-blue-600', bg: 'bg-blue-50', icon: '📈' };
        return { level: 'Beginner', color: 'text-orange-600', bg: 'bg-orange-50', icon: '🌱' };
    };

    const getPersonalizedTips = (score, answers) => {
        const tips = [];

        // Based on experience level (question 1)
        if (answers[0] === 0) tips.push('Start with fundamentals - free online courses are perfect for you');
        if (answers[0] === 3) tips.push('Consider mentorship roles to solidify expertise');

        // Based on learning style (question 2)
        if (answers[1] === 0) tips.push('Focus on hands-on projects over theory');
        if (answers[1] === 1) tips.push('Enroll in structured courses like Coursera or Udemy');
        if (answers[1] === 3) tips.push('Join communities like Discord or attend tech meetups');

        // Based on motivation (question 3)
        if (answers[2] === 0) tips.push('Target high-paying companies and negotiate skills');
        if (answers[2] === 2) tips.push('Explore social impact startups and NGO tech roles');

        return tips.slice(0, 3);
    };

    if (!quizStarted) {
        return (
            <Card className="p-8">
                <div className="text-center">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block mb-4"
                    >
                        <Brain className="w-16 h-16 text-purple-600 mx-auto" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">🧠 Skill Assessment Quiz</h3>
                    <p className="text-slate-600 mb-2">
                        Take a quick {questions.length}-question quiz to validate your current skill level.
                    </p>
                    <p className="text-sm text-slate-500 mb-6">
                        This helps us personalize your roadmap based on your experience.
                    </p>
                    <Button onClick={() => setQuizStarted(true)} className="px-8 py-3">
                        Start Assessment →
                    </Button>
                </div>
            </Card>
        );
    }

    if (quizComplete) {
        const score = calculateScore();
        const { level, color, bg, icon } = getSkillLevel(score);
        const tips = getPersonalizedTips(score, answers);

        // Save results
        saveQuizResults(score, level);

        return (
            <Card className="p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                    >
                        <Award className="w-20 h-20 text-green-600 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">Quiz Complete! 🎉</h3>

                    <div className={`inline-block px-8 py-6 ${bg} rounded-2xl mb-6 shadow-lg`}>
                        <p className="text-sm text-slate-600 mb-2">Your Skill Level</p>
                        <p className="text-6xl mb-2">{icon}</p>
                        <p className={`text-4xl font-bold ${color} mb-2`}>{level}</p>
                        <p className="text-lg text-slate-500">Score: {score}%</p>
                    </div>

                    <p className="text-slate-600 mb-4 max-w-md mx-auto">
                        {score >= 80 && "Excellent! You have strong fundamentals. Your roadmap will focus on advanced topics."}
                        {score >= 50 && score < 80 && "Good progress! Your roadmap will balance fundamentals with intermediate concepts."}
                        {score < 50 && "Great start! Your roadmap will emphasize building strong foundations first."}
                    </p>

                    {/* Personalized Tips */}
                    {tips.length > 0 && (
                        <div className="text-left max-w-md mx-auto mb-6 p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm font-semibold text-purple-800 mb-2">💡 Personalized Tips:</p>
                            <ul className="space-y-1">
                                {tips.map((tip, i) => (
                                    <li key={i} className="text-sm text-purple-700 flex items-start gap-2">
                                        <span>•</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-center gap-3">
                        <Button onClick={() => {
                            setQuizStarted(false);
                            setCurrentQuestion(0);
                            setAnswers([]);
                            setQuizComplete(false);
                        }} variant="outline">
                            Retake Quiz
                        </Button>
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                        ✓ Results saved to personalize your experience
                    </p>
                </motion.div>
            </Card>
        );
    }

    const question = questions[currentQuestion];

    return (
        <Card className="p-8">
            {/* Progress Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-slate-900">Skill Assessment</h3>
                    <span className="text-sm font-medium text-blue-600">
                        Question {currentQuestion + 1} of {questions.length}
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Question */}
            <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
            >
                <h4 className="text-2xl font-semibold text-slate-800 mb-6 leading-relaxed">
                    {question.question}
                </h4>

                <div className="space-y-3">
                    {question.options.map((option, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full text-left p-5 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center shrink-0 font-semibold text-slate-600 group-hover:text-blue-600">
                                    {String.fromCharCode(65 + index)}
                                </div>
                                <span className="font-medium text-slate-700 group-hover:text-slate-900 flex-1 pt-1">
                                    {option}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Hint */}
            <p className="text-sm text-slate-400 text-center">
                💡 Choose the option that best describes you
            </p>
        </Card>
    );
}
