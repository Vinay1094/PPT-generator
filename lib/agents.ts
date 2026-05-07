/**
 * OpenSpark - Multi-Agent System
 * Fully open-source, API-free presentation generation
 * No external LLM calls - uses deterministic rule-based agents
 */

import {
  Deck,
  Slide,
  ContentBlock,
  ColorPalette,
  LayoutType,
  GenerateDeckRequest,
} from "./types";

// ─── Color palettes ───────────────────────────────────────────────────────────

const PALETTES: ColorPalette[] = [
  { primary: "#6366f1", secondary: "#4f46e5", accent: "#a5b4fc", background: "#0f172a", text: "#f1f5f9" },
  { primary: "#10b981", secondary: "#059669", accent: "#6ee7b7", background: "#022c22", text: "#ecfdf5" },
  { primary: "#f59e0b", secondary: "#d97706", accent: "#fcd34d", background: "#1c1917", text: "#fef3c7" },
  { primary: "#ef4444", secondary: "#dc2626", accent: "#fca5a5", background: "#1a0000", text: "#fff1f2" },
  { primary: "#3b82f6", secondary: "#2563eb", accent: "#93c5fd", background: "#0c1a2e", text: "#eff6ff" },
];

export function getColorPalette(topic: string): ColorPalette {
  const hash = topic.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTES[hash % PALETTES.length];
}

// ─── Layout selection ─────────────────────────────────────────────────────────

const LAYOUTS: LayoutType[] = ["title", "bullets", "split", "quote", "image", "closing"];

export function selectLayout(index: number, total: number): LayoutType {
  if (index === 0) return "title";
  if (index === total - 1) return "closing";
  return LAYOUTS[1 + (index % (LAYOUTS.length - 2))];
}

// ─── Research sources (static, no API) ───────────────────────────────────────

export function getResearchSources(topic: string): string[] {
  return [
    `Introduction to ${topic}`,
    `${topic}: Key Concepts and Frameworks`,
    `${topic} in Practice`,
    `Future of ${topic}`,
  ];
}

// ─── Topic templates ──────────────────────────────────────────────────────────

function getTopicTemplate(
  topic: string,
  slideIndex: number,
  total: number
): { title: string; bullets: string[] } {
  const templates = [
    { title: `Introduction to ${topic}`, bullets: [`What is ${topic}?`, `Why ${topic} matters`, `Key principles of ${topic}`] },
    { title: `Core Concepts`, bullets: [`Foundational ideas`, `Building blocks`, `Essential terminology`] },
    { title: `How It Works`, bullets: [`Step-by-step process`, `Underlying mechanisms`, `Real-world workflow`] },
    { title: `Key Benefits`, bullets: [`Efficiency gains`, `Cost reduction`, `Quality improvements`, `Competitive advantage`] },
    { title: `Challenges & Solutions`, bullets: [`Common obstacles`, `Proven strategies`, `Lessons learned`] },
    { title: `Real-World Examples`, bullets: [`Industry case studies`, `Success stories`, `Measurable outcomes`] },
    { title: `Best Practices`, bullets: [`Proven approaches`, `Expert recommendations`, `Implementation tips`] },
    { title: `Future Outlook`, bullets: [`Emerging trends`, `Upcoming innovations`, `Market predictions`] },
    { title: `Getting Started`, bullets: [`First steps`, `Required resources`, `Quick wins`] },
    { title: `Summary & Next Steps`, bullets: [`Key takeaways`, `Action items`, `Further reading`] },
  ];
  return templates[slideIndex % templates.length];
}

// ─── Content block builders ───────────────────────────────────────────────────

function buildTitleSlide(topic: string, palette: ColorPalette): ContentBlock[] {
  return [
    { type: "heading", content: topic },
    { type: "subheading", content: `A comprehensive overview` },
  ];
}

function buildBulletSlide(title: string, bullets: string[]): ContentBlock[] {
  return [
    { type: "heading", content: title },
    { type: "bullets", content: bullets },
  ];
}

function buildClosingSlide(topic: string): ContentBlock[] {
  return [
    { type: "heading", content: `Thank You` },
    { type: "subheading", content: `Questions about ${topic}?` },
    { type: "text", content: `Let's continue the conversation.` },
  ];
}

function buildQuoteSlide(topic: string): ContentBlock[] {
  return [
    { type: "heading", content: "Key Insight" },
    { type: "quote", content: `The future belongs to those who master ${topic}.` },
  ];
}

