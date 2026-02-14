import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
    { name: 'Mon', usage: 40, efficiency: 24 },
    { name: 'Tue', usage: 30, efficiency: 13 },
    { name: 'Wed', usage: 20, efficiency: 98 },
    { name: 'Thu', usage: 27, efficiency: 39 },
    { name: 'Fri', usage: 18, efficiency: 48 },
    { name: 'Sat', usage: 23, efficiency: 38 },
    { name: 'Sun', usage: 34, efficiency: 43 },
];

export default function StatsPanel() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '200ms' }}>

            {/* Main Chart */}
            <div className="col-span-1 lg:col-span-2 bg-[#0a0c10] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-medium">Generation Efficiency</h3>
                    <select className="bg-white/5 border border-white/10 rounded-lg text-xs text-muted-foreground px-2 py-1 outline-none">
                        <option>This Week</option>
                        <option>Last Week</option>
                    </select>
                </div>

                <div className="h-[200px] w-full" style={{ minWidth: 0 }}>
                    <ResponsiveContainer width="99%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#333" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#020408', borderColor: '#333', borderRadius: '8px' }}
                                itemStyle={{ fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="usage" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsage)" />
                            <Area type="monotone" dataKey="efficiency" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorEff)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Small Stats */}
            <div className="space-y-6">
                <div className="bg-[#0a0c10] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-[calc(50%-12px)] relative group hover:border-cyan-500/20 transition-colors">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Avg Response Time</span>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors font-mono">1.2s</span>
                        <span className="text-xs text-emerald-400 mb-1">▼ 12%</span>
                    </div>
                    <div className="absolute right-4 top-4 w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                        <span className="text-cyan-400 text-xs">⚡</span>
                    </div>
                </div>

                <div className="bg-[#0a0c10] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-[calc(50%-12px)] relative group hover:border-violet-500/20 transition-colors">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Documents Generated</span>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-white group-hover:text-violet-400 transition-colors font-mono">842</span>
                        <span className="text-xs text-emerald-400 mb-1">▲ 8%</span>
                    </div>
                    <div className="absolute right-4 top-4 w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                        <span className="text-violet-400 text-xs">📄</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
