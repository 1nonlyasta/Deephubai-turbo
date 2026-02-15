import express from "express";
import fs from "fs";
import path from "path";
import AI from "../config/ai_config.ts";
import { processDocument } from "../utils/file_scanner.ts";
import { qpUpload, memoryUpload } from "../middleware/upload.ts";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfLib = require("pdf-parse");
import Tesseract from 'tesseract.js';

const parsePdfBuffer = async (buffer: Buffer) => {
    // Check if pdfLib is the function itself or contains .default
    const parser = typeof pdfLib === 'function' ? pdfLib : pdfLib.default;
    
    if (typeof parser === 'function') {
        const result = await parser(buffer);
        return result.text || result; // Handle if it returns object with text
    }
    
    // Fallback for older patterns
    if (pdfLib?.PDFParse) {
        const customParser = new pdfLib.PDFParse({ data: buffer });
        // Some versions of PDFParse class might behave differently
        // Based on debug script, we need to be careful
        if (customParser.getText) {
             const result = await customParser.getText();
             return result.text || result;
        }
    }
    throw new Error(`Compatible pdf-parse export not found. Type: ${typeof pdfLib}`);
};

const router = express.Router();

/* ==================== QUESTION PAPER GENERATOR ==================== */
router.post(
    "/question-paper/generate",
    qpUpload.fields([
        { name: "syllabus", maxCount: 1 },
        { name: "materials", maxCount: 10 }
    ]),
    async (req: any, res) => {
        try {
            const { sections, examTime, difficulty, topics, syllabusText: providedText, materialText: providedMaterialText } = req.body;

            let syllabusText = "";
            if (providedText) {
                syllabusText = providedText;
            } else if (req.files?.syllabus) {
                syllabusText = await processDocument(req.files.syllabus[0]);
            } else {
                return res.status(400).json({ error: "Syllabus file OR extracted text is required" });
            }

            let materialsText = "";
            if (providedMaterialText) {
                materialsText = providedMaterialText;
            } else if (req.files.materials) {
                for (const material of req.files.materials) {
                    const text = await processDocument(material);
                    materialsText += `\n\n--- ${material.originalname} ---\n${text}`;
                }
            }

            const parsedSections = JSON.parse(sections);

            // Build comprehensive prompt with all user content
            const sectionsDesc = parsedSections.map((s: any) => 
                `- **${s.name}**: ${s.questions} questions × ${s.marks} marks each`
            ).join('\n');

            const totalMarks = parsedSections.reduce((sum: number, s: any) => sum + (s.questions * s.marks), 0);

            const systemPrompt = `You are an expert CBSE question paper generator. Generate a structured JSON question paper.

**CRITICAL: OUTPUT VALID JSON ONLY.**

**JSON RULES:**
1. Use double backslashes for LaTeX: e.g., "$\\\\frac{1}{2}$", "$\\\\alpha$" (One backslash for JSON string escaping, one for LaTeX)
2. No trailing commas.
3. No markdown fencing (no \`\`\`json).

**JSON STRUCTURE:**
{
  "sections": [
    {
      "name": "Section A",
      "description": "Section A consists of 20 questions of 1 mark each.",
      "questions": [
        {
          "qNo": 1,
          "text": "Question text with LaTeX: $x^2 + 4x + 4 = 0$",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "marks": 1
        }
      ]
    }
  ]
}

**RULES:**
1. Use ONLY study materials provided.
2. For MCQs: Include 4 options in array.
3. For descriptive: Set options to empty array [].
4. Strict LaTeX formatting using $.
5. Difficulty: ${difficulty}

**SECTIONS:**
${sectionsDesc}

**MATERIALS:**
${materialsText.substring(0, 20000)}`;

            const userPrompt = `Generate the question paper as VALID JSON.`;

            const completion = await AI.complete({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.1, // Lower temperature for more deterministic JSON
            });

            let paperContent = completion.choices[0].message.content;
            
            // Clean content to ensure valid JSON
            paperContent = paperContent.replace(/```json/g, '').replace(/```/g, '').trim();

            // Try to find the JSON object if there's intro text
            const firstBracket = paperContent.indexOf('{');
            const lastBracket = paperContent.lastIndexOf('}');
            if (firstBracket !== -1 && lastBracket !== -1) {
                paperContent = paperContent.substring(firstBracket, lastBracket + 1);
            }

            try {
                // Parse JSON to verify it's valid
                const jsonData = JSON.parse(paperContent);
                
                if (!jsonData.sections || !Array.isArray(jsonData.sections)) {
                    throw new Error('Invalid structure');
                }
                
                res.json({ success: true, questionPaper: JSON.stringify(jsonData, null, 2), isJSON: true });
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.log('Failed Content:', paperContent.substring(0, 200)); // Log start of content for debugging
                
                // Final fallback: just return the raw text if parsing fails, better than crashing
                res.json({ 
                    success: true, 
                    questionPaper: paperContent, 
                    isJSON: false 
                });
            }
        } catch (error) {
            console.error("GENERATION ERROR:", error);
            res.status(500).json({ error: "Failed to generate question paper" });
        } finally {
            if (req.files?.syllabus) fs.unlink(req.files.syllabus[0].path, () => { });
            if (req.files?.materials) req.files.materials.forEach((file: any) => fs.unlink(file.path, () => { }));
        }
    }
);

