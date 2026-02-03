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
        <nav className="fixed top-0 w-full bg-[#faf9f7]/80 backdrop-blur-md z-50 border-b border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-amber-600 transition-colors">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-serif font-bold text-stone-900 tracking-tight group-hover:text-amber-700 transition-colors">
                            OPEC
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { to: "/", label: "Home" },
                            { to: "/pricing", label: "Pricing" }
                        ].map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="text-stone-500 hover:text-stone-900 font-medium transition-colors text-sm"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <SignedOut>
                            <SignInButton mode="modal" forceRedirectUrl="/opec/dashboard">
                                <button className="text-stone-600 hover:text-stone-900 font-medium">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-8 h-8 ring-2 ring-stone-100"
                                    }
                                }}
                            />
                        </SignedIn>

                        {/* Mobile Menu Toggle */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
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
                        className="md:hidden bg-[#faf9f7] border-t border-stone-200 shadow-lg overflow-hidden"
                    >
                        <div className="flex flex-col px-4 pt-2 pb-6 space-y-1">
                            {[
                                { to: "/", label: "Home" },
                                { to: "/pricing", label: "Pricing" }
                            ].map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsOpen(false)}
                                    className="py-3 px-4 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg font-medium transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
