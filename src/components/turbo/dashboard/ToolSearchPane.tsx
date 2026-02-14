import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ArrowRight, Command, LucideIcon } from 'lucide-react';

interface Tool {
    id: string;
    title: string;
    description?: string;
    icon: LucideIcon;
}

interface ToolSearchPaneProps {
    tools: Tool[];
    onToolClick: (id: string) => void;
}

export default function ToolSearchPane({ tools, onToolClick }: ToolSearchPaneProps) {
    const [query, setQuery] = useState('');

    const filteredTools = useMemo(() => {
        return tools.filter(tool =>
            tool.title.toLowerCase().includes(query.toLowerCase()) ||
            (tool.description?.toLowerCase().includes(query.toLowerCase()))
        );
    }, [tools, query]);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-12 animate-fade-in">

            {/* Search Header Section */}
            <div className="relative space-y-6">
                <div className="absolute -top-24 -left-20 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />
                <div className="absolute -top-24 -right-20 w-64 h-64 bg-violet-500/10 blur-[100px] rounded-full" />

                <div className="text-center space-y-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest"
                    >
                        <Sparkles size={12} />
                        <span>AI Powered Search</span>
                    </motion.div>
                    <h2 className="text-5xl font-black bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent italic tracking-tighter">
                        What are we building today?
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium opacity-60">
                        Search across our neural engine for the perfect academic tool.
                    </p>
                </div>

                {/* Neural Search Bar */}
                <div className="max-w-2xl mx-auto relative group z-10">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500" />
                    <div className="relative flex items-center bg-[#0a0c10] border border-white/10 rounded-2xl p-2 transition-all group-focus-within:border-white/30">
                        <div className="flex items-center justify-center w-12 text-white/20 group-focus-within:text-cyan-400 transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search tools (e.g. Paper, Lesson, PPT...)"
                            className="flex-1 bg-transparent border-none outline-none text-white text-lg font-medium placeholder:text-white/10 h-14 pr-4"
                            autoFocus
                        />
                        <div className="items-center gap-2 pr-4 text-white/20 select-none hidden sm:flex">
                            <Command size={14} />
                            <span className="text-[10px] font-bold">K</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tool Listing Area */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                        {query ? `Neural Matches (${filteredTools.length})` : 'Neural Tool Ecosystem'}
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredTools.map((tool, idx) => (
                            <motion.div
                                key={tool.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.03 }}
                                onClick={() => onToolClick(tool.id)}
                                className="group relative flex items-center gap-6 p-6 bg-[#0a0c10] border border-white/5 rounded-3xl hover:bg-white/[0.02] hover:border-white/20 transition-all cursor-pointer group"
                            >
                                {/* Tool Icon */}
                                <div className={`
                  w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center transition-all duration-500
                  group-hover:scale-110 group-hover:bg-cyan-500/10
                `}>
                                    <tool.icon size={28} className="text-white group-hover:text-cyan-400 transition-colors stroke-[1.5]" />
                                </div>

                                {/* Tool Info */}
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                                        {tool.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground group-hover:text-white/40 transition-colors">
                                        {tool.description || 'AI-powered generation with instant neural verification.'}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <div className="p-3 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                    <ArrowRight size={20} className="text-cyan-400" />
                                </div>

                                {/* Selection Bar */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-cyan-500 group-hover:h-12 transition-all duration-300 rounded-r-full" />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredTools.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-20 text-center space-y-4 grayscale opacity-20"
                        >
                            <Search size={48} className="mx-auto" />
                            <p className="text-xl font-bold">No neural matches for "{query}"</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
