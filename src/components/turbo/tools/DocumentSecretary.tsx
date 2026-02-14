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
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const TEMPLATES = [
    { id: 'permission', label: 'Permission Slip', icon: FileText, prompt: "Draft a formal school permission slip for a field trip/event." },
    { id: 'certificate', label: 'Certificate', icon: Check, prompt: "Draft a student achievement certificate wording." },
    { id: 'warning', label: 'Warning Letter', icon: FileEdit, prompt: "Draft a formal disciplinary warning letter for a student." },
    { id: 'notice', label: 'Event Notice', icon: Plus, prompt: "Draft a formal notice for an upcoming school event/holiday." },
    { id: 'recommendation', label: 'Recommendation', icon: School, prompt: "Draft a recommendation letter for a student." }
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
    // Structured document fields
    const [studentName, setStudentName] = useState('');
    const [issuerName, setIssuerName] = useState('');
    const [issuerDesignation, setIssuerDesignation] = useState('');
    const [issuerEmail, setIssuerEmail] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
    const [institutionName, setInstitutionName] = useState('');
    const [refNumber, setRefNumber] = useState('');
    const [departmentName, setDepartmentName] = useState('');
    const [documentSubject, setDocumentSubject] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingLetterhead, setUploadingLetterhead] = useState(false);
    const [letterheadFileName, setLetterheadFileName] = useState<string | null>(null);

    const handleHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLetterhead(true);
        setLetterheadFileName(file.name);

        try {
            // --- IMAGE FILES ---
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setBranding({ ...branding, headerImage: event.target.result as string });
                    }
                };
                reader.readAsDataURL(file);
            }
            // --- PDF FILES --- render first page to canvas
            else if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const page = await pdf.getPage(1);
                const scale = 2; // high-res
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d')!;

                await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
                const dataUrl = canvas.toDataURL('image/png');
                setBranding({ ...branding, headerImage: dataUrl });
            }
            // --- DOCX FILES --- extract header image from ZIP
            else if (
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.name.endsWith('.docx')
            ) {
                const arrayBuffer = await file.arrayBuffer();
                const zip = await JSZip.loadAsync(arrayBuffer);

                // Look for images in word/media/ (common location for embedded images)
                const mediaFolder = zip.folder('word/media');
                let foundImage: string | null = null;

                if (mediaFolder) {
                    const imageFiles = Object.keys(zip.files)
                        .filter(name => name.startsWith('word/media/') && /\.(png|jpg|jpeg|gif|bmp|tiff)$/i.test(name))
                        .sort(); // first image is typically the header logo

                    if (imageFiles.length > 0) {
                        const imgData = await zip.files[imageFiles[0]].async('base64');
                        const ext = imageFiles[0].split('.').pop()?.toLowerCase() || 'png';
                        const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
                        foundImage = `data:${mimeType};base64,${imgData}`;
                    }
                }

                if (foundImage) {
                    setBranding({ ...branding, headerImage: foundImage });
                } else {
                    // No image found in DOCX — try to extract text-based header from document.xml
                    const docXml = await zip.file('word/document.xml')?.async('text');
                    if (docXml) {
                        // Quick parse: extract first paragraph text as school name
                        const textMatches = docXml.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
                        if (textMatches && textMatches.length > 0) {
                            const headerTexts = textMatches.slice(0, 5).map(m => m.replace(/<[^>]+>/g, ''));
                            const schoolName = headerTexts.join(' ').trim();
                            if (schoolName) {
                                setBranding({
                                    ...branding,
                                    type: 'manual',
                                    headerImage: null,
                                    details: { ...branding.details, name: schoolName }
                                });
                            }
                        }
                    }
                    if (!foundImage && branding.type === 'upload') {
                        alert('No images found in the DOCX. First few lines extracted as school name instead.');
                    }
                }
            }
        } catch (err) {
            console.error('Letterhead upload error:', err);
            alert('Failed to process the uploaded file. Please try another file.');
        } finally {
            setUploadingLetterhead(false);
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
                    branding: branding.type === 'manual' ? branding.details : null,
                    studentName,
                    issuerName,
                    issuerDesignation,
                    issuerEmail,
                    receiverName,
                    date: docDate,
                    institutionName: institutionName || branding.details.name,
                    refNumber,
                    departmentName,
                    documentSubject: documentSubject || (selectedTemplate ? selectedTemplate.label.toUpperCase() : '')
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
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const margin = 20;
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            let yPos = 10;

            // 1. Branding Header
            if (branding.type === 'upload' && branding.headerImage) {
                doc.addImage(branding.headerImage, 'PNG', 0, 0, pageWidth, 40);
                yPos = 45;
            } else if (branding.type === 'manual' && branding.details.name) {
                doc.setFillColor(245, 245, 245);
                doc.rect(0, 0, pageWidth, 40, 'F');
                doc.setFontSize(22);
                doc.setFont('helvetica', 'bold');
                doc.text(branding.details.name.toUpperCase(), pageWidth / 2, 18, { align: 'center' });
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.text(`${branding.details.address} | ${branding.details.phone}`, pageWidth / 2, 28, { align: 'center' });
                if (branding.details.email) {
                    doc.text(branding.details.email, pageWidth / 2, 34, { align: 'center' });
                }
                yPos = 45;
            }

            // Separator line
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;

            // Ref No and Date
            doc.setFontSize(10);
            doc.setFont('times', 'normal');
            doc.text(refNumber ? `Ref: ${refNumber}` : '', margin, yPos);
            const dateStr = docDate
                ? new Date(docDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                : new Date().toLocaleDateString();
            doc.text(dateStr, pageWidth - margin, yPos, { align: 'right' });
            yPos += 15;

            // Subject
            const subject = documentSubject || (selectedTemplate ? selectedTemplate.label.toUpperCase() : '');
            doc.setFontSize(12);
            doc.setFont('times', 'bold');
            doc.text(subject, pageWidth / 2, yPos, { align: 'center' });
            // Underline subject
            const textWidth = doc.getTextWidth(subject);
            doc.line((pageWidth / 2) - (textWidth / 2), yPos + 1, (pageWidth / 2) + (textWidth / 2), yPos + 1);
            yPos += 15;

            // 2. Document Content
            doc.setFontSize(11);
            doc.setFont('times', 'normal');
            const splitText = doc.splitTextToSize(generatedDoc, pageWidth - (margin * 2));
            
            // Handle page overflow
            for (const line of splitText) {
                if (yPos > pageHeight - 65) {
                    doc.addPage();
                    yPos = margin;
                }
                doc.text(line, margin, yPos);
                yPos += 6;
            }

            // 3. Signature Block
            const sigY = Math.max(yPos + 20, pageHeight - 55);
            if (sigY > pageHeight - 20) {
                doc.addPage();
            }
            const finalSigY = sigY > pageHeight - 20 ? 40 : sigY;

            // Separator
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.3);
            doc.line(margin, finalSigY - 5, pageWidth - margin, finalSigY - 5);

            // Signature Details
            doc.setFontSize(10);
            doc.setFont('times', 'bold');
            doc.text('Yours sincerely,', margin, finalSigY);
            let sigLineY = finalSigY + 12;
            doc.text(issuerName || 'Authorized Signatory', margin, sigLineY);
            sigLineY += 5;
            doc.setFontSize(9);
            doc.setFont('times', 'normal');
            if (issuerDesignation) {
                doc.text(issuerDesignation, margin, sigLineY);
                sigLineY += 4;
            }
            if (departmentName) {
                doc.text(departmentName, margin, sigLineY);
                sigLineY += 4;
            }
            if (institutionName || branding.details.name) {
                doc.text(institutionName || branding.details.name, margin, sigLineY);
                sigLineY += 4;
            }
            if (issuerEmail) {
                doc.setFontSize(8);
                doc.text(issuerEmail, margin, sigLineY);
            }

            doc.save(`${selectedTemplate?.label || 'Document'}.pdf`);
        } catch (err) {
            console.error('PDF export error:', err);
        } finally {
            setIsExporting(false);
        }
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
                                        <label className="block w-full min-h-[10rem] border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-blue-500/30 transition-all overflow-hidden relative group">
                                            <input type="file" className="hidden" onChange={handleHeaderUpload} accept="image/*,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                                            {uploadingLetterhead ? (
                                                <div className="h-40 flex flex-col items-center justify-center space-y-3 text-blue-400">
                                                    <Loader2 size={32} className="animate-spin" />
                                                    <span className="text-[10px] uppercase font-black tracking-widest">Processing {letterheadFileName}...</span>
                                                </div>
                                            ) : branding.headerImage ? (
                                                <div className="flex flex-col items-center">
                                                    <img src={branding.headerImage} alt="Header" className="w-full object-contain p-2" style={{ maxHeight: '200px' }} />
                                                    {letterheadFileName && (
                                                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest pb-2 truncate max-w-[90%]">{letterheadFileName}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="h-40 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                                                    <Plus size={32} />
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-center px-4">Upload letterhead (Image, PDF, or DOCX)</span>
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
                                <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl">
                                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
                                        <Plus className="text-blue-500" /> Choose Template
                                    </h3>

                                    <div className="grid grid-cols-2 gap-2">
                                        {TEMPLATES.map((tmpl) => (
                                            <button
                                                key={tmpl.id}
                                                onClick={() => setSelectedTemplate(tmpl)}
                                                className={`p-3 rounded-xl border transition-all text-center space-y-2 ${selectedTemplate?.id === tmpl.id ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <tmpl.icon size={16} className={`mx-auto ${selectedTemplate?.id === tmpl.id ? 'text-blue-500' : 'text-white/30'}`} />
                                                <span className="block text-[9px] font-black uppercase tracking-widest">{tmpl.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {selectedTemplate && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                            <label className="text-[9px] uppercase font-black text-blue-500 tracking-widest ml-1 block">Document Details</label>
                                            
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Student Name</label>
                                                    <input
                                                        type="text"
                                                        value={studentName}
                                                        onChange={(e) => setStudentName(e.target.value)}
                                                        placeholder="e.g. John Doe"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500 transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Date</label>
                                                    <input
                                                        type="date"
                                                        value={docDate}
                                                        onChange={(e) => setDocDate(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Issued By (Name)</label>
                                                    <input
                                                        type="text"
                                                        value={issuerName}
                                                        onChange={(e) => setIssuerName(e.target.value)}
                                                        placeholder="e.g. Dr. Sarah Khan"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500 transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Addressed To</label>
                                                    <input
                                                        type="text"
                                                        value={receiverName}
                                                        onChange={(e) => setReceiverName(e.target.value)}
                                                        placeholder="Parent / Student"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Designation</label>
                                                    <input
                                                        type="text"
                                                        value={issuerDesignation}
                                                        onChange={(e) => setIssuerDesignation(e.target.value)}
                                                        placeholder="e.g. Principal / HOD Science"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500 transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Email ID</label>
                                                    <input
                                                        type="email"
                                                        value={issuerEmail}
                                                        onChange={(e) => setIssuerEmail(e.target.value)}
                                                        placeholder="e.g. principal@school.edu"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Ref Number</label>
                                                    <input
                                                        type="text"
                                                        value={refNumber}
                                                        onChange={(e) => setRefNumber(e.target.value)}
                                                        placeholder="e.g. RCET/AD/2026"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500 transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Department</label>
                                                    <input
                                                        type="text"
                                                        value={departmentName}
                                                        onChange={(e) => setDepartmentName(e.target.value)}
                                                        placeholder="e.g. AI & Data Science"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Document Subject/Title</label>
                                                <input
                                                    type="text"
                                                    value={documentSubject}
                                                    onChange={(e) => setDocumentSubject(e.target.value)}
                                                    placeholder={selectedTemplate ? selectedTemplate.label.toUpperCase() : 'LETTER OF RECOMMENDATION'}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500 transition-all outline-none"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Institution Name</label>
                                                <input
                                                    type="text"
                                                    value={institutionName}
                                                    onChange={(e) => setInstitutionName(e.target.value)}
                                                    placeholder="e.g. Delhi Public School"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500 transition-all outline-none"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Additional Context</label>
                                                <textarea
                                                    rows={2}
                                                    value={userInput}
                                                    onChange={(e) => setUserInput(e.target.value)}
                                                    placeholder="e.g. Field trip to Science Museum for Class 10, Fee 500/-"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500 transition-all outline-none resize-none leading-relaxed"
                                                />
                                            </div>

                                            <button
                                                onClick={handleGenerate}
                                                disabled={isGenerating || !userInput}
                                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[0.99] disabled:opacity-50 text-xs"
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
                {/* RIGHT PANEL: PREVIEW AREA - High Fidelity A4 View matching Question Paper Generator */}
                <div className="hidden lg:flex lg:col-span-8 flex-col h-full bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-2xl relative">
                    
                    {/* Preview Header - Matching QuestionPaperGenerator */}
                    <div className="h-14 bg-black/40 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                 <button className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white" title="Desktop View"><Settings size={14} /></button>
                                 <button className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white" title="Print View"><Printer size={14} /></button>
                             </div>
                             <span className="text-xs font-medium text-white/40 ml-2">Preview Mode</span>
                        </div>

                        {generatedDoc && (
                            <div className="flex items-center gap-3">
                                {/* Pagination Controls - Visual matching QP Generator */}
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                                    <button 
                                        disabled
                                        className="p-1 hover:text-white text-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Previous Page"
                                    >
                                        <Loader2 size={16} className={isGenerating ? "animate-spin" : "opacity-0"} />
                                    </button>
                                    <span className="text-xs font-mono text-white/90 min-w-[60px] text-center font-medium">
                                        Page 1 / 1
                                    </span>
                                    <button 
                                        disabled
                                        className="p-1 hover:text-white text-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Next Page"
                                    >
                                        <Check size={16} className="opacity-0" />
                                    </button>
                                </div>

                                <div className="h-4 w-[1px] bg-white/10 mx-1"></div>

                                <button
                                    onClick={exportPDF}
                                    disabled={isExporting}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
                                >
                                    {isExporting ? <Loader2 size={14} className="animate-spin" /> : <><Download size={14} /> Export PDF</>}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Paper Content - A4 Rendering */}
                    <div className="flex-1 overflow-y-auto bg-[#525659] p-8 flex justify-center relative custom-scrollbar">
                        {!generatedDoc ? (
                            <div className="text-center self-center space-y-4 opacity-30 select-none">
                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileEdit size={40} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Ready to Draft</h3>
                                <p className="max-w-xs text-sm text-white/60">Fill in the details and choose a template to generate a professional official document.</p>
                            </div>
                        ) : (
                            <div
                                className="bg-white text-black shadow-2xl origin-top transition-transform duration-300"
                                style={{
                                    width: '210mm',
                                    minHeight: '297mm',
                                    padding: '20mm',
                                    boxSizing: 'border-box',
                                    fontFamily: 'serif'
                                }}
                            >
                                {/* HEADER */}
                                <div className="mb-8 border-b-2 border-slate-100 pb-6 flex items-center justify-center h-28">
                                    {branding.type === 'upload' && branding.headerImage ? (
                                        <img src={branding.headerImage} alt="Header" className="w-full h-full object-contain" />
                                    ) : branding.type === 'manual' && branding.details.name ? (
                                        <div className="text-center w-full">
                                            <h1 className="text-3xl font-black uppercase tracking-tighter text-black">{branding.details.name}</h1>
                                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 mt-2">{branding.details.address} | {branding.details.phone}</p>
                                        </div>
                                    ) : (
                                        <div className="text-slate-200 uppercase font-black tracking-widest text-xs italic opacity-50">Letterhead Branding Area</div>
                                    )}
                                </div>

                                {/* REF NO & DATE LINE */}
                                <div className="flex justify-between items-center mb-6 text-xs text-slate-600 font-serif">
                                    <div className="font-semibold">{refNumber ? `Ref: ${refNumber}` : ''}</div>
                                    <div className="font-semibold">{docDate ? new Date(docDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString()}</div>
                                </div>

                                {/* DOCUMENT SUBJECT */}
                                <div className="text-center mb-8">
                                    <h2 className="text-sm font-bold underline uppercase tracking-wider text-black">
                                        {documentSubject || (selectedTemplate ? selectedTemplate.label.toUpperCase() : 'LETTER OF RECOMMENDATION')}
                                    </h2>
                                </div>

                                {/* CONTENT */}
                                <div className="min-h-[400px] flex flex-col mb-8">
                                    <div className="whitespace-pre-wrap text-[10.5pt] leading-relaxed font-serif text-justify text-slate-900">
                                        {generatedDoc}
                                    </div>
                                </div>

                                {/* FOOTER / SIGNATURE */}
                                <div className="mt-auto pt-6 border-t border-slate-200 flex justify-between items-end">
                                    <div className="space-y-4">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-black mb-4">Yours sincerely,</p>
                                            <p className="text-sm font-bold uppercase tracking-wide text-black">{issuerName || 'Authorized Signatory'}</p>
                                            {issuerDesignation && (
                                                <p className="text-[10px] font-semibold text-slate-600 tracking-wide">{issuerDesignation}</p>
                                            )}
                                            {departmentName && (
                                                <p className="text-[10px] font-semibold text-slate-600 tracking-wide">{departmentName}</p>
                                            )}
                                            {(institutionName || branding.details.name) && (
                                                <p className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">{institutionName || branding.details.name}</p>
                                            )}
                                            {issuerEmail && (
                                                <p className="text-[9px] text-slate-400 font-medium mt-1">{issuerEmail}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end opacity-20">
                                        <div className="w-16 h-16 border-2 border-slate-400 rounded-full flex items-center justify-center text-[8px] font-black text-slate-400 rotate-12">
                                            OFFICIAL SEAL
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Background Decos restricted to parent container */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-0" />
        </div>
    );
}