// Alias route to match frontend expectations - accepts FormData with files
router.post(
    "/generate-questions",
    qpUpload.fields([
        { name: "syllabus", maxCount: 1 },
        { name: "materials", maxCount: 10 }
    ]),
    async (req: any, res) => {
        try {
            const { sections, examTime, difficulty, topics } = req.body;

            if (!sections) {
                return res.status(400).json({ error: "sections is required" });
            }

            // Extract text from syllabus
            let syllabusText = "";
            if (req.files?.syllabus && req.files.syllabus[0]) {
                syllabusText = await processDocument(req.files.syllabus[0]);
                console.log(`[QuestionGen] Extracted ${syllabusText.length} characters from syllabus PDF`);
            }

            // PRIORITY: If snippets are provided, use them as the PRIMARY source and ignore full PDF text
            // The user explicitly requested: "if a user snips a content... only that snipped content should be used"
            if (req.body.snippets) {
                try {
                    const snippets = JSON.parse(req.body.snippets);
                    // Check if snippets array has items
                    if (Array.isArray(snippets) && snippets.length > 0) {
                        console.log(`[QuestionGen] Snippets detected. Processing ${snippets.length} snippets with OCR...`);
                        
                        let snippetText = "";
                        
                        // Process snippets in parallel
                        const ocrPromises = snippets.map(async (snippet: any, index: number) => {
                            try {
                                // Tesseract.recognize accepts base64 data URLs directly
                                const { data: { text } } = await Tesseract.recognize(snippet.image, 'eng');
                                return `\n[Snippet ${index + 1}]\n${text}`;
                            } catch (ocrErr) {
                                console.error(`OCR failed for snippet ${index}:`, ocrErr);
                                return "";
                            }
                        });

                        const ocrResults = await Promise.all(ocrPromises);
                        snippetText = ocrResults.join('\n');
                        
                        if (snippetText.trim().length > 10) {
                            console.log(`[QuestionGen] OCR successful. Extracted ${snippetText.length} chars from snippets.`);
                            console.log('[QuestionGen] OVERRIDING syllabus text with snippet content as per user request.');
                            syllabusText = "=== CONTENT FROM USER SNIPPETS ===\n" + snippetText;
                        } else {
                             console.warn('[QuestionGen] Snippets were provided but OCR extracted minimal text. Falling back to PDF text if available.');
                        }
                    }
                } catch (jsonErr) {
                    console.error('[QuestionGen] Failed to parse snippets JSON:', jsonErr);
                }
            }

            // Extract text from materials
            let materialsText = "";
            if (req.files?.materials) {
                for (const material of req.files.materials) {
                    const text = await processDocument(material);
                    materialsText += `\n\n--- ${material.originalname} ---\n${text}`;
                }
                console.log(`[QuestionGen] Extracted ${materialsText.length} characters from study materials`);
            }

            if (!syllabusText || syllabusText.trim().length < 20) {
                console.error('[QuestionGen] PDF text extraction failed - likely a scanned/image-based PDF');
                
                let errorMessage = "Could not extract text from the syllabus PDF.\n\n" +
                                   "This appears to be a scanned document. Please use the 'Snip Content' tool (Scissors icon) " +
                                   "to select the syllabus areas manually.";

                if (req.body.targetChapter) {
                    errorMessage = `Cannot search for chapter "${req.body.targetChapter}" because the uploaded PDF is scanned/image-based.\n\n` +
                                   "Please use the 'Snip Content' tool (Scissors icon) to manually capture the relevant pages for this chapter.";
                }

                return res.status(400).json({ error: errorMessage });
            }

            // DYNAMIC CHAPTER EXTRACTION
            // If the user specified a target chapter, we filter the syllabus text to only include relevant content.
            const targetChapter = req.body.targetChapter;
            if (targetChapter && targetChapter.trim().length > 0) {
                console.log(`[QuestionGen] Target chapter specified: "${targetChapter}". Extracting relevant content...`);
                
                try {
                    const extractionPrompt = `You are an expert curriculum analyzer. 
                    The user wants to generate questions ONLY for the chapter/topic: "${targetChapter}".
                    
                    Below is the full syllabus text. 
                    Extract EVERYTHING related to "${targetChapter}" (definitions, formulas, sub-topics, examples).
                    Ignore all other chapters.
                    
                    If the chapter is NOT found, return: "CHAPTER_NOT_FOUND".
                    
                    FULL SYLLABUS:
                    ${syllabusText.substring(0, 15000)}` // Limit to 15k chars to fit context if needed

                    const extractionCompletion = await AI.complete({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            { role: "system", content: "You are a precise curriculum extractor." },
                            { role: "user", content: extractionPrompt }
                        ],
                        temperature: 0.0,
                    });

                    const extractedContent = extractionCompletion.choices[0].message.content.trim();

                    if (extractedContent.includes("CHAPTER_NOT_FOUND")) {
                         console.warn(`[QuestionGen] Warning: Target chapter "${targetChapter}" not found in syllabus.`);
                         // Fallback: Proceed with full syllabus but warn? Or just proceed.
                         // For now, we'll append a clearer instruction to the final prompt.
                    } else {
                        console.log(`[QuestionGen] Successfully extracted ${extractedContent.length} chars for chapter "${targetChapter}".`);
                        syllabusText = `=== FOCUS CHAPTER: ${targetChapter} ===\n\n${extractedContent}`;
                    }
                } catch (extractErr) {
                    console.error('[QuestionGen] Chapter extraction failed:', extractErr);
                    // Fallback to full syllabus
                }
            }

            const parsedSections = JSON.parse(sections);

            const sectionsDesc = parsedSections.map((s: any) => 
                `- **${s.name}**: ${s.questions} questions × ${s.marks} marks each`
            ).join('\n');

            const systemPrompt = `You are an expert CBSE question paper generator. Generate a structured JSON question paper.

**CRITICAL: OUTPUT VALID JSON ONLY.**

**JSON RULES:**
1. Use double backslashes for LaTeX: e.g., "$\\\\frac{1}{2}$", "$\\\\alpha$"
2. No trailing commas.
3. No markdown fencing (no \`\`\`json).

**JSON STRUCTURE:**
{
  "sections": [
    {
      "name": "Section A",
      "description": "Section A consists of 20 questions of 1 mark each.",
      "questions": [
        {
          "qNo": 1,
          "text": "Question text with LaTeX: $x^2 + 4x + 4 = 0$",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "marks": 1
        }
      ]
    }
  ]
}

**RULES:**
1. Use ONLY study materials provided.
2. For MCQs: Include 4 options in array.
3. For descriptive: Set options to empty array [].
4. Strict LaTeX formatting using $.
5. Difficulty: ${difficulty}

**SECTIONS:**
${sectionsDesc}

**SYLLABUS:**
${syllabusText.substring(0, 10000)}

**STUDY MATERIALS:**
${materialsText ? materialsText.substring(0, 10000) : 'No additional materials provided.'}`;

            const userPrompt = `Generate the question paper as VALID JSON.`;

            console.log('[QuestionGen] Starting generation with Groq...');

            const completion = await AI.complete({
                forcedProvider: 'groq',
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.1,
            });

            let paperContent = completion.choices[0].message.content;
            
            paperContent = paperContent.replace(/```json/g, '').replace(/```/g, '').trim();

            const firstBracket = paperContent.indexOf('{');
            const lastBracket = paperContent.lastIndexOf('}');
            if (firstBracket !== -1 && lastBracket !== -1) {
                paperContent = paperContent.substring(firstBracket, lastBracket + 1);
            }

            try {
                const jsonData = JSON.parse(paperContent);
                
                if (!jsonData.sections || !Array.isArray(jsonData.sections)) {
                    throw new Error('Invalid structure');
                }
                
                console.log('[QuestionGen] Successfully generated paper with', jsonData.sections.length, 'sections');
                res.json({ success: true, questionPaper: JSON.stringify(jsonData, null, 2), isJSON: true });
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.log('Failed Content:', paperContent.substring(0, 200));
                
                res.json({ 
                    success: true, 
                    questionPaper: paperContent, 
                    isJSON: false 
                });
            }
        } catch (error: any) {
            console.error("GENERATION ERROR:", error);
            res.status(500).json({ error: error.message || "Failed to generate question paper" });
        } finally {
            // Cleanup uploaded files
            if (req.files?.syllabus) {
                req.files.syllabus.forEach((file: any) => fs.unlink(file.path, () => {}));
            }
            if (req.files?.materials) {
                req.files.materials.forEach((file: any) => fs.unlink(file.path, () => {}));
            }
        }
    }
);

