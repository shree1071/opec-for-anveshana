export function Input({ label, className = "", ...props }) {
    return (
        <div className="mb-5">
            <label className="block text-sm font-medium text-stone-700 mb-2">
                {label}
            </label>
            <input
                className={`w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all shadow-sm ${className}`}
                {...props}
            />
        </div>
    );
}
