import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfLib = require("pdf-parse");

export interface FileItem {
    name: string;
    type: "file" | "dir";
    path: string;
    size?: number;
    lastModified?: Date;
    children?: FileItem[];
    code?: string;
}

export const scanDirectory = (dirPath: string, baseSrcPath: string): FileItem[] => {
    if (!fs.existsSync(dirPath)) return [];

    return fs.readdirSync(dirPath).map(item => {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        const relative = path
            .relative(baseSrcPath, fullPath)
            .replace(/\\/g, "/");

        if (stats.isDirectory()) {
            return {
                name: item,
                type: "dir",
                path: `src/${relative}`,
                children: scanDirectory(fullPath, baseSrcPath),
            };
        }

        return {
            name: item,
            type: "file",
            path: `src/${relative}`,
            size: stats.size,
            lastModified: stats.mtime,
            code: "// BINARY_DATA_LOCKED",
        };
    });
};

export const extractPDFContent = async (filePath: string): Promise<string> => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        
        // Try pdf-parse as primary method for Node environment (more robust for text extraction)
        try {
            // Use createRequire for pdf-parse as it might be CJS
            const pdfParse = require("pdf-parse");
            const data = await pdfParse(dataBuffer);
            
            if (data && data.text && data.text.trim().length > 50) {
                 console.log(`[INFO] Document ${path.basename(filePath)} extracted via pdf-parse. Length: ${data.text.length}`);
                 return data.text;
            } else {
                 console.log(`[WARN] pdf-parse returned minimal text (${data?.text?.length || 0} chars). Trying fallback...`);
            }
        } catch (pdfParseErr) {
            console.error("pdf-parse failed:", pdfParseErr);
        }

        // Fallback: Use pdfjs-dist if pdf-parse failed to extract enough text
        console.log(`[INFO] Attempting fallback extraction with pdfjs-dist for ${path.basename(filePath)}...`);
        try {
            const pdfjsLib = await import('pdfjs-dist');
            
            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(dataBuffer),
                useSystemFonts: true,
                disableFontFace: true
            });

            const pdf = await loadingTask.promise;
            let fullText = "";
            const maxPages = Math.min(pdf.numPages, 50);

            for (let i = 1; i <= maxPages; i++) {
                try {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + "\n";
                } catch (pageErr) {
                    console.error(`Page ${i} extraction failed:`, pageErr);
                }
            }
            
            if (fullText.trim().length > 50) {
                 console.log(`[INFO] Fallback extraction successful via pdfjs-dist. Length: ${fullText.length}`);
                 return fullText;
            }
        } catch (fallbackErr) {
            console.error("Fallback extraction failed:", fallbackErr);
        }

        // Only return empty if both failed
        return "";

    } catch (err) {
        console.error("Extraction error:", err);
        return "";
    }
};

export const processDocument = async (file: any): Promise<string> => {
    if (!file) return "";
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext === ".pdf") {
        return await extractPDFContent(file.path);
    } else if (ext === ".txt") {
        try {
            return fs.readFileSync(file.path, "utf-8");
        } catch (e) {
            console.error("Text read error:", e);
            return "";
        }
    } else {
        return `(Unsupported format: ${ext})`;
    }
};
