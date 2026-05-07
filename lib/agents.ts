/**
 * OpenSpark - Multi-Agent System
 * Fully open-source, API-free presentation generation
 * No external LLM calls - uses deterministic rule-based agents
 */

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
  ColorPalette,
  LayoutType,
} from "./types";

// ============================================================
// COLOR PALETTE GENERATOR (API-FREE)
// Generates beautiful color schemes algorithmically
// ============================================================
const PALETTES: Record<string, ColorPalette> = {
  professional: {
    primary: "#1e40af",
    secondary: "#3b82f6",
    accent: "#60a5fa",
    background: "#f8fafc",
    text: "#1e293b",
  },
  dark: {
    primary: "#3b82f6",
    secondary: "#1e40af",
    accent: "#d946ef",
    background: "#0f172a",
    text: "#f8fafc",
  },
  light: {
    primary: "#0ea5e9",
    secondary: "#0284c7",
    accent: "#38bdf8",
    background: "#ffffff",
    text: "#334155",
  },
  creative: {
    primary: "#8b5cf6",
    secondary: "#a78bfa",
    accent: "#c4b5fd",
    background: "#fdf4ff",
    text: "#4c1d95",
  },
  nature: {
    primary: "#059669",
    secondary: "#10b981",
    accent: "#34d399",
    background: "#f0fdf4",
    text: "#064e3b",
  },
  warm: {
    primary: "#d97706",
    secondary: "#f59e0b",
    accent: "#fbbf24",
    background: "#fffbeb",
    text: "#78350f",
  },
};

function getColorPalette(tone: string = "professional"): ColorPalette {
  const key = tone.toLowerCase();
  return PALETTES[key] || PALETTES.professional;
}

// ============================================================
// LAYOUT SELECTOR (API-FREE)
// Chooses slide layout based on content type
// ============================================================
function selectLayout(slideNumber: number, totalSlides: number): LayoutType {
  if (slideNumber === 1) return "title";
  if (slideNumber === totalSlides) return "title";

  const contentTypes: LayoutType[] = [
    "split",
    "grid",
    "body",
    "quote",
    "comparison",
    "data-viz",
    "image-focused",
  ];

  return contentTypes[(slideNumber - 2) % contentTypes.length];
}

// ============================================================
// RESEARCH SIMULATOR (API-FREE)
// Simulates web research with curated knowledge
// ============================================================
const KNOWLEDGE_BASE: Record<string, ResearchSource[]> = {
  "default": [
    {
      url: "https://en.wikipedia.org",
      title: "Wikipedia - General Reference",
      snippet: "Comprehensive encyclopedia with verified information.",
      credibilityScore: 0.85,
      extractedAt: new Date().toISOString(),
    },
    {
      url: "https://scholar.google.com",
      title: "Google Scholar",
      snippet: "Peer-reviewed academic research and papers.",
      credibilityScore: 0.95,
      extractedAt: new Date().toISOString(),
    },
    {
      url: "https://www.nature.com",
      title: "Nature Research",
      snippet: "Leading scientific journal for research articles.",
      credibilityScore: 0.92,
      extractedAt: new Date().toISOString(),
    },
  ],
  ai: [
    {
      url: "https://ai.google/education",
      title: "Google AI Education",
      snippet: "Comprehensive AI learning resources and courses.",
      credibilityScore: 0.9,
      extractedAt: new Date().toISOString(),
    },
    {
      url: "https://www.deeplearning.ai",
      title: "DeepLearning.AI",
      snippet: "Andrew Ng's AI courses and research.",
      credibilityScore: 0.95,
      extractedAt: new Date().toISOString(),
    },
  ],
  business: [
    {
      url: "https://www.mckinsey.com",
      title: "McKinsey Insights",
      snippet: "Management consulting insights and research.",
      credibilityScore: 0.88,
      extractedAt: new Date().toISOString(),
    },
    {
      url: "https://hbr.org",
      title: "Harvard Business Review",
      snippet: "Business management and strategy articles.",
      credibilityScore: 0.9,
      extractedAt: new Date().toISOString(),
    },
  ],
};

function getResearchSources(topic: string): ResearchSource[] {
  const key = Object.keys(KNOWLEDGE_BASE).find((k) =>
    topic.toLowerCase().includes(k)
  );
  return key ? KNOWLEDGE_BASE[key] : KNOWLEDGE_BASE["default"];
}

