import { Navbar } from "./Navbar";

export function Layout({ children }) {
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
        </div>
    );
}
