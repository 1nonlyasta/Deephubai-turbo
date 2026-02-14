# DeepHubAI Turbo - Design Document

## 1. System Architecture

### 1.1 Overview

DeepHubAI Turbo is architected as a modern, high-performance Single Page Application (SPA). It emphasizes client-side processing to ensure responsiveness and privacy. The core architecture revolves around a modular component system where each AI tool functions as an independent module within a unified shell.

### 1.2 High-Level Diagram

```mermaid
graph TD
    Client[User Client (Browser)] --> UI[React UI Layer]
    UI --> State[State Management (Zustand/Context)]
    UI --> Router[React Router]

    subgraph "AI Engines (Hybrid Architecture)"
        Logic[Business Logic]
        Groq[Groq LPU (Primary)]
        Gemini[Google Gemini 2.0 (Fallback/Search)]
        Ollama[Ollama (Local/Private)]
        OCR[Tesseract.js (OCR)]
    end

    UI --> Logic
    Logic --> Groq
    Logic --> Gemini
    Logic --> Ollama
    Logic --> OCR

    subgraph "External Services"
        API[DeepHub API]
        GroqCloud[Groq Cloud]
        GoogleAPI[Google AI Studio]
    end

    Groq --> GroqCloud
    Gemini --> GoogleAPI

    subgraph "Output Generation"
        PDF[jsPDF/React-PDF]
        PPT[PptxGenJS]
    end

    Logic --> PDF
    Logic --> PPT
```

## 2. Technology Stack

### 2.1 Frontend Core

- **Framework:** React 18 (TypeScript) - robust, type-safe UI development.
- **Build Tool:** Vite - for lightning-fast development and optimized production builds.
- **Routing:** React Router DOM - seamless client-side navigation.

### 2.2 UI & Styling

- **CSS Framework:** Tailwind CSS - utility-first styling for rapid UI development.
- **Component Library:** Radix UI - unstyled, accessible UI primitives for modals, dropdowns, etc.
- **Icons:** Lucide React - consistent, lightweight iconography.
- **Animations:** Framer Motion & GSAP - for fluid, engaging user interactions.

### 2.3 State Management

- **Global State:** Zustand / React Context - efficient state handling across components.
- **Data Fetching:** TanStack Query - managing server state and caching.

### 2.4 AI & Processing (Hybrid Neuro-Symbolic Architecture)

- **Primary Inference:** **Groq SDK** - Leveraging LPU™ Inference Engine for ultra-low latency (approx 300 tokens/sec).
- **Fallback & Reasoning:** **Google Gemini 2.0 Flash** - High-context window model with native Google Search integration for real-time validity.
- **Local Intelligence:** **Ollama** - Running quantized Llama 3.2 models locally for privacy-preserving, deep research tasks without internet dependency.
- **OCR:** **Tesseract.js** - WASM-based client-side Optical Character Recognition.
- **Mathematics:** KaTeX / Rehype-Katex - rendering complex mathematical formulas.
- **PDF Parsing:** pdf-parse - extracting text from uploaded PDFs.

### 2.5 Document Generation

- **PDF:** jsPDF & html2canvas - generating high-quality PDF reports and papers client-side.
- **PPT:** PptxGenJS - creating native PowerPoint presentations dynamically.

## 3. Data Flow & Fallback Strategy

1.  **Input:** User interacts with a specific tool (e.g., Lesson Plan Builder) via the UI.
2.  **Processing:** Input data is validated and structured by the client-side logic.
3.  **Inference Orchestration:**
    - **Attempt 1:** Request sent to **Groq** for immediate response.
    - **Failover:** If Groq rate-limits (429) or fails, the request automatically reroutes to **Gemini**.
    - **Deep Mode:** If user selects "Deep Research" or "Ollama", request routes to `localhost:11434` for processing via local GPU/CPU.
    - **Vision/OCR:** Image/PDF uploads are processed locally via Tesseract.js to extract text before LLM injection.
4.  **Response Handling:** The AI response is received, parsed (Markdown/JSON), and stored in the local state.
5.  **Rendering:** The UI updates to display the generated content (e.g., a drafted lesson plan).
6.  **Export:** User selects an export format, and the client-side libraries (jsPDF/PptxGenJS) generate the downloadable file.

## 4. Security & Privacy

- **Data Minimization:** No unnecessary user data is stored on backend servers; processing is largely ephemeral or local.
- **Environment Variables:** API keys and sensitive configuration are managed via `.env` files and never exposed in the client bundle.
- **Secure Transmission:** All API communication occurs over HTTPS.

## 5. UI/UX Strategy

- **Visual Identity:** A modern, clean "Turbo" aesthetic using a refined color palette and glassmorphism effects.
- **Responsive Design:** Fully adaptive layouts ensure usability on desktops, tablets, and large screens.
- **Feedback Loops:** Immediate visual feedback (loading skeletons, toast notifications) during AI processing.
