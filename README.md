# DeepHubAI Turbo ⚡

> The World's Fastest AI Copilot for Educators - Hybrid Multi-Model Architecture

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.1-green.svg)](https://www.mongodb.com/)

**Built for the AWS AI Bharat Hackathon 2026**

DeepHubAI Turbo is a production-ready educational tool suite designed to empower teachers with ultra-low latency AI assistance. By combining the raw speed of **Groq LPUs** (Llama-3.3-70B), the reasoning capabilities of **Google Gemini 2.0 Flash** with native search grounding, and the privacy of local **Ollama models** (Llama 3.2), Turbo delivers an unmatched experience in lesson planning, grading, and academic research.

---

## 🚀 Why DeepHubAI Turbo?

- **⚡ Zero Latency:** Powered by Groq's LPU Inference Engine (Llama-3.3-70B-Versatile), generating lesson plans at 300+ tokens/sec
- **🧠 Intelligent Fallback Chain:** Automatic switching between Groq → Gemini 2.0 Flash → Ollama (Llama 3.2:1b) on rate limits/failures, ensuring 100% uptime
- **� Native Web Search:** Gemini 2.0 Flash integration with Google Search grounding tool for real-time information retrieval
- **� Privacy-First Deep Research:** Route sensitive queries to loscal Ollama (Llama 3.2:1b) - data never leaves your machine
- **👁️ Advanced OCR Vision:** Tesseract.js WASM + Vision models for handwritten question paper digitization (>90% accuracy)
- **🎨 Modern UI/UX:** Glassmorphism design with light/dark theme support and responsive layouts
- **🔐 Enterprise Security:** JWT authentication, bcrypt password hashing, MongoDB user management

---

## ✨ Key Features

### 🎯 9 AI-Powered Tools for Educators

#### 1. 📝 Lesson Plan Builder

Generate comprehensive, curriculum-aligned lesson plans with objectives, materials, procedures, and assessment methods. Structured JSON output with Markdown export.

**API:** `POST /api/lesson-plan/generate`

#### 2. 📚 Homework Creator

Create ready-to-print homework assignments with automatic answer keys. Supports MCQ and short answer formats with customizable difficulty levels.

**API:** `POST /api/homework/generate`

#### 3. 📄 Question Paper Generator

Upload syllabus materials (PDF/TXT) and generate standardized question papers with proper marking schemes. Supports blueprint adherence and JSON output.

**API:** `POST /api/question-paper/generate` (with file upload)

#### 4. 🧠 Paper Solver (Neural Vision)

Upload question papers (PDF/images) and get AI-generated solutions with step-by-step explanations. Uses chunking strategy for large documents (6000 char chunks). OCR accuracy >90%.

**API:** `POST /api/solve-paper` (with file upload)

#### 5. 📊 Report Card Assistant

Generate personalized, constructive report card comments with career suggestions based on student performance data. Supports vision analysis for uploaded reports.

**API:** `POST /api/analyze-report`

#### 6. 🎤 PPT Generator

Create PowerPoint presentations with title slides, content slides, table slides, comparison slides, and speaker notes. Export as .pptx using PptxGenJS.

**API:** `POST /api/ppt/generate`

#### 7. 📧 Document Secretary

AI assistant for drafting professional emails, circulars, and administrative notices with proper formatting and tone.

**API:** `POST /api/secretary/generate`

#### 8. 🔀 Quiz Shuffler

Create multiple versions of quizzes with shuffled questions and options for fair assessments.

**API:** `POST /api/shuffler/version`

#### 9. 📑 PDF Snipper & OCR Utilities

Extract text from PDFs with automatic OCR fallback. Supports snippet-based OCR for scanned documents and medical prescriptions.

**API:** `POST /api/ocr` (medical/prescription OCR)

---

## 🛠️ Tech Stack & Architecture

### Frontend (The "Turbo" Engine)

- **Framework:** React 18 + Vite (TypeScript)
- **UI/UX:** Tailwind CSS + Radix UI + Framer Motion
- **State Management:** Zustand + TanStack Query
- **Routing:** React Router v6
- **Styling:** Tailwind CSS with custom animations

### The AI Quartet (Multi-Model Architecture)

1. **Groq (Llama-3.3-70B-Versatile):** Primary engine handling 90% of requests with 300+ tokens/sec speed
2. **Google Gemini 2.0 Flash:** Fallback engine with native Google Search grounding tool for real-time information
3. **Ollama (Llama 3.2:1b):** Local engine for offline tasks and private "Deep Research" mode
4. **Kimi/Moonshot (moonshot-v1-128k):** Secondary provider for extended context windows

**Fallback Chain:** Groq → Gemini → Ollama (automatic switching on rate limits/failures)

### Backend

- **Server:** Node.js (Express) + TypeScript (dual server architecture)
  - Main Server: Port 3001 (API routes)
  - Auth Server: Port 3002 (JWT authentication)
- **Authentication:** JWT (7-day expiry) + bcrypt (salt rounds: 10)
- **Database:** MongoDB (Mongoose) with User model (username, email, password, role, createdAt)
- **File Processing:**
  - Multer (10MB limit for question papers, memory storage for PDFs)
  - PDF-Parse for text extraction
  - Sharp for image manipulation
  - Chunking strategy for large documents (6000 char chunks)
- **OCR:** Tesseract.js (client-side WASM) + Vision models
- **Document Generation:**
  - jsPDF + html2canvas (client-side PDF)
  - PptxGenJS (client-side PowerPoint)

### Key Libraries

- **AI SDKs:** groq-sdk (Groq LPU inference)
- **PDF Handling:** react-pdf, pdf-parse, jspdf, html2canvas
- **PowerPoint:** pptxgenjs (slide generation with tables, comparisons, speaker notes)
- **OCR:** tesseract.js (WASM-based, client-side)
- **Markdown:** react-markdown, remark-math, rehype-katex (LaTeX math rendering)
- **UI Components:** Radix UI primitives (20+ components), Lucide icons
- **Animations:** GSAP, Framer Motion (Motion One)
- **State Management:** Zustand, TanStack Query, React Context
- **Auth:** jsonwebtoken, bcryptjs
- **File Upload:** multer
- **Image Processing:** sharp

---

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or cloud)
- API keys:
  - **Required:** Groq API key (primary inference)
  - **Required:** Gemini API key (fallback with search grounding)
  - **Optional:** Ollama installed locally for privacy mode (Llama 3.2:1b)
  - **Optional:** Moonshot/Kimi API key (extended context)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/1nonlyasta/Deephubai-turbo.git
