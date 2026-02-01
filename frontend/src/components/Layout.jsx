import { Navbar } from "./Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser, PricingTable } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, ShieldCheck, Lock } from "lucide-react";
import { Button } from "./ui/Button";

// Standalone Pricing Popup Component to avoid re-renders
const PricingPopup = ({ showPricingPopup, setShowPricingPopup, showCheckout, setShowCheckout, user }) => {
    // Local state for transitions within the popup
    const [redirectingTier, setRedirectingTier] = useState(null);
    const [isCheckoutLoaded, setIsCheckoutLoaded] = useState(false);

    // Handle checkout loader timeout
    useEffect(() => {
        if (showCheckout) {
            const timer = setTimeout(() => {
                setIsCheckoutLoaded(true);
            }, 2000); // Give it 2s to render
            return () => clearTimeout(timer);
        } else {
            setIsCheckoutLoaded(false);
        }
    }, [showCheckout]);

    const handleUpgradeClick = (tierName) => {
        setRedirectingTier(tierName);
        setTimeout(() => {
            setShowCheckout(true);
            setRedirectingTier(null);
        }, 600);
    };

    const tiers = [
        {
            name: "Free",
            price: "$0",
            period: "/month",
            description: "Perfect for getting started with interview prep.",
            features: ["3 AI Mock Interviews/month", "Basic Voice Mode", "Standard Performance Reports", "Community Support"],
            notIncluded: ["Detailed AI Analysis", "Download PDF Reports", "Interview Recordings"],
            cta: "Continue Free",
            variant: "outline",
            disabled: false
        },
        {
            name: "Starter",
            price: "$2.99",
            period: "/month",
            description: "Essential tools for serious candidates.",
            features: ["15 AI Mock Interviews/month", "Unlimited Voice Mode", "Detailed AI Insights", "Email Support", "Priority AI Response"],
            notIncluded: ["Interview Recordings", "PDF Report Downloads"],
            cta: "Start Free Trial",
            variant: "primary",
            popular: true
        },
        {
            name: "Student",
            price: "$1.99",
            period: "/month",
            description: "Full access for verified students.",
            features: ["15 AI Mock Interviews/month", "Unlimited Voice Mode", "Detailed AI Insights", "Requires .edu email"],
            notIncluded: ["Interview Recordings"],
            cta: "Get Student Plan",
            variant: "outline",
            popular: false
        },
        {
            name: "Pro",
            price: "$5.99",
            period: "/month",
            description: "The ultimate interview preparation suite.",
            features: ["Unlimited Interviews", "Advanced OPEC Analysis", "Download PDF Reports", "Interview Recordings", "24/7 Priority Support", "Custom Company Scenarios"],
            notIncluded: [],
            cta: "Upgrade (Checkout)",
            variant: "premium",
            popular: false
        }
    ];

    return (
        <AnimatePresence>
            {showPricingPopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPricingPopup(false)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* If showing checkout, show Clerk Table, else show Custom Cards */}
                    {showCheckout ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="fixed inset-0 bg-white z-[200] flex flex-col w-full h-full overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white z-20 shadow-sm">
                                <div className="flex items-center gap-3 text-slate-900 font-bold text-xl">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <Lock className="w-5 h-5 text-green-600" />
                                    </div>
                                    Secure Checkout
                                </div>
                                <button
                                    onClick={() => { setShowCheckout(false); setShowPricingPopup(false); }}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                                >
                                    <X className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-slate-50 relative flex justify-center">
                                {/* Fallback/Loading State - Visible if Table doesn't load */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-0 p-8 text-center">
                                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
                                    <p className="text-slate-500 font-medium mb-2">Loading Secure Checkout...</p>
                                    <div className="max-w-md bg-yellow-50 border border-yellow-100 rounded-lg p-4 mt-8">
                                        <p className="text-yellow-800 text-sm font-semibold mb-1">Developer Note:</p>
                                        <p className="text-yellow-700 text-xs">
                                            If this screen remains blank, you likely haven't created a <strong>Pricing Table</strong> in your Clerk Dashboard yet.
                                            <br />
                                            Go to <em>Clerk Dashboard &gt; Components &gt; Pricing Table</em> and create one.
                                        </p>
                                    </div>
                                </div>

                                {/* Table Container - Higher Z-index to cover fallback */}
                                <div className="w-full max-w-7xl mx-auto p-4 md:p-8 min-h-screen relative z-10">
                                    {/* @ts-ignore */}
                                    <PricingTable
                                        customerEmail={user?.primaryEmailAddress?.emailAddress}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto pointer-events-auto z-10 no-scrollbar"
                        >
                            <div className="bg-transparent p-4">
                                <div className="flex justify-end mb-4">
                                    <button
                                        onClick={() => setShowPricingPopup(false)}
                                        className="p-2 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-colors"
                                    >
                                        <X className="w-6 h-6 text-slate-500" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {tiers.map((tier) => (
                                        <div
                                            key={tier.name}
                                            className={`relative flex flex-col p-8 bg-white rounded-2xl shadow-xl transition-all duration-300 ${tier.popular ? 'border-blue-500 ring-4 ring-blue-500/20 scale-[1.02]' : 'border-slate-200 hover:scale-[1.01]'} ${tier.name === 'Pro' ? 'overflow-hidden' : ''}`}
                                        >
                                            {tier.name === 'Starter' && (
                                                <div className="absolute top-0 right-0 -mr-1 -mt-1 w-32 h-32 overflow-hidden">
                                                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                                        POPULAR
                                                    </div>
                                                </div>
                                            )}
                                            {tier.name === 'Pro' && (
                                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-600" />
                                            )}

                                            <div className="mb-6">
                                                <h3 className="text-2xl font-bold text-slate-900">{tier.name}</h3>
                                                <div className="mt-4 flex items-baseline">
                                                    <span className="text-4xl font-extrabold text-slate-900">{tier.price}</span>
                                                    {tier.price !== "Free" && <span className="text-slate-500 ml-1">{tier.period}</span>}
                                                </div>
                                                <p className="mt-2 text-slate-500 text-sm">{tier.description}</p>
                                            </div>

                                            <ul className="flex-1 space-y-4 mb-8">
                                                {tier.features.map((feature) => (
                                                    <li key={feature} className="flex items-start">
                                                        <div className="flex-shrink-0">
                                                            <Check className="w-5 h-5 text-green-500" />
                                                        </div>
                                                        <p className="ml-3 text-slate-600 text-sm">{feature}</p>
                                                    </li>
                                                ))}
                                                {tier.notIncluded?.map((feature) => (
                                                    <li key={feature} className="flex items-start opacity-50">
                                                        <div className="flex-shrink-0">
                                                            <X className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                        <p className="ml-3 text-slate-500 text-sm">{feature}</p>
                                                    </li>
                                                ))}
                                            </ul>

                                            <Button
                                                disabled={tier.disabled || (redirectingTier !== null && redirectingTier !== tier.name)}
                                                variant={tier.variant === 'primary' ? 'primary' : 'outline'}
                                                className={`w-full py-3 ${tier.variant === 'premium' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 border-none' : ''}`}
                                                onClick={() => {
                                                    if (tier.price !== "$0") {
                                                        handleUpgradeClick(tier.name);
                                                    } else {
                                                        setShowPricingPopup(false);
                                                    }
                                                }}
                                            >
                                                {redirectingTier === tier.name ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Redirecting...
                                                    </span>
                                                ) : tier.cta}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </AnimatePresence>
    );
};

export function Layout({ children }) {
    const location = useLocation();
    const isChatPage = location.pathname === '/opec/chat';

    // Pricing Popup Logic
    const { user } = useUser();
    const navigate = useNavigate();
    const [showPricingPopup, setShowPricingPopup] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);

    useEffect(() => {
        // Trigger ONLY if passed from Onboarding
        if (location.state?.showPricingOnboarding) {
            setShowPricingPopup(true);

            // Clear the state so it doesn't persist on refresh/back
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    if (isChatPage) {
        return (
            <>
                {children}
                <PricingPopup
                    showPricingPopup={showPricingPopup}
                    setShowPricingPopup={setShowPricingPopup}
                    showCheckout={showCheckout}
                    setShowCheckout={setShowCheckout}
                    user={user}
                />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="pt-16">
                {children}
            </main>
            <footer className="bg-white border-t border-slate-100 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500">
                    <p>© 2026 OPEC AI. All rights reserved.</p>
                </div>
            </footer>
            <PricingPopup
                showPricingPopup={showPricingPopup}
                setShowPricingPopup={setShowPricingPopup}
                showCheckout={showCheckout}
                setShowCheckout={setShowCheckout}
                user={user}
            />
        </div>
    );
}
