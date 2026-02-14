import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export type Role = "system" | "user" | "assistant";

export interface Message {
    role: Role;
    content: string;
}

import { performSearch } from "../utils/search.ts";

export interface CompletionOptions {
    messages: Message[];
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: "json_object" | "text" };
    forcedProvider?: string;
    webSearch?: boolean;
}

const AI = {
    provider: (process.env.DEFAULT_AI_PROVIDER as "groq" | "kimi" | "gemini") || "groq",

    async complete({ messages, model, temperature = 0.7, max_tokens = 4096, response_format, forcedProvider, webSearch }: CompletionOptions) {
        const effectiveProvider = (forcedProvider && forcedProvider !== 'auto') ? forcedProvider : this.provider;
        
        // Model Selection Logic: Ensure we don't pass a Groq model name to Gemini/Ollama
        let targetModel = model;
        
        if (effectiveProvider === 'gemini') {
            // If the incoming model is a Groq/Ollama model, force Gemini default
            if (!targetModel || !targetModel.includes('gemini')) {
                // gemini-1.5-flash and gemini-1.5-pro failed with 404 for this user.
                // Falling back to standard 'gemini-pro' which is widely available.
                targetModel = 'gemini-flash-latest';
            }
        } else if (effectiveProvider === 'ollama') {
             // If the incoming model is a Groq/Gemini model, force Ollama default
             // Typically 'llama3.2' or 'llama2' depending on user setup. Defaulting to 'llama3.2'
             if (!targetModel || targetModel.includes('versatile') || targetModel.includes('gemini') || targetModel.includes('groq')) {
                // Defaulting to 1b model for speed, assuming user has it or will pull it.
                targetModel = 'llama3.2:1b';
             }
        } else if (effectiveProvider === 'groq') {
             if (!targetModel || (!targetModel.includes('70b') && !targetModel.includes('8b') && !targetModel.includes('vision') && !targetModel.includes('90b') && !targetModel.includes('llama-4') && !targetModel.includes('meta-llama'))) {
                 targetModel = 'llama-3.3-70b-versatile';
             }
        }

        console.log(`[AI] Using Provider : ${effectiveProvider} , Rendering Model : ${targetModel}`);

        // Check if we need to perform manual web search (for non-Gemini providers)
        // Gemini handles its own search via tools
        // Skip search for Ollama to prevent timeouts (use Groq/Gemini for real-time data)
        if (webSearch && effectiveProvider !== 'gemini' && effectiveProvider !== 'ollama') {
            const userQuery = messages[messages.length - 1]?.content;
            if (userQuery) {
                console.log(`[AI] Performing Web Search for: "${userQuery}"`);
                const searchResults = await performSearch(userQuery);
                
                if (searchResults) {
                    console.log(`[AI] Injected Search Results (${searchResults.length} chars)`);
                    const lastMsg = messages[messages.length - 1];
                    lastMsg.content = `
User Query: ${userQuery}

[SYSTEM INJECTED REAL-TIME CONTEXT FROM GOOGLE SEARCH]
${searchResults}

INSTRUCTIONS: Use the above real-time context to answer.
`.trim();
                }
            }
        }

        try {
            if (effectiveProvider === "kimi") {
                return await this.kimiComplete({ messages, model: targetModel, temperature, max_tokens, response_format });
            }

            if (effectiveProvider === "gemini") {
                return await this.geminiComplete({ messages, model: targetModel, temperature, max_tokens, response_format });
            }
            
            if (effectiveProvider === "ollama") {
                 return await this.ollamaComplete({ messages, model: targetModel, temperature, max_tokens, response_format });
            }

            // Default: Groq
            return await groq.chat.completions.create({
                messages,
                model: targetModel || "llama-3.3-70b-versatile",
                temperature,
                max_tokens,
                response_format
            });
        } catch (err: any) {
            console.error(`[AI Error] Provider: ${this.provider}, Model: ${model || 'default'}`);
            console.error(`[AI ERROR MESSAGE]: ${err.message}`);
            if (err.response) {
                console.error(`[AI ERROR DETAIL]:`, err.response.data || err.response);
            }
            throw err;
        }
    },

    async kimiComplete({ messages, model, temperature, max_tokens, response_format }: CompletionOptions) {
        let kimiModel = model;
        if (model?.includes("llama") || model?.includes("mixtral")) {
            kimiModel = "moonshot-v1-128k";
        }

        const response = await fetch(`${process.env.KIMI_BASE_URL || "https://api.moonshot.cn/v1"}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.KIMI_API_KEY}`
            },
            body: JSON.stringify({
                model: kimiModel,
                messages,
                temperature,
                max_tokens,
                response_format
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData: any;
            try { errorData = JSON.parse(errorText); } catch (e) { }
            throw new Error(`Kimi Error: ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            choices: [{
                message: {
                    content: data.choices[0].message.content
                }
            }]
        };
    },

    async geminiComplete({ messages, model, temperature, max_tokens, response_format }: CompletionOptions) {
        const apiKey = process.env.GEMINI_API_KEY;
        const geminiModel = (model && model.includes("gemini")) ? model : "gemini-2.0-flash-exp";

        const contents = messages.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }));

        const thinkingInstruction = `
        You are a highly advanced AI with real-time reasoning capabilities.
        
        FORMATTING RULE:
        You MUST start every response with a "Thought Process" block to verify your facts, especially for current events.
        
        Example Format:
        **Thought Process:**
        1. Analyze user query: "Who is the US President?"
        2. Check current date: ${new Date().toLocaleDateString()}
        3. Retrieve/Verify real-time info: Elections happened in 2024... Inauguration 2025...
        4. Conclusion: Donald Trump is president.
        
        **Answer:**
        The current President...
        `;

        let systemInstruction = { parts: [{ text: thinkingInstruction }] };
        if (messages[0]?.role === "system") {
            systemInstruction = { parts: [{ text: messages[0].content + "\n\n" + thinkingInstruction }] };
            contents.shift();
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents,
                systemInstruction,
                tools: [{ google_search: {} }], // Enable Google Search Grounding
                generationConfig: {
                    temperature,
                    maxOutputTokens: max_tokens,
                    responseMimeType: response_format?.type === "json_object" ? "application/json" : "text/plain"
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini Error: ${errorText}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        return {
            choices: [{
                message: {
                    content: content || "Error: Gemini returned no content."
                }
            }]
        };
    },

    // Fallback System: Groq -> Gemini -> Ollama
    async completeWithFallback(options: CompletionOptions & { forcedProvider?: string }) {
        const { messages, model, temperature, max_tokens, response_format, forcedProvider } = options;
        
        // If a specific provider is forced (e.g. from frontend switcher), try mostly that one
        const chain = forcedProvider && forcedProvider !== 'auto'
            ? [forcedProvider, ...['groq', 'gemini', 'ollama'].filter(p => p !== forcedProvider)]
            : ['groq', 'gemini', 'ollama'];

        console.log(`[AI Fallback] Starting chain: ${chain.join(' -> ')}`);

        let lastError: any = null;

        for (const providerName of chain) {
            try {
                console.log(`[AI Fallback] Attempting provider: ${providerName}`);
                this.provider = providerName as any; // Switch internal state

                if (providerName === 'groq') {
                     return await groq.chat.completions.create({
                        messages,
                        model: model || "llama-3.3-70b-versatile",
                        temperature,
                        max_tokens,
                        response_format
                    });
                }

                if (providerName === 'gemini') {
                     if (!process.env.GEMINI_API_KEY) {
                        console.log(`[AI Fallback] Skipping Gemini - no API key configured`);
                        continue;
                    }
                    return await this.geminiComplete({ 
                        messages, 
                        model: model || "gemini-2.0-flash-exp", 
                        temperature, 
                        max_tokens, 
                        response_format 
                    });
                }

                if (providerName === 'ollama') {
                    // Check if Ollama is available
                    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
                    try {
                        const healthCheck = await fetch(`${ollamaUrl}/api/tags`, { 
                            method: 'GET',
                            signal: AbortSignal.timeout(2000) // 2 second timeout
                        });
                        
                        if (!healthCheck.ok) {
                            console.log(`[AI Fallback] Skipping Ollama - service not responding`);
                            continue;
                        }

                        return await this.ollamaComplete({
                            messages,
                            model: model || "llama3.2:1b",
                            temperature,
                            max_tokens,
                            response_format
                        });
                    } catch (ollamaError) {
                        console.log(`[AI Fallback] Skipping Ollama - not available locally`);
                        continue;
                    }
                }
                
                // If we get here for 'kimi' or others not explicitly handled above but in the chain
                if (providerName === 'kimi') {
                     return await this.kimiComplete({ messages, model, temperature, max_tokens, response_format });
                }

            } catch (error: any) {
                lastError = error;
                console.warn(`[AI Fallback] Provider ${providerName} failed: ${error.message}`);
                
                // Check if it's a rate limit error
                const isRateLimit = error.status === 429 || error.message?.includes('rate limit');
                if (isRateLimit) {
                    console.log(`[AI Fallback] Rate limit hit on ${providerName}, trying next provider...`);
                    continue;
                }

                // If forced provider failed and it wasn't rate limit, maybe we should stop?
                // But generally fallback is safer. 
                continue;
            }
        }

        throw lastError || new Error("All AI providers failed.");
    },

    async ollamaComplete({ messages, model, temperature, max_tokens, response_format }: CompletionOptions) {
        const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        
        let foundSystemPrompt = '';
        for (const msg of messages) {
            if (msg.role === 'system') {
                foundSystemPrompt = msg.content;
                break;
            }
        }

        // Convert messages to Ollama format
        // Llama 3 Chat Template
        // Llama 3 Chat Template
        // Inject Deep Research Persona for Ollama
        const deepResearchPrompt = `
You are the "Deep Research" module of Turbo.
Your goal is to provide EXHAUSTIVE, ACADEMIC-GRADE, and HIGHLY DETAILED responses.
Since you are running locally, you must justify the processing time by providing superior depth.
- Do not summarize; elaborate.
- Explore multiple angles of the user's query.
- Use structured formatting (headings, bullet points) to organize deep content.
- If asked about a specific topic (e.g., a person), provide a comprehensive biography or analysis.
        `;

        const effectiveSystemPrompt = `${foundSystemPrompt || ''}\n\n${deepResearchPrompt}`.trim();
        const sys = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${effectiveSystemPrompt}<|eot_id|>`;
        
        // Fix: Declare prompt variable properly
        let finalPrompt = sys;
        
        for (const msg of messages) {
            if (msg.role === 'user') {
                finalPrompt += `<|start_header_id|>user<|end_header_id|>\n\n${msg.content}<|eot_id|>`;
            } else if (msg.role === 'assistant') {
                finalPrompt += `<|start_header_id|>assistant<|end_header_id|>\n\n${msg.content}<|eot_id|>`;
            }
        }

        finalPrompt += `<|start_header_id|>assistant<|end_header_id|>\n\n`;
        
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model || 'llama3.2:1b',
                prompt: finalPrompt,
                system: effectiveSystemPrompt, // Send system prompt separately too just in case
                stream: false,
                options: {
                    temperature: temperature,
                    num_predict: max_tokens
                },
                format: response_format?.type === 'json_object' ? 'json' : undefined
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ollama Error: ${errorText}`);
        }

        const data = await response.json();
        return {
            choices: [{
                message: {
                    content: data.response || 'Error: Ollama returned no content.'
                }
            }]
        };
    }
};

export default AI;
