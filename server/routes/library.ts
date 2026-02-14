import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LIBRARY_FILE = path.resolve(__dirname, "../../library.json");

const ensureLibrary = () => {
    if (!fs.existsSync(LIBRARY_FILE)) {
        fs.writeFileSync(LIBRARY_FILE, JSON.stringify([]));
    }
};

router.post("/save", (req, res) => {
    try {
        ensureLibrary();
        const { type, title, content, metadata } = req.body;
        const library = JSON.parse(fs.readFileSync(LIBRARY_FILE, "utf-8"));

        const newItem = {
            id: Date.now().toString(),
            type,
            title: title || 'Untitled',
            content,
            metadata: metadata || {},
            timestamp: new Date().toISOString()
        };

        library.unshift(newItem);
        fs.writeFileSync(LIBRARY_FILE, JSON.stringify(library, null, 2));

        res.json({ success: true, item: newItem });
    } catch (error) {
        console.error("SAVE ERROR:", error);
        res.status(500).json({ error: "Failed to save to library" });
    }
});

router.get("/", (req, res) => {
    try {
        ensureLibrary();
        const library = JSON.parse(fs.readFileSync(LIBRARY_FILE, "utf-8"));
        res.json({ success: true, library });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch library" });
    }
});

router.delete("/:id", (req, res) => {
    try {
        ensureLibrary();
        const { id } = req.params;
        let library = JSON.parse(fs.readFileSync(LIBRARY_FILE, "utf-8"));

        library = library.filter((item: any) => item.id !== id);
        fs.writeFileSync(LIBRARY_FILE, JSON.stringify(library, null, 2));

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete from library" });
    }
});

export default router;
