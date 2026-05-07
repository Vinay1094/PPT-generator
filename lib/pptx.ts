import PptxGenJS from "pptxgenjs";
import { Deck, Slide, ColorPalette } from "./types";

const SLIDE_WIDTH = 13.333;
const SLIDE_HEIGHT = 7.5;

function cleanColor(hex: string): string {
  return hex.replace("#", "");
}

// Map layout type to a pptxgenjs-compatible layout name
const LAYOUT_MAP: Record<string, string> = {
  "title": "TITLE",
  "bullets": "TITLE_AND_CONTENT",
  "two-column": "TITLE_AND_CONTENT",
  "image": "TITLE_AND_CONTENT",
  "quote": "TITLE_AND_CONTENT",
  "closing": "TITLE_AND_CONTENT",
  "split": "TITLE_AND_CONTENT",
  "grid": "TITLE_AND_CONTENT",
  "body": "TITLE_AND_CONTENT",
  "comparison": "TITLE_AND_CONTENT",
  "image-focused": "TITLE_AND_CONTENT",
  "data-viz": "TITLE_AND_CONTENT",
};

export async function exportDeckToPptx(deck: Deck): Promise<Uint8Array> {
  const pptx = new PptxGenJS();

  pptx.layout = "LAYOUT_WIDE";
  pptx.title = deck.title;
  pptx.author = "OpenSpark PPT Generator";

  const palette: ColorPalette = deck.colorPalette ?? {
    primary: "#1E40AF",
    secondary: "#3B82F6",
    accent: "#F59E0B",
    background: "#FFFFFF",
    text: "#111827",
  };

  const bgColor = cleanColor(palette.background);
  const primaryColor = cleanColor(palette.primary);
  const textColor = cleanColor(palette.text);

  for (const slide of deck.slides) {
    const pSlide = pptx.addSlide();

    // Background
    pSlide.background = { color: bgColor };

    // Title
    pSlide.addText(slide.title ?? "", {
      x: 0.5,
      y: 0.3,
      w: SLIDE_WIDTH - 1,
      h: 1.0,
      fontSize: 32,
      bold: true,
      color: primaryColor,
      fontFace: "Arial",
    });

    // Subtitle (if present)
    if (slide.subtitle) {
      pSlide.addText(slide.subtitle, {
        x: 0.5,
        y: 1.4,
        w: SLIDE_WIDTH - 1,
        h: 0.6,
        fontSize: 18,
        color: textColor,
        fontFace: "Arial",
      });
    }

    // Content blocks
    let yPos = slide.subtitle ? 2.1 : 1.5;
    for (const block of slide.content ?? []) {
      if (block.type === "bullets" && Array.isArray(block.items)) {
        const bulletItems = block.items.map((item: string) => ({
          text: item,
          options: { bullet: true, fontSize: 16, color: textColor, fontFace: "Arial" },
        }));
        pSlide.addText(bulletItems, {
          x: 0.5,
          y: yPos,
          w: SLIDE_WIDTH - 1,
          h: Math.min(block.items.length * 0.45 + 0.3, SLIDE_HEIGHT - yPos - 0.5),
          fontFace: "Arial",
        });
        yPos += block.items.length * 0.45 + 0.5;
      } else if (block.type === "text" && block.content) {
        pSlide.addText(block.content, {
          x: 0.5,
          y: yPos,
          w: SLIDE_WIDTH - 1,
          h: 0.6,
          fontSize: 16,
          color: textColor,
          fontFace: "Arial",
        });
        yPos += 0.7;
      } else if (block.type === "quote" && block.content) {
        pSlide.addText(`"${block.content}"`, {
          x: 1.0,
          y: yPos,
          w: SLIDE_WIDTH - 2,
          h: 1.0,
          fontSize: 20,
          italic: true,
          color: primaryColor,
          fontFace: "Arial",
        });
        yPos += 1.2;
      } else if (block.type === "heading" && block.content) {
        pSlide.addText(block.content, {
          x: 0.5,
          y: yPos,
          w: SLIDE_WIDTH - 1,
          h: 0.5,
          fontSize: 20,
          bold: true,
          color: primaryColor,
          fontFace: "Arial",
        });
        yPos += 0.7;
      }
    }

    // Speaker notes
    if (slide.speakerNotes) {
      pSlide.addNotes(slide.speakerNotes);
    }
  }

  const data = await pptx.write({ outputType: "uint8array" });
  return data as Uint8Array;
}