/* ==================== ANALYZE DOCUMENTS ==================== */
router.post(
    "/analyze-documents",
    qpUpload.fields([{ name: "syllabus", maxCount: 1 }, { name: "materials", maxCount: 10 }]),
    async (req: any, res) => {
        try {
            if (!req.files?.syllabus) return res.status(400).json({ error: "Syllabus file is required" });
            const syllabusText = await processDocument(req.files.syllabus[0]);
            let materialsText = "";
            if (req.files.materials) {
                for (const material of req.files.materials) {
                    const text = await processDocument(material);
                    materialsText += `\n\n--- ${material.originalname} ---\n${text}`;
                }
            }

            if (!syllabusText || syllabusText.length < 50) {
                return res.json({ score: 10, confidence: "low", feedback: "Auto-reading failed." });
            }

            const completion = await AI.complete({
                model: "llama-3.1-8b-instant",
                messages: [
                    { 
                        role: "system", 
                        content: `You are an AI document quality analyzer for an educational platform. 
                        Analyze the provided syllabus text and return a JSON object with:
                        - "score": A number between 0-100 indicating document clarity and usability.
                        - "feedback": A brief string explanation.

                        SCORING RULES:
                        - If text is gibberish, very short (<100 chars), or looks like bad OCR -> Score < 50.
                        - If text has some errors but is readable -> Score 50-75.
                        - If text is clear, structured, and comprehensive -> Score 80-100.
                        
                        OUTPUT STRICT JSON ONLY.` 
                    },
                    { role: "user", content: `Analyze this content: ${syllabusText.substring(0, 5000)}` }
                ] as any,
                temperature: 0.1,
                response_format: { type: "json_object" }
            });
            res.json(JSON.parse(completion.choices[0].message.content));
        } catch (error) {
            res.status(500).json({ error: "Analysis failed" });
        } finally {
            if (req.files?.syllabus) fs.unlink(req.files.syllabus[0].path, () => { });
            if (req.files?.materials) req.files.materials.forEach((file: any) => fs.unlink(file.path, () => { }));
        }
    }
);

