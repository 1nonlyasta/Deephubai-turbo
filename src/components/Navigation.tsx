import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, LogIn, UserPlus, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const Navigation: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? "glass py-4" : "bg-transparent py-6"
                }`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
        >
            <div className="container px-6 md:px-12 flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="flex items-center gap-3 group">
                    <svg className="w-8 h-8 text-foreground/80 group-hover:text-foreground transition-colors">
                        <use href="../src/assets/logo-new.svg" />
                    </svg>

                    <span className="font-light tracking-[0.3em] text-sm">
                        DEEPHUB AI
                    </span>
                </a>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-8">
                    {["About", "Values", "Team", "Contact"].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
                        </a>
                    ))}
                </div>

                {/* Auth Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 text-sm font-light px-5 py-2 rounded-full border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300 group">
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Account</span>
                            <ChevronDown className="w-3 h-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-48 bg-background border border-border shadow-xl"
                    >
                        <DropdownMenuItem
                            className="cursor-pointer flex items-center gap-3 py-3 hover:bg-accent/10 focus:bg-accent/10"
                            onClick={() => navigate("/login")}
                        >
                            <LogIn className="w-4 h-4 text-accent" />
                            <span>Login</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-border" />

                        <DropdownMenuItem
                            className="cursor-pointer flex items-center gap-3 py-3 hover:bg-accent/10 focus:bg-accent/10"
                            onClick={() => navigate("/signup")}
                        >
                            <UserPlus className="w-4 h-4 text-accent" />
                            <span>Sign Up</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.nav>
    );
};

export default Navigation;
