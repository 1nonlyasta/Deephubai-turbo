import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Import Modular Routes
import chatRoutes from "./server/routes/chat.ts";
import fileRoutes from "./server/routes/files.ts";
import ocrRoutes from "./server/routes/ocr.ts";
import teacherRoutes from "./server/routes/teacher.ts";
import libraryRoutes from "./server/routes/library.ts";

dotenv.config();

/* ==================== APP INIT ==================== */
const app = express();
const PORT = process.env.PORT || 3001;

/* ==================== CORE SETUP ==================== */
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* ==================== PATH FIX (ESM) ==================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directories exist
const uploadDirs = ["uploads", "uploads/question-papers"];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/* ==================== ROUTE REGISTRATION ==================== */
app.use("/api/chat", chatRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/medical", ocrRoutes); // Alias for medical scan
app.use("/api/question-paper", teacherRoutes);
app.use("/api", teacherRoutes);
app.use("/api/library", libraryRoutes);

/* ==================== BOOT ==================== */
const server = app.listen(PORT, () => {
    console.log("🚀 DEEPHUB CORE ONLINE (TYPESCRIPT)");
    console.log(`📡 PORT : ${PORT}`);
    console.log(`📂 MODE : ARCHITECTURAL_EVOLUTION_PHASE_2`);
});

server.on('error', (err: any) => {
    console.error("❌ SERVER ERROR:", err);
    if (err.code === 'EADDRINUSE') {
        process.exit(1);
    }
});

server.on('close', () => {
    console.log("🛑 SERVER CLOSED");
});

// Prevent immediate exit - though app.listen should handle this
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION:', reason);
});
