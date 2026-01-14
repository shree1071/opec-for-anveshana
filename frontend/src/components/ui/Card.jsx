import { motion } from "framer-motion";

export function Card({ children, className = "", delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}
        >
            {children}
        </motion.div>
    );
}
