# Galileo Tech Stack - AI Research Agent

<div align="center">

**Multi-Step Research Agent with RAG, Observability, and Modern UI**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![Galileo](https://img.shields.io/badge/Galileo-Observability-purple.svg)](https://www.galileo.ai/)

[Features](#features) • [Architecture](#architecture) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Demo](#demo)

</div>

---

## 📖 Overview

A production-ready AI research agent that combines multi-step reasoning, document RAG (Retrieval-Augmented Generation), and comprehensive observability. Built for the Galileo Product Marketing Manager technical assessment.

### What It Does

1. **🧠 Multi-Step Research**: Executes a 5-step research workflow (Plan → RAG → Search → Analyze → Synthesize)
2. **📚 Document RAG**: Upload PDFs and retrieve relevant chunks during research
3. **💬 Chat History RAG**: Retrieves context from past conversations
4. **🔍 Web Search**: Integrates Tavily API for real-time web results
5. **📊 Full Observability**: Every LLM call logged to Galileo with evaluation metrics
6. **🎨 Modern UI**: Sleek dark-themed interface with real-time pipeline visualization

---

## ✨ Features

### Core Capabilities

- **Multi-Step Research Pipeline**
  - Strategic planning with search query generation
  - Document & chat history retrieval from Pinecone
  - Web search via Tavily API
  - Hybrid source ranking (web + docs + chat)
  - Deep analysis and synthesis
  - Answer validation with grounding scores

- **RAG System**
  - Document upload (PDF, DOCX, TXT)
  - Automatic chunking and embedding (OpenAI text-embedding-3-small)
  - Pinecone vector storage with user namespace isolation
  - Chat history storage for conversation context
  - Hybrid retrieval combining documents and past conversations

- **Galileo Observability**
  - Automatic LLM call logging with token counts and latency
  - Luna-2 metrics: Context Adherence, Hallucination Detection, Completeness
  - Custom RAG evaluators with 20+ metrics
  - Separate log streams for agent vs evaluation
  - Real-time trace viewing in Galileo console

- **User Experience**
  - Hero-to-chat interface transformation
  - Real-time pipeline step indicators
  - Source attribution with RAG type badges (📄 Document, 🌐 Web, 💬 Chat)
  - Citation parsing in markdown answers
  - Document management (upload, list, delete)

### Authentication & Security

- Clerk authentication with JWT tokens
- User namespace isolation in Pinecone
- Service-to-service token validation
- Per-user document and chat history scoping

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)                   │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │ Hero Mode    │  │ Chat Mode   │  │ Document Upload  │  │
│  │ (Centered)   │→ │ (Bottom)    │  │ + Management     │  │
│  └──────────────┘  └─────────────┘  └──────────────────┘  │
│           │                │                   │            │
│           └────────────────┴───────────────────┘            │
│                            │                                │
│                    Clerk Auth (JWT)                         │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Routes    │
                    │  (/api/*)       │
                    └────────┬────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                 BACKEND (FastAPI/Python)                    │
│  ┌──────────────┬──────────▼─────────┬──────────────────┐  │
│  │              │   ResearchAgent    │                  │  │
│  │  Endpoints   │    (LangGraph)     │   RAG System    │  │
│  │              └─────────┬──────────┘                  │  │
│  │  /research            │                              │  │
│  │  /documents     ┌─────┴─────┐                       │  │
│  │  /documents/    │  Plan     │    ┌──────────────┐   │  │
│  │    upload       │  RAG      │───→│  Pinecone    │   │  │
│  │  /health        │  Search   │    │  Vector DB   │   │  │
│  │                 │  Curate   │    └──────────────┘   │  │
│  │                 │  Analyze  │                       │  │
│  │                 │  Synth    │    ┌──────────────┐   │  │
│  │                 │  Validate │───→│  Tavily      │   │  │
│  │                 └───────────┘    │  Search API  │   │  │
│  │                      │            └──────────────┘   │  │
│  │                      │                               │  │
│  │                      ▼                               │  │
│  │              ┌───────────────┐                       │  │
│  │              │   Galileo     │                       │  │
│  │              │  Observability│                       │  │
│  │              └───────────────┘                       │  │
│  │                                                       │  │
│  │  Database: SQLite (users, docs, chunks, chat)       │  │
│  └───────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Frontend** | Next.js | 14.2.35 | React framework with App Router |
| | TypeScript | 5.x | Type safety |
| | Tailwind CSS | 3.x | Styling |
| | Framer Motion | 11.x | Animations |
| | Clerk | Latest | Authentication |
| **Backend** | Python | 3.11+ | Core language |
| | FastAPI | 0.100+ | API framework |
| | LangGraph | 0.0.20+ | Workflow orchestration |
| | SQLAlchemy | 2.0+ | Database ORM |
| **AI/ML** | OpenAI GPT-4o-mini | Latest | LLM for reasoning |
| | OpenAI Embeddings | text-embedding-3-small | Document embeddings |
| | Tavily API | Latest | Web search |
| **Storage** | Pinecone | Cloud | Vector database |
| | SQLite | 3.x | Relational database |
| **Observability** | Galileo SDK | 1.37.0+ | LLM observability |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn
- Clerk account (for authentication)
- API Keys:
  - Galileo API key
  - OpenAI API key
  - Tavily API key
  - Pinecone API key

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd galileo-tech-stack
```

### 2. Backend Setup

```bash
cd research-agent

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys:
# GALILEO_API_KEY=your-galileo-key
# OPENAI_API_KEY=your-openai-key
# TAVILY_API_KEY=your-tavily-key
# PINECONE_API_KEY=your-pinecone-key
# CLERK_SECRET_KEY=your-clerk-secret

# Verify setup
python verify_setup.py

# Initialize database
python -c "from backend.database import init_db; init_db()"

# Start backend server
python api_server.py
# Backend runs at http://localhost:8000
```

### 3. Frontend Setup

```bash
cd research-agent-ui

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
# CLERK_SECRET_KEY=your-clerk-secret-key
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Start development server
npm run dev
# Frontend runs at http://localhost:3001
```

### 4. Access Application

1. Open http://localhost:3001
2. Sign in with Clerk
3. Upload documents (optional)
4. Start researching!

---

## 📚 Documentation

### Project Structure

```
galileo-tech-stack/
├── research-agent/           # Python backend
│   ├── agent.py             # Main LangGraph research agent
│   ├── api_server.py        # FastAPI endpoints
│   ├── tools.py             # Tavily search integration
│   ├── evaluators.py        # LLM-as-judge evaluations
│   ├── rag_evaluators.py    # RAG-specific evaluators
│   ├── backend/             # Backend modules
│   │   ├── auth.py          # Clerk authentication
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models.py        # Database models
│   │   ├── documents.py     # Document endpoints
│   │   ├── embeddings.py    # OpenAI embeddings
│   │   ├── document_processor.py  # Chunking logic
│   │   └── chat_history.py  # Chat storage
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment template
│   ├── AGENT.md            # Backend documentation
│   └── CLAUDE.md           # Development log
│
├── research-agent-ui/       # Next.js frontend
│   ├── app/
│   │   ├── page.tsx         # Main page (hero + chat)
│   │   ├── layout.tsx       # Root layout
│   │   ├── api/             # API routes (proxy to backend)
│   │   │   ├── research/
│   │   │   ├── documents/
│   │   │   └── documents/upload/
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   └── ResearchInterface.tsx  # Main research component
│   ├── middleware.ts        # Clerk middleware
│   ├── package.json         # Node dependencies
│   └── .env.example         # Environment template
│
└── README.md               # This file
```

### Component Documentation

- **[Backend Documentation](research-agent/AGENT.md)** - Comprehensive guide to the Python backend
- **[Development Log](research-agent/CLAUDE.md)** - Phase-by-phase implementation details
- **[Security Guidelines](research-agent/SECURITY.md)** - API key management best practices

---

## 🎯 Key Features Guide

### Document Upload & RAG

```bash
# 1. Upload documents via UI
#    - Supports PDF, DOCX, TXT
#    - Automatic chunking (500 chars with 50 overlap)
#    - OpenAI embeddings stored in Pinecone

# 2. Documents are automatically included in all research queries
#    - User namespace isolation (user_<user_id>_docs)
#    - Top-k retrieval (default: 5 chunks)
#    - Confidence boosting (+0.15) prioritizes your documents

# 3. View documents in the UI
#    - "Your documents" section shows all uploads
#    - File size and chunk count displayed
#    - Delete documents to remove from Pinecone
```

### Research Workflow

**Step 1: Plan** (11-15s)
- Analyzes question
- Generates search queries
- Outlines coverage areas
- Quality score: 8-9/10

**Step 2: RAG Retrieval** (0.1-0.5s)
- Queries Pinecone for relevant document chunks
- Retrieves past conversation context
- Returns top-k results per namespace

**Step 3: Search** (10-17s)
- Executes 3 web searches via Tavily
- Retrieves 15 results total
- Relevance score: 7-9/10

**Step 4: Curate** (<0.1s)
- Hybrid ranking: web + docs + chat
- Confidence-based sorting
- Selects top 10 sources

**Step 5: Analyze** (15-18s)
- Extracts insights from all sources
- Synthesizes across web + docs + chat
- Completeness score: 8-9/10

**Step 6: Synthesize** (11-13s)
- Creates comprehensive answer
- Includes inline citations
- Quality score: 8-9/10

**Step 7: Validate** (1.5-3.5s)
- Checks factual grounding
- Detects hallucinations
- Grounded score: 8-10/10

### Chat History RAG

- All research conversations automatically stored
- Pinecone namespace: `user_<user_id>_chat_<session_id>`
- Retrieved when toggle is ON
- Confidence boost: +0.30
- Helps with follow-up questions and context retention

### Galileo Observability

**Log Streams:**
1. `multi-step-research` - Main agent workflow
2. `multi-step-research-eval` - Step evaluations
3. `rag-document-retrieval` - Document retrieval ops
4. `rag-hybrid-ranking` - Source ranking evaluation
5. `rag-context-utilization` - Context usage metrics

**View Traces:**
1. Visit https://app.galileo.ai/
2. Select project: `research-agent`
3. Choose log stream
4. View LLM calls with:
   - Input/output
   - Token counts
   - Latency
   - Luna metrics
   - Custom metadata

---

## 🎨 UI Features

### Hero Mode (Initial)
- Centered layout with large title
- Prominent input area
- Document upload interface
- Shows all uploaded documents

### Chat Mode (After First Query)
- Input moves to bottom (Cursor-style)
- Pipeline steps at top with real-time updates
- Seamless flow between input and results
- Minimal, focused interface

### Source Attribution
- **📄 Document** - From your uploaded files
- **🌐 Web** - From Tavily search
- **💬 Chat History** - From past conversations

### Citations
- Inline citations in markdown: `(Source 1 - Document)`
- Styled badges with color coding
- Click sources to view details

---

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```ini
# AI/ML APIs
GALILEO_API_KEY=gal_live_xxx
OPENAI_API_KEY=sk-proj-xxx
TAVILY_API_KEY=tvly-xxx
PINECONE_API_KEY=pcsk_xxx

# Authentication
CLERK_SECRET_KEY=sk_live_xxx

# Database
DATABASE_URL=sqlite:///./research_agent.db

# Server
PORT=8000
HOST=0.0.0.0
```

**Frontend (.env.local)**
```ini
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Pinecone Setup

1. Create index: `research-agent-rag`
2. Dimensions: 1536
3. Metric: cosine
4. Cloud: Serverless (recommended)
5. Namespaces automatically created per user

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check Python version
python --version  # Should be 3.11+

# Verify dependencies
pip list | grep -E "langchain|openai|galileo|fastapi"

# Test API keys
python verify_setup.py

# Check port availability
lsof -ti:8000  # Should be empty
```

### Frontend Build Errors

```bash
# Clear Next.js cache
rm -rf .next node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

### RAG Not Retrieving Documents

```bash
# Verify documents in Pinecone
# Check namespace: user_<clerk_user_id>_docs

# Verify document upload succeeded
curl http://localhost:8000/documents

# Check backend logs
tail -f /tmp/fastapi-server.log | grep "Retrieved"
```

### Galileo Not Logging

```bash
# Verify API key
echo $GALILEO_API_KEY

# Check project exists
# Visit https://app.galileo.ai/

# Verify SDK version
pip show galileo | grep Version

# Test connection
python -c "from galileo.logger import GalileoLogger; logger = GalileoLogger(project='test'); print('Connected!')"
```

### Authentication Issues

```bash
# Verify Clerk keys match
grep CLERK .env
grep CLERK .env.local

# Check JWT token
# Open browser dev tools → Application → Cookies → __session

# Test backend auth
curl -H "Authorization: Bearer $JWT_TOKEN" http://localhost:8000/documents
```

---

## 📊 Performance Metrics

### Typical Research Times

| Step | Average | Min | Max |
|------|---------|-----|-----|
| Plan | 12s | 11s | 16s |
| RAG Retrieval | 0.3s | 0.1s | 0.5s |
| Search | 14s | 10s | 17s |
| Curate | <0.1s | <0.1s | <0.1s |
| Analyze | 16s | 15s | 19s |
| Synthesize | 12s | 11s | 13s |
| Validate | 2.5s | 1.5s | 3.5s |
| **Total** | **57s** | **49s** | **66s** |

### Quality Scores (1-10 scale)

- Plan Quality: 8.8/10
- Search Relevance: 7.5/10
- Analysis Completeness: 8.9/10
- Answer Quality: 9.1/10
- Grounding Score: 9.3/10

### Cost Estimates (per query)

- OpenAI GPT-4o-mini: ~$0.02-0.04
- OpenAI Embeddings: ~$0.0001
- Tavily Search: ~$0.001
- Pinecone: ~$0.0001
- **Total: ~$0.02-0.04 per research query**

---

## 🚢 Deployment

### Backend (Railway/Render)

```bash
# 1. Create new service
# 2. Connect GitHub repo
# 3. Set environment variables
# 4. Build command: pip install -r requirements.txt
# 5. Start command: python api_server.py
```

### Frontend (Vercel)

```bash
# 1. Import GitHub repo
# 2. Set environment variables
# 3. Build command: npm run build
# 4. Output directory: .next
# 5. Deploy
```

### Database Migration

```bash
# For production, switch to PostgreSQL
# Update DATABASE_URL in .env
# Run migrations
alembic upgrade head
```

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch
2. Make changes
3. Test locally (both frontend and backend)
4. Run linters:
   ```bash
   # Backend
   black agent.py
   flake8 .

   # Frontend
   npm run lint
   ```
5. Commit with clear messages
6. Create pull request

### Code Standards

- **Python**: Black formatting, type hints, docstrings
- **TypeScript**: ESLint, Prettier, explicit types
- **Git**: Conventional commits (feat:, fix:, docs:)

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Galileo** - Observability platform
- **Clerk** - Authentication service
- **Tavily** - Search API
- **Pinecone** - Vector database
- **OpenAI** - Language models and embeddings
- **Vercel** - Next.js framework

---

## 📞 Support

- **Issues**: [GitHub Issues](your-repo-url/issues)
- **Galileo Docs**: https://v2docs.galileo.ai/
- **Clerk Docs**: https://clerk.com/docs

---

## 🎯 Roadmap

### Completed ✅
- [x] Multi-step research pipeline
- [x] Document RAG with Pinecone
- [x] Chat history RAG
- [x] Galileo observability
- [x] Clerk authentication
- [x] Modern UI with dark theme
- [x] Real-time pipeline visualization
- [x] Source attribution

### In Progress 🚧
- [ ] Parallel search queries
- [ ] Advanced caching
- [ ] Multi-language support

### Planned 📅
- [ ] Image search integration
- [ ] PDF export of research
- [ ] Research templates
- [ ] Team collaboration features
- [ ] API rate limiting
- [ ] Result caching

---

<div align="center">

**Built with ❤️ for Galileo**

[⬆ Back to Top](#galileo-tech-stack---ai-research-agent)

</div>
