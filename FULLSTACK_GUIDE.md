# Full-Stack Research Agent - Complete Setup Guide

This guide shows you how to run the complete system: Python backend + Next.js frontend.

## 📁 Project Structure

```
galileo-tech-stack/
├── research-agent/           # Python backend (LangGraph + Galileo)
│   ├── agent.py             # Core research agent
│   ├── api_server.py        # FastAPI server (NEW!)
│   ├── evaluators.py        # LLM-as-judge
│   ├── tools.py             # Web search
│   └── requirements.txt     # Python dependencies
│
└── research-agent-ui/       # Next.js frontend (NEW!)
    ├── app/                 # Next.js app directory
    ├── components/          # React components
    ├── package.json         # Node dependencies
    └── README.md            # Frontend docs
```

## 🚀 Quick Start (Both Servers)

### Step 1: Set Up Python Backend

```bash
# Navigate to Python backend
cd research-agent

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your API keys to .env:
#   GALILEO_API_KEY=your-key-here
#   OPENAI_API_KEY=your-key-here
```

### Step 2: Set Up Next.js Frontend

```bash
# Navigate to frontend (open NEW terminal)
cd research-agent-ui

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Default backend URL is already configured
```

### Step 3: Start Both Servers

**Terminal 1 - Python API:**
```bash
cd research-agent
source venv/bin/activate
python api_server.py
```

Output:
```
================================================================================
🚀 Starting Research Agent API Server
================================================================================
Server will be available at: http://localhost:8000
API docs will be available at: http://localhost:8000/docs
Ready to accept requests from Next.js frontend
================================================================================
```

**Terminal 2 - Next.js Frontend:**
```bash
cd research-agent-ui
npm run dev
```

Output:
```
▲ Next.js 15.1.2
- Local:        http://localhost:3000
- Ready in 2.5s
```

### Step 4: Use the Application

1. Open http://localhost:3000 in your browser
2. Enter a research question
3. Click "Begin Research"
4. Watch the 4-step process unfold in real-time
5. View the final answer and metrics

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
│                     (Web Browser)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─ HTTP Request
                     ↓
┌─────────────────────────────────────────────────────────────┐
│               Next.js Frontend (Port 3000)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Components                                      │  │
│  │  - ResearchInterface.tsx                             │  │
│  │  - Step tracking                                     │  │
│  │  - Real-time updates                                 │  │
│  │  - Animations (Framer Motion)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Route: /api/research                            │  │
│  │  - Forwards requests to Python backend               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─ POST /research
                     ↓
┌─────────────────────────────────────────────────────────────┐
│            FastAPI Server (Port 8000)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  api_server.py                                        │  │
│  │  - CORS enabled                                      │  │
│  │  - Accepts research requests                         │  │
│  │  - Returns structured results                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  agent.py (ResearchAgent)                            │  │
│  │  - LangGraph workflow                                │  │
│  │  - 6 steps: Plan → Search → Curate → Analyze → Synthesize → Validate    │  │
│  │  - Galileo logging                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─ External APIs
                     ↓
┌─────────────────────────────────────────────────────────────┐
│  External Services                                          │
│  - OpenAI GPT-4o-mini                                      │
│  - Galileo Platform                                         │
│  - Tavily Search API                                        │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Configuration

### Python Backend (.env)

```bash
GALILEO_API_KEY=gal_live_your_key_here
OPENAI_API_KEY=sk-proj-your_key_here
```

### Next.js Frontend (.env.local)

```bash
PYTHON_BACKEND_URL=http://localhost:8000/research
```

## 📡 API Endpoints

### Python Backend (FastAPI)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Detailed health status |
| `/research` | POST | Execute research |
| `/docs` | GET | Interactive API documentation (Swagger UI) |

### Next.js Frontend

| Route | Description |
|-------|-------------|
| `/` | Main research interface |
| `/api/research` | API route (forwards to Python) |

## 🧪 Testing the Full Stack

### Test 1: Health Check

```bash
# Test Python backend
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "agent": "initialized",
  "galileo": "connected"
}
```

### Test 2: Research via API

```bash
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the latest trends in AI observability?"}'
```

### Test 3: Full UI Flow

1. Open http://localhost:3000
2. Enter question: "What are the latest trends in AI observability?"
3. Click "Begin Research"
4. Verify all 4 steps complete
5. Check final answer appears

## 🚢 Deployment

### Option 1: Separate Hosting

**Frontend (Vercel):**
1. Push code to GitHub
2. Import repository on Vercel
3. Set `PYTHON_BACKEND_URL` to production API URL
4. Deploy

**Backend (Railway/Render/Fly.io):**
1. Deploy `research-agent` directory
2. Set environment variables
3. Use `python api_server.py` as start command
4. Note the production URL

### Option 2: Monorepo Deployment

Use Vercel monorepo with Python serverless functions (requires Next.js API routes only, no separate Python server).

## 📊 Monitoring

### Galileo Dashboard

1. Visit https://app.galileo.ai
2. Select project: `research-agent-web`
3. Select log stream: `web-interface`
4. View all LLM calls, latency, and Luna metrics

### FastAPI Swagger UI

Visit http://localhost:8000/docs for interactive API documentation.

## 🐛 Troubleshooting

### Issue: "Research failed" in UI

**Diagnosis:**
- Check Python backend is running: `curl http://localhost:8000`
- Check browser console for errors
- Verify `.env.local` has correct backend URL

**Fix:**
```bash
# Restart Python backend
cd research-agent
python api_server.py

# Verify it's accessible
curl http://localhost:8000/health
```

### Issue: CORS errors

**Diagnosis:**
- Browser console shows CORS error
- Frontend can't connect to backend

**Fix:**
Check `api_server.py` CORS configuration includes:
```python
allow_origins=[
    "http://localhost:3000",  # Your frontend URL
]
```

### Issue: Styles not applying

**Diagnosis:**
- Page loads but looks unstyled
- Tailwind classes not working

**Fix:**
```bash
cd research-agent-ui
rm -rf .next
npm run dev
```

## 🎨 Design Features

The frontend features a distinctive aesthetic:

- **Dark Theme**: Deep navy backgrounds with amber accents
- **Typography**:
  - Crimson Pro (serif) for headings
  - Space Mono (monospace) for technical details
- **Animations**:
  - Staggered step reveals
  - Pulse effects during processing
  - Smooth state transitions
- **Layout**: Vertical timeline showing research progress
- **Backgrounds**: Subtle grid pattern + paper texture

## 🔒 Security Notes

- Never commit `.env` or `.env.local` files
- Both projects have `.gitignore` configured
- API keys are server-side only
- Frontend uses environment variables for backend URL

## 📚 Additional Resources

- **Frontend README**: [research-agent-ui/README.md](research-agent-ui/README.md)
- **Backend README**: [research-agent/README.md](research-agent/README.md)
- **Galileo Docs**: https://v2docs.galileo.ai
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com

---

## ✅ Success Checklist

Before deploying:

- [ ] Python backend runs successfully
- [ ] Next.js frontend runs successfully
- [ ] Can submit questions via UI
- [ ] All 4 steps complete
- [ ] Metrics display correctly
- [ ] Final answer appears
- [ ] Galileo logs are visible
- [ ] No console errors
- [ ] API health check passes
- [ ] Environment variables configured

---

**Built with Python, Next.js, and Galileo 🚀**
