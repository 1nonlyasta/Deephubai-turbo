import express from "express";
import AI from "../config/ai_config.ts";
import { SYSTEM_PROMPTS } from "../config/prompts.js";
import { sanitizePrompt, isOwnerQuestion, getOwnerResponse } from "../utils/helpers.ts";

const router = express.Router();

router.post("/", async (req, res) => {
    const { message: providedMessage, messages = [], mode = "normal" } = req.body;

    const message = providedMessage || (messages.length > 0 ? messages[messages.length - 1].content : "");

    if (!message && (!messages || messages.length === 0)) {
        console.error("DEBUG: Chat API 400 - Missing content", req.body);
        return res.status(400).json({ error: "Message missing" });
    }

    if (isOwnerQuestion(message)) {
        return res.json({ response: getOwnerResponse(mode) });
    }

    const requestedProvider = (req.body as any).provider || AI.provider;
    // Ollama is for deep research/code, not real-time search (prevents timeouts)
    // Gemini has built-in search, Groq uses manual search
    const isSearchEnabled = (requestedProvider === 'gemini') || 
                           ((req.body as any).webSearch && requestedProvider !== 'ollama');

    const basePrompt = (SYSTEM_PROMPTS as any)[mode] || SYSTEM_PROMPTS.normal;
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let dynamicInstructions = "";

    if (isSearchEnabled) {
        // GEMINI/GROQ: Has Real-time Search
        dynamicInstructions = `
    Current Date: ${currentDate}
    
    CRITICAL INSTRUCTIONS:
    1. REAL-TIME SEARCH: You have access to Google Search. For ANY question about current events, people, or dynamic topics, you MUST use the search tool.
    2. IGNORE TRAINING DATA: If your training data conflicts with search results (e.g., President of US), TRUST THE SEARCH RESULTS.
    3. HIDDEN VERIFICATION: Internally verify facts against the 2026 date.
        `;
    } else {
        // OLLAMA or Search Disabled: Focus on Deep Analysis
        dynamicInstructions = `
    Current System Date: ${currentDate} (For Context Only)
    
    CRITICAL INSTRUCTIONS:
    1. DEEP RESEARCH MODE: You are optimized for exhaustive analysis, code generation, and technical depth.
    2. KNOWLEDGE CUTOFF: You do NOT have real-time internet access.
    3. HONESTY: If asked about events after your training data, state your knowledge cutoff clearly.
    4. STRENGTH: Focus on providing comprehensive technical explanations, architectural insights, and production-ready code.
        `;
    }

    const systemPrompt = `
    ${basePrompt}
    
    ${dynamicInstructions}

    GENERAL RULES:
    1. PERSISTENCE: Maintain context.
    2. TECHNICAL DEPTH: Provide production-ready code.
    3. FORMATTING: Use Markdown.
    4. PERSONALITY: You are Turbo. Be helpful and intelligent.
  `;

    try {
        let history = [];

        if (messages && messages.length > 0) {
            history = messages.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: sanitizePrompt(msg.content)
            }));
        } else {
            history = [{ role: "user", content: sanitizePrompt(message) }];
        }

        const completion = await AI.complete({
            forcedProvider: (req.body as any).provider === 'auto' ? undefined : (req.body as any).provider,
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                ...history
            ] as any,
            temperature: 0.7,
            max_tokens: 4096,
            webSearch: (req.body as any).webSearch
        });

        res.json({
            response: completion.choices[0].message.content,
        });
    } catch (err: any) {
        console.error("CHAT API ERROR:", err.message);
        res.status(500).json({
            error: "AI_OFFLINE",
            details: err.message,
            provider: AI.provider
        });
    }
});

export default router;
