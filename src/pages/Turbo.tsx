import React, { useState, useEffect } from 'react';
import {
    Bell,
    Database
} from 'lucide-react';
import TurboSidebar from '../components/turbo/TurboSidebar';
import TurboDynamicIsland from '../components/turbo/TurboDynamicIsland';
import QuestionPaperGenerator from '../components/turbo/tools/QuestionPaperGenerator';
import HomeworkCreator from '../components/turbo/tools/HomeworkCreator';
import LessonPlanBuilder from '../components/turbo/tools/LessonPlanBuilder';
import PPTGenerator from '../components/turbo/tools/PPTGenerator';
import PaperSolver from '../components/turbo/tools/PaperSolver';
import ReportCardAssistant from '../components/turbo/tools/ReportCardAssistant';
import DocumentSecretary from '../components/turbo/tools/DocumentSecretary';
import QuizShuffler from '../components/turbo/tools/QuizShuffler';
import Library from '../components/turbo/dashboard/Library';
import TurboChat from '../components/turbo/dashboard/TurboChat';
import TurboWatchDial from '../components/turbo/TurboWatchDial';

export default function Turbo() {
    const [collapsed, setCollapsed] = useState(false);
    const [activePage, setActivePage] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 1024;

    useEffect(() => {
        if (!isMobile) setIsMobileMenuOpen(false);
    }, [isMobile]);

    return (
        <div className="min-h-screen bg-[#020408] text-foreground font-sans selection:bg-cyan-500/30 overflow-hidden relative">

            {/* Sidebar - Hidden on mobile by default, behaves as a drawer */}
            <div className={`
        fixed inset-y-0 left-0 z-[110] transition-transform duration-500 ease-in-out
        ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
                <TurboSidebar
                    activePage={activePage}
                    setActivePage={(page: string) => { setActivePage(page); setIsMobileMenuOpen(false); }}
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                />
            </div>

            {/* Mobile Backdrop for Sidebar Drawer */}
            {isMobile && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105]"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* THE WATCH DIAL - Primary Mobile Nav */}
            {isMobile && <TurboWatchDial activePage={activePage} setActivePage={setActivePage} />}

            <div
                className={`
          transition-all duration-500 ease-in-out
          ${isMobile ? 'ml-0' : (collapsed ? 'ml-20' : 'ml-64')}
          h-screen relative flex flex-col overflow-hidden
        `}
            >
                {/* Global Neural Background Accents - Replaced with Mesh Gradient */}
                <div className="absolute inset-0 pointer-events-none z-0 bg-mesh opacity-80" />

                {/* Dynamic Island - Desktop Only */}
                {!isMobile && <TurboDynamicIsland title={activePage === 'dashboard' ? 'Turbo V4' : activePage.replace('-', ' ')} activePage={activePage} />}

                {/* Desktop Notification Center */}
                {!isMobile && (
                    <div className="fixed top-6 right-6 z-[60] flex items-center gap-3">
                        <button className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all shadow-xl group">
                            <Bell size={18} />
                            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-black" />
                        </button>
                    </div>
                )}

                <main className={`
          flex-1 relative z-10 overflow-hidden flex flex-col items-center transition-all duration-500
          ${isMobile ? 'p-3 pt-6 pb-24' : 'p-6 pt-24'}
        `}>

                    <div className="w-full h-full max-w-[1400px]">
                        {activePage === 'dashboard' && <TurboChat />}

                        {activePage !== 'dashboard' && (
                            <div className={`w-full h-full glass-panel rounded-[2rem] overflow-hidden ${isMobile ? 'rounded-2xl' : ''}`}>
                                <div className={`w-full h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 ${isMobile ? 'p-4' : 'p-6'}`}>
                                    {activePage === 'library' && <Library />}
                                    {activePage === 'question-gen' && <QuestionPaperGenerator />}
                                    {activePage === 'homework' && <HomeworkCreator />}
                                    {activePage === 'lesson-plan' && <LessonPlanBuilder />}
                                    {activePage === 'ppt-gen' && <PPTGenerator />}
                                    {activePage === 'paper-solver' && <PaperSolver />}
                                    {activePage === 'report-assistant' && <ReportCardAssistant />}
                                    {activePage === 'secretary' && <DocumentSecretary />}
                                    {activePage === 'shuffler' && <QuizShuffler />}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fallback */}
                    {activePage !== 'dashboard' && activePage !== 'library' && activePage !== 'question-gen' && activePage !== 'homework' && activePage !== 'lesson-plan' && activePage !== 'ppt-gen' && activePage !== 'paper-solver' && activePage !== 'report-assistant' && activePage !== 'secretary' && activePage !== 'shuffler' && (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-cyan-400">
                                <Database size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-widest">Protocol Offline</h3>
                            <p className="text-white/30 text-xs mt-2 max-w-xs leading-relaxed uppercase tracking-[0.2em]">
                                The requested module is undergoing neural calibration. access will be restored shortly.
                            </p>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}
