import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Database,
    FileText,
    BookOpen,
    Brain,
    Presentation,
    ClipboardList,
    BarChart3,
    FileEdit,
    Shuffle,
    X,
    Menu,
    Bell,
    Search,
    LucideIcon
} from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    icon: LucideIcon;
    color: string;
}

const MENU_ITEMS: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'cyan' },
    { id: 'library', label: 'Library', icon: Database, color: 'indigo' },
    { id: 'question-gen', label: 'Questions', icon: FileText, color: 'blue' },
    { id: 'homework', label: 'Homework', icon: BookOpen, color: 'purple' },
    { id: 'lesson-plan', label: 'Lesson', icon: Brain, color: 'emerald' },
    { id: 'ppt-gen', label: 'Slides', icon: Presentation, color: 'amber' },
    { id: 'paper-solver', label: 'Solver', icon: ClipboardList, color: 'rose' },
    { id: 'report-assistant', label: 'Reports', icon: BarChart3, color: 'green' },
    { id: 'secretary', label: 'Secretary', icon: FileEdit, color: 'sky' },
    { id: 'shuffler', label: 'Shuffler', icon: Shuffle, color: 'violet' },
];

interface TurboWatchDialProps {
    activePage: string;
    setActivePage: (page: string) => void;
}

export default function TurboWatchDial({ activePage, setActivePage }: TurboWatchDialProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [model, setModel] = useState<'Turbo V1' | 'Turbo V2'>('Turbo V1');
    const [status] = useState('System Online');

    const currentItem = MENU_ITEMS.find(item => item.id === activePage) || MENU_ITEMS[0];

    // Filter menu items based on search query
    const filteredItems = searchQuery
        ? MENU_ITEMS.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : MENU_ITEMS;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[200] lg:hidden">
            {/* Expanded Menu */}
            <AnimatePresence>
                {isExpanded && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setIsExpanded(false);
                                setSearchQuery('');
                            }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            style={{ zIndex: -1 }}
                        />

                        {/* Menu Grid */}
                        <motion.div
                            initial={{ y: 300, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 300, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/95 backdrop-blur-xl border-t-2 border-white/10 rounded-t-3xl shadow-[0_-10px_60px_rgba(0,0,0,0.8)]"
                        >
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-2">
                                <div className="w-12 h-1.5 rounded-full bg-white/20" />
                            </div>

                            {/* Header */}
                            <div className="px-6 pb-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Turbo Tools</h3>
                                        <p className="text-xs text-white/40">Select your AI assistant</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsExpanded(false);
                                            setSearchQuery('');
                                        }}
                                        className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
                                    >
                                        <X size={18} className="text-white" />
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                                    <Search size={18} className="text-cyan-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search tools..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white transition-colors">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Model Switcher & Status */}
                                <div className="flex items-center justify-between gap-3">
                                    {/* System Status */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">{status}</span>
                                    </div>

                                    {/* Model Switcher */}
                                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                                        <button
                                            onClick={() => setModel('Turbo V1')}
                                            className={`px-3 py-1.5 rounded-md text-[9px] font-black transition-all ${model === 'Turbo V1' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
                                                }`}
                                        >
                                            TURBO V1
                                        </button>
                                        <button
                                            onClick={() => setModel('Turbo V2')}
                                            className={`px-3 py-1.5 rounded-md text-[9px] font-black transition-all ${model === 'Turbo V2' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
                                                }`}
                                        >
                                            TURBO V2
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tools Grid */}
                            <div className="grid grid-cols-4 gap-4 px-4 pb-8">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => {
                                        const isActive = item.id === activePage;
                                        return (
                                            <motion.button
                                                key={item.id}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setActivePage(item.id);
                                                    setIsExpanded(false);
                                                    setSearchQuery('');
                                                }}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${isActive
                                                        ? 'bg-cyan-500/20 border border-cyan-500/40'
                                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isActive
                                                        ? 'bg-cyan-500 text-black'
                                                        : 'bg-white/10 text-white/70'
                                                    }`}>
                                                    <item.icon size={22} />
                                                </div>
                                                <span className={`text-[10px] font-bold text-center leading-tight ${isActive ? 'text-cyan-400' : 'text-white/60'
                                                    }`}>
                                                    {item.label}
                                                </span>
                                            </motion.button>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-4 py-8 text-center">
                                        <div className="text-white/40 text-sm">No tools found</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Bar - iPhone-style Glassmorphism */}
            <motion.div
                layout
                className="bg-black/20 backdrop-blur-[40px] border-t border-white/20 shadow-[0_-8px_32px_rgba(0,0,0,0.4)] backdrop-saturate-[180%]"
                style={{
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                }}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Current Tool */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 flex-shrink-0">
                            <currentItem.icon size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black text-white uppercase tracking-wide truncate">{currentItem.label}</span>
                            <span className="text-[10px] text-white/40 truncate">Active Tool</span>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Notification Button */}
                        <button className="relative w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg hover:bg-white/15">
                            <Bell size={18} className="text-white/70" />
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-black/50" />
                        </button>

                        {/* Menu Button */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg hover:bg-white/15"
                        >
                            <Menu size={20} className="text-white" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
