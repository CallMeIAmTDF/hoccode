import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export const AnimatedFire: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
    return (
        <div className="relative w-64 h-64 flex items-center justify-center pointer-events-none">
            {/* Intense Core Glow */}
            <motion.div
                className="absolute w-40 h-40 bg-orange-500 rounded-full blur-[50px] mix-blend-screen"
                animate={{
                    scale: [1, 1.15, 0.95, 1.1, 1],
                    opacity: [0.6, 0.7, 0.5, 0.7, 0.6],
                }}
                transition={{
                    duration: 2 / intensity,
                    repeat: Infinity,
                    ease: "easeInOut", // Rougher ease
                    times: [0, 0.3, 0.6, 0.8, 1]
                }}
            />

            {/* Rising Embers System (New Layer for Realism) */}
            <RisingEmbers intensity={intensity} />

            {/* Main Flame SVG */}
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-[0_0_20px_rgba(251,146,60,0.5)] z-10"
                style={{ overflow: 'visible' }}
            >
                {/* Back Layer (Dark Red/Orange) */}
                <motion.path
                    d="M50 85 C20 85 10 50 50 10 C90 50 80 85 50 85 Z"
                    fill="#ea580c"
                    animate={{
                        d: [
                            "M50 85 C20 85 10 50 50 10 C90 50 80 85 50 85 Z",
                            "M50 85 C15 80 5 45 52 5 C95 45 85 80 50 85 Z", // Slight tip shift
                            "M50 85 C25 82 8 48 48 12 C88 52 75 82 50 85 Z", // Shift left
                            "M50 85 C20 85 10 50 50 10 C90 50 80 85 50 85 Z",
                        ],
                        scale: [1, 1.02, 0.98, 1],
                    }}
                    transition={{
                        duration: 0.8 / intensity,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* Middle Layer (Bright Orange) */}
                <motion.path
                    d="M50 80 C30 80 25 55 50 20 C75 55 70 80 50 80 Z"
                    fill="#fb923c"
                    animate={{
                        d: [
                            "M50 80 C30 80 25 55 50 20 C75 55 70 80 50 80 Z",
                            "M50 80 C32 78 22 52 52 15 C78 52 68 78 50 80 Z",
                            "M50 80 C28 82 20 58 48 22 C72 58 72 82 50 80 Z",
                            "M50 80 C30 80 25 55 50 20 C75 55 70 80 50 80 Z",
                        ],
                    }}
                    transition={{
                        duration: 0.6 / intensity,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* Inner Core (White/Yellow Hot) */}
                <motion.path
                    d="M50 75 C40 75 38 60 50 35 C62 60 60 75 50 75 Z"
                    fill="#fef08a"
                    animate={{
                        d: [
                            "M50 75 C40 75 38 60 50 35 C62 60 60 75 50 75 Z",
                            "M50 75 C36 73 34 55 52 30 C66 55 64 73 50 75 Z", // Tip wiggles right
                            "M50 75 C42 74 40 62 48 38 C60 62 58 74 50 75 Z", // Tip wiggles left
                            "M50 75 C40 75 38 60 50 35 C62 60 60 75 50 75 Z",
                        ],
                        fill: ["#fef08a", "#ffffff", "#fef08a"],
                        opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                        duration: 0.4 / intensity,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </svg>
        </div>
    );
};

const RisingEmbers = ({ intensity }: { intensity: number }) => {
    // Generate stable random values for embers so they don't re-render chaotically
    const embers = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            xStart: Math.random() * 60 - 30, // Random start X position (-30 to 30)
            delay: Math.random() * 2,
            duration: 1.5 + Math.random(),
            size: Math.random() * 4 + 2, // Random size 2px - 6px
        }));
    }, []);

    return (
        <div className="absolute inset-0 flex justify-center items-end pb-10 overflow-visible z-0">
            {embers.map((ember) => (
                <motion.div
                    key={ember.id}
                    className="absolute rounded-full bg-yellow-200 blur-[1px]"
                    style={{
                        width: ember.size,
                        height: ember.size,
                        bottom: '20%', // Start near the base of the fire
                    }}
                    animate={{
                        y: [0, -120 - Math.random() * 50], // Move UP 120px-170px
                        x: [ember.xStart, ember.xStart + (Math.random() * 40 - 20)], // Drift left/right
                        opacity: [0, 1, 1, 0], // Fade in then out
                        scale: [0.5, 1, 0], // Shrink as it burns out
                    }}
                    transition={{
                        duration: ember.duration / intensity,
                        repeat: Infinity,
                        delay: ember.delay,
                        ease: "easeOut",
                        times: [0, 0.2, 0.8, 1]
                    }}
                />
            ))}
        </div>
    );
};
