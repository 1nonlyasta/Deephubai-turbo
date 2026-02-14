import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import { connectDB } from "./db/mongo.js";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`🔐 AUTH SERVER running on http://localhost:${PORT}`);
});
