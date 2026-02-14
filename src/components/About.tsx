import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Reason {
    title: string;
    description: string;
}

const reasons: Reason[] = [
    {
        title: "All-in-One AI Hub",
        description: "A unified platform for everything AI."
    },
    {
        title: "Customized Platform",
        description: "Solutions that adapt to your needs, workflow, and goals."
    },
    {
        title: "News & Updates",
        description: "Stay ahead with real-time AI breakthroughs and insights."
    },
    {
        title: "Explore AI Products",
        description: "Discover advanced robots, smart tools, and futuristic technologies."
    },
    {
        title: "Personalized AI Assistant",
        description: "Your intelligent companion for tasks, learning, and decision-making."
    },
    {
        title: "Powerful AI Community",
        description: "Connect, collaborate, and grow with innovators shaping the future."
    }
];

const About: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        /* Background kept consistent with site-wide dark theme */
        <div className="bg-[#050505] text-white selection:bg-[#b3daff]/30">
            <section id="about" className="py-0 md:py-0 relative overflow-hidden">

                {/* Subtle brand-colored background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(179,218,255,0.03)_0%,transparent_70%)] pointer-events-none" />

                <div className="container px-6 md:px-12 relative z-10">

                    {/* Section Header: Replicating Navigation typography */}
                    <motion.div
                        ref={ref}
                        className="max-w-4xl mb-20"
                        initial={{ opacity: 0, y: 40 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >


                        {/* Matches Hero/Branding: Clash Display, tight leading/tracking */}
                        <h2 className="font-clash text-5xl md:text-7xl font-light leading-[0.9] tracking-[-0.04em]">
                            Why Choose <br />
                            <span className="font-semibold text-[#b3daff]">DeepHub AI?</span>
                        </h2>
                    </motion.div>

                    {/* 6-Box Grid Implementation */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reasons.map((reason, index) => (
                            <motion.div
                                key={reason.title}
                                /* glass-like boxes with subtle borders */
                                className="group p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#b3daff]/50 transition-all duration-500 hover:bg-white/[0.05]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.1 * index }}
                            >
                                {/* Box Title in Clash Display */}
                                <h3 className="font-clash text-xl font-semibold mb-4 text-white group-hover:text-[#b3daff] transition-colors">
                                    {reason.title}
                                </h3>

                                {/* Box Description in clean sans-serif */}
                                <p className="text-white/50 font-sans leading-relaxed text-sm md:text-base font-light">
                                    {reason.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
