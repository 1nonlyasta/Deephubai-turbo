import React from 'react';
import { useAI } from '../context/AIContext';

export default function AIModelSwitcher({ compact = false }: { compact?: boolean }) {
    const { provider, setProvider } = useAI();
    const providers = [
        { id: 'auto', label: 'Auto', icon: '🔄' },
        { id: 'groq', label: 'Groq', icon: '⚡' },
        { id: 'gemini', label: 'Gemini', icon: '🧠' },
        { id: 'ollama', label: 'Ollama', icon: '🏠' },
    ] as const;

    return (
        <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-2'} gap-1 px-1`}>
            {providers.map(p => (
                <button
                    key={p.id}
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setProvider(p.id as any); 
                    }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        provider === p.id 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
                    title={compact ? p.label : undefined}
                >
                    <span>{p.icon}</span>
                    {!compact && <span>{p.label}</span>}
                </button>
            ))}
        </div>
    );
}
