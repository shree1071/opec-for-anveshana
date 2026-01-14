import { motion } from "framer-motion";

export function Button({ children, onClick, variant = "primary", className = "", ...props }) {
    const baseStyle = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/30",
        secondary: "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
        ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
}
