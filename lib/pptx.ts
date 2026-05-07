import PptxGenJS from "pptxgenjs";
import { Deck, ColorPalette } from "./types";

const SLIDE_WIDTH = 13.333;
const SLIDE_HEIGHT = 7.5;

function cleanColor(hex: string): string {
  return hex.replace("#", "");
}

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

    // Subtitle
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
      if (block.type === "bullets" && Array.isArray(block.items) && block.items.length > 0) {
        // Render each bullet as a separate text box
        for (const item of block.items) {
          pSlide.addText("• " + item, {
            x: 0.7,
            y: yPos,
            w: SLIDE_WIDTH - 1.4,
            h: 0.45,
            fontSize: 16,
            color: textColor,
            fontFace: "Arial",
          });
          yPos += 0.45;
          if (yPos > SLIDE_HEIGHT - 0.5) break;
        }
        yPos += 0.1;
      } else if (block.content) {
        const isQuote = block.type === "quote";
        const isHeading = block.type === "heading" || block.type === "subheading";
        pSlide.addText(isQuote ? `"${block.content}"` : block.content, {
          x: isQuote ? 1.0 : 0.5,
          y: yPos,
          w: isQuote ? SLIDE_WIDTH - 2 : SLIDE_WIDTH - 1,
          h: isQuote ? 1.0 : 0.5,
          fontSize: isHeading ? 20 : isQuote ? 20 : 16,
          bold: isHeading,
          italic: isQuote,
          color: isQuote || isHeading ? primaryColor : textColor,
          fontFace: "Arial",
        });
        yPos += isQuote ? 1.2 : 0.65;
      }
      if (yPos > SLIDE_HEIGHT - 0.5) break;
    }

    // Speaker notes (field is 'notes' in the Slide type)
    if (slide.notes) {
      pSlide.addNotes(slide.notes);
    }
  }

  const data = await pptx.write({ outputType: "uint8array" });
  return data as Uint8Array;
}
