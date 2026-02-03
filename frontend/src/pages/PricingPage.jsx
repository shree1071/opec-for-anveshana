import { motion } from "framer-motion";
import { useState } from "react";
import {
    Sparkles, MessageSquare, Brain, Zap, Upload, Target,
    Clock, Users, Building2, Check, ArrowRight
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useUser, SignInButton } from "@clerk/clerk-react";

export function PricingPage() {
    const { isSignedIn } = useUser();
    const [activeTab, setActiveTab] = useState('personal');

    const personalPlans = [
        {
            name: 'Free',
            price: 0,
            tagline: 'See what AI can do',
            buttonText: 'Your current plan',
            buttonStyle: 'border border-stone-300 text-stone-500 cursor-default bg-transparent',
            features: [
                { icon: Sparkles, text: 'Get simple explanations' },
                { icon: MessageSquare, text: 'Have short chats for common questions' },
                { icon: Brain, text: 'Try out career insights' },
                { icon: Clock, text: 'Limited context memory' },
            ],
        },
        {
            name: 'Go',
            price: 249,
            tagline: 'Keep chatting with expanded access',
            buttonText: 'Upgrade to Go',
            buttonStyle: 'bg-stone-800 hover:bg-stone-900 text-white shadow-md hover:shadow-lg',
            features: [
                { icon: Sparkles, text: 'Explore career topics in depth' },
                { icon: Upload, text: 'Upload resumes and documents' },
                { icon: Brain, text: 'Get more memory for smarter replies' },
                { icon: Target, text: 'Get help with planning and tasks' },
                { icon: Zap, text: 'Explore custom career paths' },
            ],
        },
        {
            name: 'Plus',
            price: 999,
            tagline: 'Unlock the full experience',
            popular: true,
            buttonText: 'Upgrade to Plus',
            buttonStyle: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200',
            features: [
                { icon: Sparkles, text: 'Solve complex career problems' },
                { icon: MessageSquare, text: 'Have long chats over multiple sessions' },
                { icon: Brain, text: 'Remember goals and past conversations' },
                { icon: Target, text: 'Plan interviews with agent mode' },
                { icon: Users, text: 'Organize projects and customize agents' },
                { icon: Zap, text: 'Produce and share reports' },
            ],
        },
        {
            name: 'Pro',
            price: 4999,
            tagline: 'Maximize your productivity',
            buttonText: 'Upgrade to Pro',
            buttonStyle: 'bg-stone-800 hover:bg-stone-900 text-white shadow-md hover:shadow-lg',
            features: [
                { icon: Sparkles, text: 'Master advanced tasks and topics' },
                { icon: Brain, text: 'Tackle big projects with unlimited agents' },
                { icon: Target, text: 'Create high-quality resumes at any scale' },
                { icon: Clock, text: 'Keep full context with maximum memory' },
                { icon: Zap, text: 'Run research and plan tasks with agents' },
                { icon: Building2, text: 'Scale your projects and automate workflows' },
            ],
        },
    ];

    const businessPlans = [
        {
            name: 'Business',
            price: 1499,
            tagline: 'Get more work done with AI for teams',
            recommended: true,
            buttonText: 'Upgrade to Business',
            buttonStyle: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg',
            features: [
                { icon: Building2, text: 'Conduct professional analysis' },
                { icon: Users, text: 'Get unlimited messages with GPT-5' },
                { icon: Brain, text: 'Priority access to new features' },
                { icon: Target, text: 'Advanced admin controls' },
                { icon: Zap, text: 'Team collaboration features' },
                { icon: Clock, text: 'Dedicated support' },
            ],
        },
    ];

    const plans = activeTab === 'personal' ? personalPlans : businessPlans;

    return (
        <div className="min-h-screen bg-[#faf9f7] pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-amber-600 font-semibold tracking-wide uppercase text-sm mb-3"
                    >
                        Pricing Plans
                    </motion.h2>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-serif font-medium text-stone-900 mb-6"
                    >
                        Invest in your future career.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-stone-500 max-w-2xl mx-auto"
                    >
                        Professional grade AI career simulation and coaching tools, accessible to everyone.
                    </motion.p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white p-1.5 rounded-full shadow-sm border border-stone-200 inline-flex">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'personal'
                                ? 'bg-stone-900 text-white shadow-md'
                                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                                }`}
                        >
                            Personal
                        </button>
                        <button
                            onClick={() => setActiveTab('business')}
                            className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'business'
                                ? 'bg-stone-900 text-white shadow-md'
                                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                                }`}
                        >
                            Business
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className={`grid gap-6 ${activeTab === 'personal' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center'}`}>
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (index * 0.1) }}
                            className={`relative flex flex-col p-6 bg-white rounded-2xl border transition-all hover:shadow-xl ${plan.popular || plan.recommended
                                    ? 'border-amber-200 shadow-md ring-1 ring-amber-100'
                                    : 'border-stone-200 shadow-sm hover:border-stone-300'
                                }`}
                        >
                            {(plan.popular || plan.recommended) && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wide">
                                        {plan.popular ? 'Most Popular' : 'Recommended'}
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-3">
                                    <span className="text-sm text-stone-500 font-medium">₹</span>
                                    <span className="text-4xl font-bold text-stone-900">
                                        {plan.price.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-stone-500 text-sm">/month</span>
                                </div>
                                <p className="text-sm text-stone-500 min-h-[40px]">{plan.tagline}</p>
                            </div>

                            <div className="flex-1 mb-8">
                                <div className="space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <feature.icon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-stone-600 leading-snug">{feature.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${plan.buttonStyle}`}>
                                {plan.buttonText}
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-stone-500 text-sm">
                        Enterprise? <a href="#" className="text-amber-600 font-medium hover:underline">Contact Sales</a> for volume licensing.
                    </p>
                </div>
            </div>
        </div>
    );
}
