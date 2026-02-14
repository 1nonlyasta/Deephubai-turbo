import * as React from "react";
import { motion } from "framer-motion";
import Logo from "../assets/logo-new.png";

const Footer: React.FC = () => {
    return (
        <footer className="py-8 sm:py-12 border-t border-border/50">
            <div className="container px-4 sm:px-6 md:px-12">
                <div className="flex flex-col items-center gap-8 md:gap-6">
                    {/* Logo */}
                    <motion.a
                        href="#"
                        className="flex items-center gap-2 sm:gap-3 group"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <img
                            src={Logo}
                            alt="Logo"
                            className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                        />
                        <span className="font-light tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm text-foreground/60">DEEPHUB AI</span>
                    </motion.a>

                    {/* Links - Responsive Grid */}
                    <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-4 md:gap-8 max-w-lg md:max-w-none">
                        {["Twitter", "LinkedIn", "Instagram", "Youtube", "Help Centre", "Jobs", "Terms Of Use", "Cookie Prefrence"].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 whitespace-nowrap"
                            >
                                {link}
                            </a>
                        ))}
                    </nav>

                    {/* Copyright */}
                    <p className="text-xs sm:text-sm text-muted-foreground text-center">
                        © {new Date().getFullYear()} DeepHubAI. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
