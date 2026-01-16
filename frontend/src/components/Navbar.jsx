import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/Button";
import { Brain } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

export function Navbar() {
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
                                    <Button variant="primary" className="py-2 px-4 text-sm">
                                        Start Simulation
                                    </Button>
                                </Link>
                            )}
                        </SignedIn>
                    </div>
                </div>
            </div>
        </nav>
    );
}
