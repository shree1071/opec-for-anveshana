import { Link } from "react-router-dom";
import { Button } from "./ui/Button";
import { Compass } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <Compass className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            CareerPath
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
                        </SignedIn>
                        <Link to="/simulate">
                            <Button variant="primary" className="py-2 px-4 text-sm">
                                Start Simulation
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
