import PptxGenJS from "pptxgenjs";
import { Deck, ColorPalette } from "./types";

const SLIDE_WIDTH = 13.333;
const SLIDE_HEIGHT = 7.5;

function cleanColor(hex: string): string {
  return hex.replace("#", "");
}

function contentToString(content: string | string[] | Record<string, unknown>): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return (content as string[]).join(", ");
  return JSON.stringify(content);
}

/**
 * Generates a PPTX file from a Deck and returns it as a base64 string.
 * Using base64 avoids TypeScript Buffer/Uint8Array type incompatibilities.
 */
export async function exportDeckToPptx(deck: Deck): Promise<string> {
  const pptx = new PptxGenJS();

  pptx.layout = "LAYOUT_WIDE";
  pptx.title = deck.title;
  pptx.author = "OpenSpark PPT Generator";

  const palette: ColorPalette = deck.colorPalette;
  const bgColor = cleanColor(palette.background);
  const primaryColor = cleanColor(palette.primary);
  const textColor = cleanColor(palette.text);

  for (const slide of deck.slides) {
    const pSlide = pptx.addSlide();
    pSlide.background = { color: bgColor };

    // Slide title
    pSlide.addText(slide.title ?? "", {
      x: 0.5, y: 0.3,
      w: SLIDE_WIDTH - 1, h: 1.0,
      fontSize: 32, bold: true,
      color: primaryColor, fontFace: "Arial",
    });

    // Content blocks
    let yPos = 1.5;
    for (const block of slide.content ?? []) {
      if (yPos > SLIDE_HEIGHT - 0.5) break;

      if (block.type === "bullets") {
        const rawContent = block.content;
        const items: string[] = Array.isArray(rawContent)
          ? (rawContent as string[])
          : typeof rawContent === "string"
          ? rawContent.split("\n")
          : [];
        for (const item of items) {
          if (yPos > SLIDE_HEIGHT - 0.5) break;
          pSlide.addText("• " + item, {
            x: 0.7, y: yPos,
            w: SLIDE_WIDTH - 1.4, h: 0.45,
            fontSize: 16, color: textColor, fontFace: "Arial",
          });
          yPos += 0.45;
        }
        yPos += 0.1;
      } else if (block.content) {
        const text = contentToString(block.content);
        const isQuote = block.type === "quote";
        const isHeading = block.type === "heading" || block.type === "subheading";
        pSlide.addText(isQuote ? `"${text}"` : text, {
          x: isQuote ? 1.0 : 0.5,
          y: yPos,
          w: isQuote ? SLIDE_WIDTH - 2 : SLIDE_WIDTH - 1,
          h: isQuote ? 1.0 : 0.5,
          fontSize: isHeading ? 20 : 16,
          bold: isHeading,
          italic: isQuote,
          color: isQuote || isHeading ? primaryColor : textColor,
          fontFace: "Arial",
        });
        yPos += isQuote ? 1.2 : 0.65;
      }
    }

    if (slide.notes) {
      pSlide.addNotes(slide.notes);
    }
  }

  // Return as base64 string — avoids Buffer/Uint8Array TS type issues
  const base64 = await pptx.write({ outputType: "base64" });
  return base64 as string;
}

/**
 * Helper: convert base64 PPTX string to a Blob for browser download.
 */
export function base64ToBlob(base64: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
}
