import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageSquare, Brain, Zap, Upload, Target, Clock, Users, Building2 } from 'lucide-react';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const personalPlans = [
    {
        name: 'Free',
        price: 0,
        tagline: 'See what AI can do',
        buttonText: 'Your current plan',
        buttonStyle: 'border border-slate-300 text-slate-500 cursor-default',
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
        buttonStyle: 'bg-slate-800 hover:bg-slate-900 text-white',
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
        buttonStyle: 'bg-indigo-600 hover:bg-indigo-700 text-white',
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
        buttonStyle: 'bg-slate-800 hover:bg-slate-900 text-white',
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
        name: 'Free',
        price: 0,
        tagline: 'See what AI can do',
        buttonText: 'Your current plan',
        buttonStyle: 'border border-slate-300 text-slate-500 cursor-default',
        features: [
            { icon: Sparkles, text: 'Get simple explanations' },
            { icon: MessageSquare, text: 'Have short chats for common questions' },
            { icon: Brain, text: 'Try out career insights' },
            { icon: Clock, text: 'Limited context memory' },
        ],
    },
    {
        name: 'Business',
        price: 1499,
        tagline: 'Get more work done with AI for teams',
        recommended: true,
        buttonText: 'Upgrade to Business',
        buttonStyle: 'bg-indigo-600 hover:bg-indigo-700 text-white',
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

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');
    const plans = activeTab === 'personal' ? personalPlans : businessPlans;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-slate-800">Upgrade your plan</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center py-4">
                        <div className="inline-flex bg-slate-100 rounded-full p-1">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'personal'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                                    }`}
                            >
                                Personal
                            </button>
                            <button
                                onClick={() => setActiveTab('business')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'business'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                                    }`}
                            >
                                Business
                            </button>
                        </div>
                    </div>

                    {/* Plans Grid */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        <div className={`grid gap-4 ${activeTab === 'personal' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                            {plans.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`rounded-xl p-6 border transition-all ${(plan as any).popular || (plan as any).recommended
                                        ? 'border-indigo-200 bg-indigo-50/30 ring-2 ring-indigo-100'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                >
                                    {/* Plan Header */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-semibold text-slate-800">{plan.name}</h3>
                                            {(plan as any).popular && (
                                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                                                    POPULAR
                                                </span>
                                            )}
                                            {(plan as any).recommended && (
                                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                                                    RECOMMENDED
                                                </span>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-sm text-slate-500">₹</span>
                                            <span className="text-3xl font-bold text-slate-900">
                                                {plan.price.toLocaleString('en-IN')}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                INR / month {plan.price > 0 && '(inclusive of GST)'}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-600">{plan.tagline}</p>
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        className={`w-full py-3 rounded-full text-sm font-medium transition-colors mb-6 ${plan.buttonStyle}`}
                                    >
                                        {plan.buttonText}
                                    </button>

                                    {/* Features */}
                                    <div className="space-y-3">
                                        {plan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <feature.icon className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-slate-700">{feature.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
