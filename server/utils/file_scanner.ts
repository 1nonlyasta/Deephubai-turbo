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
        let text = "";

        if (typeof pdfLib === 'function') {
            const data = await pdfLib(dataBuffer);
            text = data.text || "";
        } else if (pdfLib?.PDFParse) {
            const parser = new pdfLib.PDFParse({ data: dataBuffer });
            text = await (parser as any).getText();
            await (parser as any).destroy();
        }

        if (typeof text !== 'string') {
            text = String(text || "");
        }

        if (text.trim().length < 50) {
            console.log(`[INFO] Document ${path.basename(filePath)} has minimal text (possible scan).`);
        }

        return text;
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
