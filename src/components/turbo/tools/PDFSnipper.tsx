import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, Crop as CropIcon, Check, X, ZoomIn, ZoomOut, Hand, MousePointer2 } from 'lucide-react';

// Configure PDF worker - Static file from public folder
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Snippet {
    id: number;
    image: string;
    page: number;
}

interface PDFSnipperProps {
    file: File | string;
    onConfirm: (snippets: Snippet[]) => void;
    onCancel: () => void;
    initialSnippets?: Snippet[];
}

export default function PDFSnipper({ file, onConfirm, onCancel, initialSnippets = [] }: PDFSnipperProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
    const [imageRef, setImageRef] = useState<HTMLCanvasElement | null>(null);
    const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);

    // Tools: 'crop' | 'pan'
    const [toolMode, setToolMode] = useState<'crop' | 'pan'>('pan'); // Default to pan for easier navigation
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handleSnippet = async () => {
        if (completedCrop && imageRef) {
            const canvas = document.createElement('canvas');

            const rect = imageRef.getBoundingClientRect();
            const scaleX = imageRef.width / rect.width;
            const scaleY = imageRef.height / rect.height;

            canvas.width = completedCrop.width * scaleX;
            canvas.height = completedCrop.height * scaleY;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw high-res crop from source canvas
            ctx.drawImage(
                imageRef,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const base64 = canvas.toDataURL('image/jpeg', 0.95);
            setSnippets([...snippets, { id: Date.now(), image: base64, page: pageNumber }]);
            setCrop(undefined);
            setCompletedCrop(null);
        }
    };

    // Drag to Scroll Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if (toolMode === 'pan' && containerRef.current) {
            setIsDragging(true);
            setStartPos({
                x: e.pageX,
                y: e.pageY,
                scrollLeft: containerRef.current.scrollLeft,
                scrollTop: containerRef.current.scrollTop
            });
            e.preventDefault(); // Prevent text selection
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && toolMode === 'pan' && containerRef.current) {
            const x = e.pageX - startPos.x;
            const y = e.pageY - startPos.y;
            containerRef.current.scrollLeft = startPos.scrollLeft - x;
            containerRef.current.scrollTop = startPos.scrollTop - y;
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-[#0a0c10] border border-white/10 w-full h-full max-w-7xl rounded-2xl flex flex-col overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-black/60 backdrop-blur-md shrink-0 relative z-20">
                    <div className="flex items-center gap-3">
                        <h2 className="text-white font-semibold flex items-center gap-2">
                            <CropIcon size={18} className="text-cyan-400" />
                            Syllabus Snipper
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
                            {snippets.length} Selected
                        </span>
                        <button
                            onClick={() => onConfirm(snippets)}
                            disabled={snippets.length === 0}
                            className="px-5 py-2 bg-cyan-500 text-black font-bold rounded-full text-sm hover:bg-cyan-400 disabled:opacity-30 disabled:grayscale transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95"
                        >
                            Done
                        </button>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all border border-transparent hover:border-white/10"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">

                    {/* PDF Viewer Area */}
                    <div
                        ref={containerRef}
                        className={`flex-1 overflow-auto bg-[#1a1c20] flex justify-center p-12 relative cursor-${toolMode === 'pan' ? (isDragging ? 'grabbing' : 'grab') : 'crosshair'
                            }`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Floating Tool Pill */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] flex bg-black/60 backdrop-blur-xl rounded-full p-1.5 border border-white/10 shadow-2xl ring-1 ring-white/5">
                            <button
                                onClick={() => setToolMode('pan')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${toolMode === 'pan'
                                        ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Hand size={14} /> PAN
                            </button>
                            <button
                                onClick={() => setToolMode('crop')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${toolMode === 'crop'
                                        ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <MousePointer2 size={14} /> SELECT
                            </button>
                        </div>
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={<div className="text-white/50 animate-pulse mt-20">Loading PDF...</div>}
                            className="shadow-2xl"
                        >
                            <div
                                className="relative border border-white/10"
                                style={{ pointerEvents: toolMode === 'pan' ? 'none' : 'auto' }}
                            >
                                <ReactCrop
                                    crop={crop}
                                    onChange={c => setCrop(c)}
                                    onComplete={c => setCompletedCrop(c)}
                                    disabled={toolMode === 'pan'}
                                    className="max-w-full"
                                >
                                    <Page
                                        pageNumber={pageNumber}
                                        scale={scale}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        canvasRef={(ref) => {
                                            if (ref) setImageRef(ref);
                                        }}
                                    />
                                </ReactCrop>
                            </div>
                        </Document>

                        {/* Snippet Overlay Action - Only show if we have a valid crop */}
                        {crop && crop.width > 20 && toolMode === 'crop' && (
                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in">
                                <button
                                    onClick={handleSnippet}
                                    className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-full shadow-2xl flex items-center gap-2 hover:bg-cyan-400 hover:scale-105 transition-all"
                                >
                                    <Check size={18} /> Capture Selection
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Controls */}
                    <div className="w-80 border-l border-white/10 bg-black/40 flex flex-col z-10 shadow-xl overflow-hidden">

                        {/* Snippet List Section with fixed header and scrollable area */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="p-4 border-b border-white/5 shrink-0 bg-white/[0.02]">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                                    Captured Snippets
                                    <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full text-[10px] border border-cyan-500/20">
                                        {snippets.length}
                                    </span>
                                </h3>
                            </div>

                            <div className="flex-1 overflow-auto p-4 space-y-4 custom-scrollbar">
                                {snippets.length === 0 ? (
                                    <div className="text-center py-20 text-muted-foreground/30 text-sm border-2 border-dashed border-white/5 rounded-xl">
                                        <CropIcon size={32} className="mx-auto mb-2 opacity-50" />
                                        No snippets yet.<br />Select & Capture.
                                    </div>
                                ) : (
                                    snippets.map((snip, i) => (
                                        <div key={snip.id} className="relative group border border-white/10 rounded-lg overflow-hidden bg-white/5 hover:border-cyan-500/30 transition-colors shadow-lg">
                                            <div className="w-full min-h-[60px] bg-black/20 flex items-center justify-center overflow-hidden">
                                                <img src={snip.image} alt="Snippet" className="w-full h-auto block" />
                                            </div>
                                            <button
                                                onClick={() => setSnippets(snippets.filter(s => s.id !== snip.id))}
                                                className="absolute top-1 right-1 p-1.5 bg-red-500 rounded-md text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-xl scale-90 hover:scale-100 z-20"
                                            >
                                                <X size={14} />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] text-white/90 flex justify-between z-10 border-t border-white/5">
                                                <span className="font-medium">#{i + 1}</span>
                                                <span className="opacity-70">Pg {snip.page}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Sidebar Footer with Navigation and Primary Action */}
                        <div className="shrink-0 space-y-4 p-4 border-t border-white/10 bg-[#0a0c10]">
                            {/* Pagination and Zoom Controls */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-white/[0.03] rounded-lg p-1">
                                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-white/10 rounded-md transition-colors"><ZoomOut size={16} className="text-white/60 hover:text-white" /></button>
                                    <span className="text-white text-[11px] font-mono font-medium">{Math.round(scale * 100)}%</span>
                                    <button onClick={() => setScale(s => Math.min(2.5, s + 0.1))} className="p-2 hover:bg-white/10 rounded-md transition-colors"><ZoomIn size={16} className="text-white/60 hover:text-white" /></button>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                        disabled={pageNumber <= 1}
                                        className="p-2.5 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <div className="flex-1 text-center bg-white/5 py-2 rounded-lg border border-white/5">
                                        <span className="text-white font-bold text-sm">{pageNumber}</span>
                                        <span className="text-white/30 text-xs mx-1">/</span>
                                        <span className="text-white/40 text-xs">{numPages || '--'}</span>
                                    </div>
                                    <button
                                        onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || 1))}
                                        disabled={pageNumber >= (numPages || 1)}
                                        className="p-2.5 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* PRIMARY ACTION BUTTON (The "Done" Button) */}
                            <button
                                onClick={() => onConfirm(snippets)}
                                disabled={snippets.length === 0}
                                className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98] disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                <Check size={18} className="group-hover:scale-110 transition-transform" />
                                Confirm Selection
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
