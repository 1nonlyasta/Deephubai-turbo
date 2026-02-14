// src/components/HeaderBox.tsx
import React from "react";

export default function HeaderBox() {
    return (
        <section className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
                {/* centered gradient border + glass inner */}
                <div className="gradient-border mx-4 md:mx-0 card-shadow">
                    <div className="inner flex flex-col md:flex-row items-center gap-6 md:gap-12">
                        {/* left: text */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight" style={{ letterSpacing: '-0.02em' }}>
                                <span className="text-dh-accent"></span>.
                            </h1>

                            <p className="mt-4 text-slate-300 max-w-xl mx-auto md:mx-0">
                            </p>
                        </div>

                        {/* right: small panel with highlights or stats */}
                        <div className="w-full md:w-80">
                            <div className="glass p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <div className="text-xs text-slate-400">Avg Deployment</div>
                                        <div className="text-lg font-semibold"><span className="text-dh-accent">10m</span></div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400">Uptime</div>
                                        <div className="text-lg font-semibold text-green-400">99.99%</div>
                                    </div>
                                </div>

                                <div className="mt-2 text-slate-300 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span>LLM integrations</span>
                                        <span className="text-sm text-slate-200 font-medium">5+</span>
                                    </div>

                                    <div className="mt-3">
                                        <div className="w-full h-2 bg-white/6 rounded-full overflow-hidden">
                                            <div className="h-2 rounded-full" style={{ width: "72%", background: "linear-gradient(90deg, var(--dh-accent), var(--dh-accent2))" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-slate-400 text-center">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
