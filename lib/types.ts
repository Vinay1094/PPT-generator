import { z } from "zod";

// Slide layout types
export const LayoutTypeSchema = z.enum([
  "title",
  "split",
  "grid",
  "body",
  "quote",
  "comparison",
  "image-focused",
  "data-viz",
]);

export type LayoutType = z.infer<typeof LayoutTypeSchema>;

// Color palette for each slide
export const ColorPaletteSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  text: z.string(),
});

export type ColorPalette = z.infer<typeof ColorPaletteSchema>;

// Individual content block within a slide
export const ContentBlockSchema = z.object({
  type: z.enum(["heading", "body", "callout", "bullet", "image", "chart", "icon"]),
  content: z.string(),
  style: z.record(z.string()).optional(),
  sourceUrl: z.string().url().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type ContentBlock = z.infer<typeof ContentBlockSchema>;

// Research source with fact-check metadata
export const ResearchSourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  snippet: z.string(),
  credibilityScore: z.number().min(0).max(1),
  extractedAt: z.string(),
});

export type ResearchSource = z.infer<typeof ResearchSourceSchema>;

// Individual slide definition
export const SlideSchema = z.object({
  slideNumber: z.number().positive(),
  title: z.string(),
  subtitle: z.string().optional(),
  layoutType: LayoutTypeSchema,
  colorPalette: ColorPaletteSchema,
  visualMetaphor: z.string(),
  blocks: z.array(ContentBlockSchema),
  sources: z.array(ResearchSourceSchema).optional(),
  notes: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export type Slide = z.infer<typeof SlideSchema>;

// Full presentation deck
export const DeckSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  author: z.string().optional(),
  topic: z.string(),
  slides: z.array(SlideSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number().default(1),
});

export type Deck = z.infer<typeof DeckSchema>;

// Agent edit request
export const AgentEditRequestSchema = z.object({
  deckId: z.string().optional(),
  slideNumber: z.number().positive(),
  instruction: z.string(),
});

export type AgentEditRequest = z.infer<typeof AgentEditRequestSchema>;

// Agent edit response
export const AgentEditResponseSchema = z.object({
  slideNumber: z.number(),
  updatedBlocks: z.array(ContentBlockSchema),
  updatedColorPalette: ColorPaletteSchema.optional(),
  updatedLayoutType: LayoutTypeSchema.optional(),
  reason: z.string(),
});

export type AgentEditResponse = z.infer<typeof AgentEditResponseSchema>;

// Deck generation request
export const GenerateDeckRequestSchema = z.object({
  topic: z.string().min(1),
  targetAudience: z.string().optional(),
  slideCount: z.number().min(5).max(20).default(10),
  tone: z.enum(["professional", "casual", "academic", "technical"]).default("professional"),
});

export type GenerateDeckRequest = z.infer<typeof GenerateDeckRequestSchema>;

// Agent role definitions
export const AgentRoleSchema = z.enum(["researcher", "strategist", "designer"]);

export type AgentRole = z.infer<typeof AgentRoleSchema>;
