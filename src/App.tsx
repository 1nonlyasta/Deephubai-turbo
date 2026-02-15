import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import Turbo from "./pages/Turbo";
const NotFound = React.lazy(() => import("./pages/NotFound"));
import { AIProvider } from "./context/AIContext";

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={0}>
                <AIProvider>
                    <BrowserRouter>
                        <div className="min-h-screen bg-background text-foreground selection:bg-cyan-500/30">
                            <Routes>
                                <Route path="/" element={<React.Suspense fallback={<div>Loading...</div>}><Turbo /></React.Suspense>} />
                                <Route path="*" element={<React.Suspense fallback={<div>Loading...</div>}><NotFound /></React.Suspense>} />
                            </Routes>
                            <Toaster />
                        </div>
                    </BrowserRouter>
                </AIProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}
