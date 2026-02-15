import React, { useState, useEffect } from 'react';
import {
    Upload,
    FileText,
    Trash2,
    Sparkles,
    Download,
    Loader2,
    Brain,
    Check,
    X,
    Plus,
    ClipboardList,
    Database
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';
import BrandLogo from '../../../assets/logo-new.svg';

import { useAI } from "../../../context/AIContext";

const preprocessLatex = (content: string) => {
    if (!content) return '';
    let processed = content
        // 1. Normalize delimiters
        .replace(/\\\[/g, '$$')
        .replace(/\\\]/g, '$$')
        .replace(/\\\(/g, '$')
        .replace(/\\\)/g, '$');

    // 2. Fix specific corruption patterns related to string escaping (e.g. \frac -> \u000c + rac)
    // Fix \frac becoming \u000crac (form feed)
    processed = processed.replace(/[\u000c]/g, '\\f'); // temporarily normalize \f char to \f string
    processed = processed.replace(/(\\f|f)rac\{/g, '\\frac{'); // fix \frac{ or frac{

    // Fix \times becoming \t + imes (tab) or just imes
    processed = processed.replace(/\t/g, '\\t'); // temporarily normalize tab char
    processed = processed.replace(/(\\t|t)imes/g, '\\times'); // fix \times or times

    // Fix potentially unescaped common functions & symbols (expanded list)
    const mathKeywords = [
        'sqrt', 'sin', 'cos', 'tan', 'log', 'ln', 'exp', 'lim', 'sup', 'inf',
        'pi', 'theta', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
        'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Upsilon', 'Phi', 'Psi', 'Omega',
        'hbar', 'partial', 'nabla', 'infty', 'propto', 'approx', 'sim', 'geq', 'leq', 'neq', 'pm', 'mp', 'div', 'cdot', 'bullet', 'circ', 'star',
        'cup', 'cap', 'in', 'subset', 'supset', 'subseteq', 'supseteq', 'forall', 'exists', 'neg', 'vee', 'wedge',
        'int', 'oint', 'sum', 'prod', 'coprod', 'hat', 'vec', 'bar', 'dot', 'ddot'
    ];
    
    // Create a regex that matches these keywords if they are NOT preceded by a backslash
    // Use lookahead for the suffix to avoid consuming it (important for adjacent keywords like 'sin cos')
    const keywordRegex = new RegExp(`([^\\\\])(${mathKeywords.join('|')})(?=(\\s|\\{|[0-9]|$))`, 'gi');
    processed = processed.replace(keywordRegex, '$1\\$2');

    // Handle keywords at the START of string
    const startRegex = new RegExp(`^(${mathKeywords.join('|')})(?=(\\s|\\{|[0-9]))`, 'gi');
    processed = processed.replace(startRegex, '\\$1');

    return processed;
};

export default function PaperSolver() {
    const { provider } = useAI();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ocrText, setOcrText] = useState('');
    const [isSolving, setIsSolving] = useState(false);
    interface SolutionItem {
        question_no: number;
        question: string;
        answer: string;
        explanation: string;
    }

    const [solutions, setSolutions] = useState<SolutionItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [loadingStep, setLoadingStep] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // AI Provider selection - REMOVED LOCAL STATE
    // type AIProvider = 'auto' | 'groq' | 'gemini' | 'ollama';
    // const [selectedProvider, setSelectedProvider] = useState<AIProvider>('auto');

    const LOADING_MESSAGES = [
        "Neural Eye scanning paper...",
        "Extracting academic identifiers...",
        "Decoding manual script...",
        "Cross-referencing knowledge bank...",
        "Synthesizing high-fidelity solutions...",
        "Finalizing pedagogical review..."
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSolving || isProcessing) {
            interval = setInterval(() => {
                setLoadingStep(prev => (prev + 1) % LOADING_MESSAGES.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isSolving, isProcessing]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let selectedFile: File | undefined;
        if ('files' in e.target && e.target.files) {
            selectedFile = e.target.files[0];
        } else if (e.type === 'drop' && 'dataTransfer' in e && e.dataTransfer.files) {
            selectedFile = e.dataTransfer.files[0];
        }

        if (selectedFile) {
            if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setPreview(selectedFile.type === 'application/pdf' ? 'pdf' : URL.createObjectURL(selectedFile));
                setOcrText('');
                setSolutions(null);
                setError(null);
            } else {
                setError("Please upload an image (PNG, JPG) or a PDF file.");
            }
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e);
    };

    const startSolvingProcess = async () => {
        if (!file) return;
        setIsSolving(true);
        setIsProcessing(true);
        setError(null);
        setProgress(0);

        try {
            let currentText = ocrText;
            if (file.type.startsWith('image/') && !currentText) {
                const result = await Tesseract.recognize(
                    file,
                    'eng',
                    {
                        logger: m => {
                            if (m.status === 'recognizing text') setProgress(m.progress * 40);
                        }
                    }
                );
                currentText = result.data.text;
                setOcrText(currentText);

                if (!currentText.trim()) {
                    throw new Error("No text found in the image. Please upload a clearer paper.");
                }
            }

            setProgress(50);


            let response;
            
            if (file.type === 'application/pdf') {
                const formData = new FormData();
                formData.append('paper', file);
                formData.append('preferredProvider', provider);
                // Optionally append text if we extracted any (though usually backend parses PDF)
                if (currentText) formData.append('paperText', currentText); 

                response = await fetch('/api/solve-paper', {
                    method: 'POST',
                    body: formData,
                });
            } else {
                // For Images/Text, we MUST have extracted text
                if (!currentText) throw new Error("Could not extract text from document.");
                
                response = await fetch('/api/solve-paper', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paperText: currentText }),
                });
            }

            const data = await response.json();
            if (data.success) {
                console.log("Solutions received:", data.solutions);
                setSolutions(data.solutions);
                setProgress(100);
            } else {
                throw new Error(data.error || "Solving engine failed.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSolving(false);
            setIsProcessing(false);
        }
    };

    const handleSaveToLibrary = async () => {
        if (!solutions) return;
        setIsSaving(true);
        try {

            const response = await fetch('/api/library/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'question-paper',
                    title: `Solutions - ${file?.name || 'Academic Paper'}`,
                    content: solutions,
                    metadata: {
                        fileName: file?.name,
                        timestamp: new Date().toISOString()
                    }
                })
            });
            const data = await response.json();
            if (data.success) {
                alert("Saved to library!");
            }
        } catch (err) {
            console.error("Save Error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const renderSolutionContent = (content: string) => {
        if (!content) return null;
        const items = content.split(/(?=### |#### )/g).filter(item => item.trim());
        return items.map((item, idx) => {
            const isSection = item.startsWith('### ');
            return (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className={`${isSection ? 'mt-12 mb-6 first:mt-0' :
                            'bg-white/5 border border-white/10 rounded-3xl p-8 mb-6 hover:border-rose-500/20 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] group hover:-translate-y-1 duration-300'
                        }`}
                >
                    <div className="prose prose-invert max-w-none 
            prose-p:text-white/80 prose-p:leading-relaxed prose-p:mb-4 last:prose-p:mb-0
            prose-headings:text-rose-400 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-wider
            prose-h3:text-2xl prose-h3:mb-2
            prose-h4:text-sm prose-h4:mb-4 prose-h4:text-rose-500/40 prose-h4:font-bold prose-h4:tracking-[0.2em]
            prose-strong:text-rose-300 prose-strong:font-black
            prose-li:text-white/70 prose-li:mb-2
            prose-ul:list-disc prose-ul:pl-4"
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                        >
                            {item}
                        </ReactMarkdown>
                    </div>
                </motion.div>
            );
        });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3 text-red-400">
                            <X size={18} />
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-500/40 hover:text-red-400 text-xs font-black uppercase tracking-widest">Dismiss</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                {/* INPUT PANEL */}
                <div className="lg:col-span-4 space-y-6 flex flex-col h-full">

                    {/* Upload Card */}
                    <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden flex-1 flex flex-col">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><Upload size={20} /></div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Paper Ingest</h3>
                            </div>
                            {file && (
                                <button
                                    onClick={() => { setFile(null); setPreview(null); setOcrText(''); setSolutions(null); }}
                                    className="p-2 hover:bg-white/5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>




                        {!preview ? (
                            <label
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl cursor-pointer transition-all group p-8 text-center ${isDragging
                                        ? 'border-rose-500 bg-rose-500/10 scale-[1.02]'
                                        : 'border-white/10 hover:border-rose-500/30 hover:bg-rose-500/5'
                                    }`}
                            >
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 ${isDragging ? 'bg-rose-500/20 scale-110' : 'bg-white/5 group-hover:scale-110'
                                    }`}>
                                    <Plus size={32} className={`transition-colors ${isDragging ? 'text-rose-500' : 'text-white/20 group-hover:text-rose-500'}`} />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">
                                    {isDragging ? 'Drop File Here' : 'Upload Question Paper'}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {isDragging ? 'Fast & Free Processing' : 'Supports PNG, JPG, PDF (Max 10MB)'}
                                </p>
                            </label>
                        ) : preview === 'pdf' ? (
                            <div className="flex-1 flex flex-col items-center justify-center bg-black/40 border border-white/10 rounded-2xl p-8 space-y-4 group relative">
                                <div className="w-20 h-20 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.1)]">
                                    <FileText size={40} />
                                </div>
                                <div className="text-center">
                                    <h5 className="text-white font-bold text-sm truncate max-w-[200px]">{file?.name}</h5>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">PDF Document</p>
                                </div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                    <label className="px-4 py-2 bg-white text-black rounded-xl font-bold text-xs cursor-pointer hover:bg-gray-200 transition-all">
                                        Change File
                                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 relative group bg-black/40">
                                <img src={preview as string} alt="Paper Preview" className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="px-4 py-2 bg-white text-black rounded-xl font-bold text-xs cursor-pointer hover:bg-gray-200 transition-all">
                                        Change File
                                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={startSolvingProcess}
                            disabled={!file || isSolving || isProcessing}
                            className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-black font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_10px_20px_rgba(225,29,72,0.2)] disabled:opacity-50 flex items-center justify-center gap-3 mt-auto"
                        >
                            {isSolving || isProcessing ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    <span>Solve Paper</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* PREVIEW PANEL */}
                <div className="lg:col-span-8 bg-[#0a0c10] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full">
                    <div className="bg-white/5 border-b border-white/5 px-8 h-16 flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-400 flex items-center gap-2">
                            <Brain size={14} /> Neural Solution Lab
                        </span>
                        {solutions && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSaveToLibrary}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-all active:scale-95"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                                    {isSaving ? 'Saving...' : 'Save to Library'}
                                </button>
                                <button
                                    onClick={() => { }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white text-white/60 hover:text-black rounded-xl font-bold text-xs transition-all border border-white/10 group"
                                >
                                    <Download size={14} /> Export Key
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 bg-[#0a0c10] overflow-y-auto p-12 custom-scrollbar">
                        {isProcessing || isSolving ? (
                            <div className="h-full w-full flex flex-col items-center justify-center space-y-8 max-w-sm mx-auto">
                                <div className="relative">
                                    <motion.div
                                        animate={{
                                            x: [0, 20, -20, 0],
                                            y: [0, -15, 15, 0],
                                            rotate: [0, 10, -10, 0],
                                            scale: [1, 1.05, 0.95, 1]
                                        }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                        className="relative z-10"
                                    >
                                        <div className="w-24 h-24 mx-auto relative group">
                                            <img src={BrandLogo} alt="Logo" className="w-full h-full object-contain filter brightness-125" />
                                            <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full -z-10" />
                                        </div>
                                    </motion.div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/5 rounded-full animate-[ping_3s_linear_infinite]" />
                                </div>

                                <div className="space-y-4 text-center w-full">
                                    <AnimatePresence mode="wait">
                                        <motion.div key={loadingStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-lg font-bold text-white">
                                            {LOADING_MESSAGES[loadingStep]}
                                        </motion.div>
                                    </AnimatePresence>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div className="h-full bg-rose-500" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            </div>
                        ) : !solutions ? (
                            <div className="h-full w-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-6">
                                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-rose-500/40">
                                    <ClipboardList size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold text-white">Solution Lab Ready</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">Upload any question paper. Our AI will OCR the content and generate high-fidelity, pedagogically sound solutions in seconds.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto space-y-2 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
                                <div className="space-y-4 border-b border-white/5 pb-8 mb-12">
                                    <h2 className="text-4xl font-black text-white tracking-tight uppercase italic underline decoration-rose-500 underline-offset-8 text-center lg:text-left">Solution Key</h2>
                                    <p className="text-muted-foreground text-[10px] uppercase tracking-[0.4em] font-black flex items-center gap-3">
                                        <span className="w-8 h-px bg-rose-500/30" />
                                        Neural Solver Engine Active
                                        <span className="w-8 h-px bg-rose-500/30" />
                                    </p>
                                </div>

                                <div className="space-y-6">
                                {solutions.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group relative bg-[#1A1A2E]/50 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="relative z-10 space-y-4">
                                            <div className="flex items-start gap-4">
                                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 font-bold text-sm">
                                                    Q{item.question_no || index + 1}
                                                </span>
                                                <div className="flex-1 space-y-2">
                                                    <h3 className="text-gray-200 font-medium leading-relaxed prose prose-invert max-w-none">
                                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                            {preprocessLatex(item.question)}
                                                        </ReactMarkdown>
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="pl-12 space-y-4">
                                                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                                                    <div className="flex items-baseline gap-2 mb-2">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-green-500/70">Answer</span>
                                                    </div>
                                                    <div className="text-green-400 font-medium prose prose-invert max-w-none">
                                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                            {preprocessLatex(item.answer)}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>

                                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                                    <div className="flex items-baseline gap-2 mb-2">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-500/70">Explanation</span>
                                                    </div>
                                                    <div className="text-blue-200/80 text-sm leading-relaxed prose prose-invert max-w-none">
                                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                            {preprocessLatex(item.explanation)}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
