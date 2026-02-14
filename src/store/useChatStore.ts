import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatStore {
    messages: ChatMessage[];
    addMessage: (message: ChatMessage) => void;
    setMessages: (messages: ChatMessage[]) => void;
    clearHistory: () => void;
    lastProvider: string;
    setLastProvider: (provider: string) => void;
}

export const useChatStore = create<ChatStore>()(
    persist(
        (set) => ({
            messages: [],
            addMessage: (message) => set((state) => ({
                messages: [...state.messages, message]
            })),
            setMessages: (messages) => set({ messages }),
            clearHistory: () => set({ messages: [] }),

            // AI Metadata
            lastProvider: 'groq',
            setLastProvider: (provider) => set({ lastProvider: provider }),
        }),
        {
            name: 'deephub-chat-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
