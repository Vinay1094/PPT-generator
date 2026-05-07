# OpenSpark

> A free, open-source, high-performance alternative to Genspark for AI-powered presentation generation.

[![License](https://img.shields.io/github/license/Vinay1094/PPT-generator)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)

## Why OpenSpark?

OpenSpark replicates the Genspark experience with a fully open-source, self-hostable stack. It uses a **Research-First agentic workflow** that transforms deep web data into structured Tailwind CSS layouts, then mathematically maps them to native PowerPoint (.pptx) shapes.

## Features

- **Multi-Agent Orchestration**: Coordinated Researcher, Strategist, and Designer agents
- **Research-First Workflow**: Web browsing and source verification with Firecrawl + Composio
- **Content-Adaptive Design**: Dynamic slide layouts (Split, Grid, Title, Body, Quote, Comparison, Data-Viz)
- **Strict JSON Schema**: Pydantic-style validation with Zod for output consistency
- **Native PPTX Export**: Using `pptxgenjs` with font embedding and SVG vector support
- **AI Edit Workspace**: Natural language slide editing (`/api/agent-edit`)
- **Fact-Check Overlay**: Credibility scoring for research sources
- **Real-Time Preview**: 1280x720 (16:9) slide canvas in the browser

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Next.js 15 + React 19 |
| Multi-Agent | Custom orchestration with Gemini 2.0 Flash |
| Primary LLM | Google Gemini 1.5/2.0 Flash (free tier) |
| Research Tools | Firecrawl + Composio |
| Visual Engine | FLUX.2 [dev] (planned) |
| PPTX Converter | PptxGenJS + dom-to-pptx |
| Styling | Tailwind CSS |
| Type Safety | TypeScript + Zod |
| CI/CD | GitHub Actions + Vercel |

## Project Structure

```
PPT-generator/
├── app/
│   ├── api/
│   │   ├── generate/route.ts      # Multi-agent pipeline endpoint
│   │   ├── agent-edit/route.ts    # AI slide editing endpoint
│   │   └── export/route.ts        # PPTX download endpoint
│   ├── globals.css                 # Tailwind + slide canvas styles
│   ├── layout.tsx                  # Root layout + metadata
│   ├── page.tsx                    # Main editor UI
│   └── postcss.config.mjs
├── components/                     # (Planned) Reusable UI components
├── lib/
│   ├── agents.ts                   # Researcher, Strategist, Designer agents
│   ├── pptx.ts                     # PPTX export engine
│   ├── sample-data.ts              # Demo deck for testing
│   └── types.ts                    # Zod schemas for Deck, Slide, ContentBlock
├── .github/workflows/
│   └── ci.yml                      # Next.js build + Vercel deploy
├── .env.local.example
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Quick Start

### 1. Clone

```bash
git clone https://github.com/Vinay1094/PPT-generator.git
cd PPT-generator
```

### 2. Install

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your API keys:

| Variable | Description | Get it from |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key | [AI Studio](https://aistudio.google.com/apikey) |
| `FIRECRAWL_API_KEY` | Web research | [Firecrawl](https://www.firecrawl.dev) |
| `COMPOSIO_API_KEY` | Tool integration | [Composio](https://composio.dev) |
| `FLUX_API_KEY` | Image generation (optional) | Black Forest Labs |

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### The Three Agents

1. **Researcher Agent** - Uses Firecrawl to browse the web, extract raw data, statistics, and credible URLs with credibility scoring
2. **Narrative Strategist** - Synthesizes research into a 10-slide outline using Gemini 2.0 Flash with strict JSON output
3. **UI Designer Agent** - Generates Tailwind CSS metadata, chooses layouts based on content density

### The Pipeline

```
User Topic → Researcher (Firecrawl) → Strategist (Gemini) → Designer (Tailwind)
                    ↓                        ↓                    ↓
             Sources + Scores        Slide Outline JSON    CSS Classes + Layouts
                    └──────────────────────────────────────────────┘
                                    ↓
                           Render in 1280x720 Canvas
                                    ↓
                           Export to Native .pptx
```

## API Endpoints

### POST `/api/generate`

Generate a research-backed presentation deck.

```json
{
  "topic": "Agentic AI",
  "targetAudience": "Technical Team",
  "slideCount": 10,
  "tone": "professional"
}
```

### POST `/api/agent-edit`

Edit a slide using natural language.

```json
{
  "slideNumber": 1,
  "instruction": "make this slide more professional"
}
```

### POST `/api/export`

Export a deck to native PowerPoint.

```json
{
  "deck": { /* Deck JSON from /api/generate */ }
}
```

## Roadmap

- [ ] Real-time multi-agent coordination with CrewAI/LangGraph
- [ ] Firecrawl + Composio integration for live web research
- [ ] FLUX.2 LoRA integration for branded icons/infographics
- [ ] `dom-to-pptx` for pixel-perfect DOM-to-PPTX mapping
- [ ] SVG chart/vector support as editable PPTX shapes
- [ ] Font embedding for design consistency
- [ ] Collaborative editing with CRDT
- [ ] Deployed Vercel instance

## Contributing

Contributions are welcome! Please open an issue or submit a PR.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with Next.js 15, React 19, TypeScript, and Tailwind CSS by [Databloom AI and Tech](https://github.com/Vinay1094).
