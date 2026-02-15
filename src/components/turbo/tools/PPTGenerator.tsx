import React, { useState, useEffect, useRef } from 'react';
import {
    Presentation,
    Download,
    Loader2,
    Sparkles,
    Layout,
    Plus,
    Minus,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Monitor,
    Mic,
    MicOff,
    Square,
    Database
} from 'lucide-react';
import pptxgen from "pptxgenjs";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from '../../../assets/logo-new.svg';

const LOADING_MESSAGES = [
    "Initializing neural engine...",
    "Analyzing pedagogical structure...",
    "Drafting scholarly slide content...",
    "Generating visual diagrams...",
    "Optimizing visual hierarchy...",
    "Finalizing presentation deck..."
];

interface Theme {
    name: string;
    bg: string;
    card: string;
    accent: string;
    border: string;
    gradient: string;
    pptBg: string;
    pptAccent: string;
}

const THEMES: Record<string, Theme> = {
    midnight: {
        name: 'Midnight',
        bg: 'bg-[#0a0c10]',
        card: 'bg-[#111827]',
        accent: 'text-cyan-400',
        border: 'border-cyan-500/20',
        gradient: 'from-cyan-500 to-blue-600',
        pptBg: '111827',
        pptAccent: '06B6D4'
    },
    aurora: {
        name: 'Aurora',
        bg: 'bg-[#0f0b1a]',
        card: 'bg-[#1a142e]',
        accent: 'text-purple-400',
        border: 'border-purple-500/20',
        gradient: 'from-purple-500 to-pink-600',
        pptBg: '1A142E',
        pptAccent: 'A855F7'
    },
    oceanic: {
        name: 'Oceanic',
        bg: 'bg-[#0b141a]',
        card: 'bg-[#14232e]',
        accent: 'text-emerald-400',
        border: 'border-emerald-500/20',
        gradient: 'from-emerald-500 to-teal-600',
        pptBg: '14232E',
        pptAccent: '10B981'
    },
    sunset: {
        name: 'Sunset',
        bg: 'bg-[#1a0f0a]',
        card: 'bg-[#2e1a14]',
        accent: 'text-orange-400',
        border: 'border-orange-500/20',
        gradient: 'from-orange-500 to-red-600',
        pptBg: '2E1A14',
        pptAccent: 'FB923C'
    },
    forest: {
        name: 'Forest',
        bg: 'bg-[#0a1a10]',
        card: 'bg-[#142e1a]',
        accent: 'text-green-400',
        border: 'border-green-500/20',
        gradient: 'from-green-500 to-emerald-700',
        pptBg: '142E1A',
        pptAccent: '4ADE80'
    },
    royal: {
        name: 'Royal',
        bg: 'bg-[#0f0f2e]',
        card: 'bg-[#1a1a40]',
        accent: 'text-yellow-400',
        border: 'border-yellow-500/20',
        gradient: 'from-blue-600 to-indigo-800',
        pptBg: '1A1A40',
        pptAccent: 'FACC15'
    },
    slate: {
        name: 'Slate',
        bg: 'bg-[#0f172a]',
        card: 'bg-[#1e293b]',
        accent: 'text-sky-300',
        border: 'border-slate-500/20',
        gradient: 'from-slate-600 to-slate-800',
        pptBg: '1E293B',
        pptAccent: '7DD3FC'
    }
};

interface Slide {
    type: string;
    title: string;
    bullets: string[];
    notes?: string;
    diagramData?: {
        steps: string[];
        label?: string;
    };
    data?: {
        leftTitle?: string;
        rightTitle?: string;
        leftItems: string[];
        rightItems: string[];
    };
    reflection?: string;
    tableData?: {
        headers: string[];
        rows: string[][];
    };
    comparisonData?: {
        leftTitle: string;
        rightTitle: string;
        pairs: string[][];
    };
    imageKeyword?: string;
}

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

    // Fix potentially unescaped common functions
    processed = processed.replace(/(\s)(sqrt|sin|cos|tan|log|ln|pi|theta|alpha|beta|gamma|delta|sigma)(\s|\{|[0-9])/gi, '$1\\$2$3');

    return processed;
};