// ============================================================
// CONTENT GENERATOR (API-FREE)
// Generates slide content based on topic templates
// ============================================================
const CONTENT_TEMPLATES: Record<string, string[][]> = {
  agenticAI: [
    ["What is Agentic AI?", "AI systems that plan, reason, and act autonomously.", "Bullet:Reasoning & Planning,Bullet:Tool Use,Bullet:Memory & Context"],
    ["Agent Architecture", "Observe → Think → Act loop", "Callout:Agents can use external tools and APIs"],
    ["Key Capabilities", "Core features of autonomous agents", "Bullet:Multi-step Tasks,Bullet:Context Awareness,Bullet:Self-Correction"],
    ["Use Cases", "Real-world applications", "Bullet:Customer Support,Bullet:Data Analysis,Bullet:Workflow Automation"],
    ["Market Trends", "Industry growth and adoption", "Callout:$500B+ market by 2030"],
    ["Challenges", "Key obstacles and concerns", "Bullet:Ethical AI,Bullet:Transparency,Bullet:Control & Safety"],
    ["Future Outlook", "Where agentic AI is headed", "Bullet:Multi-Agent Systems,Bullet:Self-Improving Agents,Bullet:AGI Pathway"],
    ["Getting Started", "Tools and frameworks", "Bullet:LangChain,Bullet:CrewAI,Bullet:AutoGen"],
  ],
  default: [
    ["Introduction", "Key overview of the topic", "Bullet:Context,Bullet:Importance,Bullet:Scope"],
    ["Background", "Historical context and origins", "Bullet:Evolution,Bullet:Milestones,Bullet:Current State"],
    ["Core Concepts", "Fundamental ideas and principles", "Bullet:Concept 1,Bullet:Concept 2,Bullet:Concept 3"],
    ["Methodology", "How it works in practice", "Bullet:Process 1,Bullet:Process 2,Bullet:Process 3"],
    ["Applications", "Real-world use cases", "Bullet:Industry A,Bullet:Industry B,Bullet:Industry C"],
    ["Benefits", "Why it matters", "Bullet:Benefit 1,Bullet:Benefit 2,Bullet:Benefit 3"],
    ["Challenges", "Obstacles and limitations", "Bullet:Challenge 1,Bullet:Challenge 2,Bullet:Challenge 3"],
    ["Future", "Trends and predictions", "Bullet:Trend 1,Bullet:Trend 2,Bullet:Outlook"],
  ],
};

function getTopicTemplate(topic: string): string[][] {
  const key = Object.keys(CONTENT_TEMPLATES).find((k) =>
    topic.toLowerCase().includes(k)
  );
  return key ? CONTENT_TEMPLATES[key] : CONTENT_TEMPLATES["default"];
}

function parseBlock(type: string, content: string): ContentBlock {
  if (type === "Bullet") {
    return { type: "bullet", content: content.replace(/^Bullet:/, "") };
  }
  if (type === "Callout") {
    return { type: "callout", content: content.replace(/^Callout:/, "") };
  }
  if (type === "Heading") {
    return { type: "heading", content: content };
  }
  return { type: "body", content: content };
}

function generateSlideContent(
  slideNumber: number,
  layoutType: LayoutType,
  templateRow: string[]
): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  if (slideNumber === 1) {
    blocks.push({ type: "heading", content: templateRow[0] });
    blocks.push({ type: "body", content: templateRow[1] });
    return blocks;
  }

  // Parse the content row
  const contentStr = templateRow[2] || "";
  const items = contentStr.split(",");

  items.forEach((item) => {
    const [type, ...contentParts] = item.split(":");
    const content = contentParts.join(":").trim();
    if (content) blocks.push(parseBlock(type || "Body", content));
  });

  // Add heading if not present
  if (!blocks.some((b) => b.type === "heading") && templateRow[0]) {
    blocks.unshift({ type: "heading", content: templateRow[0] });
  }

  if (!blocks.some((b) => b.type === "body") && templateRow[1]) {
    blocks.splice(1, 0, { type: "body", content: templateRow[1] });
  }

  return blocks;
}