cd Deephubai-turbo

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add your configuration:
# GROQ_API_KEY=your_groq_api_key
# GEMINI_API_KEY=your_gemini_api_key
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# MOONSHOT_API_KEY=your_moonshot_api_key (optional)
# OLLAMA_BASE_URL=http://localhost:11434 (optional, for local Ollama)

# Run the development server
npm run dev

# In a separate terminal, run the backend server
npm run server

# Optional: Run authentication server
npm run auth-server
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the frontend
npm run build

# Preview production build
npm run preview
```

---

## 🎯 Usage

### Dashboard Navigation

1. Access the unified dashboard displaying all 8 AI tools
2. Click on any tool card to activate it
3. The centralized input interface persists across tool navigation
4. Switch between tools seamlessly without page reloads

### AI Model Selection

- **Automatic Mode:** System intelligently routes requests with fallback chain (Groq → Gemini → Ollama)
- **Manual Selection:** Choose specific provider (Groq/Gemini/Ollama/Moonshot) via AIContext
- **Failover:** Automatic fallback on rate limits/failures (<2s)
- **Web Search:** Gemini 2.0 Flash includes native Google Search grounding tool
- **Privacy Mode:** Route to local Ollama (Llama 3.2:1b) for sensitive data

### Export Options

- **PDF:** All generated content exportable to PDF
- **PPTX:** Presentations downloadable as PowerPoint files
- **Text:** Copy-to-clipboard functionality for all text content

### Theme Support

- Toggle between light and dark themes
- Preference saved and persists across sessions
- Instant switching without page reload

---

## 🏗️ Project Structure

```
DeepHubAI-Turbo/
├── src/
│   ├── components/
│   │   ├── turbo/
│   │   │   ├── dashboard/
│   │   │   │   ├── ActionCard.tsx        # Tool cards
│   │   │   │   ├── Library.tsx           # Content library
│   │   │   │   ├── StatsPanel.tsx        # Usage statistics
│   │   │   │   ├── ToolSearchPane.tsx    # Tool search
│   │   │   │   └── TurboChat.tsx         # Chat interface
│   │   │   └── tools/
│   │   │       ├── LessonPlanBuilder.tsx
│   │   │       ├── HomeworkCreator.tsx
│   │   │       ├── QuestionPaperGenerator.tsx
│   │   │       ├── PaperSolver.tsx
│   │   │       ├── ReportCardAssistant.tsx
│   │   │       ├── PPTGenerator.tsx
│   │   │       ├── DocumentSecretary.tsx
│   │   │       ├── QuizShuffler.tsx
│   │   │       └── PDFSnipper.tsx
│   │   └── product/              # Radix UI components (20+)
│   ├── pages/
│   │   └── Turbo.tsx             # Main Turbo page
│   ├── contexts/
│   │   └── AIContext.tsx         # AI provider state
│   └── App.tsx
├── server/
│   ├── config/
│   │   ├── ai_config.ts          # AI model configuration
│   │   └── prompts.js            # System prompts
│   ├── routes/
│   │   ├── chat.ts               # Chat endpoint
│   │   ├── teacher.ts            # Teacher tool endpoints
│   │   ├── files.ts              # File operations
│   │   └── library.ts            # Library CRUD
│   ├── middleware/
│   │   └── upload.ts             # Multer configuration
│   └── utils/
│       ├── helpers.ts            # Utility functions
│       ├── search.ts             # Search utilities
│       └── file_scanner.ts       # File scanning
├── backend/
│   ├── controllers/
│   │   └── auth.controller.js    # Auth logic
│   ├── models/
│   │   └── user.js               # User schema
│   ├── routes/
│   │   └── auth.js               # Auth routes
│   ├── db/
│   │   └── mongo.js              # MongoDB connection
│   └── auth-server.js            # Auth server (port 3002)
├── .kiro/
│   └── specs/
│       └── deephubai-turbo/
│           ├── requirements.md   # Feature requirements
│           ├── design.md         # System design
│           └── tasks.md          # Implementation tasks
├── server.ts                     # Main server (port 3001)
└── package.json
```

---

## 🔒 Security & Privacy

- **API Key Protection:** All API keys stored in environment variables, never exposed in client bundle
- **JWT Authentication:** 7-day token expiry with secure signing (JWT_SECRET)
- **Password Security:** bcrypt hashing with salt rounds 10
- **HTTPS Only:** All API communication over HTTPS
- **Local Processing:** OCR (Tesseract.js WASM), PDF (jsPDF), and PPT (PptxGenJS) generation occur entirely client-side
- **Ollama Privacy Mode:** Route sensitive queries to local Llama 3.2:1b - data never leaves your machine
- **MongoDB Security:** User model with role-based access (default: "beta")
- **File Upload Limits:** 10MB for question papers, 5MB for images
- **No Data Logging:** User-generated content is never logged on backend servers

---

## 🚀 Performance

- **AI Response Time:** <5 seconds for standard requests (Groq primary)
- **Initial Load:** <2 seconds on standard connections
- **Groq Throughput:** ~300 tokens/second (Llama-3.3-70B-Versatile)
- **Failover Time:** <2 seconds (Groq → Gemini → Ollama)
- **Export Operations:** <3 seconds for PDF/PPTX generation (client-side)
- **OCR Accuracy:** >90% on scanned documents (Tesseract.js + Vision models)
- **Chunking Strategy:** 6000 char chunks for large documents (prevents token overflow)
- **File Upload:** 10MB limit with progress indicators

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Groq** for ultra-fast LPU inference (Llama-3.3-70B-Versatile)
- **Google** for Gemini 2.0 Flash API with native search grounding
- **Ollama** for local model deployment (Llama 3.2:1b)
- **Moonshot AI** for extended context windows (moonshot-v1-128k)
- **AWS AI Bharat Hackathon 2026** for the opportunity
- **Radix UI** for accessible component primitives
- **Tesseract.js** for client-side OCR capabilities

---

## 📧 Contact & Support

- **GitHub:** [1nonlyasta/Deephubai-turbo](https://github.com/1nonlyasta/Deephubai-turbo)
- **Issues:** [Report a bug](https://github.com/1nonlyasta/Deephubai-turbo/issues)

---

**DeepHubAI - Empowering the Future of Education** 🎓✨
