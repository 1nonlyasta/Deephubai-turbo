import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { scanDirectory } from "../utils/file_scanner.ts";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_PATH = path.resolve(__dirname, "../../src");

router.get("/", (req, res) => {
    res.json(scanDirectory(SRC_PATH, SRC_PATH));
});

export default router;
