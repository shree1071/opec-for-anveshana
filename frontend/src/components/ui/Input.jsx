export function Input({ label, ...props }) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {label}
            </label>
            <input
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                {...props}
            />
        </div>
    );
}