/* ==================== HOMEWORK GENERATOR ==================== */
router.post("/homework/generate", async (req, res) => {
    try {
        const { lessonSummary } = req.body;
        if (!lessonSummary) return res.status(400).json({ error: "Lesson summary is required" });

        const completion = await AI.complete({
            model: "llama-3.3-70b-versatile",
            messages: [
                { 
                    role: "system", 
                    content: `You are a professional academic worksheet generator.
                    Your goal is to create a "Ready-to-Print" homework assignment for students.
                    
                    CRITICAL INSTRUCTIONS:
                    1. **Student-Facing Only**: Do NOT include any advice for teachers, "Key Concepts", "Recap", or "Possible Questions". 
                    2. **Direct Content**: Start directly with "Section A". No intro text like "Here is your homework".
                    3. **Formatting**:
                       - Use Markdown.
                       - Use clear Section Headers (e.g., ## Section A: Multiple Choice).
                       - Number questions clearly (1., 2., 3.).
                       - Number questions clearly (1., 2., 3.).
                       - **DO NOT** leave space for answers. Provide the questions ONLY. (e.g. no "Answer: ______").
                       - **DO NOT** include any "Notes" or instructions about space (e.g. "Note: Leave space for...").
                       - **Math Rules**: Use LaTeX for all math. Enclose in "$" (inline) or "$$" (block). 
                       - **IMPORTANT**: Use DOUBLE BACKSLASHES for all LaTeX commands (e.g., $\\frac{1}{2}$, $\\alpha$, $\\Delta$) to ensure they render correctly.
                    4. **Structure**:
                       - Section A: Multiple Choice (5 questions)
                       - Section B: Short Answer (3 questions)
                       - Section C: Critical Thinking / Long Answer (1 question)
                    
                    Output ONLY the worksheet content.` 
                }, 
                { role: "user", content: `Create a ${req.body.difficulty || "medium"} difficulty homework assignment on: ${lessonSummary}` }
            ] as any,
            temperature: 0.4,
        });
        res.json({ success: true, content: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate homework" });
    }
});

/* ==================== LESSON PLAN BUILDER ==================== */
router.post("/lesson-plan/generate", async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) return res.status(400).json({ error: "Topic is required" });

        const completion = await AI.complete({
            model: "llama-3.3-70b-versatile",
            messages: [
                { 
                    role: "system", 
                    content: `You are an elite pedagogical architect. Create a structured lesson plan in JSON format.
                    
                    REQUIRED JSON STRUCTURE:
                    {
                        "title": "Lesson Title",
                        "content": "Full lesson plan in Markdown format. Use headers, bullet points, and clear sections."
                    }
                    
                    **LATEX RULES**:
                    - Use LaTeX for all math. Enclose in "$" (inline) or "$$" (block).
                    - **IMPORTANT**: Use DOUBLE BACKSLASHES for all LaTeX commands (e.g., $\\frac{1}{2}$, $\\alpha$, $\\Delta$) to ensure they render correctly in JSON.
                    
                    Ensure the 'content' field contains the ENTIRE lesson plan formatted with nice Markdown.` 
                }, 
                { role: "user", content: topic }
            ] as any,
            temperature: 0.3,
            response_format: { type: "json_object" }
        });
        const result = JSON.parse(completion.choices[0].message.content);
        res.json({ success: true, title: result.title, content: result.content });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate lesson plan" });
    }
});

