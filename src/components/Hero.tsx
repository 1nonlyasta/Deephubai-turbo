import React from "react"
import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"

interface HeroProps {
    hideAstronaut?: boolean;
}

const Hero: React.FC<HeroProps> = ({ hideAstronaut }) => {
    return (
        <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden px-safe">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-foreground/[0.02] rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-accent/[0.03] rounded-full blur-[80px]" />
            </div>

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
                    backgroundSize: "100px 100px"
                }}
            />

            <div className="container relative z-10 px-6 md:px-12">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Eyebrow */}
                    <motion.p
                        className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground mb-6 md:mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Welcome to the future
                    </motion.p>

                    {/* Headline */}
                    <motion.h1
                        className="
              font-light mb-6 md:mb-8
              text-[clamp(2.5rem,8vw,6rem)]
              leading-[1.05] md:leading-[0.95]
            "
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        We build
                        <br />
                        <span className="text-gradient font-semibold">tomorrow</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        className="
              text-muted-foreground font-light
              text-[clamp(1rem,2.5vw,1.25rem)]
              max-w-xl mx-auto mb-12 md:mb-16
            "
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Pioneering digital solutions that reshape industries and redefine
                        what's possible.
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <a
                            href="#about"
                            className="group inline-flex items-center gap-3 text-sm font-light text-foreground hover:text-accent transition-colors"
                        >
                            <span className="relative">
                                Discover our story
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all group-hover:w-full" />
                            </span>
                            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Floating cube — decorative only */}
            <motion.div
                className="absolute bottom-20 right-20 w-12 h-12 border border-foreground/10 rotate-45 hidden lg:block"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 45 }}
                transition={{ duration: 1, delay: 1 }}
                style={{ animation: "float 8s ease-in-out infinite" }}
            />

            {/* Scroll indicator — hide on very short screens */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
            >
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-muted-foreground/50 to-transparent" />
            </motion.div>
        </section>
    )
}

export default Hero;
