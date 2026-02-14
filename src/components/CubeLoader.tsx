import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CubeLoaderProps {
    onComplete: () => void;
}

type Phase = "drawing" | "unfolding" | "zooming" | "complete";

const CubeLoader: React.FC<CubeLoaderProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<Phase>("drawing");

    useEffect(() => {
        const drawTimer = setTimeout(() => setPhase("unfolding"), 2000);
        const unfoldTimer = setTimeout(() => setPhase("zooming"), 3200);
        const zoomTimer = setTimeout(() => {
            setPhase("complete");
            onComplete();
        }, 4000);

        return () => {
            clearTimeout(drawTimer);
            clearTimeout(unfoldTimer);
            clearTimeout(zoomTimer);
        };
    }, [onComplete]);

    const ease = [0.4, 0, 0.2, 1] as [number, number, number, number];

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden gpu-accelerate"
            animate={{
                opacity: phase === "complete" ? 0 : 1,
            }}
            transition={{ duration: 0.4 }}
        >
            {/* Subtle grid background */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Main container - optimized zoom */}
            <motion.div
                className="relative flex flex-col items-center gap-8 gpu-accelerate"
                animate={{
                    scale: phase === "zooming" ? 8 : 1,
                    opacity: phase === "zooming" ? 0 : 1,
                }}
                transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                }}
            >
                {/* Isometric Cube Container */}
                <div className="relative w-48 h-48">

                    {/* Glow effect */}
                    <motion.div
                        className="absolute inset-0 blur-2xl gpu-accelerate"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: phase === "drawing" ? 0.15 : 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                    >
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                            <path
                                d="M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z"
                                fill="white"
                            />
                        </svg>
                    </motion.div>

                    {/* Cube drawing phase */}
                    <motion.svg
                        viewBox="0 0 200 200"
                        className="absolute inset-0 w-full h-full gpu-accelerate"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{
                            opacity: phase === "unfolding" || phase === "zooming" ? 0 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Outer hexagon */}
                        <motion.path
                            d="M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z"
                            stroke="white"
                            strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                                pathLength: { delay: 0, duration: 0.7, ease },
                                opacity: { delay: 0, duration: 0.15 },
                            }}
                        />
                        {/* Top face */}
                        <motion.path
                            d="M100 20 L170 60 L100 100 L30 60 Z"
                            stroke="white"
                            strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                                pathLength: { delay: 0.25, duration: 0.7, ease },
                                opacity: { delay: 0.25, duration: 0.15 },
                            }}
                        />
                        {/* Inner diamond - accent */}
                        <motion.path
                            d="M100 45 L130 62 L100 80 L70 62 Z"
                            stroke="hsl(var(--accent))"
                            strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                                pathLength: { delay: 0.5, duration: 0.7, ease },
                                opacity: { delay: 0.5, duration: 0.15 },
                            }}
                        />
                        {/* Center line */}
                        <motion.path
                            d="M100 100 L100 180"
                            stroke="white"
                            strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                                pathLength: { delay: 0.4, duration: 0.7, ease },
                                opacity: { delay: 0.4, duration: 0.15 },
                            }}
                        />
                        {/* Left line */}
                        <motion.path
                            d="M30 60 L100 100"
                            stroke="white"
                            strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                                pathLength: { delay: 0.35, duration: 0.7, ease },
                                opacity: { delay: 0.35, duration: 0.15 },
                            }}
                        />
                        {/* Right square - accent */}
                        <motion.path
                            d="M115 110 L155 88 L155 135 L115 157 Z"
                            stroke="hsl(var(--accent))"
                            strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                                pathLength: { delay: 0.65, duration: 0.7, ease },
                                opacity: { delay: 0.65, duration: 0.15 },
                            }}
                        />
                        {/* Right line */}
                        <motion.path
                            d="M170 60 L100 100"
                            stroke="white"
                            strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                                pathLength: { delay: 0.35, duration: 0.7, ease },
                                opacity: { delay: 0.35, duration: 0.15 },
                            }}
                        />
                    </motion.svg>

                    {/* Unfolding faces */}
                    <AnimatePresence>
                        {(phase === "unfolding" || phase === "zooming") && (
                            <div className="absolute inset-0 gpu-accelerate" style={{ perspective: "800px" }}>
                                {/* Top face - unfolds up */}
                                <motion.div
                                    className="absolute inset-0 gpu-accelerate"
                                    initial={{ rotateX: 0, y: 0, opacity: 1 }}
                                    animate={{
                                        rotateX: -120,
                                        y: -40,
                                        opacity: phase === "zooming" ? 0 : 0.8
                                    }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ transformOrigin: "center bottom", transformStyle: "preserve-3d" }}
                                >
                                    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
                                        <path
                                            d="M100 20 L170 60 L100 100 L30 60 Z"
                                            stroke="white"
                                            strokeWidth="1"
                                            fill="black"
                                        />
                                        <path
                                            d="M100 45 L130 62 L100 80 L70 62 Z"
                                            stroke="hsl(var(--accent))"
                                            strokeWidth="1"
                                        />
                                    </svg>
                                </motion.div>

                                {/* Left face - unfolds left */}
                                <motion.div
                                    className="absolute inset-0 gpu-accelerate"
                                    initial={{ rotateY: 0, x: 0, opacity: 1 }}
                                    animate={{
                                        rotateY: 100,
                                        x: -35,
                                        opacity: phase === "zooming" ? 0 : 0.8
                                    }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                                    style={{ transformOrigin: "right center", transformStyle: "preserve-3d" }}
                                >
                                    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
                                        <path
                                            d="M30 60 L100 100 L100 180 L30 140 Z"
                                            stroke="white"
                                            strokeWidth="1"
                                            fill="black"
                                        />
                                    </svg>
                                </motion.div>

                                {/* Right face - unfolds right */}
                                <motion.div
                                    className="absolute inset-0 gpu-accelerate"
                                    initial={{ rotateY: 0, x: 0, opacity: 1 }}
                                    animate={{
                                        rotateY: -100,
                                        x: 35,
                                        opacity: phase === "zooming" ? 0 : 0.8
                                    }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                                    style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
                                >
                                    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
                                        <path
                                            d="M170 60 L100 100 L100 180 L170 140 Z"
                                            stroke="white"
                                            strokeWidth="1"
                                            fill="black"
                                        />
                                        <path
                                            d="M115 110 L155 88 L155 135 L115 157 Z"
                                            stroke="hsl(var(--accent))"
                                            strokeWidth="1"
                                        />
                                    </svg>
                                </motion.div>

                                {/* Center reveal - mini preview */}
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center gpu-accelerate"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: 0.3 }}
                                >
                                    <div className="w-14 h-14 rounded bg-card border border-border/30 overflow-hidden">
                                        <div className="h-1.5 bg-muted/50 flex items-center px-1 gap-0.5">
                                            <div className="w-0.5 h-0.5 rounded-full bg-accent" />
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-center gap-1 p-2">
                                            <div className="w-6 h-0.5 bg-foreground/30 rounded-full" />
                                            <div className="w-4 h-0.5 bg-accent/50 rounded-full" />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Particles */}
                    {phase === "drawing" && [...Array(4)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-foreground gpu-accelerate"
                            style={{ top: "50%", left: "50%" }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 0.8, 0],
                                scale: [0, 1, 0],
                                x: (Math.random() - 0.5) * 80,
                                y: (Math.random() - 0.5) * 80,
                            }}
                            transition={{
                                delay: 1.4 + i * 0.08,
                                duration: 0.6,
                            }}
                        />
                    ))}
                </div>

                {/* Loading text */}
                <motion.div
                    className="flex flex-col items-center gap-4"
                    animate={{
                        opacity: phase === "zooming" ? 0 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center gap-0.5">
                        {["D", "E", "E", "P", "H", "U", "B", "A", "I"].map((letter, i) => (
                            <motion.span
                                key={i}
                                className="text-2xl font-light tracking-[0.4em] text-foreground"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.3 + i * 0.08, duration: 0.35 }}
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </div>

                    {/* Loading bar */}
                    <motion.div
                        className="w-40 h-px bg-muted rounded-full overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.6 }}
                    >
                        <motion.div
                            className="h-full bg-foreground"
                            initial={{ width: "0%" }}
                            animate={{ width: phase === "drawing" ? "60%" : "100%" }}
                            transition={{ duration: phase === "drawing" ? 1.2 : 0.25, ease: "easeOut" }}
                        />
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default CubeLoader;
