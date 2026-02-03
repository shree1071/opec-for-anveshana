export function Select({ label, options, className = "", ...props }) {
    return (
        <div className="mb-5">
            {label && (
                <label className="block text-sm font-medium text-stone-700 mb-2">
                    {label}
                </label>
            )}
            <select
                className={`w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all shadow-sm appearance-none ${className}`}
                {...props}
            >
                <option value="" disabled>Select an option</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
