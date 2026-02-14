# DeepHubAI Turbo - Requirements Document

## 1. Introduction

DeepHubAI Turbo is an advanced, AI-powered suite of tools designed specifically for educators. It aims to streamline administrative and instructional tasks, allowing teachers to focus more on student engagement and less on paperwork. By leveraging Generative AI (Groq/Llama) and local processing capabilities, Turbo provides a fast, secure, and intuitive experience.

## 2. Functional Requirements

### 2.1 Core AI Tools

The system must provide the following distinct tools accessible from a unified dashboard:

1.  **Lesson Plan Builder**
    - **Input:** Topic, Grade Level, Subject, Duration.
    - **Output:** Structured lesson plan with objectives, materials, procedure, and assessment methods.
    - **Feature:** Ability to export plans to PDF or text.

2.  **Homework Creator**
    - **Input:** Topic, Difficulty Level, Question Types (MCQ, Short Answer).
    - **Output:** Ready-to-print homework sheets.
    - **Feature:** Automatic generation of answer keys.

3.  **Question Paper Generator**
    - **Input:** Syllabus/Chapter coverage, Total Marks, Blueprint.
    - **Output:** Formatted question paper adhering to academic standards.
    - **Feature:** Option to shuffle questions for different sets.

4.  **Paper Solver**
    - **Input:** Uploaded image or PDF of a question paper as strings.
    - **Output:** AI-generated solutions and explanations.
    - **Feature:** OCR capabilities to read scanned documents.

5.  **Report Card Assistant**
    - **Input:** Student performance data, key competencies.
    - **Output:** Personalized, constructive comments for report cards.

6.  **PPT Generator**
    - **Input:** Topic and key points.
    - **Output:** Downloadable PowerPoint (.pptx) presentation with slide content and structure.

7.  **Document Secretary**
    - **Function:** General-purpose AI assistant for drafting emails, circulars, and administrative notices.

8.  **PDF Snipper & Utilities**
    - **Function:** Tools to manipulate PDF documents (split, extract) for classroom use.

### 2.2 User Interface (UI)

- **Dashboard:** A central "Turbo" interface to access all tools.
- **Dynamic Island/Input:** A centralized, persistent input mechanism for quick AI interactions.
- **Responsiveness:** The interface must be fully responsive across desktop and tablet devices.
- **Theme:** Support for Light/Dark modes for accessibility.

### 2.3 System Capabilities

- **Multi-Model Architecture:**
  - **Groq (Llama-3.3-70B):** Primary engine for ultra-fast, real-time inferencing.
  - **Gemini 2.0 Flash (Google):** Robust fallback engine with native Google Search grounding for current events.
  - **Ollama (Llama 3.2):** Local, private AI engine for "Deep Research" and offline capability without API costs.
- **Local/Client-Side Processing:** Maximize use of client-side logic to reduce server load and latency.
- **AI Integration:** Real-time generation using high-speed inference models (via Groq SDK) with automatic failover.
- **File Handling:** Support for uploading PDF and Images for analysis (OCR).
- **Export Formats:** Application must support exporting content as PDF, PPTX, and Copy-to-Clipboard.

## 3. Non-Functional Requirements

### 3.1 Performance

- **Latency:** AI responses should be near-instantaneous (leveraging Groq's LPUs).
- **Resilience:** System must automatically switch providers (Groq -> Gemini -> Ollama) if one fails or rate-limits.
- **Load Time:** Application initial load time should be under 2 seconds.

### 3.2 Security & Privacy

- **Data Handling:** Student data entered into the system should be processed securely.
- **Local Privacy:** Sensitive research can be routed to the local Ollama instance, ensuring data never leaves the machine.
- **Authentication:** Secure access to the tool suite (if applicable).

### 3.3 Reliability

- **Uptime:** The system should function reliably, handling API limits gracefully with error messages.
- **Offline Capability:** Basic navigation should work offline, with clear indicators when internet is required for AI generation.

### 3.4 Usability

- **Accessibility:** UI elements should be clearly labeled and navigable.
- **Simplicity:** Minimal clicks required to generate content (3-click rule).