/* ==================== PPT GENERATOR ==================== */
router.post("/ppt/generate", async (req, res) => {
    try {
        const { topic, slideCount, grade, subject, board } = req.body;
        if (!topic) return res.status(400).json({ error: "Topic is required" });

        const completion = await AI.complete({
            model: "llama-3.3-70b-versatile",
            messages: [
                { 
                    role: "system", 
                    content: `You are a World-Class Pedagogical Architect and Textbook Author.
                    Your goal is to create a "Textbook Replacement" presentation.
                    
                    CRITICAL INSTRUCTIONS:
                    1. **Deep Content**: Each slide must be rich, detailed, and comprehensive. No short bullets. Use full sentences.
                    2. **Visual Structure**: You MUST include at least one 'table' slide and one 'comparison' slide.
                    3. **Exact Length**: Generate EXACTLY ${slideCount} slides.
                    4. **Math Rules**: Use LaTeX for all math. Enclose in "$" (inline) or "$$" (block). 
                    5. **IMPORTANT**: Use DOUBLE BACKSLASHES for all LaTeX commands (e.g., $\\frac{1}{2}$, $\\alpha$, $\\Delta$) to ensure they render correctly in JSON.
                    
                    Output MUST be a valid JSON object with a 'slides' array.
                    
                    Schema:
                    {
                      "slides": [
                        {
                          "type": "title" | "content" | "table" | "comparison",
                          "title": "Slide Title",
                          "content": "Detailed paragraph explaining the concept in depth...",
                          "bullets": ["Detailed point 1", "Detailed point 2"],
                          "tableData": {
                            "headers": ["Col 1", "Col 2"],
                            "rows": [["Cell 1", "Cell 2"], ["Cell 3", "Cell 4"]]
                          },
                          "comparisonData": {
                            "leftTitle": "Concept A",
                            "rightTitle": "Concept B",
                            "pairs": [["Feature 1 A", "Feature 1 B"], ["Feature 2 A", "Feature 2 B"]]
                          },
                          "speakerNotes": "Reading script for the teacher..."
                        }
                      ]
                    }`
                }, 
                { role: "user", content: `Topic: ${topic}\nGrade: ${grade}\nSubject: ${subject}\nBoard: ${board}\nSlide Count: ${slideCount}` }
            ] as any,
            temperature: 0.3,
            response_format: { type: "json_object" }
        });
        const result = JSON.parse(completion.choices[0].message.content);
        res.json({ success: true, slides: (result as any).slides || [] });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate PPT content" });
    }
});

