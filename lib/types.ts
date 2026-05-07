import { z } from "zod";

// Slide layout types
export const LayoutTypeSchema = z.enum([
  "title",
  "split",
  "grid",
  "bullets",
  "body",
  "quote",
  "comparison",
  "image-focused",
  "data-viz",
  "image",
  "closing",
  "two-column",
]);
export type LayoutType = z.infer<typeof LayoutTypeSchema>;

// Color palette for each slide deck
export const ColorPaletteSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  text: z.string(),
});
export type ColorPalette = z.infer<typeof ColorPaletteSchema>;

// A single content block within a slide
export const ContentBlockSchema = z.object({
  type: z.enum(["heading", "subheading", "text", "bullets", "image", "quote", "chart", "table"]),
  content: z.union([z.string(), z.array(z.string()), z.record(z.unknown())]),
  style: z.record(z.string()).optional(),
});
export type ContentBlock = z.infer<typeof ContentBlockSchema>;

// A single slide
export const SlideSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  layout: LayoutTypeSchema,
  content: z.array(ContentBlockSchema),
  notes: z.string().optional(),
  backgroundColor: z.string().optional(),
});
export type Slide = z.infer<typeof SlideSchema>;

// The full presentation deck
export const DeckSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  author: z.string().optional(),
  topic: z.string(),
  slides: z.array(SlideSchema),
  colorPalette: ColorPaletteSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number().default(1),
});
export type Deck = z.infer<typeof DeckSchema>;

// Request schema for generating a new deck
export const GenerateDeckRequestSchema = z.object({
  topic: z.string().min(1),
  slideCount: z.number().min(3).max(20).default(8),
  audience: z.string().optional(),
  style: z.string().optional(),
});
export type GenerateDeckRequest = z.infer<typeof GenerateDeckRequestSchema>;

// Request/response for the AI edit endpoint
export const AgentEditRequestSchema = z.object({
  deck: DeckSchema,
  slideIndex: z.number().min(0),
  instruction: z.string().min(1),
});
export type AgentEditRequest = z.infer<typeof AgentEditRequestSchema>;

export const AgentEditResponseSchema = z.object({
  deck: DeckSchema,
  message: z.string(),
});
export type AgentEditResponse = z.infer<typeof AgentEditResponseSchema>;