export default function PPTGenerator() {
    const [topic, setTopic] = useState('');
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [slideCount, setSlideCount] = useState(5);
    const [board, setBoard] = useState('CBSE');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const [generatedSlides, setGeneratedSlides] = useState<Slide[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
    const [activeTheme, setActiveTheme] = useState('midnight');
    const [loadingStep, setLoadingStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isGenerating) {
            setLoadingStep(0);
            interval = setInterval(() => {
                setLoadingStep(prev => (prev + 1) % LOADING_MESSAGES.length);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isGenerating]);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';

            rec.onresult = (event: any) => {
                let transcript = '';
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setTopic(transcript);
            };

            rec.onerror = (e: any) => {
                console.error('Speech error:', e.error);
                setIsRecording(false);
                setError(`Voice error: ${e.error}`);
            };

            setRecognition(rec);
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognition?.stop();
            setIsRecording(false);
        } else {
            setTopic('');
            recognition?.start();
            setIsRecording(true);
        }
    };

    const normalizeSlide = (slide: any): Slide => {
        const type = slide.type?.toLowerCase() || 'bullets';
        let bullets: string[] = [];
        const rawBullets = slide.bullets || slide.content || slide.items || slide.points || slide.data?.bullets || [];

        if (Array.isArray(rawBullets)) {
            bullets = rawBullets;
        } else if (typeof rawBullets === 'string') {
            bullets = rawBullets.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^[-*•]\s+/, ''));
        }

        let diagramData = slide.diagramData || {};
        if (type === 'diagram' && !slide.diagramData) {
            if (Array.isArray(slide.steps)) diagramData.steps = slide.steps;
            if (slide.label) diagramData.label = slide.label;
        }

        let data = slide.data || {};
        if (type === 'comparison' && !slide.data) {
            data = {
                leftTitle: slide.leftTitle || 'Option A',
                rightTitle: slide.rightTitle || 'Option B',
                leftItems: slide.leftItems || [],
                rightItems: slide.rightItems || []
            };
        }

        return {
            ...slide,
            type,
            bullets: bullets.map(b => preprocessLatex(b)),
            diagramData: {
                ...diagramData,
                steps: (diagramData.steps || []).map((s: string) => preprocessLatex(s)),
                label: diagramData.label ? preprocessLatex(diagramData.label) : undefined
            },
            data: {
                ...data,
                leftTitle: data.leftTitle ? preprocessLatex(data.leftTitle) : undefined,
                rightTitle: data.rightTitle ? preprocessLatex(data.rightTitle) : undefined,
                leftItems: (data.leftItems || []).map((i: string) => preprocessLatex(i)),
                rightItems: (data.rightItems || []).map((i: string) => preprocessLatex(i))

            },
            title: preprocessLatex(slide.title || slide.header || 'Untitled Slide'),
            notes: slide.notes || slide.speakerNotes || '',
            tableData: slide.tableData ? {
                headers: slide.tableData.headers.map((h: string) => preprocessLatex(h)),
                rows: slide.tableData.rows.map((row: string[]) => row.map((cell: string) => preprocessLatex(cell)))
            } : undefined,
            comparisonData: slide.comparisonData ? {
                leftTitle: preprocessLatex(slide.comparisonData.leftTitle),
                rightTitle: preprocessLatex(slide.comparisonData.rightTitle),
                pairs: slide.comparisonData.pairs.map((pair: string[]) => pair.map((p: string) => preprocessLatex(p)))
            } : undefined
        };
    };

    const handleGenerate = async () => {
        if (!topic) {
            setError("Please enter a topic for your presentation.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedSlides(null);

        try {
            const response = await fetch('/api/ppt/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, grade, subject, slideCount, board }),
            });

            const data = await response.json();
            if (data.success) {
                const rawSlides = Array.isArray(data.slides) ? data.slides : [];
                const normalized = rawSlides.map(normalizeSlide);
                setGeneratedSlides(normalized);
                setCurrentPreviewIndex(0);
            } else {
                throw new Error(data.error || "Generation failed");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const parseRichText = (text: string) => {
        if (!text) return [];
        if (typeof text !== 'string') text = String(text);
        const parts: any[] = [];
        let remaining = text.replace(/\$(.*?)\$/g, '$1');
        const regex = /(_\{?(.*?)\}?|\^\{?(.*?)\}?)/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(remaining)) !== null) {
            if (match.index > lastIndex) {
                parts.push({ text: remaining.substring(lastIndex, match.index) });
            }
            const isSub = match[1].startsWith('_');
            const val = match[2] || match[3] || match[1].substring(1);
            parts.push({
                text: val.replace(/[\{\}]/g, ''),
                options: { sub: isSub, super: !isSub }
            });
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < remaining.length) {
            parts.push({ text: remaining.substring(lastIndex) });
        }

        return parts.length > 0 ? parts : [{ text: remaining }];
    };

    const downloadPPT = () => {
        if (!generatedSlides) return;
        const pres = new pptxgen();
        pres.author = "DeepHub AI Educator";
        pres.company = "DeepHubAI";
        pres.title = topic;

        generatedSlides.forEach((slideData, index) => {
            const slide = pres.addSlide();
            const theme = THEMES[activeTheme];
            const bgColor = theme.pptBg;
            const textColor = "FFFFFF";
            const accentColor = theme.pptAccent;

            slide.background = { color: bgColor };

            const addFooter = (s: any) => {
                s.addText(`DEEPHUB AI | ${subject.toUpperCase() || "ACADEMIC PRESENTATION"}`, {
                    x: 0.5, y: 5.2, w: 9, fontSize: 10, color: "4B5563", align: 'right', fontFace: 'Arial'
                });
            };

            if (index === 0 || slideData.type === 'title') {
                slide.addText(parseRichText(slideData.title), {
                    x: 0.5, y: 1.5, w: 9,
                    fontSize: 44, color: accentColor, bold: true, align: 'center',
                    fontFace: 'Arial'
                });
                slide.addText(`Prepared for ${grade || "All Classes"} | ${subject || "General Science"}`, {
                    x: 0.5, y: 3.5, w: 9,
                    fontSize: 20, color: textColor, align: 'center',
                    italic: true, fontFace: 'Arial'
                });
            } else if (slideData.type === 'diagram' && slideData.diagramData) {
                slide.addText(parseRichText(slideData.title), {
                    x: 0.5, y: 0.5, w: 9, h: 0.8,
                    fontSize: 32, color: accentColor, bold: true, fontFace: 'Arial'
                });

                const steps = slideData.diagramData.steps || [];
                const boxWidth = 2.0;
                const boxHeight = 1.0;
                const gap = 0.5;
                const startX = (10 - (steps.length * boxWidth + (steps.length - 1) * gap)) / 2;

                steps.forEach((step, i) => {
                    const x = startX + i * (boxWidth + gap);
                    const y = 2.5;

                    slide.addShape(pres.ShapeType.rect, {
                        x, y, w: boxWidth, h: boxHeight,
                        fill: { color: "1E293B" },
                        line: { color: accentColor, width: 2 }
                    });

                    slide.addText(parseRichText(step), {
                        x, y, w: boxWidth, h: boxHeight,
                        fontSize: 14, color: textColor, align: 'center', bold: true, fontFace: 'Arial'
                    });

                    if (i < steps.length - 1) {
                        slide.addShape(pres.ShapeType.rightArrow, {
                            x: x + boxWidth + 0.05, y: y + 0.35, w: 0.4, h: 0.3,
                            fill: { color: accentColor }
                        });
                    }
                });

                addFooter(slide);
            } else if (slideData.type === 'comparison' && slideData.data) {
                slide.addText(parseRichText(slideData.title), {
                    x: 0.5, y: 0.5, w: 9, h: 0.8,
                    fontSize: 32, color: accentColor, bold: true, fontFace: 'Arial'
                });

                const { leftTitle, rightTitle, leftItems = [], rightItems = [] } = slideData.data;

                slide.addText(leftTitle || 'Option A', { x: 0.5, y: 1.5, w: 4.25, h: 0.5, fontSize: 20, color: accentColor, bold: true, align: 'center', fill: { color: "1E293B" } });
                slide.addText(rightTitle || 'Option B', { x: 5.25, y: 1.5, w: 4.25, h: 0.5, fontSize: 20, color: accentColor, bold: true, align: 'center', fill: { color: "1E293B" } });

                leftItems.forEach((item, i) => {
                    slide.addText(parseRichText(item), {
                        x: 0.5, y: 2.1 + (i * 0.4), w: 4.25,
                        bullet: true, indent: 20, fontSize: 14, color: textColor
                    } as any);
                });

                rightItems.forEach((item, i) => {
                    slide.addText(parseRichText(item), {
                        x: 5.25, y: 2.1 + (i * 0.4), w: 4.25,
                        bullet: true, indent: 20, fontSize: 14, color: textColor
                    } as any);
                });

                addFooter(slide);
            } else if (slideData.type === 'recap') {
                slide.addText(parseRichText(slideData.title), {
                    x: 0.5, y: 0.5, w: 9, h: 0.8,
                    fontSize: 32, color: accentColor, bold: true, fontFace: 'Arial'
                });

                slideData.bullets.forEach((point, i) => {
                    slide.addText(parseRichText(point), {
                        x: 0.5, y: 1.5 + (i * 0.45), w: 9,
                        bullet: true, indent: 20, fontSize: 16, color: textColor
                    } as any);
                });

                if (slideData.reflection) {
                    slide.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 4.2, w: 9, h: 0.8, fill: { color: "1E293B" }, line: { color: accentColor, width: 1 } });
                    slide.addText("REFLECTION: " + slideData.reflection, { x: 0.7, y: 4.2, w: 8.6, h: 0.8, fontSize: 14, color: accentColor, italic: true, align: 'center', fontFace: 'Arial' });
                }

                addFooter(slide);
            } else {
                slide.addText(parseRichText(slideData.title), {
                    x: 0.5, y: 0.5, w: 9, h: 0.8,
                    fontSize: 32, color: accentColor, bold: true, fontFace: 'Arial'
                });

                slideData.bullets.forEach((point, i) => {
                    slide.addText(parseRichText(point), {
                        x: 0.5, y: 1.5 + (i * 0.5), w: 9,
                        bullet: true, indent: 20, fontSize: 18, color: textColor
                    } as any);
                });

                addFooter(slide);
            }

            if (slideData.notes) slide.addNotes(slideData.notes);
        });

        pres.writeFile({ fileName: `DeepHubAI_${topic.replace(/\s+/g, '_')}.pptx` });
    };

    const handleSaveToLibrary = async () => {
        if (!generatedSlides) return;
        setIsSaving(true);
        try {
            const response = await fetch('/api/library/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'ppt-content',
                    title: topic || `${subject} - Presentation`,
                    content: JSON.stringify(generatedSlides),
                    metadata: {
                        topic,
                        subject,
                        grade,
                        slideCount,
                        board,
                        activeTheme,
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

    return (
        <div className="flex flex-col h-full animate-fade-in pb-10">
            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-red-400 text-sm font-bold">{error}</span>
                    <button onClick={() => setError(null)} className="text-red-500/40 hover:text-red-400 text-xs font-black uppercase tracking-widest">Dismiss</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
                <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="bg-[#111318] border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Presentation size={20} /></div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Presentation Arch</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Main Topic</label>
                                    <button
                                        onClick={toggleRecording}
                                        className={`p-1.5 rounded-lg transition-all ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'hover:bg-white/5 text-white/30 hover:text-white'}`}
                                    >
                                        {isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={14} />}
                                    </button>
                                </div>
                                <textarea
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder={isRecording ? "Listening..." : "e.g. The Mechanism of Photosynthesis in C3 Plants"}
                                    className={`w-full h-24 bg-white/5 border rounded-xl p-4 text-sm text-white focus:border-amber-500/50 outline-none resize-none transition-all ${isRecording ? 'border-red-500/30 ring-1 ring-red-500/20' : 'border-white/10'}`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Subject</label>
                                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Biology" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500/50 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Grade/Class</label>
                                    <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Class 10" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500/50 outline-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest flex justify-between">
                                    Slide Count <span>{slideCount} Slides</span>
                                </label>
                                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-2">
                                    <button onClick={() => setSlideCount(Math.max(3, slideCount - 1))} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all"><Minus size={16} /></button>
                                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(slideCount / 15) * 100}%` }}></div>
                                    </div>
                                    <button onClick={() => setSlideCount(Math.min(15, slideCount + 1))} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all"><Plus size={16} /></button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Board/Curriculum</label>
                                <select
                                    value={board}
                                    onChange={(e) => setBoard(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500/50 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="CBSE" className="bg-[#111318]">CBSE (National)</option>
                                    <option value="ICSE" className="bg-[#111318]">ICSE / ISC</option>
                                    <option value="IGCSE" className="bg-[#111318]">IGCSE / A-Levels</option>
                                    <option value="State Board" className="bg-[#111318]">State Board (India)</option>
                                    <option value="Global" className="bg-[#111318]">Global Syllabus</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Select Visual Style</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.keys(THEMES).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setActiveTheme(t)}
                                            className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${activeTheme === t ? 'border-white/40 bg-white/5' : 'border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className={`w-full h-8 rounded-lg bg-gradient-to-br ${THEMES[t].gradient}`}></div>
                                            <span className="text-[8px] font-black uppercase text-white/40 tracking-tighter">{THEMES[t].name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-black font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_10px_20px_rgba(217,119,6,0.2)] disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="animate-spin mx-auto" /> : (
                                    <div className="flex items-center justify-center gap-2">
                                        <Sparkles size={18} />
                                        <span>Generate Deck</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 bg-[#0a0c10] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
                    <div className="bg-white/5 border-b border-white/5 px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
                                <Monitor size={14} /> Screen Preview
                            </span>
                            {generatedSlides && generatedSlides.length > 0 && (
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                                    <button disabled={currentPreviewIndex === 0} onClick={() => setCurrentPreviewIndex(i => i - 1)} className="text-white/40 hover:text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Slide {currentPreviewIndex + 1} of {generatedSlides.length}</span>
                                    <button disabled={currentPreviewIndex === generatedSlides.length - 1} onClick={() => setCurrentPreviewIndex(i => i + 1)} className="text-white/40 hover:text-white disabled:opacity-30"><ChevronRight size={16} /></button>
                                </div>
                            )}
                        </div>
                        {generatedSlides && generatedSlides.length > 0 && (
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
                                    onClick={downloadPPT}
                                    className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-black rounded-xl font-bold text-xs hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                >
                                    <Download size={14} /> Export .pptx
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 bg-black/40 p-12 flex items-center justify-center relative overflow-hidden">
                        {!generatedSlides || generatedSlides.length === 0 ? (
                            <div className="flex flex-col items-center justify-center space-y-8 max-w-sm w-full">
                                {isGenerating ? (
                                    <div className="w-full space-y-8 animate-in fade-in zoom-in duration-500">
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
                                                    <img src={BrandLogo} alt="DeepHub AI" className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                                                    <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full -z-10" />
                                                </div>
                                            </motion.div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/5 rounded-full animate-[ping_3s_linear_infinite]" />
                                        </div>

                                        <div className="space-y-4 text-center">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={loadingStep}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="text-lg font-bold text-white tracking-tight"
                                                >
                                                    {LOADING_MESSAGES[loadingStep]}
                                                </motion.div>
                                            </AnimatePresence>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px] relative">
                                                <motion.div 
                                                    className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-full" 
                                                    initial={{ width: "0%" }} 
                                                    animate={{ width: `${((loadingStep + 1) / LOADING_MESSAGES.length) * 100}%` }} 
                                                    transition={{ duration: 0.5, ease: "easeInOut" }} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4 opacity-30">
                                        <Presentation size={64} className="mx-auto text-amber-500 mb-6" />
                                        <h4 className="text-xl font-bold text-white">Slide Deck Engine</h4>
                                        <p className="text-xs leading-relaxed">Our neural engine will structure your presentation with logical flow, key highlights, and speaker notes.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentPreviewIndex}
                                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    className={`w-full h-full max-w-4xl aspect-[16/9] ${THEMES[activeTheme].card} rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border ${THEMES[activeTheme].border} flex flex-col overflow-hidden relative`}
                                >
                                    <div className="p-10 pb-4 relative z-10">
                                        <div className={`font-black tracking-tight ${THEMES[activeTheme].accent} leading-tight ${currentPreviewIndex === 0 || generatedSlides[currentPreviewIndex].type === 'title' ? 'text-5xl text-center mt-12' : 'text-3xl border-b border-white/5 pb-6'}`}>
                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                {generatedSlides[currentPreviewIndex].title}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    <div className="flex-1 px-14 py-6 overflow-y-auto custom-scrollbar relative z-10">
                                        {currentPreviewIndex === 0 || generatedSlides[currentPreviewIndex].type === 'title' ? (
                                            <div className="text-center space-y-6">
                                                <p className="text-white/60 text-xl italic font-light tracking-wide">Prepared for {grade || "Class"} | {subject || "Subject"}</p>
                                                <div className={`h-1 w-24 mx-auto rounded-full bg-gradient-to-r ${THEMES[activeTheme].gradient} mt-12 opacity-50`}></div>
                                            </div>
                                        ) : generatedSlides[currentPreviewIndex].type === 'table' && generatedSlides[currentPreviewIndex].tableData ? (
                                            <div className="overflow-hidden rounded-xl border border-white/20">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-white/10 uppercase font-black text-white/60">
                                                        <tr>
                                                            {generatedSlides[currentPreviewIndex].tableData?.headers.map((h, i) => (
                                                                <th key={i} className="px-6 py-4">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/10">
                                                        {generatedSlides[currentPreviewIndex].tableData?.rows.map((row, i) => (
                                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                                {row.map((cell, j) => (
                                                                    <td key={j} className="px-6 py-4 text-white/80 font-medium">{cell}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : generatedSlides[currentPreviewIndex].type === 'comparison' && generatedSlides[currentPreviewIndex].comparisonData ? (
                                            <div className="grid grid-cols-2 gap-8 h-full">
                                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                                    <h3 className={`text-xl font-black mb-6 border-b border-white/10 pb-4 ${THEMES[activeTheme].accent}`}>{generatedSlides[currentPreviewIndex].comparisonData?.leftTitle}</h3>
                                                    <ul className="space-y-4">
                                                        {generatedSlides[currentPreviewIndex].comparisonData?.pairs.map((pair, i) => (
                                                            <li key={i} className="flex gap-3 text-white/70">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${THEMES[activeTheme].bg} mt-2 shrink-0`} />
                                                                <span>{pair[0]}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                                    <h3 className={`text-xl font-black mb-6 border-b border-white/10 pb-4 ${THEMES[activeTheme].accent}`}>{generatedSlides[currentPreviewIndex].comparisonData?.rightTitle}</h3>
                                                    <ul className="space-y-4">
                                                        {generatedSlides[currentPreviewIndex].comparisonData?.pairs.map((pair, i) => (
                                                            <li key={i} className="flex gap-3 text-white/70">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${THEMES[activeTheme].bg} mt-2 shrink-0`} />
                                                                <span>{pair[1]}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ) : generatedSlides[currentPreviewIndex].type === 'diagram' && generatedSlides[currentPreviewIndex].diagramData ? (
                                            <div className="h-full flex flex-col items-center justify-center space-y-8 pb-12">
                                                <div className="flex flex-wrap items-center justify-center gap-6">
                                                    {generatedSlides[currentPreviewIndex].diagramData?.steps.map((step, idx) => (
                                                        <React.Fragment key={idx}>
                                                            <div className="bg-white/3 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl min-w-[220px] text-center flex flex-col items-center justify-center group hover:border-white/20 transition-all">
                                                                <div className="text-white font-bold prose prose-invert prose-p:my-0 text-lg">
                                                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{step}</ReactMarkdown>
                                                                </div>
                                                            </div>
                                                            {idx < (generatedSlides?.[currentPreviewIndex]?.diagramData?.steps.length ?? 0) - 1 && (
                                                                <div className={`${THEMES[activeTheme].accent} animate-pulse font-black text-2xl`}>➔</div>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : generatedSlides[currentPreviewIndex].type === 'comparison' && generatedSlides[currentPreviewIndex].data ? (
                                            <div className="h-full grid grid-cols-2 gap-8 py-4">
                                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
                                                    <h4 className="text-amber-500 font-bold border-b border-white/10 pb-3 mb-4 text-center uppercase tracking-widest text-sm">
                                                        {generatedSlides[currentPreviewIndex].data?.leftTitle || "Option A"}
                                                    </h4>
                                                    <ul className="space-y-3 flex-1">
                                                        {generatedSlides[currentPreviewIndex].data?.leftItems.map((item, idx) => (
                                                            <li key={idx} className="text-white/80 text-sm flex gap-2">
                                                                <span className="text-amber-500 flex-shrink-0">•</span>
                                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{item}</ReactMarkdown>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
                                                    <h4 className="text-cyan-400 font-bold border-b border-white/10 pb-3 mb-4 text-center uppercase tracking-widest text-sm">
                                                        {generatedSlides[currentPreviewIndex].data?.rightTitle || "Option B"}
                                                    </h4>
                                                    <ul className="space-y-3 flex-1">
                                                        {generatedSlides[currentPreviewIndex].data?.rightItems.map((item, idx) => (
                                                            <li key={idx} className="text-white/80 text-sm flex gap-2">
                                                                <span className="text-cyan-400 flex-shrink-0">•</span>
                                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{item}</ReactMarkdown>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="prose prose-invert max-w-none prose-p:text-white/90 prose-p:text-lg prose-p:leading-relaxed">
                                                <ul className="space-y-4">
                                                    {generatedSlides[currentPreviewIndex].bullets?.map((bullet, idx) => (
                                                        <li key={idx} className="flex gap-4">
                                                            <span className="text-amber-500 mt-1.5 flex-shrink-0"><CheckCircle2 size={18} /></span>
                                                            <div className="flex-1">
                                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{bullet}</ReactMarkdown>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-black/60 p-4 border-t border-white/5 flex gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Layout size={12} className="text-white/40" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Speaker Notes</span>
                                            </div>
                                            <p className="text-[11px] text-white/60 italic line-clamp-2">
                                                {generatedSlides[currentPreviewIndex].notes || "No notes for this slide."}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
