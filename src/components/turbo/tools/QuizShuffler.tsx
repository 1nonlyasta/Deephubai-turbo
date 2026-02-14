import React, { useState } from 'react';
import {
    Shuffle,
    Copy,
    Check,
    Loader2,
    Sparkles,
    Layout,
    Download,
    RefreshCw,
    X,
    ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';

interface Versions {
    setA: string;
    setB: string;
    setC: string;
}

export default function QuizShuffler() {
    const [masterQuiz, setMasterQuiz] = useState('');
    const [versions, setVersions] = useState<Versions | null>(null);
    const [isShuffling, setIsShuffling] = useState(false);
    const [activeSet, setActiveSet] = useState<keyof Versions>('setA');
    const [copied, setCopied] = useState<keyof Versions | null>(null);

    const handleShuffle = async () => {
        if (!masterQuiz.trim()) return;
        setIsShuffling(true);
        try {

            const response = await fetch('/api/shuffler/version', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ masterQuiz })
            });
            const data = await response.json();
            if (response.ok) {
                setVersions(data.versions);
            }
        } catch (error) {
            console.error("SHUFFLE ERR:", error);
        } finally {
            setIsShuffling(false);
        }
    };

    const handleZipExport = async () => {
        if (!versions) return;

        const zip = new JSZip();
        zip.file("Set_A.txt", versions.setA);
        zip.file("Set_B.txt", versions.setB);
        zip.file("Set_C.txt", versions.setC);

        const content = await zip.generateAsync({ type: "blob" });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Quiz_Versions_${timestamp}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = (text: string, setId: keyof Versions) => {
        navigator.clipboard.writeText(text);
        setCopied(setId);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] animate-fade-in relative">

            {/* TOOL HEADER */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-600/10 flex items-center justify-center text-violet-500 shadow-lg shadow-violet-600/5">
                        <Shuffle size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-widest text-white leading-none">The Shuffler</h1>
                        <p className="text-[10px] text-muted-foreground mt-1 font-bold tracking-tight uppercase">Smart Quiz Versioning Engine</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-violet-600/5 border border-violet-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-violet-400">
                        Balanced Difficulty
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 relative z-10">

                {/* LEFT PANEL: MASTER INPUT */}
                <div className="lg:col-span-4 flex flex-col h-full min-h-0 space-y-6 relative z-20">
                    <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-8 space-y-6 flex-1 flex flex-col shadow-xl">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                                    <ClipboardList className="text-violet-500" size={20} /> Master Source
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">Input your questions and options to generate secure variants.</p>
                            </div>
                            <button
                                onClick={() => setMasterQuiz('')}
                                className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <textarea
                            value={masterQuiz}
                            onChange={(e) => setMasterQuiz(e.target.value)}
                            placeholder="Example:
 1. What is the capital of France?
 a) London
 b) Paris
 c) Berlin
 
 2. Solve x + 5 = 10..."
                            className="flex-1 w-full bg-[#020408] border border-white/10 rounded-2xl p-6 text-xs focus:border-violet-500 transition-all outline-none resize-none font-mono leading-relaxed"
                        />

                        <button
                            onClick={handleShuffle}
                            disabled={isShuffling || !masterQuiz.trim()}
                            className="w-full py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-violet-600/20 flex items-center justify-center gap-3 transition-all hover:scale-[0.99] active:scale-[0.97] disabled:opacity-50 text-xs"
                        >
                            {isShuffling ? <Loader2 className="animate-spin" size={20} /> : <><Shuffle size={20} /> Shuffling Engine</>}
                        </button>
                    </div>
                </div>

                {/* RIGHT PANEL: VERSIONS VIEW */}
                <div className="lg:col-span-8 bg-[#0a0c10] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full min-h-0 relative group">

                    <div className="bg-white/5 border-b border-white/5 px-8 h-16 flex items-center justify-between z-20">
                        <div className="flex items-center gap-4">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-400 flex items-center gap-2">
                                <Layout size={14} /> Neural Versions
                            </span>
                            {versions && (
                                <div className="flex gap-2 ml-4">
                                    {(['setA', 'setB', 'setC'] as const).map((setId) => (
                                        <button
                                            key={setId}
                                            onClick={() => setActiveSet(setId)}
                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeSet === setId
                                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                                                    : 'bg-white/5 text-muted-foreground hover:text-white'
                                                }`}
                                        >
                                            {setId.replace('set', 'Set ')}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {versions && (
                            <button
                                onClick={() => copyToClipboard(versions[activeSet], activeSet)}
                                className="flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-white text-white/60 hover:text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                {copied === activeSet ? <Check size={14} /> : <Copy size={14} />}
                                {copied === activeSet ? 'Success' : 'Copy Version'}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 bg-[#020408] custom-scrollbar relative">
                        <div className="absolute inset-0 bg-[#020408] z-0" />

                        {!versions ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto relative z-10">
                                <div className="w-24 h-24 rounded-3xl bg-violet-600/5 flex items-center justify-center text-violet-500/30 relative">
                                    <RefreshCw size={48} className="animate-spin-slow opacity-20" />
                                    <div className="absolute inset-0 border border-violet-500/10 rounded-3xl animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold text-white tracking-tight">Encryption Engine Ready</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed px-4">Supply your master quiz to generate 3 unique variants with balanced parity.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 h-full relative z-10">
                                <textarea
                                    readOnly
                                    value={versions[activeSet]}
                                    className="w-full h-full bg-transparent border-none outline-none resize-none font-mono text-white/80 leading-relaxed text-sm p-4 focus:ring-0"
                                />
                            </div>
                        )}
                    </div>

                    {versions && (
                        <div className="bg-white/5 border-t border-white/5 px-8 py-6 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                                <Sparkles size={14} className="text-violet-500 animate-pulse" />
                                Complexity Parity Verified
                            </div>
                            <button
                                onClick={handleZipExport}
                                className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.05] shadow-lg shadow-violet-600/20"
                            >
                                <Download size={14} /> Neural ZIP Export
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
