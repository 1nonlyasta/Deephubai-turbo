# DeepHubAI Turbo - Requirements Document

## 1. Introduction

DeepHubAI Turbo is a production-ready, AI-powered suite of tools designed specifically for educators. It aims to streamline administrative and instructional tasks, allowing teachers to focus more on student engagement and less on paperwork. By leveraging a multi-model AI architecture (Groq LPU + Gemini 2.0 Flash + Ollama + Moonshot) with intelligent fallback chains and local processing capabilities, Turbo provides a fast, secure, and intuitive experience with 100% uptime guarantee.

## 2. Functional Requirements

### 2.1 Core AI Tools

The system must provide the following 9 distinct tools accessible from a unified dashboard:

#### 2.1.1 Lesson Plan Builder

**User Story:** As an educator, I want to generate structured lesson plans quickly so that I can focus on teaching rather than planning documentation.

**Acceptance Criteria:**
1. System accepts topic, grade level, subject, and duration as inputs
2. Generated lesson plan includes objectives, materials, procedure, and assessment methods
3. User can export lesson plans to PDF format
4. User can export lesson plans to text format
5. Generation completes within 5 seconds for standard requests

#### 2.1.2 Homework Creator

**User Story:** As a teacher, I want to create homework assignments with answer keys so that I can save time on assignment preparation.

**Acceptance Criteria:**
1. System accepts topic, difficulty level, and question types (MCQ, Short Answer) as inputs
2. Generated homework sheets are ready-to-print format
3. System automatically generates answer keys for all questions
4. User can specify number of questions to generate
5. Output is exportable to PDF format

#### 2.1.3 Question Paper Generator

**User Story:** As an educator, I want to generate standardized question papers so that I can create fair assessments efficiently.

**Acceptance Criteria:**
1. System accepts syllabus/chapter coverage, total marks, and blueprint as inputs
2. Generated question paper adheres to academic formatting standards
3. User can shuffle questions to create different sets
4. Question distribution matches the provided blueprint
5. Output includes proper marking scheme

#### 2.1.4 Paper Solver

**User Story:** As a teacher, I want to upload question papers and get AI-generated solutions so that I can quickly create answer keys.

**Acceptance Criteria:**
1. System accepts uploaded images (PNG, JPG) of question papers
2. System accepts uploaded PDF documents of question papers
3. OCR accurately extracts text from scanned documents (>90% accuracy)
4. AI generates solutions with step-by-step explanations
5. User can copy or export solutions to PDF

#### 2.1.5 Report Card Assistant

**User Story:** As a teacher, I want to generate personalized report card comments so that I can provide meaningful feedback efficiently.

**Acceptance Criteria:**
1. System accepts student performance data and key competencies as inputs
2. Generated comments are personalized and constructive
3. Comments align with educational best practices
4. User can edit generated comments before finalizing
5. Supports batch generation for multiple students

#### 2.1.6 PPT Generator

**User Story:** As an educator, I want to create presentation slides from topics so that I can prepare visual teaching materials quickly.

**Acceptance Criteria:**
1. System accepts topic and key points as inputs
2. Generated presentation has proper slide structure (title, content, conclusion)
3. Output is downloadable as PowerPoint (.pptx) format
4. Slides include appropriate formatting and layout
5. User can specify number of slides to generate

#### 2.1.7 Document Secretary

**User Story:** As an administrator, I want an AI assistant to draft professional documents so that I can handle administrative tasks efficiently.

**Acceptance Criteria:**
1. System can draft emails with proper formatting
2. System can create circulars and administrative notices
3. Generated documents follow professional tone and structure
4. User can specify document type and key points
5. Output is editable before finalization

#### 2.1.8 Quiz Shuffler

**User Story:** As a teacher, I want to create multiple versions of quizzes with shuffled questions so that I can prevent cheating during assessments.

**Acceptance Criteria:**
1. System accepts quiz content with questions and options
2. System generates multiple versions with shuffled question order
3. System shuffles options within each question
4. Each version maintains the same content but different arrangement
5. Output is exportable to PDF format

#### 2.1.9 PDF Snipper & OCR Utilities

**User Story:** As a teacher, I want to extract text from PDFs and images so that I can digitize physical documents.

**Acceptance Criteria:**
1. System can extract text from PDF documents using pdf-parse
2. System can perform OCR on scanned documents using Tesseract.js
3. System supports snippet-based OCR for specific document sections
4. System can process medical prescriptions and handwritten text
5. OCR accuracy exceeds 90% on clear scanned documents

### 2.2 User Interface (UI)

#### 2.2.1 Dashboard

**Acceptance Criteria:**
1. Dashboard displays all 8 AI tools as accessible cards/buttons
2. Each tool has clear icon and description
3. Dashboard loads within 2 seconds on standard connections
4. Navigation between tools is seamless (no page reload)
5. Recent activity/history is visible on dashboard

#### 2.2.2 Input Mechanism

**Acceptance Criteria:**
1. Centralized input interface is persistent across tool navigation
2. Input fields are clearly labeled and validated
3. User receives immediate feedback on invalid inputs
4. Input state is preserved when switching between tools
5. Supports keyboard shortcuts for quick access

#### 2.2.3 Responsiveness

**Acceptance Criteria:**
1. Interface adapts to desktop screens (1920x1080 and above)
2. Interface adapts to tablet screens (768px and above)
3. All interactive elements are touch-friendly (min 44x44px)
4. Text remains readable at all supported screen sizes
5. No horizontal scrolling required on any supported device