function buildSplitSlide(title: string, bullets: string[]): ContentBlock[] {
  const half = Math.ceil(bullets.length / 2);
  return [
    { type: "heading", content: title },
    { type: "bullets", content: bullets.slice(0, half) },
    { type: "bullets", content: bullets.slice(half) },
  ];
}

// ─── Slide builder ────────────────────────────────────────────────────────────

function buildSlide(
  topic: string,
  slideIndex: number,
  totalSlides: number,
  palette: ColorPalette
): Slide {
  const layout = selectLayout(slideIndex, totalSlides);
  const template = getTopicTemplate(topic, slideIndex, totalSlides);
  const now = new Date().toISOString();

  let content: ContentBlock[];
  switch (layout) {
    case "title":
      content = buildTitleSlide(topic, palette);
      break;
    case "closing":
      content = buildClosingSlide(topic);
      break;
    case "quote":
      content = buildQuoteSlide(topic);
      break;
    case "split":
      content = buildSplitSlide(template.title, template.bullets);
      break;
    default:
      content = buildBulletSlide(template.title, template.bullets);
  }

  return {
    id: `slide-${slideIndex + 1}`,
    title: template.title,
    layout,
    content,
    notes: `Speaker notes for slide ${slideIndex + 1}: ${template.title}`,
  };
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

export function runResearchFirstPipeline(request: GenerateDeckRequest): Deck {
  const { topic, slideCount = 8 } = request;
  const palette = getColorPalette(topic);
  const now = new Date().toISOString();

  const slides: Slide[] = Array.from({ length: slideCount }, (_, i) =>
    buildSlide(topic, i, slideCount, palette)
  );

  return {
    title: topic,
    topic,
    slides,
    colorPalette: palette,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

// ─── AI Edit agent (rule-based, API-free) ─────────────────────────────────────

function applyInstruction(slide: Slide, instruction: string): Slide {
  const lower = instruction.toLowerCase();

  // Simplify / make concise
  if (lower.includes("concis") || lower.includes("shorter") || lower.includes("simpl")) {
    return {
      ...slide,
      content: slide.content.map((block) => {
        if (block.type === "bullets" && Array.isArray(block.content)) {
          return { ...block, content: (block.content as string[]).slice(0, 3) };
        }
        if (block.type === "text" && typeof block.content === "string") {
          const sentences = (block.content as string).split(".").filter(Boolean);
          return { ...block, content: sentences.slice(0, 2).join(".") + "." };
        }
        return block;
      }),
    };
  }

  // Add more detail / expand
  if (lower.includes("more detail") || lower.includes("expand") || lower.includes("elaborat")) {
    return {
      ...slide,
      content: slide.content.map((block) => {
        if (block.type === "bullets" && Array.isArray(block.content)) {
          const extra = ["Additional context", "Supporting evidence", "Key consideration"];
          return { ...block, content: [...(block.content as string[]), ...extra] };
        }
        return block;
      }),
    };
  }

  // Change layout to bullets
  if (lower.includes("bullet") || lower.includes("list")) {
    const headingBlock = slide.content.find((b) => b.type === "heading");
    return {
      ...slide,
      layout: "bullets" as LayoutType,
      content: [
        headingBlock || { type: "heading" as const, content: slide.title },
        { type: "bullets", content: ["Key point 1", "Key point 2", "Key point 3"] },
      ],
    };
  }

  // Change to quote layout
  if (lower.includes("quote") || lower.includes("insight")) {
    return {
      ...slide,
      layout: "quote" as LayoutType,
      content: [
        { type: "heading" as const, content: "Key Insight" },
        { type: "quote", content: `Insight about ${slide.title}` },
      ],
    };
  }

  // Add a note
  if (lower.includes("note") || lower.includes("speaker")) {
    return { ...slide, notes: instruction };
  }

  // Default: update the title to reflect instruction
  return {
    ...slide,
    content: slide.content.map((block) =>
      block.type === "subheading"
        ? { ...block, content: `Updated: ${instruction.slice(0, 60)}` }
        : block
    ),
  };
}

export function agentEdit(deck: Deck, slideIndex: number, instruction: string): Deck {
  if (slideIndex < 0 || slideIndex >= deck.slides.length) {
    throw new Error(`Invalid slide index: ${slideIndex}. Deck has ${deck.slides.length} slides.`);
  }

  const updatedSlides = deck.slides.map((slide, i) =>
    i === slideIndex ? applyInstruction(slide, instruction) : slide
  );

  return {
    ...deck,
    slides: updatedSlides,
    updatedAt: new Date().toISOString(),
  };
}
