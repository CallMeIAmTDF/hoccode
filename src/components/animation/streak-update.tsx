"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
    show: boolean;
    streak: number;
    onClose?: () => void;
};

export default function CelebrationModal({ show, streak, onClose }: Props) {
    useEffect(() => {
        if (show && onClose) {
            const t = setTimeout(() => onClose(), 3000);
            return () => clearTimeout(t);
        }
    }, [show, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center space-y-8 relative"
                    >
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(60)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: -20, opacity: 1 }}
                                    animate={{ y: "100vh", opacity: 0 }}
                                    transition={{
                                        duration: 2 + Math.random() * 2,
                                        delay: Math.random() * 1.5,
                                        repeat: Infinity,
                                    }}
                                    className="absolute w-3 h-3 rounded-full"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        backgroundColor: [
                                            "#ff6b6b",
                                            "#4ecdc4",
                                            "#45b7d1",
                                            "#96ceb4",
                                            "#feca57",
                                            "#ff9ff3",
                                        ][Math.floor(Math.random() * 6)],
                                    }}
                                />
                            ))}
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 mb-4 animate-pulse">
                                CHÚC MỪNG
                            </h2>
                            <p className="text-xl text-gray-300 max-w-md mx-auto">
                                Bạn đã đạt mốc <span className="text-yellow-400">{streak}</span>{" "}
                                ngày streak liên tiếp!
                            </p>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-96 h-96 border-4 border-yellow-400/30 rounded-full animate-ping" />
                                <div className="absolute w-80 h-80 border-4 border-pink-500/30 rounded-full animate-ping [animation-delay:300ms]" />
                                <div className="absolute w-64 h-64 border-4 border-purple-600/30 rounded-full animate-ping [animation-delay:600ms]" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
