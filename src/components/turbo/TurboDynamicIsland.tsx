import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, Cpu, Share2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../../assets/logo-new.svg";
import AIModelSwitcher from "../AIModelSwitcher";

interface TurboDynamicIslandProps {
  title: string;
  activePage?: string;
}

export default function TurboDynamicIsland({
  title,
  activePage = "dashboard",
}: TurboDynamicIslandProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const [status] = useState("System Online");

  // Animation variants for the "Island"
  const islandVariants: any = {
    compact: {
      width: "auto",
      minWidth: "180px",
      height: "38px",
      borderRadius: "20px",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    expanded: {
      width: "450px",
      height: "120px",
      borderRadius: "28px",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.div
        variants={islandVariants}
        initial="compact"
        animate={isExpanded ? "expanded" : "compact"}
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
        className="bg-black border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] pointer-events-auto flex flex-col overflow-hidden relative cursor-pointer group"
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* COMPACT STATE */
            <motion.div
              key="compact"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="h-full flex items-center justify-between px-4 gap-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                  {title === "dashboard" ? "Neural Workspace" : title}
                </span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Zap size={10} fill="currentColor" />
                <span className="text-[9px] font-bold">V4</span>
              </div>
            </motion.div>
          ) : (
            /* EXPANDED STATE (Dynamic Island Feel) */
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 h-full flex flex-col justify-between"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img
                      src={BrandLogo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      {title === "dashboard" ? "Neural Workspace" : title}
                    </h4>
                    <span className="text-[9px] text-emerald-400 font-medium tracking-widest uppercase">
                      ● {status}
                    </span>
                  </div>
                </div>

                {activePage === "dashboard" ? (
                  <AIModelSwitcher compact={false} />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <Zap
                      size={12}
                      className="text-emerald-400"
                      fill="currentColor"
                    />
                    <span className="text-[9px] font-bold text-emerald-400 tracking-wide">
                      POWERED BY GROQ
                    </span>
                  </div>
                )}
              </div>

              {/* Navigation & Search Area */}
              <div className="flex items-center gap-2">
                {/* Navigation Links */}
                <div className="flex items-center gap-1">
                  {[
                    { path: "/latest", label: "Latest", icon: Zap },
                    { path: "/virtualbrain", label: "Virtual", icon: Cpu },
                    { path: "/circuitbrain", label: "Circuit", icon: Share2 },
                    { path: "/profile", label: "Profile", icon: User },
                  ].map((link) => (
                    <button
                      key={link.path}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(link.path);
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-cyan-400 text-white/40 transition-all flex flex-col items-center justify-center gap-1 group/link"
                      title={link.label}
                    >
                      <link.icon
                        size={14}
                        className="group-hover/link:scale-110 transition-transform"
                      />
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-white/10 mx-1" />

                {/* Search Bar */}
                <div className="bg-white/5 rounded-xl p-2.5 flex items-center gap-3 border border-white/5 flex-1">
                  <Search size={14} className="text-white/30" />
                  <input
                    type="text"
                    placeholder="Neural Command Search..."
                    className="bg-transparent border-none outline-none text-[11px] text-white flex-1 placeholder:text-white/20 w-full"
                  />
                  <div className="flex items-center gap-1.5 bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
                    <span className="text-[8px] font-bold text-white/40">
                      ⌘
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle Bottom Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      </motion.div>
    </div>
  );
}
