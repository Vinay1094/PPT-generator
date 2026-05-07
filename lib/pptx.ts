import PptxGenJS from "pptxgenjs";
import { Deck, Slide, ContentBlock, ColorPalette, LayoutType } from "./types";

// SLIDE DIMENSIONS: 16:9 ratio at standard size
const SLIDE_WIDTH = 13.333; // inches (1280 / 96)
const SLIDE_HEIGHT = 7.5;   // inches (720 / 96)

// Convert hex color (with or without #) to clean hex string
function cleanColor(hex: string): string {
  return hex.replace("#", "");
}

// Map layout type to a pptxgenjs-compatible layout name
function getLayoutName(layout: LayoutType): string {
  const map: Record<LayoutType, string> = {
    title: "TITLE_SLIDE",
    "two-column": "TITLE_AND_CONTENT",
    bullets: "TITLE_AND_CONTENT",
    image: "TITLE_AND_CONTENT",
    quote: "BLANK",
    closing: "BLANK",
  };
  return map[layout] || "TITLE_AND_CONTENT";
}

// Render a single content block onto a pptxgenjs slide
function renderBlock(
  pptxSlide: PptxGenJS.Slide,
  block: ContentBlock,
  palette: ColorPalette
): void {
  switch (block.type) {
    case "heading": {
      pptxSlide.addText(block.content as string, {
        x: 0.5,
        y: 0.4,
        w: SLIDE_WIDTH - 1,
        h: 1.2,
        fontSize: 36,
        bold: true,
        color: cleanColor(palette.text),
        fontFace: "Calibri",
        align: "left",
      });
      break;
    }
    case "subheading": {
      pptxSlide.addText(block.content as string, {
        x: 0.5,
        y: 1.7,
        w: SLIDE_WIDTH - 1,
        h: 0.8,
        fontSize: 24,
        bold: false,
        color: cleanColor(palette.accent),
        fontFace: "Calibri",
        align: "left",
      });
      break;
    }
    case "bullets": {
      const items = Array.isArray(block.content)
        ? (block.content as string[])
        : [block.content as string];
      const bulletItems = items.map((text) => ({
        text,
        options: { bullet: true, fontSize: 18, color: cleanColor(palette.text) },
      }));
      pptxSlide.addText(bulletItems, {
        x: 0.5,
        y: 2.0,
        w: SLIDE_WIDTH - 1,
        h: SLIDE_HEIGHT - 2.8,
        fontFace: "Calibri",
        valign: "top",
      });
      break;
    }
    case "text": {
      pptxSlide.addText(block.content as string, {
        x: 0.5,
        y: 2.0,
        w: SLIDE_WIDTH - 1,
        h: SLIDE_HEIGHT - 2.8,
        fontSize: 18,
        color: cleanColor(palette.text),
        fontFace: "Calibri",
        align: "left",
        valign: "top",
        wrap: true,
      });
      break;
    }
    case "quote": {
      pptxSlide.addText(`"${block.content as string}"`, {
        x: 1.0,
        y: 2.5,
        w: SLIDE_WIDTH - 2,
        h: 3.0,
        fontSize: 28,
        italic: true,
        color: cleanColor(palette.accent),
        fontFace: "Calibri",
        align: "center",
        valign: "middle",
      });
      break;
    }
    case "image": {
      // Placeholder box when no actual image binary is available
      pptxSlide.addShape("rect" as PptxGenJS.SHAPE_NAME, {
        x: 0.5,
        y: 2.0,
        w: SLIDE_WIDTH - 1,
        h: SLIDE_HEIGHT - 3,
        fill: { color: cleanColor(palette.secondary) },
        line: { color: cleanColor(palette.accent), width: 1 },
      });
      pptxSlide.addText("[ Image Placeholder ]", {
        x: 0.5,
        y: 2.0,
        w: SLIDE_WIDTH - 1,
        h: SLIDE_HEIGHT - 3,
        fontSize: 16,
        color: cleanColor(palette.text),
        align: "center",
        valign: "middle",
        fontFace: "Calibri",
      });
      break;
    }
    default:
      break;
  }
}

// Build and export the full deck as a PPTX Blob
export async function exportDeckToPptx(deck: Deck): Promise<Blob> {
  const pptx = new PptxGenJS();

  // Presentation-level settings
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "PPT Generator";
  pptx.company = "Open Source";
  pptx.title = deck.title;

  const palette: ColorPalette = deck.colorPalette;

  for (const slide of deck.slides) {
    const pptxSlide = pptx.addSlide();

    // Background fill
    pptxSlide.background = { color: cleanColor(palette.background) };

    // Accent bar at top
    pptxSlide.addShape("rect" as PptxGenJS.SHAPE_NAME, {
      x: 0,
      y: 0,
      w: SLIDE_WIDTH,
      h: 0.12,
      fill: { color: cleanColor(palette.primary) },
      line: { color: cleanColor(palette.primary), width: 0 },
    });

    // Render each content block
    for (const block of slide.content) {
      renderBlock(pptxSlide, block, palette);
    }

    // Speaker notes
    if (slide.notes) {
      pptxSlide.addNotes(slide.notes);
    }
  }

  // Write to base64 and convert to Blob
  const base64 = await pptx.write({ outputType: "base64" }) as string;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
}