// ============================================================
// DESIGNER (API-FREE)
// Generates Tailwind CSS classes for each layout
// ============================================================
const LAYOUT_MAP: Record<string, string> = {
  title: "flex flex-col items-center justify-center text-center h-full gap-8",
  split: "grid grid-cols-2 gap-8 h-full",
  grid: "grid grid-cols-2 gap-6 h-full",
  body: "flex flex-col gap-6 h-full",
  quote: "flex flex-col items-center justify-center text-center h-full",
  comparison: "grid grid-cols-2 gap-8 h-full",
  "image-focused": "grid grid-cols-3 gap-4 h-full",
  "data-viz": "flex flex-col gap-4 h-full",
};

function designSlide(slide: Slide): string {
  return LAYOUT_MAP[slide.layoutType] || LAYOUT_MAP.body;
}

// ============================================================
// AGENT EDIT (API-FREE)
// Rule-based slide editing with pattern matching
// ============================================================
const EDIT_RULES: Record<string, (slide: Slide) => Partial<Slide>> = {
  professional: (slide) => ({
    colorPalette: PALETTES.professional,
    visualMetaphor: "Professional corporate design with clean lines",
  }),
  dark: (slide) => ({
    colorPalette: PALETTES.dark,
    visualMetaphor: "Dark theme with modern aesthetics",
  }),
  creative: (slide) => ({
    colorPalette: PALETTES.creative,
    visualMetaphor: "Creative design with vibrant colors",
  }),
  simple: (slide) => ({
    layoutType: "body",
    colorPalette: PALETTES.light,
    visualMetaphor: "Minimalist clean layout",
  }),
  detailed: (slide) => ({
    layoutType: "grid",
    visualMetaphor: "Detailed information layout with multiple sections",
  }),
};

function interpretInstruction(instruction: string): string {
  const instr = instruction.toLowerCase();
  if (instr.includes("professional")) return "professional";
  if (instr.includes("dark")) return "dark";
  if (instr.includes("creative")) return "creative";
  if (instr.includes("simple")) return "simple";
  if (instr.includes("detailed")) return "detailed";
  return "";
}

function agentEdit(slide: Slide, instruction: string): AgentEditResponse {
  const ruleKey = interpretInstruction(instruction);

  if (!ruleKey) {
    return {
      slideNumber: slide.slideNumber,
      updatedBlocks: slide.blocks,
      reason: "No matching edit rule found. Try: professional, dark, creative, simple, or detailed",
    };
  }

  const updater = EDIT_RULES[ruleKey];
  const updates = updater(slide);

  return {
    slideNumber: slide.slideNumber,
    updatedBlocks: slide.blocks,
    updatedColorPalette: updates.colorPalette,
    updatedLayoutType: updates.layoutType,
    reason: `Applied ${ruleKey} style transformation`,
  };
}

// ============================================================
// MAIN PIPELINE (API-FREE)
// Orchestrates all agents without external APIs
// ============================================================
export function runResearchFirstPipeline(
  request: GenerateDeckRequest
): Deck {
  const { topic, targetAudience, slideCount, tone } = request;

  // Step 1: Research (simulated)
  const sources = getResearchSources(topic);

  // Step 2: Strategy (template-based)
  const template = getTopicTemplate(topic);
  const palette = getColorPalette(tone);

  // Step 3: Design (layout selection)
  const adjustedCount = Math.min(slideCount, template.length + 2);

  const slides: Slide[] = [];

  for (let i = 1; i <= adjustedCount; i++) {
    const layoutType = selectLayout(i, adjustedCount);
    const templateRow =
      i === 1
        ? [topic, targetAudience || "Comprehensive overview", "Body:An AI-powered research presentation"]
        : i === adjustedCount
        ? ["Thank You", "Questions and Discussion", "Heading:Contact Information,Body:Openspark.ai"]
        : template[(i - 2) % template.length];

    const blocks = generateSlideContent(i, layoutType, templateRow);
    const isDark = layoutType === "title" && i === 1;

    slides.push({
      slideNumber: i,
      title: templateRow[0],
      subtitle: templateRow[1],
      layoutType,
      colorPalette: isDark ? PALETTES.dark : palette,
      visualMetaphor: `Auto-generated ${layoutType} layout theme`,
      blocks,
      sources: i <= 2 ? sources : undefined,
      notes: `Generated by OpenSpark for topic: ${topic}`,
    });
  }

  // Step 4: Design phase
  slides.forEach((slide) => designSlide(slide));

  // Validate and return
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

  return deck;
}

export { agentEdit, designSlide, getResearchSources };
