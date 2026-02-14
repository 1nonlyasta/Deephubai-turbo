import express from "express";
import fs from "fs";
import Tesseract from 'tesseract.js';
import AI from "../config/ai_config.ts";
import { upload } from "../middleware/upload.ts";

const router = express.Router();

const OCR_PROMPT = `You are a medical prescription OCR specialist. Extract ALL text from this prescription image with extreme accuracy.

INSTRUCTIONS:
1. Read every word, number, and symbol visible in the image
2. Preserve the exact formatting and structure
3. Include medicine names, dosages, frequencies, and doctor notes
4. If handwriting is unclear, provide your best interpretation with [?] for uncertain parts
5. Include patient name, date, and doctor details if visible

OUTPUT FORMAT:
Return ONLY the extracted text, preserving line breaks and structure exactly as written.
Do not add explanations or commentary - just the raw extracted text.`;

router.post("/medical/scan", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Image missing" });
    }

    try {
        const imageBuffer = fs.readFileSync(req.file.path);
        const base64Image = imageBuffer.toString("base64");
        const mimeType = req.file.mimetype || "image/jpeg";

        const completion = await AI.complete({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: OCR_PROMPT },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`,
                            },
                        },
                    ] as any,
                },
            ] as any,
            max_tokens: 2000,
            temperature: 0.1,
        });

        const extractedText = completion.choices[0].message.content;

        res.json({
            extractedText: extractedText,
            confidence: 95,
            model: "groq-vision",
        });
    } catch (err: any) {
        console.error("VISION OCR ERROR:", err);
        res.status(500).json({ error: "OCR_FAILED", details: err.message });
    } finally {
        if (req.file) {
            fs.unlink(req.file.path, () => { });
        }
    }
});

router.post("/process-snippets", upload.none(), async (req, res) => {
    try {
        const { snippets } = req.body;

        if (!snippets || !Array.isArray(snippets) || snippets.length === 0) {
            return res.status(400).json({ error: "No snippets provided" });
        }

        const results = [];
        for (let i = 0; i < snippets.length; i++) {
            try {
                const { data: { text } } = await Tesseract.recognize(snippets[i], 'eng');
                results.push(`\n[Syllabus Section ${i + 1}]\n${text.trim()}`);
            } catch (ocrErr: any) {
                console.error(`ERROR in Snippet ${i + 1}:`, ocrErr.message);
                results.push(`\n[Syllabus Section ${i + 1}]\n(OCR Failed for this selection: ${ocrErr.message})`);
            }
        }

        const finalResult = results.join('\n');
        res.json({ text: finalResult });
    } catch (err: any) {
        console.error("TESSERACT OCR ERROR:", err);
        res.status(500).json({ error: "OCR_FAILED", details: err.message });
    }
});

export default router;
