import * as React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const Contact: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        /* py-0 ensures we maintain the minimal gaps controlled by the parent Aboutus.jsx */
        <section id="contact" className="py-0 md:py-0 relative bg-transparent">
            <div className="container px-6 md:px-12">
                <motion.div
                    ref={ref}
                    className="max-w-4xl mx-auto text-center"
                    initial={{ opacity: 0, y: 60 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >


                    {/* Main Heading: Clash Display, tight leading/tracking */}
                    <h2 className="font-clash text-5xl md:text-7xl lg:text-8xl font-light leading-[0.9] tracking-[-0.04em] mb-8">
                        Lets Meet & <br />
                        <span className="font-semibold text-[#b3daff]">Connect</span> with us
                    </h2>

                    <p className="text-lg text-white/50 font-sans font-light max-w-xl mx-auto mb-12 leading-relaxed">
                        We're always excited to meet new collaborators, dreamers, and doers.
                        Let's start a conversation about the future.
                    </p>

                    {/* Button: Replicating the 'Sign Up' style from Navigation (Solid White Pill) */}
                    <motion.a
                        href="mailto:deephubai.org@gmail.com"
                        className="group inline-flex items-center px-8 py-2 rounded-full border-2 border-white bg-transparent text-white text-sm font-semibold hover:bg-white hover:text-black transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Join Now
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
};

export default Contact;
