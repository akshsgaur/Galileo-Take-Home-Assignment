# Galileo Research Agent - Web Interface

Beautiful, distinctive frontend for the Multi-Step Research Agent built with Next.js 15, TypeScript, Tailwind CSS, and Framer Motion.

## 🎨 Design Philosophy

This interface breaks away from generic AI aesthetics with:

- **Typography**: Crimson Pro (serif headings) + Space Mono (monospace details) for an academic-meets-modern feel
- **Color Palette**: Deep navy/charcoal backgrounds with warm amber/gold accents (no purple gradients!)
- **Motion**: Staggered reveals, pulse effects, and smooth transitions using Framer Motion
- **Backgrounds**: Subtle grid patterns creating depth and atmosphere
- **Theme**: Dark theme with paper texture overlay - like researching in a modern library at night

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+ (for backend)
- Running Python Research Agent API server

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

Create `.env.local` file:

```bash
# Python backend URL (default: http://localhost:8000/research)
PYTHON_BACKEND_URL=http://localhost:8000/research
```

## 🏗️ Project Structure

```
research-agent-ui/
├── app/
│   ├── api/
│   │   └── research/
│   │       └── route.ts          # API endpoint that calls Python backend
│   ├── globals.css               # Tailwind + custom styles
│   ├── layout.tsx                # Root layout with fonts
│   └── page.tsx                  # Main page
├── components/
│   └── ResearchInterface.tsx     # Main UI component with step tracking
├── public/                       # Static assets
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Google Fonts** | Crimson Pro + Space Mono |

## 🎯 Features

### Real-Time Step Tracking

Watch the research process unfold in real-time:

1. **Planning** - Research strategy generation
2. **Searching** - Web search for sources
3. **Analyzing** - Insight extraction
4. **Synthesizing** - Final answer creation

Each step shows:
- ⏱ Latency in seconds
- ⭐ Quality score (1-10)
- 📝 Step-specific content (plan, insights)

### Responsive Design

- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly interactions

### Animations

- Fade-in page load
- Staggered step reveals
- Pulse effects during processing
- Smooth state transitions
- Shimmer effects on active steps

## 🔌 Backend Integration

### Running the Python API Server

```bash
# Navigate to Python backend
cd ../research-agent

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start the FastAPI server
python api_server.py
```

The API server will run on `http://localhost:8000` with:
- API endpoint: `POST /research`
- Health check: `GET /health`
- Interactive docs: `http://localhost:8000/docs`

### API Request/Response

**Request:**
```json
{
  "question": "What are the latest trends in AI observability?"
}
```

**Response:**
```json
{
  "question": "What are the latest trends in AI observability?",
  "answer": "Detailed answer here...",
  "plan": "Research plan generated...",
  "insights": "Key insights extracted...",
  "metrics": [
    {
      "step": "plan",
      "latency": 2.1,
      "quality_score": 8,
      "reasoning": "..."
    }
    // ... more metrics
  ]
}
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Next.js frontend"
   git push
   ```

2. **Deploy on Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js configuration
   - Set environment variable: `PYTHON_BACKEND_URL`
   - Deploy!

3. **Backend Hosting Options**
   - Deploy Python API to Railway, Render, or Fly.io
   - Update `PYTHON_BACKEND_URL` to production URL
   - Ensure CORS is configured for your Vercel domain

### Environment Variables

For production, set:

```bash
PYTHON_BACKEND_URL=https://your-python-api.railway.app/research
```

## 🎨 Customization

### Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  'parchment': '#F4EFE3',  // Light text color
  'ink': '#1A1410',        // Dark text on buttons
  'amber': {
    // Custom amber shades
  }
}
```

### Fonts

Change in `tailwind.config.ts` and `app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font');
```

### Animations

Modify timing in `tailwind.config.ts`:

```typescript
animation: {
  'fade-in': 'fadeIn 0.6s ease-out forwards',
  // Add custom animations
}
```

## 🐛 Troubleshooting

### "Research failed" Error

**Cause**: Python backend not running or not accessible

**Fix**:
1. Start Python API: `python api_server.py`
2. Verify it's running: visit `http://localhost:8000`
3. Check `.env.local` has correct `PYTHON_BACKEND_URL`

### CORS Errors

**Cause**: Python backend not allowing requests from frontend

**Fix**: Check `api_server.py` CORS settings include your frontend URL

### Styling Not Working

**Cause**: Tailwind not processing CSS

**Fix**:
```bash
# Rebuild
npm run build
npm run dev
```

## 📸 Screenshots

*(Add screenshots of your distinctive UI here)*

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - See [LICENSE](../research-agent/README.md) for details

## 🔗 Related

- **Python Backend**: [../research-agent](../research-agent/)
- **Galileo Platform**: [https://galileo.ai](https://galileo.ai)

---

**Built with ❤️ using Next.js • Deployed on Vercel**
