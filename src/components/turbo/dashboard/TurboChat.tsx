import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Trash2,
    Zap,
    Loader2,
    Copy,
    Check,
    Globe
} from 'lucide-react';
import BrandLogo from '../../../assets/logo-new.svg';
import { useChatStore, ChatMessage } from '../../../store/useChatStore';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useAI } from "../../../context/AIContext";

export default function TurboChat() {
    const { provider } = useAI();
    const { messages, addMessage, setMessages, clearHistory } = useChatStore();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSearchEnabled, setIsSearchEnabled] = useState(false); // Default: Off for speed
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize with a default message if the store is empty
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                { role: 'assistant', content: "Hello! I'm Turbo, your AI research and generation assistant. How can I help you today?" }
            ]);
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        addMessage(userMessage);
        const updatedMessages = [...messages, userMessage];
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    messages: updatedMessages,
                    mode: 'normal',
                    provider: provider,
                    webSearch: isSearchEnabled
                })
            });

            const data = await response.json();
            if (data.response) {
                addMessage({ role: 'assistant', content: data.response });
            } else {
                throw new Error("Empty response");
            }
        } catch (err) {
            console.error("Chat Error:", err);
            addMessage({ role: 'assistant', content: "I'm having trouble connecting to the neural network right now. Please try again later." });
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        clearHistory();
        setMessages([{ role: 'assistant', content: "Memory purged. System ready for new research session." }]);
    };

    return (
        <div className="flex flex-col w-full h-full bg-[#050608]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative transition-all duration-500">

            {/* Subtle Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        x: [-20, 20, -20],
                        y: [-20, 20, -20],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        x: [20, -20, 20],
                        y: [20, -20, 20],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full"
                />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Header */}
            <div className="bg-white/[0.02] border-b border-white/5 px-8 h-16 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-9 h-9 flex items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-white/10 shadow-lg">
                        <img src={BrandLogo} alt="Turbo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Turbo V4</h3>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        </div>
                        <p className="text-[9px] text-white/30 font-medium uppercase tracking-[0.2em]">Neural Research Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Zap size={10} className="text-cyan-400 opacity-50" />
                        <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">70B Precision</span>
                    </div>
                    <button
                        onClick={clearChat}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                        title="Clear Chat"
                    >
                        <Trash2 size={14} className="text-white/20 group-hover:text-red-400" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-none z-10"
            >
                <AnimatePresence mode='popLayout'>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                max-w-[85%] px-5 py-3 rounded-2xl text-[14px] leading-relaxed
                ${msg.role === 'user'
                                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg shadow-cyan-900/20'
                                    : 'bg-white/[0.04] text-gray-200 border border-white/5 rounded-tl-none backdrop-blur-sm'}
              `}>
                                <ReactMarkdown
                                    components={{
                                        code({ className, children, ...props }: any) {
                                            const inline = !className;
                                            const match = /language-(\w+)/.exec(className || '');
                                            const [copied, setCopied] = useState(false);

                                            const handleCopy = () => {
                                                navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            };

                                            return !inline && match ? (
                                                <div className="relative group my-4 rounded-xl overflow-hidden border border-white/10">
                                                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                                        <span>{match[1]}</span>
                                                        <button
                                                            onClick={handleCopy}
                                                            className="flex items-center gap-1.5 hover:text-white transition-colors"
                                                        >
                                                            {copied ? (
                                                                <>
                                                                    <Check size={10} className="text-emerald-400" />
                                                                    <span className="text-emerald-400">Copied!</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy size={10} />
                                                                    <span>Copy</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus as any}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        className="!bg-black/60 !m-0 !p-4 !text-xs"
                                                        {...(props as any)}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                </div>
                                            ) : (
                                                <code className="bg-white/10 px-1.5 py-0.5 rounded text-cyan-400 font-mono text-xs" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                        li: ({ children }) => <li>{children}</li>,
                                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-md font-bold mb-2 text-white">{children}</h2>,
                                        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{children}</a>,
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <div className="flex justify-start">
                        <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 ${provider === 'ollama' ? 'bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'bg-white/[0.03] border border-white/5'}`}>
                            {provider === 'ollama' ? (
                                <>
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute w-full h-full bg-cyan-400/20 rounded-full animate-ping" />
                                        <Zap size={14} className="text-cyan-400 relative z-10" />
                                    </div>
                                    <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest animate-pulse">
                                        Conducting Deep Research...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Loader2 size={12} className="text-cyan-400 animate-spin" />
                                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Thinking...</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-6 bg-black/20 border-t border-white/5 shrink-0 z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="relative flex items-center bg-white/[0.02] border border-white/5 rounded-xl p-2 pl-6 focus-within:border-cyan-500/30 transition-all duration-300">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask Turbo anything..."
                            className="flex-1 bg-transparent border-none outline-none text-white text-[14px] placeholder:text-white/20 h-10"
                        />
                        {/* Only show web search toggle for Groq/Gemini (Ollama doesn't use search) */}
                        {provider !== 'ollama' && (
                            <div className="px-2">
                                <button
                                    onClick={() => setIsSearchEnabled(!isSearchEnabled)}
                                    className={`p-2 transition-colors ${isSearchEnabled ? 'text-cyan-400' : 'text-white/20 hover:text-white/40'}`}
                                    title={isSearchEnabled ? "Web Search Active" : "Enable Web Search"}
                                >
                                    <Globe size={18} />
                                </button>
                            </div>
                        )}
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="w-10 h-10 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-20 text-white rounded-lg flex items-center justify-center transition-all"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}



