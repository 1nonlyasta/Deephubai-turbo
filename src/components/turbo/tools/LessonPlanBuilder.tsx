import React, { useState, useEffect } from 'react';
import {
    FileText,
    Trash2,
    Sparkles,
    Download,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Mic,
    Square,
    Calendar,
    BookOpen,
    Target,
    Clock,
    Layout,
    GraduationCap,
    Database,
    AlertCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// A4 Pagination Constants
const A4_HEIGHT_PX = 1122.5;
const TOP_MARGIN_PX = 56.7; // 1.5cm
const BOTTOM_MARGIN_PX = 94.5;
const FOOTER_RESERVE = 60;
const SAFETY_BUFFER = 40;
const USABLE_PAGE_HEIGHT = A4_HEIGHT_PX - TOP_MARGIN_PX - BOTTOM_MARGIN_PX - FOOTER_RESERVE - SAFETY_BUFFER;

interface LessonSection {
    title: string;
    content: string[]; // Content blocks (paragraphs, lists)
}

interface LessonPage {
    sections: LessonSection[];
    pageNumber: number;
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

const parseLessonPlanToSections = (markdown: string): LessonSection[] => {
    // Preprocess the entire markdown content first
    markdown = preprocessLatex(markdown);
    
    const sections: LessonSection[] = [];
    const lines = markdown.split('\n');
    let currentSection = { title: "", content: [] as string[] };
    let currentBlock = "";
    
    lines.forEach(line => {
        if (line.startsWith('##')) {
            if (currentBlock) {
                 currentSection.content.push(currentBlock);
                 currentBlock = "";
            }
            if (currentSection.title || currentSection.content.length > 0) sections.push(currentSection);
            currentSection = { title: line.replace(/#/g, '').trim(), content: [] };
        } else if (line.trim() === "") {
             if (currentBlock) {
                 currentSection.content.push(currentBlock);
                 currentBlock = "";
             }
        } else {
             // Append to current block (paragraph/list item)
             currentBlock += (currentBlock ? "\n" : "") + line;
        }
    });
    
    if (currentBlock) currentSection.content.push(currentBlock);
    if (currentSection.title || currentSection.content.length > 0) sections.push(currentSection);
    return sections;
};

const paginateLessonPlan = (sections: LessonSection[]): LessonPage[] => {
    const pages: LessonPage[] = [];
    let currentPageSections: LessonSection[] = [];
    // Page 1 starts with Header (~250px)
    let currentHeight = 250; 
    const MAX_HEIGHT_PER_PAGE = 1000;

    sections.forEach(section => {
         let currentSectionForPage: LessonSection = { title: section.title, content: [] };
         currentHeight += 60; // Section title height
         
         const blocks = section.content;
         for (let i = 0; i < blocks.length; i++) {
             const block = blocks[i];
             // Approx height calculation: 20px per line (assuming 80 chars per line)
             const blockHeight = (Math.ceil(block.length / 80) + (block.match(/\n/g) || []).length) * 24 + 20; // 24px line-height + 20px buffer
             
             if (currentHeight + blockHeight > MAX_HEIGHT_PER_PAGE) {
                 // Push current page
                 if (currentSectionForPage.content.length > 0) {
                     currentPageSections.push(currentSectionForPage);
                 }
                 pages.push({ sections: currentPageSections, pageNumber: pages.length + 1 });
                 
                 // Reset for new page
                 currentPageSections = [];
                 currentHeight = 40; // Top padding only
                 currentSectionForPage = { title: `${section.title} (Cont.)`, content: [] };
             }
             
             currentSectionForPage.content.push(block);
             currentHeight += blockHeight;
         }
         
         if (currentSectionForPage.content.length > 0) {
             currentPageSections.push(currentSectionForPage);
         }
    });
    
    if (currentPageSections.length > 0) {
        pages.push({ sections: currentPageSections, pageNumber: pages.length + 1 });
    }
    
    return pages;
};

export default function LessonPlanBuilder() {
    // Voice/Topic State
    const [isRecording, setIsRecording] = useState(false);
    const [topic, setTopic] = useState('');
    const [recognition, setRecognition] = useState<any>(null);

    // Lesson Plan Setup State
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [duration, setDuration] = useState('40 Mins');
    const [board, setBoard] = useState('CBSE');
    const [objectives, setObjectives] = useState('');
    const [schoolName, setSchoolName] = useState('');

    // UI/Process State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
    const [generatedTitle, setGeneratedTitle] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    // Pagination State
    // Pagination State
    const [paginatedPages, setPaginatedPages] = useState<LessonPage[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTopic(currentTranscript);
            };

            recognitionInstance.onerror = (event: any) => {
                if (event.error === 'network') {
                    setError("Network issue with Speech API. Please type your topic directly.");
                } else {
                    setError(`Speech Error: ${event.error}`);
                }
                setIsRecording(false);
            };

            setRecognition(recognitionInstance);
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

    const handleGenerate = async () => {
        if (!topic) {
            setError("Please enter or record a lesson topic first.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setProgress(30);

        try {
            const response = await fetch('/api/lesson-plan/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, grade, subject, duration, objectives, board }),
            });

            if (!response.ok) {
                throw new Error('Generation failed. Ensure backend is running.');
            }

            const data = await response.json();
            if (data.success) {
                setGeneratedTitle(data.title || topic);
                setGeneratedPlan(data.content);
                setProgress(100);
            } else {
                throw new Error(data.error || "Generation failed");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // Calculate Pages when content changes
    useEffect(() => {
        if (generatedPlan) {
            const sections = parseLessonPlanToSections(generatedPlan);
            const pages = paginateLessonPlan(sections);
            setPaginatedPages(pages);
            setTotalPages(pages.length);
            setCurrentPage(1);
        }
    }, [generatedPlan]);

    const exportPDF = async () => {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const totalPagesToExport = paginatedPages.length;
        
        for (let i = 0; i < totalPagesToExport; i++) {
            const pageElement = document.getElementById(`print-page-${i}`);
            if (!pageElement) continue;

            try {
                const canvas = await html2canvas(pageElement, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    windowWidth: 210 * 3.7795275591, // A4 width in px
                    height: pageElement.offsetHeight,
                    width: pageElement.offsetWidth
                });

                const imgWidth = 210;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (i > 0) pdf.addPage();
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

            } catch (error) {
                console.error(`Error exporting page ${i + 1}`, error);
            }
        }

        pdf.save(`${generatedTitle || 'lesson-plan'}.pdf`);
    };

    const [isSaving, setIsSaving] = useState(false);
    const handleSaveToLibrary = async () => {
        if (!generatedPlan) return;
        setIsSaving(true);
        try {
            const response = await fetch('/api/library/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'lesson-plan',
                    title: generatedTitle || `${subject} - ${topic}`,
                    content: generatedPlan,
                    metadata: {
                        topic,
                        grade,
                        subject,
                        board,
                        duration,
                        timestamp: new Date().toISOString()
                    }
                })
            });
            const data = await response.json();
            if (data.success) {
                alert("Saved to library!");
            }
        } catch (err: any) {
            console.error("Save Error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Lesson Plan Builder</h2>
                    <p className="text-muted-foreground text-sm mt-1">Structure comprehensive pedagogy in seconds</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {isGenerating && (
                        <div className="flex flex-col items-end mr-4">
                            <span className="text-xs text-primary font-medium mb-1">Architecting Plan...</span>
                            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-200">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN - CONFIGURATION */}
                <div className="lg:col-span-5 space-y-6">

                    {/* 1. Topic Input */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-500/10 rounded-lg text-green-400">
                                    <Target size={16} />
                                </div>
                                <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Primary Topic</h3>
                            </div>
                            <button onClick={toggleRecording} className={`p-2 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-white/40 hover:text-white'}`}>
                                {isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={14} />}
                            </button>
                        </div>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={isRecording ? "Listening..." : "e.g. Newton's Laws of Motion"}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-lg font-medium text-white focus:border-primary/50 outline-none placeholder:text-white/20"
                        />
                    </div>

                    {/* 2. Details */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                                <Layout size={16} />
                            </div>
                            <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Class Context</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/50 font-medium">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Physics"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/50 font-medium">Grade Level</label>
                                <input
                                    type="text"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    placeholder="Grade 9"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/50 font-medium">Duration</label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                                >
                                    <option value="30 Mins">30 Mins</option>
                                    <option value="40 Mins">40 Mins</option>
                                    <option value="45 Mins">45 Mins</option>
                                    <option value="60 Mins">60 Mins</option>
                                    <option value="90 Mins">90 Mins</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-white/50 font-medium">Board</label>
                                <select
                                    value={board}
                                    onChange={(e) => setBoard(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                                >
                                    <option value="CBSE">CBSE</option>
                                    <option value="ICSE">ICSE</option>
                                    <option value="IGCSE">IGCSE</option>
                                    <option value="State">State Board</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/50 font-medium">Specific Learning Objectives (Optimal)</label>
                            <textarea
                                value={objectives}
                                onChange={(e) => setObjectives(e.target.value)}
                                placeholder="e.g. Students should be able to define inertia..."
                                className="w-full h-24 bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-primary/50 outline-none resize-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl font-bold text-white shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        {isGenerating ? 'Architecting Plan...' : 'Generate Lesson Plan'}
                    </button>

                </div>

                {/* RIGHT COLUMN - PREVIEW */}
                <div className="lg:col-span-7 flex flex-col h-[750px] bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-2xl relative">
                    {/* Preview Header */}
                    <div className="h-14 bg-black/40 border-b border-white/5 flex items-center justify-between px-4">
                        <span className="text-xs font-medium text-white/40">Pedagogy Preview</span>

                        {generatedPlan && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSaveToLibrary}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                >
                                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                                    Save
                                </button>
                                <button onClick={exportPDF} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all">
                                    <Download size={14} /> Export PDF
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-[#525659] p-8 flex justify-center relative">
                        {!generatedPlan ? (
                            <div className="text-center self-center space-y-4 opacity-30 select-none">
                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <GraduationCap size={40} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Ready to Plan</h3>
                                <p className="max-w-xs text-sm">Define your topic and context to generate a structured lesson plan.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                {/* Page Switcher */}
                                {paginatedPages.length > 1 && (
                                    <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-lg border border-white/10 mb-4 sticky top-0 z-10 backdrop-blur-md">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="text-white disabled:opacity-30 hover:bg-white/10 p-1 rounded"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="text-sm font-medium text-white">
                                            Page {currentPage} of {paginatedPages.length}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(paginatedPages.length, p + 1))}
                                            disabled={currentPage === paginatedPages.length}
                                            className="text-white disabled:opacity-30 hover:bg-white/10 p-1 rounded"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}

                                <div
                                    className="bg-white text-black shadow-2xl p-[20mm] min-h-[297mm] w-[210mm] origin-top scale-90"
                                >
                                    {/* Header Only on Page 1 */}
                                    {currentPage === 1 && (
                                        <div className="border-b-2 border-green-800 pb-6 mb-8">
                                            <h1 className="text-3xl font-black uppercase tracking-tight text-green-900 mb-2">{generatedTitle}</h1>
                                            <div className="flex gap-4 text-sm font-bold text-gray-600 uppercase tracking-wider">
                                                <span>{grade}</span>
                                                <span>•</span>
                                                <span>{subject}</span>
                                                <span>•</span>
                                                <span>{duration}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Page Content */}
                                    {(() => {
                                        const pageData = paginatedPages[currentPage - 1];
                                        if (!pageData) return null;
                                        return (
                                            <div className="space-y-6">
                                                {pageData.sections.map((section, idx) => (
                                                    <div key={idx}>
                                                        {section.title && (
                                                            <h2 className="text-xl font-bold text-green-800 border-b border-green-100 pb-2 mb-3 uppercase tracking-wide">
                                                                {section.title}
                                                            </h2>
                                                        )}
                                                        <div className="prose prose-sm max-w-none prose-p:text-gray-800">
                                                            {section.content.map((block, bIdx) => (
                                                                <ReactMarkdown key={bIdx} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                                    {block}
                                                                </ReactMarkdown>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Hidden Print Container */}
            <div style={{ position: 'absolute', top: -10000, left: -10000 }}>
                {paginatedPages.map((page, pageIdx) => (
                    <div
                        key={pageIdx}
                        id={`print-page-${pageIdx}`}
                        className="bg-white text-black p-[20mm]"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                        }}
                    >
                         {/* Header only on Page 1 */}
                         {pageIdx === 0 && (
                            <div className="border-b-2 border-green-800 pb-6 mb-8">
                                <h1 className="text-3xl font-black uppercase tracking-tight text-green-900 mb-2">{generatedTitle}</h1>
                                <div className="flex gap-4 text-sm font-bold text-gray-600 uppercase tracking-wider">
                                    <span>{grade}</span>
                                    <span>•</span>
                                    <span>{subject}</span>
                                    <span>•</span>
                                    <span>{duration}</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {page.sections.map((section, idx) => (
                                <div key={idx}>
                                    {section.title && (
                                        <h2 className="text-xl font-bold text-green-800 border-b border-green-100 pb-2 mb-3 uppercase tracking-wide">
                                            {section.title}
                                        </h2>
                                    )}
                                    <div className="prose prose-sm max-w-none prose-p:text-gray-800">
                                        {section.content.map((block, bIdx) => (
                                            <ReactMarkdown key={bIdx} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                {block}
                                            </ReactMarkdown>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
