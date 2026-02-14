import React, { useState, useEffect } from 'react';
import {
    Database,
    Search,
    Trash2,
    Download,
    Loader2,
    FileText,
    BookOpen,
    Brain,
    Presentation,
    Clock,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface LibraryItem {
    id: string;
    type: 'question-paper' | 'homework' | 'lesson-plan' | 'ppt-content';
    title: string;
    content: string;
    timestamp: string;
    metadata: {
        difficulty?: string;
        schoolName?: string;
        [key: string]: any;
    };
}

const TYPE_ICONS: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
    'question-paper': { icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    'homework': { icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    'lesson-plan': { icon: Brain, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    'ppt-content': { icon: Presentation, color: 'text-amber-400', bg: 'bg-amber-400/10' }
};

export default function Library() {
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<string>('all');
    const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

    useEffect(() => {
        fetchLibrary();
    }, []);

    const fetchLibrary = async () => {
        try {
            const response = await fetch('/api/library');
            const data = await response.json();
            if (data.success) {
                setItems(data.library);
            }
        } catch (err) {
            console.error("Library fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Don't open the modal
        if (!confirm("Are you sure you want to delete this record?")) return;

        try {
            const response = await fetch(`/api/library/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setItems(items.filter(item => item.id !== id));
                if (selectedItem?.id === id) setSelectedItem(null);
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
            JSON.stringify(item.metadata).toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || item.type === filter;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-dh-brand" size={48} />
                <p className="text-muted-foreground animate-pulse">Syncing with Neural Library...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Database className="text-dh-brand" /> My Academic Library
                    </h2>
                    <p className="text-muted-foreground mt-1">Access your generated assets and historical records.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-dh-brand transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search library..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-dh-brand/20 w-64 transition-all"
                        />
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        {['all', 'question-paper', 'homework', 'lesson-plan'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-dh-brand text-black shadow-lg' : 'text-muted-foreground hover:text-white'
                                    }`}
                            >
                                {f === 'all' ? 'All' : f.split('-')[0]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredItems.map((item, idx) => {
                        const Config = TYPE_ICONS[item.type] || { icon: FileText, color: 'text-white', bg: 'bg-white/10' };
                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative bg-[#0a0c10] border border-white/5 rounded-3xl p-6 hover:border-dh-brand/50 transition-all cursor-pointer overflow-hidden shadow-xl"
                                onClick={() => setSelectedItem(item)}
                            >
                                {/* Background Glow */}
                                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-30 ${Config.color.replace('text', 'bg')}`} />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={`p-3 rounded-2xl ${Config.bg} ${Config.color}`}>
                                            <Config.icon size={24} />
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
                                            <Clock size={12} />
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-dh-brand transition-colors">
                                        {item.title}
                                    </h3>

                                    <div className="mt-auto space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            {item.metadata.difficulty && (
                                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 border border-white/10 rounded text-muted-foreground">
                                                    {item.metadata.difficulty}
                                                </span>
                                            )}
                                            {item.metadata.schoolName && (
                                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 border border-white/10 rounded text-muted-foreground truncate max-w-[120px]">
                                                    {item.metadata.schoolName}
                                                </span>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-muted-foreground group-hover:text-white transition-colors">
                                            <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                                View Item <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
                <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-6 bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-muted-foreground/20">
                        <Database size={40} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xl font-bold text-white">Your library is empty</h4>
                        <p className="text-sm text-muted-foreground max-w-xs">Start generating papers or lesson plans to build your digital academic repository.</p>
                    </div>
                </div>
            )}

            {/* Viewer Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10"
                    >
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedItem(null)} />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-5xl h-full bg-[#0a0c10] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
                        >
                            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${TYPE_ICONS[selectedItem.type]?.bg || 'bg-white/10'}`}>
                                        {React.createElement(TYPE_ICONS[selectedItem.type]?.icon || FileText, { size: 20, className: TYPE_ICONS[selectedItem.type]?.color })}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{selectedItem.title}</h3>
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest">{selectedItem.type.replace('-', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-dh-brand text-black rounded-xl font-bold text-xs transition-all hover:scale-105">
                                        <Download size={16} /> DOWNLOAD
                                    </button>
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
                                    >
                                        <ChevronRight className="rotate-90 md:rotate-0" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-[#020408] custom-scrollbar">
                                <div className="max-w-4xl mx-auto">
                                    <div className="prose prose-invert prose-headings:text-dh-brand prose-p:text-white/80 prose-li:text-white/70 max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {selectedItem.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                                <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} /> {new Date(selectedItem.timestamp).toLocaleString()}
                                    </div>
                                    {selectedItem.metadata.schoolName && (
                                        <div className="flex items-center gap-2">
                                            <FileText size={12} /> {selectedItem.metadata.schoolName}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, selectedItem.id)}
                                    className="text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                >
                                    <Trash2 size={12} /> Delete Record
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
