import {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {AnimatedFire} from "@/components/animation/AnimatedFire";

export interface StreakNotificationProps {
    isVisible: boolean;
    from: number;
    to: number;
    onComplete: () => void;
}

export const StreakNotification: React.FC<StreakNotificationProps> = ({
                                                                          isVisible,
                                                                          from,
                                                                          to,
                                                                          onComplete,
                                                                      }) => {
    const [displayNumber, setDisplayNumber] = useState(from);
    const [isExploding, setIsExploding] = useState(false);

    useEffect(() => {
        console.log(12312132)

        if (isVisible) {
            setDisplayNumber(from);
            setIsExploding(false);

            // The "Boom" moment
            const boomDelay = setTimeout(() => {
                setDisplayNumber(to);
                setIsExploding(true);
            }, 600);

            // Cleanup
            const closeTimer = setTimeout(() => {
                onComplete();
            }, 3000);

            return () => {
                clearTimeout(boomDelay);
                clearTimeout(closeTimer);
            };
        }
    }, [isVisible, from, to, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center isolate overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* 1. Background Overlay with Flash */}
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl z-[-2]" />

                    {/* Flash Effect on Explosion */}
                    {isExploding && (
                        <motion.div
                            className="absolute inset-0 bg-white mix-blend-overlay z-[-1]"
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    )}

                    {/* Shockwaves Background */}
                    {isExploding && <Shockwaves />}

                    {/* Main Content */}
                    <motion.div
                        className="relative flex flex-col items-center justify-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                    >
                        {/* Title */}
                        <motion.h2
                            className="absolute -top-32 font-display font-bold text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-orange-100 to-orange-300 uppercase tracking-widest drop-shadow-sm text-center"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            Streak Updated!
                        </motion.h2>

                        {/* Fire and Explosion Core */}
                        <div className="relative flex items-center justify-center">
                            {/* Particles fly out behind the number but in front of fire */}
                            {isExploding && <ExplosionParticles />}

                            <motion.div
                                animate={isExploding ? {
                                    scale: [1, 1.4, 1],
                                    filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                                } : {}}
                                transition={{ duration: 0.4, ease: "circOut" }}
                            >
                                <AnimatedFire intensity={isExploding ? 2 : 1} />
                            </motion.div>

                            {/* The Number */}
                            <div className="absolute inset-0 flex items-center justify-center pt-10 pointer-events-none">
                                <ExplosiveCounter value={displayNumber} isExploding={isExploding} />
                            </div>
                        </div>

                        {/* Subtitle */}
                        <motion.p
                            className="absolute -bottom-24 text-orange-200/90 text-xl font-medium tracking-wide"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                        >
                            Tiếp tục giữ vững nhé!
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- Sub-components for Effects ---

const ExplosiveCounter = ({ value, isExploding }: { value: number; isExploding: boolean }) => {
    return (
        <div className="relative h-32 w-48 flex justify-center items-center">
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={value}
                    className="font-display font-black text-8xl text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] z-20"
                    style={{
                        textShadow: isExploding ? "0 0 30px rgba(255,165,0,0.8), 0 0 60px rgba(255,255,255,0.6)" : "none"
                    }}
                    initial={isExploding ? { scale: 0.5, opacity: 0, y: 50, rotate: -10 } : { scale: 0.8, opacity: 0 }}
                    animate={isExploding
                        ? { scale: [1.5, 1], opacity: 1, y: 0, rotate: 0 }
                        : { scale: 1, opacity: 1 }
                    }
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 12, // Lower damping for more bounce/shake
                        mass: 0.8
                    }}
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

const Shockwaves = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[-1]">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute border-2 border-orange-400/30 rounded-full box-content"
                    style={{ width: '100px', height: '100px' }}
                    initial={{ scale: 0.5, opacity: 1, borderWidth: "10px" }}
                    animate={{ scale: 4, opacity: 0, borderWidth: "0px" }}
                    transition={{
                        duration: 1.5,
                        ease: "easeOut",
                        delay: i * 0.2,
                    }}
                />
            ))}
            <motion.div
                className="absolute bg-orange-500/20 rounded-full blur-3xl"
                initial={{ width: 0, height: 0, opacity: 1 }}
                animate={{ width: 600, height: 600, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
        </div>
    );
};

const ExplosionParticles = () => {
    // Generate random particles
    const particles = Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24; // Distribute evenly or randomly
        const randomSpread = Math.random() * 20 - 10;
        const finalAngle = (angle + randomSpread) * (Math.PI / 180);
        const distance = 150 + Math.random() * 100;

        return {
            id: i,
            x: Math.cos(finalAngle) * distance,
            y: Math.sin(finalAngle) * distance,
            scale: Math.random() * 0.5 + 0.5,
            color: i % 2 === 0 ? '#fbbf24' : '#ef4444', // Yellow or Red
        };
    });

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
                    style={{ backgroundColor: p.color }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                        x: p.x,
                        y: p.y,
                        scale: 0,
                        opacity: 0,
                    }}
                    transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: Math.random() * 0.1, // Slight randomness in start time
                    }}
                />
            ))}
        </div>
    );
};