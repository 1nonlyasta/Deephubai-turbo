import React, { useState } from 'react';
import { Search, Bell, Sparkles } from 'lucide-react';

interface TurboHeaderProps {
    title: string;
}

export default function TurboHeader({ title }: TurboHeaderProps) {
    const [model, setModel] = useState<'turbo-v4' | 'tafitti'>('turbo-v4');

    return (
        <header className="h-20 flex items-center justify-between px-8 bg-[#020408]/80 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
            {/* Page Title */}
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white tracking-wide font-display">
                    {title}
                </h1>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                        System Online
                    </span>
                </div>
            </div>

            {/* Center Search - Productivity Style */}
            <div className="flex-1 max-w-xl mx-12 hidden md:block group">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search tools, students, or generate command..."
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-light"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">

                {/* Model Selector */}
                <div className="hidden lg:flex items-center bg-white/5 rounded-full px-1 p-1 border border-white/5">
                    <button
                        onClick={() => setModel('turbo-v4')}
                        className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${model === 'turbo-v4' ? 'bg-[#1a1f2e] text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)] border border-cyan-500/20' : 'text-muted-foreground hover:text-white'}
            `}
                    >
                        <Sparkles size={12} />
                        <span>Turbo V4</span>
                    </button>
                    <button
                        onClick={() => setModel('tafitti')}
                        className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${model === 'tafitti' ? 'bg-[#1a1f2e] text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.15)] border border-violet-500/20' : 'text-muted-foreground hover:text-white'}
            `}
                    >
                        <span className="text-[10px]">🩺</span>
                        <span>Tafitti</span>
                    </button>
                </div>

                {/* Notifications */}
                <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-[#020408]"></span>
                </button>

                {/* Profile User */}
                <div className="flex items-center gap-3 pl-6 border-l border-white/5">
                    <div className="flex-col items-end hidden sm:flex">
                        <span className="text-xs font-medium text-white">Adithya</span>
                        <span className="text-[10px] text-muted-foreground">Pro Educator</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-shadow">
                        <div className="w-full h-full rounded-full bg-[#020408] flex items-center justify-center overflow-hidden">
                            <img src="https://github.com/shadcn.png" alt="User" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