#### 2.2.4 Theme Support

**Acceptance Criteria:**
1. System provides light theme option
2. System provides dark theme option
3. Theme preference is saved and persists across sessions
4. Theme switching is instant (no page reload)
5. All UI elements are readable in both themes

### 2.3 System Capabilities

#### 2.3.1 Multi-Model Architecture

**Acceptance Criteria:**
1. Groq (Llama-3.3-70B-Versatile) is used as primary inference engine
2. System automatically falls back to Gemini 2.0 Flash on Groq failure/rate limit
3. Gemini 2.0 Flash includes native Google Search grounding tool for real-time information
4. Ollama (Llama 3.2:1b) is available for local/private processing
5. Moonshot/Kimi (moonshot-v1-128k) is available for extended context windows
6. User can manually select AI provider via AIContext (auto/groq/gemini/ollama/moonshot)
7. Failover occurs within 2 seconds of primary model failure
8. System maintains conversation context across provider switches

#### 2.3.2 Local/Client-Side Processing

**Acceptance Criteria:**
1. OCR processing occurs entirely in browser using Tesseract.js WASM
2. PDF generation occurs client-side using jsPDF + html2canvas
3. PPT generation occurs client-side using PptxGenJS with slides, tables, comparisons, speaker notes
4. No sensitive data is sent to server unnecessarily
5. Processing indicators show when operations are local vs. remote
6. LaTeX math rendering occurs client-side using KaTeX
7. Markdown to HTML conversion occurs client-side

#### 2.3.3 File Handling

**Acceptance Criteria:**
1. System accepts PDF files up to 10MB via Multer
2. System accepts image files (PNG, JPG, JPEG) up to 5MB
3. File upload includes drag-and-drop support
4. User receives clear error messages for unsupported formats
5. Upload progress is visible for large files
6. System uses memory storage for PDFs and disk storage for question papers
7. Large documents are processed using chunking strategy (6000 char chunks)
8. Automatic PDF text extraction with OCR fallback

#### 2.3.4 Export Formats

**Acceptance Criteria:**
1. All generated content can be exported to PDF using jsPDF + html2canvas
2. Presentation content can be exported to PPTX using PptxGenJS
3. PPTX includes title slides, content slides, table slides, comparison slides, speaker notes
4. All text content has copy-to-clipboard functionality
5. Exported files have meaningful default names with timestamps
6. Export operations complete within 3 seconds
7. JSON output available for structured data (question papers, reports, PPT slides)
8. Markdown export available for lesson plans and homework

## 3. Non-Functional Requirements

### 3.1 Performance

**Acceptance Criteria:**
1. AI responses are generated within 5 seconds for standard requests using Groq
2. Application initial load time is under 2 seconds
3. Groq inference provides ~300 tokens/second throughput (Llama-3.3-70B-Versatile)
4. UI remains responsive during AI processing
5. No memory leaks during extended usage sessions
6. Failover between providers occurs within 2 seconds
7. Large documents are processed using chunking (6000 char chunks)
8. Client-side operations (PDF, PPTX, OCR) complete within 3 seconds

### 3.2 Security & Privacy

**Acceptance Criteria:**
1. API keys are stored in environment variables only (GROQ_API_KEY, GEMINI_API_KEY, MOONSHOT_API_KEY, JWT_SECRET)
2. API keys are never exposed in client bundle
3. All API communication occurs over HTTPS
4. Ollama local processing keeps data on user's machine (Llama 3.2:1b)
5. No user-generated content is logged or stored on backend servers
6. JWT tokens expire after 7 days
7. Passwords are hashed with bcrypt (salt rounds: 10)
8. MongoDB connection uses secure connection string
9. File uploads are validated for size and type
10. CORS is configured to allow only trusted origins

### 3.3 Reliability

**Acceptance Criteria:**
1. System handles API rate limits gracefully with user-friendly messages
2. Automatic failover between AI providers occurs transparently (Groq → Gemini → Ollama)
3. Application functions offline for navigation and local features (OCR, PDF, PPTX)
4. Clear indicators show when internet is required
5. System recovers from errors without requiring page refresh
6. Conversation context is maintained across provider switches
7. File upload failures provide retry mechanism
8. MongoDB connection includes reconnection logic

### 3.4 Usability

**Acceptance Criteria:**
1. All UI elements have clear labels and tooltips
2. Content generation requires maximum 3 clicks
3. Error messages are actionable and user-friendly
4. Loading states are clearly indicated
5. Help documentation is accessible from all tools


### 2.4 Authentication & User Management

#### 2.4.1 User Authentication

**User Story:** As a user, I want to securely register and login so that my data is protected.

**Acceptance Criteria:**
1. System provides user registration with username, email, and password
2. Passwords are hashed using bcrypt with salt rounds 10
3. System generates JWT tokens with 7-day expiration
4. JWT tokens are signed with JWT_SECRET from environment variables
5. User model includes username, email, password (hashed), role (default: "beta"), createdAt
6. Authentication server runs on separate port (3002) from main server (3001)
7. Login endpoint returns JWT token on successful authentication
8. System validates JWT tokens on protected routes

### 2.5 Content Library

#### 2.5.1 Library Management

**User Story:** As a teacher, I want to save and manage generated content so that I can reuse it later.

**Acceptance Criteria:**
1. System provides API to save generated content to library
2. System provides API to fetch all library items
3. System provides API to delete library items by ID
4. Library items include metadata (title, type, timestamp, content)
5. Library is accessible from dashboard