/* ==================== PAPER SOLVER ==================== */
router.post('/solve-paper', memoryUpload.single('paper'), async (req: any, res) => {
    try {
        let paperText = req.body.paperText;
        if (req.file && req.file.mimetype === 'application/pdf') {
            paperText = await parsePdfBuffer(req.file.buffer);
        }
        
        console.log("Paper Text received:", paperText ? paperText.substring(0, 100) : "NULL/UNDEFINED");

        if (!paperText || typeof paperText !== 'string' || paperText.trim().length === 0) {
             return res.status(400).json({ error: "No valid paper content provided (text/pdf)" });
        }

        // Chunking Strategy: Split text into ~6k char chunks to fit context/output limits
        // 38 questions can be large. 
        const CHUNK_SIZE = 6000; 
        const chunks = [];
        for (let i = 0; i < paperText.length; i += CHUNK_SIZE) {
            chunks.push(paperText.substring(i, Math.min(i + CHUNK_SIZE, paperText.length)));
        }

        console.log(`Splitting paper into ${chunks.length} chunks for processing...`);

        const allSolutions = [];
        const preferredProvider = req.body.preferredProvider || 'auto';
        console.log(`[PaperSolver] Processing with preferred provider: ${preferredProvider}`);
        
        // Process chunks sequentially to respect rate limits and order
        for (const [index, chunk] of chunks.entries()) {
            try {
                const completion = await AI.completeWithFallback({
                    forcedProvider: preferredProvider === 'auto' ? undefined : preferredProvider,
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are a precise academic solver. Output strictly a JSON object with a 'solutions' array. Each item must have: 'question_no' (number), 'question' (string), 'answer' (string), and 'explanation' (string). \n\nIMPORTANT INSTRUCTIONS:\n1. Solve ALL questions found in this segment. Do not skip any.\n2. Use LaTeX math mode with '$' delimiters for all mathematical expressions (e.g., $x^2$).\n3. **IMPORTANT**: Use DOUBLE BACKSLASHES for all LaTeX commands (e.g., $\\frac{1}{2}$, $\\alpha$, $\\Delta$) to ensure they do not break the JSON format.\n4. If a question is cut off at the start/end, solve what is complete or ignore strictly partial fragments.\n5. No conversational filler." },
                        { role: "user", content: `Segment ${index + 1}/${chunks.length} of Paper:\n${chunk}` }
                    ] as any,
                    temperature: 0.1,
                    max_tokens: 8000, 
                    response_format: { type: "json_object" }
                });
                
                const content = completion.choices[0].message.content;
                const chunkSolutions = JSON.parse(content).solutions || [];
                allSolutions.push(...chunkSolutions);
                
            } catch (chunkError) {
                console.error(`Error processing chunk ${index + 1}:`, chunkError);
                // Continue to next chunk instead of failing entirely
            }
        }

        // Re-index questions to ensure sequential numbering
        const reindexedSolutions = allSolutions.map((sol, idx) => ({
            ...sol,
            question_no: idx + 1
        }));

        res.json({ success: true, solutions: reindexedSolutions });
    } catch (error) {
        console.error("Critical Paper Solver Error:", error);
        res.status(500).json({ error: "Failed to solve the paper" });
    }
});

