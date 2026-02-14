import React, { createContext, useContext, useState, useEffect } from 'react';

export type AIProvider = 'auto' | 'groq' | 'gemini' | 'ollama';

interface AIContextType {
    provider: AIProvider;
    setProvider: (provider: AIProvider) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
    // Persist selection in localStorage
    const [provider, setProviderState] = useState<AIProvider>(() => {
        const saved = localStorage.getItem('preferred_ai_provider');
        return (saved as AIProvider) || 'auto';
    });

    const setProvider = (newProvider: AIProvider) => {
        setProviderState(newProvider);
        localStorage.setItem('preferred_ai_provider', newProvider);
    };

    return (
        <AIContext.Provider value={{ provider, setProvider }}>
            {children}
        </AIContext.Provider>
    );
}

export function useAI() {
    const context = useContext(AIContext);
    if (context === undefined) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
}
