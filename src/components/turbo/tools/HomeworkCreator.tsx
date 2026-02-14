import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import {
    FileText,
    Clock,
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
    Database,
    AlertCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// A4 Pagination Constants
const A4_HEIGHT_PX = 1122.5;
const TOP_MARGIN_PX = 56.7; // 1.5cm
const BOTTOM_MARGIN_PX = 94.5; // 2.5cm
const FOOTER_RESERVE = 60;
const SAFETY_BUFFER = 40;
const USABLE_PAGE_HEIGHT = A4_HEIGHT_PX - TOP_MARGIN_PX - BOTTOM_MARGIN_PX - FOOTER_RESERVE - SAFETY_BUFFER;

interface HomeworkSection {
    title: string;
    questions: string[];
}

interface HomeworkPage {
    sections: HomeworkSection[];
    pageNumber: number;
}

const parseHomeworkToSections = (markdown: string): HomeworkSection[] => {
    const sections: HomeworkSection[] = [];
    const lines = markdown.split('\n');
    let currentSection = { title: "", questions: [] as string[] };
    
    lines.forEach(line => {
        if (line.startsWith('##')) {
            if (currentSection.title || currentSection.questions.length > 0) sections.push(currentSection);
            currentSection = { title: line.replace(/#/g, '').trim(), questions: [] };
        } else if (line.match(/^\d+\./)) {
            // New Question matched
            // CLEANUP: Remove "Answer: ____" or plain underscores if they appear
            let cleanLine = line.replace(/Answer:\s*_+/gi, '').replace(/_+$/g, '').trim();
            // FILTER: Remove "Note:" lines entirely if they are part of the question string
            cleanLine = cleanLine.replace(/Note:.*$/gim, '').trim();
            
            if (cleanLine) currentSection.questions.push(cleanLine);
        } else if (line.trim() && currentSection.questions.length > 0) {
            // Append Continuation
            // Skip if the line itself is just a Note
            if (line.match(/^Note:/i)) return;

            let cleanLine = line.replace(/Answer:\s*_+/gi, '').replace(/_+$/g, '').trim();
            cleanLine = cleanLine.replace(/Note:.*$/gim, '').trim();
            
            if (cleanLine) {
                currentSection.questions[currentSection.questions.length - 1] += '\n' + cleanLine;
            }
        }
    });
    if (currentSection.title || currentSection.questions.length > 0) sections.push(currentSection);
    return sections;
};

const paginateSections = (sections: HomeworkSection[]): HomeworkPage[] => {
    const pages: HomeworkPage[] = [];
    let currentPageSections: HomeworkSection[] = [];
    // Page 1 starts with Header (~250px)
    let currentHeight = 250; 
    const MAX_HEIGHT_PER_PAGE = 1000; // Heuristic units for A4 text capacity

    sections.forEach(section => {
         let currentSectionForPage: HomeworkSection = { title: section.title, questions: [] };
         currentHeight += 60; // Section title height
         
         const questions = section.questions;
         for (let i = 0; i < questions.length; i++) {
             const q = questions[i];
             // Base height (40) + Text length factor + Margin
             const qHeight = 60 + (q.length * 0.4); 
             
             if (currentHeight + qHeight > MAX_HEIGHT_PER_PAGE) {
                 // Push current page
                 if (currentSectionForPage.questions.length > 0) {
                     currentPageSections.push(currentSectionForPage);
                 }
                 pages.push({ sections: currentPageSections, pageNumber: pages.length + 1 });
                 
                 // Reset for new page
                 currentPageSections = [];
                 currentHeight = 40; // Top padding only
                 currentSectionForPage = { title: `${section.title} (Cont.)`, questions: [] };
             }
             
             currentSectionForPage.questions.push(q);
             currentHeight += qHeight;
         }
         
         if (currentSectionForPage.questions.length > 0) {
             currentPageSections.push(currentSectionForPage);
         }
    });
    
    if (currentPageSections.length > 0) {
        pages.push({ sections: currentPageSections, pageNumber: pages.length + 1 });
    }
    
    return pages;
};

// Add type for speech recognition if not in window
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

import { useAI } from "../../../context/AIContext";

const formatQuestionText = (text: string) => {
    // Ensure options (a) ... (d) or a) ... d) start on new lines
    // Regex matches common option patterns preceded by space or newline
    // Updated: Move space outside bold tags for valid markdown
    return text.replace(/(\s|\n)([a-d][.)])\s+/gi, '\n\n**$2** ');
};

export default function HomeworkCreator() {
    const { provider } = useAI();
    // Voice State
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState<any>(null);

    // Assignment State
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [schoolName, setSchoolName] = useState('');

    // UI/Process State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedHomework, setGeneratedHomework] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    // Pagination State
    const [paginatedPages, setPaginatedPages] = useState<HomeworkPage[]>([]);
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
                setTranscript(currentTranscript);
            };

            recognitionInstance.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'network') {
                    setError("Speech Recognition requires an internet connection in this browser. Please check your network or type your summary directly.");
                } else if (event.error === 'not-allowed') {
                    setError("Microphone access was denied. Please enable microphone permissions in your browser settings.");
                } else {
                    setError(`Speech Recognition Error: ${event.error}. Please try again or type directly.`);
                }
                setIsRecording(false);
            };

            recognitionInstance.onerror = (event: any) => {
                 // Duplicate handler removed in logic, simplified here
                 console.error('Speech recognition error', event.error);
            };

            setRecognition(recognitionInstance);
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognition?.stop();
            setIsRecording(false);
        } else {
            setTranscript('');
            recognition?.start();
            setIsRecording(true);
        }
    };

    const handleGenerate = async () => {
        if (!transcript) {
            setError("Please record or type a lesson summary first.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setProgress(20);

        try {
            const response = await fetch('/api/homework/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lessonSummary: transcript || assignmentTitle,
                    grade: '10',
                    subject,
                    difficulty,
                    questions: 10,
                    schoolName,
                    preferredProvider: provider
                })
            });

            if (!response.ok) {
                throw new Error('Generation failed. Ensure backend is running.');
            }

            const data = await response.json();
            if (data.success) {
                setGeneratedHomework(data.content);
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
        if (generatedHomework) {
            const sections = parseHomeworkToSections(generatedHomework);
            const pages = paginateSections(sections);
            setPaginatedPages(pages);
            setTotalPages(pages.length);
            setCurrentPage(1);
        }
    }, [generatedHomework]);

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

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 210;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            } catch (error) {
                console.error(`Error exporting page ${i + 1}`, error);
            }
        }

        pdf.save(`${assignmentTitle || 'homework'}.pdf`);
    };

    const [isSaving, setIsSaving] = useState(false);
    const handleSaveToLibrary = async () => {
        if (!generatedHomework) return;
        setIsSaving(true);
        try {
            const response = await fetch('/api/library/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'homework',
                    title: assignmentTitle || `${schoolName} - ${subject || 'Homework'}`,
                    content: generatedHomework,
                    metadata: {
                        schoolName,
                        assignmentTitle,
                        subject,
                        difficulty,
                        dueDate,
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
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Homework Creator</h2>
                    <p className="text-muted-foreground text-sm mt-1">Transform lesson summaries into structured assignments</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {isGenerating && (
                        <div className="flex flex-col items-end mr-4">
                            <span className="text-xs text-primary font-medium mb-1">Generating...</span>
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
                {/* LEFT COLUMN - INPUT */}
                <div className="lg:col-span-5 space-y-6">

                    {/* 1. Voice/Text Input */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                                    <Mic size={16} />
                                </div>
                                <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Lesson Summary</h3>
                            </div>
                            <button
                                onClick={toggleRecording}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-white/60 hover:text-white'}`}
                            >
                                {isRecording ? <Square size={12} fill="currentColor" /> : <Mic size={12} />}
                                {isRecording ? 'Stop Recording' : 'Record Voice'}
                            </button>
                        </div>

                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder={isRecording ? "Listening to your lesson summary..." : "Type or paste your lesson summary here. For example: 'Today we covered the laws of thermodynamics, specifically focusing on entropy and heat transfer...'"}
                            className="w-full h-48 bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary/50 outline-none resize-none transition-all placeholder:text-white/20 leading-relaxed"
                        />
                    </div>

                    {/* 2. Configuration */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
                                <BookOpen size={16} />
                            </div>
                            <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Assignment Details</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs text-white/50 font-medium">School Name</label>
                                    <input
                                        type="text"
                                        value={schoolName}
                                        onChange={(e) => setSchoolName(e.target.value)}
                                        placeholder="Enter School Name"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                                    />
                                </div>
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
                                    <label className="text-xs text-white/50 font-medium">Difficulty</label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs text-white/50 font-medium">Assignment Title</label>
                                <input
                                    type="text"
                                    value={assignmentTitle}
                                    onChange={(e) => setAssignmentTitle(e.target.value)}
                                    placeholder="Thermodynamics Worksheet 1"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs text-white/50 font-medium">Due Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary/50 outline-none"
                                    />
                                    <Calendar className="absolute right-3 top-2.5 text-white/40 pointer-events-none" size={14} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !transcript}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        {isGenerating ? 'Designing Assignment...' : 'Generate Homework'}
                    </button>

                </div>

                {/* RIGHT COLUMN - PREVIEW */}
                <div className="lg:col-span-7 flex flex-col h-[700px] bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-2xl relative">
                    {/* ... existing preview code ... */}
                    {/* Preview Header */}
                    <div className="h-14 bg-black/40 border-b border-white/5 flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-medium text-white/40">Preview Mode</span>
                            
                            {paginatedPages.length > 0 && (
                                <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/5">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1 hover:text-white text-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-xs font-mono text-white/90 min-w-[60px] text-center font-medium">
                                        Page {currentPage} / {totalPages}
                                    </span>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1 hover:text-white text-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {generatedHomework && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSaveToLibrary}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                >
                                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                                    Save
                                </button>
                                <button onClick={exportPDF} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all">
                                    <Download size={14} /> Export PDF
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-[#525659] p-8 flex justify-center relative">
                        {!generatedHomework ? (
                            <div className="text-center self-center space-y-4 opacity-30 select-none">
                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText size={40} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Ready to Create</h3>
                                <p className="max-w-xs text-sm">Describe your lesson above to generate a custom homework assignment.</p>
                            </div>
                        ) : (
                            <div
                                id="homework-preview"
                                className="bg-white text-black shadow-2xl p-[20mm] min-h-[297mm] w-[210mm] mx-auto origin-top transform scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.85] xl:scale-90 transition-transform"
                                style={{ marginBottom: '-10%' }}
                            >
                                {/* Header only on Page 1 */}
                                {currentPage === 1 && (
                                    <div className="border-b-2 border-black pb-4 mb-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h1 className="text-2xl font-bold uppercase tracking-tight mb-1">{schoolName || "SCHOOL NAME"}</h1>
                                                <h2 className="text-lg font-semibold text-slate-600">{assignmentTitle || "Homework Assignment"}</h2>
                                            </div>
                                            <div className="text-right text-sm">
                                                <p className="font-bold">Subject:</p>
                                                <p>{subject || "General"}</p>
                                                <p className="font-bold mt-2">Due Date:</p>
                                                <p>{dueDate || "TBA"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(() => {
                                    const pageData = paginatedPages[currentPage - 1];
                                    if (!pageData) return null;

                                    return (
                                        <div className="space-y-6">
                                            {pageData.sections.map((section, idx) => (
                                                <div key={idx} className="mb-6">
                                                    <div className="text-center font-bold text-base mb-4 uppercase border-b border-black/30 pb-2">
                                                        {section.title}
                                                    </div>
                                                    
                                                    {section.questions.length > 0 && (
                                                        <table className="w-full border-2 border-black" style={{ borderCollapse: 'collapse' }}>
                                                            <thead>
                                                                <tr>
                                                                    <th className="border-2 border-black px-3 py-2 font-semibold text-sm w-16">Q.No.</th>
                                                                    <th className="border-2 border-black px-3 py-2 font-semibold text-sm">Questions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {section.questions.map((q, qIdx) => {
                                                                    const match = q.match(/^(\d+)\.(.+)/ms);
                                                                    const qNo = match ? match[1] : (qIdx + 1).toString();
                                                                    const qText = match ? match[2].trim() : q;
                                                                    
                                                                    return (
                                                                        <tr key={qIdx}>
                                                                            <td className="border-2 border-black px-3 py-3 text-center align-top font-bold">{qNo}.</td>
                                                                            <td className="border-2 border-black px-3 py-3 align-top">
                                                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                                                    {formatQuestionText(qText)}
                                                                                </ReactMarkdown>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Print Container for PDF Export */}
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
                            <div className="border-b-2 border-black pb-4 mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h1 className="text-2xl font-bold uppercase tracking-tight mb-1">{schoolName || "SCHOOL NAME"}</h1>
                                        <h2 className="text-lg font-semibold text-slate-600">{assignmentTitle || "Homework Assignment"}</h2>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p className="font-bold">Subject:</p>
                                        <p>{subject || "General"}</p>
                                        <p className="font-bold mt-2">Due Date:</p>
                                        <p>{dueDate || "TBA"}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {page.sections.map((section, idx) => (
                                <div key={idx} className="mb-6">
                                    <div className="text-center font-bold text-base mb-4 uppercase border-b border-black/30 pb-2">
                                        {section.title}
                                    </div>
                                    
                                    {section.questions.length > 0 && (
                                        <table className="w-full border-2 border-black" style={{ borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr>
                                                    <th className="border-2 border-black px-3 py-2 font-semibold text-sm w-16">Q.No.</th>
                                                    <th className="border-2 border-black px-3 py-2 font-semibold text-sm">Questions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {section.questions.map((q, qIdx) => {
                                                    const match = q.match(/^(\d+)\.(.+)/ms);
                                                    const qNo = match ? match[1] : (qIdx + 1).toString();
                                                    const qText = match ? match[2].trim() : q;
                                                                    
                                                                    return (
                                                                        <tr key={qIdx}>
                                                                            <td className="border-2 border-black px-3 py-3 text-center align-top font-bold">{qNo}.</td>
                                                                            <td className="border-2 border-black px-3 py-3 align-top">
                                                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                                                    {formatQuestionText(qText)}
                                                                                </ReactMarkdown>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