/* ==================== REPORT CARD ASSISTANT ==================== */
router.post('/analyze-report', memoryUpload.single('report'), async (req: any, res) => {
    try {
        let reportText = req.body.reportText;
        if (req.file && req.file.mimetype === 'application/pdf') {
            reportText = await parsePdfBuffer(req.file.buffer);
            
            const completion = await AI.complete({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { 
                        role: "system", 
                        content: `You are a Senior Academic Counselor & Admissions Officer. Analyze this student report card/mark sheet and output strictly JSON.

                        **NAME EXTRACTION RULES (CRITICAL):**
                        1. Look for phrases like "**This is to certify that [NAME]**", "**Candidate Name:**", "**Name of Student:**", or "**Student Name:**".
                        2. **DO NOT** use Mother's Name, Father's Name, or Guardian's Name as the Student Name.
                        3. If multiple names appear, prioritize the one near "Certify that" or "Candidate".
                        4. If the name is in ALL CAPS near the top, it is likely the student.

                        **JSON OUTPUT STRUCTURE:**
                        ... (same as before) ...
                        ` 
                    }, 
                    { role: "user", content: reportText }
                ] as any,
                temperature: 0.1, // Lower temp for precision
                response_format: { type: "json_object" }
            });
            res.json({ success: true, analysis: JSON.parse(completion.choices[0].message.content) });
        } else {
             let visionContent = [];
             if (req.file && req.file.mimetype.startsWith('image/')) {
                 const base64Image = req.file.buffer.toString('base64');
                 visionContent = [
                     { type: "text", text: "Analyze this student report card image. Extract Name, Grade, Scores. Output strictly JSON." },
                     { type: "image_url", image_url: { url: `data:${req.file.mimetype};base64,${base64Image}` } }
                 ];
             } else {
                 visionContent = [{ type: "text", text: reportText || "No content." }];
             }

             const completion = await AI.complete({
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: [
                    { 
                        role: "system", 
                        content: `You are a Senior Academic Counselor. Analyze the image/text and output strictly JSON.
                        
                        **NAME EXTRACTION RULES (CRITICAL):**
                        1. Look for phrases like "**This is to certify that [NAME]**", "**Candidate Name:**", "**Name of Student:**", or "**Student:**".
                        2. **DO NOT** use Mother's Name (Mothers Name), Father's Name, or Guardian's Name as the Student Name.
                        3. If multiple names appear, prioritize the one near "Certify that" or "Candidate".
                        4. If the name is in ALL CAPS near the top, it is likely the student.

                        **JSON OUTPUT STRUCTURE:**
                        {
                            "studentName": "Name",
                            "gradeClass": "Grade",
                            "overallPercentage": 85,
                            "performanceSummary": "Summary...",
                            "subjects": [{ "name": "Math", "marks": 90, "grade": "A1" }],
                            "collegeChances": { "topTier": 50, "averageTier": 90, "comment": "..." },
                            "careerSuggestions": [{ "role": "Engineer", "stream": "Science", "match": 80, "reason": "..." }],
                            "strengths": ["Math"],
                            "weaknesses": ["History"],
                            "recommendations": ["Study hard"]
                        }
                        
                        **IMPORTANT:**
                        1. If details are missing/blurred, INFER reasonable values based on visible grades.
                        2. If Name is missing, use "Student".
                        3. Calculate percentages if only grades are shown (A1=95, A2=85, etc).
                        4. Output VALID JSON ONLY.` 
                    }, 
                    { role: "user", content: visionContent }
                ] as any,
                temperature: 0.1,
                response_format: { type: "json_object" }
            });
            res.json({ success: true, analysis: JSON.parse(completion.choices[0].message.content) });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to analyze report card" });
    }
});

