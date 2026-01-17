import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, MessageSquare, TrendingUp, Sparkles, Target, Zap, Users, CheckCircle, ChevronRight, Play } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/clerk-react";

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const wordAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1
        }
    }
};

const heroImageVariant = {
    hidden: { opacity: 0, rotateX: 20, y: 100 },
    visible: {
        opacity: 1,
        rotateX: 2,
        y: 0,
        transition: {
            duration: 1,
            ease: "easeOut",
            type: "spring",
            damping: 20
        }
    }
};

const companyLogos = [
    { name: "Google", slug: "google" },
    { name: "Meta", slug: "meta" },
    { name: "Netflix", slug: "netflix" },
    { name: "Tesla", slug: "tesla" },
    { name: "OpenAI", slug: "openai" },
    { name: "Spotify", slug: "spotify" },
    { name: "Uber", slug: "uber" }
];

// Doubling the logos for infinite scroll
const marqueeLogos = [...companyLogos, ...companyLogos];

export function LandingPage() {
    return (
        <div className="font-sans bg-[#F9F8F6] text-slate-900 min-h-screen selection:bg-indigo-100 selection:text-indigo-900">

            {/* Hero Section */}
            <section className="relative pt-20 pb-12 lg:pt-32 lg:pb-20 overflow-hidden perspective-[1200px]">
                {/* Background Decor */}
                <div className="absolute inset-0 -z-10 bg-[#F9F8F6] bg-grid-slate-200 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-tr from-blue-100/40 via-purple-100/40 to-indigo-100/40 rounded-full blur-3xl -z-20 origin-center"
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="flex flex-col items-center"
                    >
                        <motion.div variants={fadeInUp} className="mb-4">
                            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-semibold text-slate-600 hover:scale-105 transition-transform cursor-default">
                                <Sparkles className="w-4 h-4 text-amber-400" fill="currentColor" />
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Introducing OPEC Methodology v1.0
                                </span>
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={staggerContainer}
                            className="text-5xl sm:text-7xl md:text-8xl font-bold text-slate-900 tracking-tight mb-12 flex flex-col items-center leading-none"
                        >
                            <span className="block overflow-hidden py-2">
                                <motion.span variants={wordAnimation} className="inline-block">Career</motion.span>{" "}
                                <motion.span variants={wordAnimation} className="inline-block">Clarity</motion.span>
                            </span>

                            <span className="relative block">
                                <span className="relative z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    <motion.span variants={wordAnimation} className="inline-block">Simplified</motion.span>{" "}
                                    <motion.span variants={wordAnimation} className="inline-block">by</motion.span>{" "}
                                    <motion.span variants={wordAnimation} className="inline-block">AI</motion.span>
                                </span>
                                <span className="absolute -bottom-2 left-0 right-0 h-4 bg-indigo-100/50 -z-10 skew-x-12 transform origin-left scale-x-0 animate-scale-in" style={{ animationFillMode: 'forwards', animationDelay: '1s' }}></span>
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed font-light">
                            Stop guessing your future. Let our <span className="font-semibold text-slate-800">4 specialized AI agents</span> guide you from confusion to a data-backed career roadmap in minutes.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 w-full justify-center px-4">
                            <SignedOut>
                                <SignUpButton mode="modal" forceRedirectUrl="/opec/onboarding">
                                    <Button className="h-16 px-10 text-xl font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto rounded-xl">
                                        Start Your Journey
                                        <ChevronRight className="w-6 h-6 ml-2" />
                                    </Button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link to="/opec/onboarding">
                                    <Button className="h-16 px-10 text-xl font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto rounded-xl">
                                        Go to Dashboard
                                        <ChevronRight className="w-6 h-6 ml-2" />
                                    </Button>
                                </Link>
                            </SignedIn>
                            <Button variant="outline" className="h-16 px-10 text-lg font-semibold border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 w-full sm:w-auto rounded-xl">
                                <Play className="w-5 h-5 mr-2 fill-slate-600" />
                                See How It Works
                            </Button>
                        </motion.div>

                        {/* Interactive "Path" Visualization */}
                        <motion.div
                            variants={heroImageVariant}
                            className="mt-12 relative w-full max-w-5xl mx-auto aspect-[16/9] bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden hidden md:block"
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {/* Background Grid */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>

                            {/* The Roadmap Path */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-full h-full" viewBox="0 0 800 450" fill="none">
                                    {/* Path Line */}
                                    <path
                                        d="M 50 225 Q 200 225 250 150 T 450 150 T 650 300 T 800 225"
                                        stroke="url(#gradient-path)"
                                        strokeWidth="4"
                                        fill="none"
                                        className="drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    />
                                    <defs>
                                        <linearGradient id="gradient-path" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                                            <stop offset="20%" stopColor="#6366f1" />
                                            <stop offset="80%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#ec4899" />
                                        </linearGradient>
                                    </defs>

                                    {/* Milestones */}
                                    <g transform="translate(250, 150)">
                                        <circle r="6" fill="#6366f1" className="animate-pulse" />
                                        <circle r="12" fill="#6366f1" fillOpacity="0.2" className="animate-ping" />
                                        <foreignObject x="-60" y="-50" width="120" height="40">
                                            <div className="bg-slate-800/90 backdrop-blur border border-indigo-500/30 rounded-lg p-2 text-center shadow-lg">
                                                <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Analysis</div>
                                            </div>
                                        </foreignObject>
                                    </g>

                                    <g transform="translate(450, 150)">
                                        <circle r="6" fill="#8b5cf6" />
                                        <foreignObject x="-60" y="20" width="120" height="40">
                                            <div className="bg-slate-800/90 backdrop-blur border border-purple-500/30 rounded-lg p-2 text-center shadow-lg">
                                                <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Skill Strategy</div>
                                            </div>
                                        </foreignObject>
                                    </g>

                                    <g transform="translate(650, 300)">
                                        <circle r="8" fill="#ec4899" />
                                        <circle r="16" fill="#ec4899" fillOpacity="0.1" />
                                        <foreignObject x="-70" y="-55" width="140" height="60">
                                            <div className="bg-slate-800/90 backdrop-blur border border-pink-500/30 rounded-lg p-2 text-center shadow-lg flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-xs">🚀</div>
                                                <div className="text-left">
                                                    <div className="text-[10px] text-pink-300 font-bold uppercase">Goal Reached</div>
                                                    <div className="text-[10px] text-slate-400">Product Manager</div>
                                                </div>
                                            </div>
                                        </foreignObject>
                                    </g>
                                </svg>
                            </div>

                            {/* Floating UI Elements */}
                            <div className="absolute top-10 right-10 p-4 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 w-48 shadow-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-1.5 bg-green-500/20 rounded text-green-400"><TrendingUp className="w-4 h-4" /></div>
                                    <div className="text-xs font-medium text-slate-300">Salary Growth</div>
                                </div>
                                <div className="text-xl font-bold text-white">₹ 24.5 LPA</div>
                                <div className="text-[10px] text-green-400 mt-1">+140% vs Avg</div>
                            </div>

                            <div className="absolute bottom-10 left-10 p-4 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 w-56 shadow-xl">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-3">Next Action Step</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                                        <Play className="w-4 h-4 ml-0.5 fill-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-white">System Design</div>
                                        <div className="text-[10px] text-indigo-300">Module 4 • 45 mins</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Trusted By Section - BIGGER & COLOURED */}
            <section className="py-10 bg-white border-y border-slate-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Teams at these companies build their careers with us
                    </p>
                </div>

                <div className="relative w-full">
                    {/* Gradients to hide edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-white to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-white to-transparent z-10"></div>

                    <div className="flex w-max animate-scroll hover:[animation-play-state:paused] items-center gap-24 md:gap-40">
                        {marqueeLogos.map((brand, idx) => (
                            <div key={`logo-${idx}`} className="group relative transition-transform duration-300 hover:scale-110 cursor-pointer">
                                <img
                                    src={`https://cdn.simpleicons.org/${brand.slug}`}
                                    alt={brand.name}
                                    className="h-16 md:h-24 w-auto object-contain brightness-100"
                                    title={brand.name}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features / Bento Grid Section */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">Built for Clarity. <br /> Designed for Action.</h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Most tools give generic advice. We built a system that understands <em>you</em>.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
                    {/* Large Card - Phase 1 */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="md:col-span-2 relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 overflow-hidden text-white flex flex-col justify-between shadow-2xl shadow-indigo-200"
                    >
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-6 border border-white/10">
                                <MessageSquare className="w-3 h-3" /> Phase 1: Reflection
                            </div>
                            <h3 className="text-4xl font-bold mb-4">Deep Dive Discovery</h3>
                            <p className="text-lg text-indigo-100 max-w-md">
                                An empathetic AI listener that helps you unpack your chaotic thoughts and feelings about your career, converting confusion into structured insights.
                            </p>
                        </div>
                        <div className="absolute right-0 bottom-0 w-3/4 h-3/4 bg-white/10 rounded-tl-3xl backdrop-blur-sm border-t border-l border-white/10 p-6 translate-x-1/4 translate-y-1/4">
                            <div className="space-y-4">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">AI</div>
                                    <div className="bg-white/20 p-3 rounded-xl rounded-tl-none text-sm">What excites you most about technology?</div>
                                </div>
                                <div className="flex gap-4 items-center justify-end">
                                    <div className="bg-indigo-800/80 p-3 rounded-xl rounded-tr-none text-sm">I love building visual things...</div>
                                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center font-bold">Me</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Small Card - Analyzers */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Hidden Patterns</h3>
                            <p className="text-slate-500">
                                We connect dots you didn't know existed, finding your unique strengths.
                            </p>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2">
                            {['Creative', 'Analytical', 'Leader'].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">{tag}</span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Small Card - Stats */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Real Market Data</h3>
                            <p className="text-slate-500">
                                Salary trends and growth projections specific to the Indian market.
                            </p>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-slate-900">₹25L</span>
                                <span className="text-sm text-green-600 font-semibold mb-2">+40% YoY</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                <div className="w-3/4 h-full bg-green-500 rounded-full"></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Large Card - Phase 2 */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="md:col-span-2 relative bg-slate-900 rounded-3xl p-8 overflow-hidden text-white flex flex-col justify-between shadow-2xl shadow-slate-200"
                    >
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold mb-6 border border-white/10">
                                <Zap className="w-3 h-3" /> Phase 2: Action
                            </div>
                            <h3 className="text-4xl font-bold mb-4">The Career Simulator 2.0</h3>
                            <p className="text-lg text-slate-400 max-w-md">
                                Simulate your next 5 years. See the skills you need, the roles you can take, and the money you can make.
                            </p>
                        </div>
                        {/* Visual Abstract Graph */}
                        <div className="absolute right-0 bottom-0 w-2/3 h-2/3">
                            <svg viewBox="0 0 200 100" className="w-full h-full opacity-20">
                                <path d="M0,100 Q50,50 100,80 T200,20" fill="none" stroke="white" strokeWidth="4" />
                                <path d="M0,100 Q50,70 100,90 T200,40" fill="none" stroke="indigo" strokeWidth="4" />
                            </svg>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Methodology Section */}
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">The OPEC Engine</h2>
                        <p className="text-slate-500 mt-2">How our agents collaborate for you</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { letter: "O", title: "Observation", text: "Deep listening", color: "bg-blue-50 text-blue-600" },
                            { letter: "P", title: "Pattern", text: "Connecting dots", color: "bg-indigo-50 text-indigo-600" },
                            { letter: "E", title: "Evaluation", text: "Market analysis", color: "bg-purple-50 text-purple-600" },
                            { letter: "C", title: "Clarity", text: "Action plan", color: "bg-green-50 text-green-600" }
                        ].map((item, i) => (
                            <Card key={i} className="p-6 text-center border-none shadow-none bg-slate-50 hover:bg-white hover:shadow-lg transition-all duration-300">
                                <div className={`w-16 h-16 mx-auto ${item.color} rounded-2xl flex items-center justify-center text-2xl font-bold mb-4`}>
                                    {item.letter}
                                </div>
                                <h3 className="font-bold text-slate-900">{item.title}</h3>
                                <p className="text-sm text-slate-500">{item.text}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                    Ready to launch your career?
                </h2>
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                    Join the platform that treats your career like a high-growth startup. Smart, data-driven, and ambitious.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <SignedOut>
                        <SignUpButton mode="modal" forceRedirectUrl="/opec/onboarding">
                            <Button className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-indigo-200 transition-all">
                                Get Started for Free
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <Link to="/opec/onboarding">
                            <Button className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-indigo-200 transition-all">
                                Go to Dashboard
                            </Button>
                        </Link>
                    </SignedIn>
                </div>
            </section>
        </div>
    );
}
