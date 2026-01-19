import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/Button";
import { Brain, Menu, X } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const showSimulator = location.pathname !== '/' && location.pathname !== '/opec/onboarding';

    return (
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-blue-600 tracking-tight">
                            OPEC
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                            Home
                        </Link>
                        <Link to="/about" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                            How it Works
                        </Link>
                        <Link to="/industry" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                            Industry Insights
                        </Link>
                        <Link to="/colleges" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                            Colleges
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="text-slate-600 hover:text-slate-900 font-medium">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                            {showSimulator && (
                                <Link to="/opec/simulate">
                                    <Button variant="primary" className="py-2 px-4 text-sm hidden sm:block">
                                        Start Simulation
                                    </Button>
                                </Link>
                            )}
                        </SignedIn>

                        {/* Mobile Menu Toggle */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-slate-100 shadow-lg overflow-hidden"
                    >
                        <div className="flex flex-col px-4 pt-2 pb-6 space-y-1">
                            {[
                                { to: "/", label: "Home" },
                                { to: "/about", label: "How it Works" },
                                { to: "/industry", label: "Industry Insights" },
                                { to: "/colleges", label: "Colleges" },
                            ].map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsOpen(false)}
                                    className="py-3 px-4 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {/* Mobile only simulation button if signed in */}
                            <SignedIn>
                                {showSimulator && (
                                    <Link
                                        to="/opec/simulate"
                                        onClick={() => setIsOpen(false)}
                                        className="mt-4 block"
                                    >
                                        <Button className="w-full justify-center">
                                            Start Simulation
                                        </Button>
                                    </Link>
                                )}
                            </SignedIn>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