/* ==================== THE SECRETARY ==================== */
router.post('/secretary/generate', async (req, res) => {
    try {
        const { template, context, branding, studentName, issuerName, issuerDesignation, issuerEmail, receiverName, date, institutionName } = req.body;

        const templateDescriptions: Record<string, string> = {
            permission: "an official permission slip GRANTED BY the school authority (Principal/Teacher) allowing the student to participate in a specific activity, field trip, or event. This is NOT a request from the student — it is the school GRANTING permission.",
            certificate: "an official achievement certificate ISSUED BY the school/institution recognizing and celebrating a student's academic excellence, sports achievement, or other accomplishment",
            warning: "a formal disciplinary warning letter ISSUED BY the school administration/teacher to a student or their parent/guardian regarding behavioral or conduct issues, with clear expectations and consequences",
            notice: "an official event notice or circular ISSUED BY the school administration to students/parents/staff regarding an upcoming event, holiday, schedule change, or important announcement",
            recommendation: "an official letter of recommendation WRITTEN BY a teacher/principal on behalf of a student, endorsing and recommending the student for admission, scholarship, internship, or other opportunities based on their academic performance and character"
        };

        const docType = templateDescriptions[template] || "a formal school document";
        const brandingInfo = branding ? `\nInstitution Name: ${branding.name || institutionName || 'Not specified'}\nAddress: ${branding.address || ''}\nPhone: ${branding.phone || ''}\nEmail: ${branding.email || ''}` : (institutionName ? `\nInstitution Name: ${institutionName}` : '');

        const systemPrompt = `You are an expert academic document drafter writing on behalf of a school authority (Principal, Head of Department, or Teacher). Every document you produce is FROM the institution/authority TO or ABOUT a student.

PERSPECTIVE (CRITICAL — NEVER VIOLATE):
- CORRECT: "We hereby grant permission...", "I am pleased to recommend...", "This is to certify that...", "It has come to our attention..."
- WRONG: "I request permission...", "I am writing to apply...", "I kindly request..."
- You are the AUTHORITY issuing the document. The student is the SUBJECT, not the author.

OUTPUT FORMAT:
- Produce ONLY the document body text (salutation + body paragraphs).
- Do NOT include letterhead, date, reference number, signature block, or "Yours sincerely/faithfully" — the application renders those separately.
- Plain text only. No markdown, no bold, no bullet points, no asterisks.

LENGTH & TONE (CRITICAL):
- Write strictly **200–300 words**. The document MUST fit on a single A4 page.
- Focus on a professional, highly academic tone as seen in formal recommendation letters.
- Use precisely 2-3 detailed paragraphs.
- For recommendations: focus on specific qualities like scientific inquiry, analytical reasoning, and intellectual curiosity as requested in the example.`;

        const { refNumber, departmentName, documentSubject } = req.body;

        const userPrompt = `Draft ${docType}.

Subject: ${documentSubject || docType.toUpperCase()}
Reference Number: ${refNumber || 'N/A'}
Department: ${departmentName || 'N/A'}
Student Name: ${studentName || 'the student'}
Issued By (Authority): ${issuerName || 'The Principal'}${issuerDesignation ? `, ${issuerDesignation}` : ''}
${issuerEmail ? `Contact Email: ${issuerEmail}` : ''}
Addressed To: ${receiverName || 'To Whom It May Concern'}
Date: ${date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
${brandingInfo}

Teacher's Context/Instructions:
${context}

Write the complete document body now. Remember: Strictly 200-300 words, teacher perspective, formal letter format.`;

        const completion = await AI.complete({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ] as any,
            temperature: 0.6,
        });
        res.json({ success: true, content: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate document" });
    }
});

/* ==================== THE SHUFFLER ==================== */
router.post('/shuffler/version', async (req, res) => {
    try {
        const { masterQuiz } = req.body;
        const completion = await AI.complete({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a quiz shuffling expert. Output only JSON." },
                { role: "user", content: masterQuiz }
            ] as any,
            temperature: 0.1,
            response_format: { type: "json_object" }
        });
        const versions = JSON.parse(completion.choices[0].message.content);
        res.json({ success: true, versions });
    } catch (error) {
        res.status(500).json({ error: "Failed to shuffle quiz" });
    }
});

export default router;
