import React from 'react';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface ActionCardProps {
    title: string;
    icon: LucideIcon;
    color: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose';
    delay: number;
    onClick: () => void;
}

export default function ActionCard({ title, icon: Icon, color, delay, onClick }: ActionCardProps) {
    const colorMap = {
        blue: 'from-blue-500 to-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]',
        violet: 'from-violet-500 to-fuchsia-400 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
        emerald: 'from-emerald-500 to-teal-400 group-hover:shadow-[0_0_20px_rgba(20,184,166,0.3)]',
        amber: 'from-amber-500 to-orange-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
        rose: 'from-rose-500 to-pink-400 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]',
    };

    const borderMap = {
        blue: 'group-hover:border-cyan-500/50',
        violet: 'group-hover:border-violet-500/50',
        emerald: 'group-hover:border-emerald-500/50',
        amber: 'group-hover:border-amber-500/50',
        rose: 'group-hover:border-rose-500/50',
    };

    const bgGradient = colorMap[color] || colorMap.blue;
    const borderHover = borderMap[color] || borderMap.blue;

    return (
        <div
            onClick={onClick}
            className={`
        group relative p-6 rounded-2xl bg-[#0a0c10] border border-white/5 
        hover:bg-[#11141c] transition-all duration-300 cursor-pointer overflow-hidden
        ${borderHover}
        animate-fade-up
      `}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Hover Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl bg-white/5 text-white ${bgGradient} bg-clip-text text-transparent`}>
                        <Icon size={28} className="stroke-[1.5]" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight size={14} className="text-white" />
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-semibold text-white group-hover:tracking-wide transition-all duration-300">
                        {title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        AI-powered generation with instant verification.
                    </p>
                </div>
            </div>
        </div>
    );
}
