import PptxGenJS from "pptxgenjs";
import { Deck, Slide, ContentBlock, ColorPalette, LayoutType } from "./types";

// SLIDE DIMENSIONS: 16:9 ratio at standard size
const SLIDE_WIDTH = 13.333; // inches (1280 / 96)
const SLIDE_HEIGHT = 7.5;   // inches (720 / 96)

// Convert tailwind hex to hex without #
function cleanColor(hex: string): string {
  return hex.replace("#", "");
}

// Map layout type to pptxgenjs shapes
function addSlideBlocks(
  slide: PptxGenJS.Slide,
  blocks: ContentBlock[],
  palette: ColorPalette,
  layoutType: LayoutType
) {
  const textColor = cleanColor(palette.text);
  const accentColor = cleanColor(palette.accent);
  const bg = cleanColor(palette.background);

  let y = layoutType === "title" ? SLIDE_HEIGHT * 0.3 : 0.5;
  const lineHeight = 0.5;

  blocks.forEach((block, i) => {
    const opts: Partial<PptxGenJS.TextProps> = {
      x: 0.5,
      y,
      w: SLIDE_WIDTH - 1,
      h: lineHeight,
      color: textColor,
      fontSize: block.type === "heading" ? 32 : 18,
      bold: block.type === "heading" || block.type === "callout",
      valign: "middle",
      fill: { color: bg },
    };

    // Style variations by type
    if (block.type === "callout") {
      opts.fill = { color: accentColor };
      opts.color = cleanColor(palette.background);
      opts.shape = "rectangle";
      opts.line = { color: accentColor, width: 2 };
    }

    if (block.type === "bullet") {
      opts.bullet = { type: "number", color: accentColor };
      opts.color = palette.text.startsWith("#") ? opts.color : "000000";
    }

    if (block.type === "heading") {
      opts.align = layoutType === "title" ? "center" : "left";
      opts.fontSize = layoutType === "title" ? 44 : 28;
    }

    slide.addText(block.content, opts);
    y += lineHeight + 0.15;
  });
}

// Add shape/icon based on layout type
function addLayoutShapes(
  slide: PptxGenJS.Slide,
  layoutType: LayoutType,
  palette: ColorPalette
) {
  const accent = cleanColor(palette.accent);
  const primary = cleanColor(palette.primary);

  if (layoutType === "split") {
    // Vertical divider line
    slide.addShape("line", {
      x: SLIDE_WIDTH / 2,
      y: 0,
      w: 0,
      h: SLIDE_HEIGHT,
      line: { color: accent, width: 2 },
    });
  }

  if (layoutType === "grid") {
    // Grid background dots
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        slide.addShape("ellipse", {
          x: 1 + i * 3,
          y: 1 + j * 2,
          w: 0.1,
          h: 0.1,
          fill: { color: primary },
          alpha: 30,
        });
      }
    }
  }

  if (layoutType === "quote") {
    // Large quote marks
    slide.addText("\"", {
      x: 0.5,
      y: 2,
      w: 2,
      h: 2,
      fontSize: 120,
      color: accent,
      align: "left",
      valign: "top",
    });
  }
}

// Main export function
export function exportToPptx(deck: Deck): PptxGenJS {
  const pres = new PptxGenJS();

  pres.layout = "LAYOUT_16x9";
  pres.author = deck.author || "OpenSpark AI";
  pres.title = deck.title;
  pres.subject = deck.topic;
  pres.company = "OpenSpark";

  deck.slides.forEach((slideData: Slide) => {
    const slide = pres.addSlide();
    const bg = cleanColor(slideData.colorPalette.background);

    // Set background
    slide.background = { color: bg };

    // Add layout-specific shapes
    addLayoutShapes(slide, slideData.layoutType, slideData.colorPalette);

    // Add content blocks
    addSlideBlocks(
      slide,
      slideData.blocks,
      slideData.colorPalette,
      slideData.layoutType
    );
  });

  return pres;
}

// Alternative: DOM to PPTX (for advanced rendering)
// This would use dom-to-pptx library for pixel-perfect conversion
export async function exportHtmlToPptx(
  htmlElementId: string,
  filename: string
): Promise<Blob> {
  // This is a client-side operation that uses dom-to-pptx
  // The actual implementation depends on having the library
  // in the browser bundle
  if (typeof window === "undefined") {
    throw new Error("DOM export only works in browser");
  }

  const element = document.getElementById(htmlElementId);
  if (!element) {
    throw new Error(`Element #${htmlElementId} not found`);
  }

  // dom-to-pptx traverses the DOM, computes styles,
  // and maps them to native PowerPoint shapes
  // const blob = await domToPptx(element);

  // For now, return a placeholder
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_16x9";
  const slide = pres.addSlide();
  slide.addText("DOM Export Placeholder - See implementation TODO", {
    x: 0.5,
    y: 3,
    w: 12,
    h: 1,
    fontSize: 24,
    align: "center",
  });
  return pres.writeFile({ outputType: "blob" });
}
