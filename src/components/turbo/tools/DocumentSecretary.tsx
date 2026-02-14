import React, { useState, useRef } from 'react';
import {
    FileText,
    Upload,
    Plus,
    Sparkles,
    Download,
    Printer,
    Settings,
    School,
    Check,
    Loader2,
    FileEdit,
    Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';

const TEMPLATES = [
    { id: 'permission', label: 'Permission Slip', icon: FileText, prompt: "Draft a formal school permission slip for a field trip/event." },
    { id: 'certificate', label: 'Certificate', icon: Check, prompt: "Draft a student achievement certificate wording." },
    { id: 'warning', label: 'Warning Letter', icon: FileEdit, prompt: "Draft a formal disciplinary warning letter for a student." },
    { id: 'notice', label: 'Event Notice', icon: Plus, prompt: "Draft a formal notice for an upcoming school event/holiday." }
] as const;

type Template = typeof TEMPLATES[number];

interface BrandingDetails {
    name: string;
    address: string;
    phone: string;
    email: string;
    motto: string;
}

interface Branding {
    type: 'upload' | 'manual';
    headerImage: string | null;
    details: BrandingDetails;
}

export default function DocumentSecretary() {
    const [activeTab, setActiveTab] = useState<'branding' | 'templates' | 'editor'>('branding');
    const [branding, setBranding] = useState<Branding>({
        type: 'upload',
        headerImage: null,
        details: { name: '', address: '', phone: '', email: '', motto: '' }
    });
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [userInput, setUserInput] = useState('');
    const [generatedDoc, setGeneratedDoc] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleHeaderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setBranding({ ...branding, headerImage: event.target.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!selectedTemplate || !userInput) return;
        setIsGenerating(true);
        try {

            const response = await fetch('/api/secretary/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template: selectedTemplate.id,
                    context: userInput,
                    branding: branding.type === 'manual' ? branding.details : null
                })
            });
            const data = await response.json();
            if (response.ok) {
                setGeneratedDoc(data.content);
                setActiveTab('editor');
            }
        } catch (error) {
            console.error("GEN ERR:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveToLibrary = async () => {
        if (!generatedDoc) return;
        setIsSaving(true);
        try {

            const response = await fetch('/api/library/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'secretary-doc',
                    title: `Document - ${selectedTemplate?.label || 'Academic'}`,
                    content: generatedDoc,
                    metadata: {
                        template: selectedTemplate?.id,
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

    const exportPDF = async () => {
        setIsExporting(true);
        const doc = new jsPDF('p', 'mm', 'a4');
        const margin = 20;
        const pageWidth = doc.internal.pageSize.width;

        // 1. Branding Header
        if (branding.type === 'upload' && branding.headerImage) {
            doc.addImage(branding.headerImage, 'PNG', 0, 0, pageWidth, 40);
        } else if (branding.type === 'manual' && branding.details.name) {
            doc.setFillColor(245, 245, 245);
            doc.rect(0, 0, pageWidth, 40, 'F');
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text(branding.details.name.toUpperCase(), pageWidth / 2, 20, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`${branding.details.address} | ${branding.details.phone}`, pageWidth / 2, 30, { align: 'center' });
        }

        // 2. Document Content
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(generatedDoc, pageWidth - (margin * 2));
        doc.text(splitText, margin, 60);

        doc.save(`${selectedTemplate?.label || 'Document'}.pdf`);
        setIsExporting(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] animate-fade-in relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 lg:mb-8 gap-4">
                <div className="flex items-center gap-2 bg-[#0a0c10] border border-white/5 p-2 rounded-2xl w-full lg:w-fit overflow-x-auto">
                    {(['branding', 'templates', 'editor'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 lg:px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-muted-foreground hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <FileEdit size={20} />
                    </div>
                    <div className="hidden lg:block">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white leading-none">The Secretary</h3>
                        <p className="text-[10px] text-muted-foreground mt-1 font-bold">Document Architect</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-8 flex-1 min-h-0 relative z-10">
                <div className="lg:col-span-4 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-2 relative z-20 max-h-[60vh] lg:max-h-full">
                    <AnimatePresence mode="wait">
                        {activeTab === 'branding' && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-8 space-y-8">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                                            <School className="text-blue-500" /> Branding Vault
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">Set your institution identity once for all future documents.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => setBranding({ ...branding, type: 'upload' })} className={`p-6 rounded-2xl border transition-all text-center space-y-3 ${branding.type === 'upload' ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 hover:border-white/10'}`}>
                                            <Upload className={branding.type === 'upload' ? 'text-blue-500 mx-auto' : 'text-white/20 mx-auto'} />
                                            <span className="block text-[8px] font-black uppercase tracking-widest leading-tight">Letterhead Upload</span>
                                        </button>
                                        <button onClick={() => setBranding({ ...branding, type: 'manual' })} className={`p-6 rounded-2xl border transition-all text-center space-y-3 ${branding.type === 'manual' ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 hover:border-white/10'}`}>
                                            <Settings className={branding.type === 'manual' ? 'text-blue-500 mx-auto' : 'text-white/20 mx-auto'} />
                                            <span className="block text-[8px] font-black uppercase tracking-widest leading-tight">Manual Setup</span>
                                        </button>
                                    </div>

                                    {branding.type === 'upload' ? (
                                        <label className="block w-full h-40 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-blue-500/30 transition-all overflow-hidden relative group">
                                            <input type="file" className="hidden" onChange={handleHeaderUpload} accept="image/*" />
                                            {branding.headerImage ? (
                                                <img src={branding.headerImage} alt="Header" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                                                    <Plus size={32} />
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-center">Click to upload letterhead</span>
                                                </div>
                                            )}
                                        </label>
                                    ) : (
                                        <div className="space-y-4">
                                            {(['name', 'address', 'phone', 'email'] as const).map((field) => (
                                                <div key={field} className="space-y-1.5">
                                                    <label className="text-[9px] uppercase font-black text-muted-foreground tracking-widest ml-1">{field}</label>
                                                    <input
                                                        type="text"
                                                        value={branding.details[field]}
                                                        onChange={(e) => setBranding({ ...branding, details: { ...branding.details, [field]: e.target.value } })}
                                                        placeholder={`Enter Institution ${field}`}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-blue-500 transition-all outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button onClick={() => setActiveTab('templates')} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-[0.98] transition-all text-xs">Save Branding</button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'templates' && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-8 space-y-8 shadow-xl">
                                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                                        <Plus className="text-blue-500" /> Choose Template
                                    </h3>

                                    <div className="grid grid-cols-1 gap-3">
                                        {TEMPLATES.map((tmpl) => (
                                            <button
                                                key={tmpl.id}
                                                onClick={() => setSelectedTemplate(tmpl)}
                                                className={`p-5 rounded-2xl border transition-all text-left flex items-center gap-4 group ${selectedTemplate?.id === tmpl.id ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedTemplate?.id === tmpl.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-muted-foreground group-hover:text-white'
                                                    }`}>
                                                    <tmpl.icon size={18} />
                                                </div>
                                                <span className="block text-sm font-bold">{tmpl.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {selectedTemplate && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                            <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1 leading-none">Contextual Details</label>
                                            <textarea
                                                rows={3}
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                placeholder="Example: Field trip to Science Museum for Class 10 on Friday, Fee 500/-"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs focus:border-blue-500 transition-all outline-none resize-none leading-relaxed"
                                            />
                                            <button
                                                onClick={handleGenerate}
                                                disabled={isGenerating}
                                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[0.99]"
                                            >
                                                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <><Sparkles size={18} /> Generate Draft</>}
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'editor' && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-8 text-center space-y-4 shadow-xl">
                                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
                                        <Check size={32} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Draft Ready!</h3>
                                    <p className="text-sm text-blue-400 font-medium">Your document is ready for final review in the preview panel.</p>
                                    <button onClick={() => setActiveTab('templates')} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white underline underline-offset-4">Refine Template</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT PANEL: PREVIEW AREA - Hidden on Mobile */}
                <div className="hidden lg:flex lg:col-span-8 bg-[#0a0c10] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex-col min-h-0 relative group">
                    <div className="bg-white/5 border-b border-white/5 px-8 h-16 flex items-center justify-between z-20">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                            <Printer size={14} /> Document Architecture Preview
                        </span>
                        {generatedDoc && (
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
                                    onClick={exportPDF}
                                    disabled={isExporting}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.05]"
                                >
                                    {isExporting ? <Loader2 size={14} className="animate-spin" /> : <><Download size={14} /> Export PDF</>}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-[#020408] custom-scrollbar relative">
                        {/* Background Decoration to prevent visual overlap artifacts */}
                        <div className="absolute inset-0 bg-[#020408] z-0" />

                        <div className="max-w-2xl mx-auto min-h-full bg-white text-black p-8 lg:p-14 shadow-2xl relative z-10 flex flex-col scale-[0.98] origin-top transition-transform group-hover:scale-100">
                            <div className="mb-12 border-b-2 border-slate-100 pb-8 h-32 flex items-center justify-center">
                                {branding.type === 'upload' && branding.headerImage ? (
                                    <img src={branding.headerImage} alt="Header" className="w-full h-full object-contain" />
                                ) : branding.type === 'manual' && branding.details.name ? (
                                    <div className="text-center">
                                        <h1 className="text-3xl font-black uppercase tracking-tighter">{branding.details.name}</h1>
                                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 mt-2">{branding.details.address} | {branding.details.phone}</p>
                                    </div>
                                ) : (
                                    <div className="text-slate-200 uppercase font-black tracking-widest text-xs italic opacity-50">Letterhead Branding Area</div>
                                )}
                            </div>

                            <div className="flex-1">
                                {!generatedDoc ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-200 italic text-sm text-center space-y-6 py-20">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 animate-pulse">
                                            <FileEdit size={40} />
                                        </div>
                                        <p className="max-w-[200px]">Add context to start drafting the official document.</p>
                                    </div>
                                ) : (
                                    <textarea
                                        value={generatedDoc}
                                        onChange={(e) => setGeneratedDoc(e.target.value)}
                                        className="w-full h-full border-none outline-none resize-none font-serif leading-relaxed text-lg p-0 focus:ring-0"
                                    />
                                )}
                            </div>

                            <div className="mt-20 pt-12 border-t border-slate-100 flex justify-between items-end">
                                <div className="space-y-4">
                                    <div className="w-32 h-px bg-slate-200" />
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Authorized Official Signature</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Issued: {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Decos restricted to parent container */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-0" />
        </div>
    );
}
