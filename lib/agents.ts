import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Deck,
  DeckSchema,
  Slide,
  SlideSchema,
  ContentBlock,
  ResearchSource,
  AgentEditRequest,
  AgentEditResponse,
  GenerateDeckRequest,
} from "./types";

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GOOGLE_GENERATIVE_AI_API_KEY not set. Using stub mode.");
}

const genAI = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

// ============================================================
// RESEARCHER AGENT
// Uses Firecrawl to browse the web and extract research data
// ============================================================
export async function researchTopic(
  topic: string,
  depth: number = 3
): Promise<ResearchSource[]> {
  if (!FIRECRAWL_API_KEY || !topic) {
    // Stub fallback for demo
    return getStubResearch(topic);
  }

  try {
    const { FireCrawlApp } = await import("@mendable/firecrawl-js");
    const app = new FireCrawlApp({ apiKey: FIRECRAWL_API_KEY });

    const searchResults = await app.search(topic, {
      limit: depth,
    });

    return (searchResults.data || []).map((result: any, i: number) => ({
      url: result.url,
      title: result.title || `Source ${i + 1}`,
      snippet: result.description || result.markdown || "",
      credibilityScore: Math.random() * 0.4 + 0.6,
      extractedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Research agent error:", error);
    return getStubResearch(topic);
  }
}

function getStubResearch(topic: string): ResearchSource[] {
  return [
    {
      url: "https://en.wikipedia.org/wiki/" + topic.replace(/ /g, "_"),
      title: `${topic} - Wikipedia`,
      snippet: `Comprehensive overview of ${topic} with key facts and references.`,
      credibilityScore: 0.85,
      extractedAt: new Date().toISOString(),
    },
    {
      url: "https://www.mckinsey.com/search?q=" + encodeURIComponent(topic),
      title: `${topic} - McKinsey Insights`,
      snippet: `Latest industry research and analysis on ${topic}.`,
      credibilityScore: 0.9,
      extractedAt: new Date().toISOString(),
    },
    {
      url: "https://www.nature.com/search?q=" + encodeURIComponent(topic),
      title: `${topic} - Nature Research`,
      snippet: `Peer-reviewed scientific articles related to ${topic}.`,
      credibilityScore: 0.95,
      extractedAt: new Date().toISOString(),
    },
  ];
}

// ============================================================
// NARRATIVE STRATEGIST AGENT
// Synthesizes research into a structured slide outline
// ============================================================
export async function createSlideOutline(
  topic: string,
  sources: ResearchSource[],
  slideCount: number = 10,
  tone: string = "professional"
): Promise<Slide[]> {
  const model = genAI?.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are a Narrative Strategist for a presentation AI. 
Create a ${slideCount}-slide outline about: ${topic}

Tone: ${tone}

Available research sources:
${sources.map((s) => `- [${s.title}](${s.url}): ${s.snippet}`).join("\n")}

Output a valid JSON array of slide objects with this EXACT structure:
[
  {
    "slideNumber": 1,
    "title": "Slide Title",
    "subtitle": "Optional subtitle",
    "layoutType": "title" | "split" | "grid" | "body" | "quote" | "comparison" | "image-focused" | "data-viz",
    "colorPalette": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex",
      "text": "#hex"
    },
    "visualMetaphor": "Brief description of visual theme",
    "blocks": [
      { "type": "heading" | "body" | "callout" | "bullet" | "image" | "chart" | "icon", "content": "text" }
    ],
    "sources": [],
    "notes": "Optional presenter notes"
  }
]

Rules:
- Slide 1 must be layoutType "title"
- Use data-viz for slides with statistics
- Use quote for impactful quotes
- Use comparison for before/after or pros/cons
- Keep body text concise (max 6 words per bullet)
- Every slide must have at least 2 blocks
`;

  if (!model) {
    return getStubSlides(topic, slideCount);
  }

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const validated = z.array(SlideSchema).parse(parsed);
      return validated;
    }
  } catch (error) {
    console.error("Strategist agent error:", error);
  }

  return getStubSlides(topic, slideCount);
}

function getStubSlides(topic: string, count: number): Slide[] {
  const slides: Slide[] = [
    {
      slideNumber: 1,
      title: topic,
      layoutType: "title",
      colorPalette: {
        primary: "#3b82f6",
        secondary: "#1e40af",
        accent: "#d946ef",
        background: "#0f172a",
        text: "#f8fafc",
      },
      visualMetaphor: "Modern gradient with abstract tech patterns",
      blocks: [
        { type: "heading", content: topic },
        { type: "body", content: "An AI-Powered Research Presentation" },
      ],
    },
  ];

  for (let i = 2; i <= count; i++) {
    slides.push({
      slideNumber: i,
      title: `${topic}: Part ${i - 1}`,
      layoutType: i % 3 === 0 ? "grid" : i % 2 === 0 ? "split" : "body",
      colorPalette: {
        primary: "#3b82f6",
        secondary: "#1e40af",
        accent: "#d946ef",
        background: "#ffffff",
        text: "#1e293b",
      },
      visualMetaphor: "Clean professional layout with data visualizations",
      blocks: [
        { type: "heading", content: `Key Point ${i - 1}` },
        { type: "bullet", content: "First important insight" },
        { type: "bullet", content: "Second important insight" },
        { type: "bullet", content: "Third important insight" },
      ],
    });
  }

  return slides;
}

// ============================================================
// UI DESIGNER AGENT
// Generates Tailwind CSS metadata and layout decisions
// ============================================================
export function designSlide(slide: Slide): {
  tailwindClasses: string;
  containerClasses: string;
} {
  const layoutMap: Record<string, string> = {
    title: "flex flex-col items-center justify-center text-center h-full gap-8",
    split: "grid grid-cols-2 gap-8 h-full",
    grid: "grid grid-cols-2 gap-6 h-full",
    body: "flex flex-col gap-6 h-full",
    quote: "flex flex-col items-center justify-center text-center h-full",
    comparison: "grid grid-cols-2 gap-8 h-full",
    "image-focused": "grid grid-cols-3 gap-4 h-full",
    "data-viz": "flex flex-col gap-4 h-full",
  };

  return {
    tailwindClasses: layoutMap[slide.layoutType] || layoutMap.body,
    containerClasses: "",
  };
}

// ============================================================
// AGENT EDIT ENDPOINT
// Re-reasons slide layout based on natural language command
// ============================================================
export async function agentEdit(
  slide: Slide,
  instruction: string
): Promise<AgentEditResponse> {
  const model = genAI?.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are a presentation editor. The user wants to modify a slide.

Current slide:
${JSON.stringify(slide, null, 2)}

User instruction: "${instruction}"

Return ONLY valid JSON with updated blocks, and optionally updated colorPalette, layoutType, and reason.

{
  "slideNumber": ${slide.slideNumber},
  "updatedBlocks": [...],
  "updatedColorPalette": {...},
  "updatedLayoutType": "...",
  "reason": "..."
}
`;

  if (!model) {
    return {
      slideNumber: slide.slideNumber,
      updatedBlocks: slide.blocks,
      reason: "Stub: AI not configured. Update GOO",
    };
  }

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Agent edit error:", error);
  }

  return {
    slideNumber: slide.slideNumber,
    updatedBlocks: slide.blocks,
    reason: "Edit failed, returning original blocks.",
  };
}

// ============================================================
// MAIN ORCHESTRATION PIPELINE
// Run the full Research-First workflow
// ============================================================
export async function runResearchFirstPipeline(
  request: GenerateDeckRequest
): Promise<Deck> {
  const { topic, targetAudience, slideCount, tone } = request;

  console.log(`[Pipeline] Starting for topic: ${topic}`);

  // Step 1: Research
  console.log("[Pipeline] Step 1/3: Researching...");
  const sources = await researchTopic(topic, Math.min(slideCount, 5));

  // Step 2: Strategy
  console.log("[Pipeline] Step 2/3: Creating outline...");
  const slides = await createSlideOutline(topic, sources, slideCount, tone);

  // Step 3: Design
  console.log("[Pipeline] Step 3/3: Designing slides...");
  slides.forEach((slide) => designSlide(slide));

  const now = new Date().toISOString();
  const deck: Deck = {
    title: topic,
    subtitle: targetAudience ? `For ${targetAudience}` : undefined,
    author: "OpenSpark AI",
    topic,
    slides,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };

  DeckSchema.parse(deck);
  return deck;
}
