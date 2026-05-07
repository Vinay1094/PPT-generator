"use client";

import { useState, useCallback } from "react";
import { SAMPLE_DECK } from "@/lib/sample-data";
import type { Deck, Slide, ContentBlock, AgentEditRequest, AgentEditResponse } from "@/lib/types";
import { exportDeckToPptx } from "@/lib/pptx";

// Layout class map for Tailwind
const LAYOUT_MAP: Record<string, string> = {
  title: "flex flex-col items-center justify-center text-center h-full gap-8",
  split: "grid grid-cols-2 gap-8 h-full",
  grid: "grid grid-cols-2 gap-6 h-full",
  bullets: "flex flex-col gap-4 h-full",
  image: "grid grid-cols-2 gap-8 h-full",
  quote: "flex items-center justify-center h-full",
  closing: "flex flex-col items-center justify-center text-center h-full gap-6",
  "image-focused": "grid grid-cols-3 gap-4 h-full",
};

function SlidePreview({ slide, palette }: { slide: Slide; palette: Deck["colorPalette"] }) {
  const layoutClass = LAYOUT_MAP[slide.layout] ?? "flex flex-col gap-4 h-full";

  return (
    <div
      className="w-full aspect-video rounded-xl overflow-hidden shadow-lg p-8 flex flex-col"
      style={{ backgroundColor: palette.background, color: palette.text }}
    >
      <div className="flex-1 overflow-hidden" style={{ color: palette.text }}>
        <div className={layoutClass}>
          {slide.content.map((block, i) => (
            <BlockRenderer key={i} block={block} palette={palette} />
          ))}
        </div>
      </div>
      {slide.notes && (
        <p className="mt-2 text-xs opacity-50 truncate">{slide.notes}</p>
      )}
    </div>
  );
}

function BlockRenderer({
  block,
  palette,
}: {
  block: ContentBlock;
  palette: Deck["colorPalette"];
}) {
  switch (block.type) {
    case "heading":
      return (
        <h1 className="text-4xl font-bold leading-tight" style={{ color: palette.text }}>
          {block.content as string}
        </h1>
      );
    case "subheading":
      return (
        <h2 className="text-2xl font-medium" style={{ color: palette.accent }}>
          {block.content as string}
        </h2>
      );
    case "bullets": {
      const items = Array.isArray(block.content)
        ? (block.content as string[])
        : [block.content as string];
      return (
        <ul className="list-disc list-inside space-y-2 text-lg">
          {items.map((item, i) => (
            <li key={i} style={{ color: palette.text }}>
              {item}
            </li>
          ))}
        </ul>
      );
    }
    case "text":
      return (
        <p className="text-lg leading-relaxed" style={{ color: palette.text }}>
          {block.content as string}
        </p>
      );
    case "quote":
      return (
        <blockquote
          className="text-3xl italic font-light text-center px-8"
          style={{ color: palette.accent }}
        >
          &ldquo;{block.content as string}&rdquo;
        </blockquote>
      );
    case "image":
      return (
        <div
          className="w-full h-full rounded-lg flex items-center justify-center text-sm opacity-60"
          style={{ backgroundColor: palette.secondary, border: `1px solid ${palette.accent}` }}
        >
          [ Image Placeholder ]
        </div>
      );
    default:
      return null;
  }
}

export default function Home() {
  const [deck, setDeck] = useState<Deck>(SAMPLE_DECK);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [topic, setTopic] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), slideCount: 8 }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }
      const data: Deck = await res.json();
      setDeck(data);
      setCurrentSlide(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [topic]);

  const handleEdit = useCallback(async () => {
    if (!editPrompt.trim()) return;
    setEditLoading(true);
    setError(null);
    try {
      const payload: AgentEditRequest = {
        deck,
        slideIndex: currentSlide,
        instruction: editPrompt.trim(),
      };
      const res = await fetch("/api/agent-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Edit failed");
      }
      const data: AgentEditResponse = await res.json();
      setDeck(data.deck);
      setEditPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setEditLoading(false);
    }
  }, [deck, currentSlide, editPrompt]);

  const handleExport = useCallback(async () => {
    try {
      const blob = await exportDeckToPptx(deck);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${deck.title.replace(/\s+/g, "-")}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  }, [deck]);

  const slide = deck.slides[currentSlide];

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-indigo-400">OpenSpark</span>
          <span className="text-sm text-gray-500">AI Presentation Generator</span>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
        >
          Export .pptx
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-gray-800 flex flex-col gap-4 p-4 overflow-y-auto">
          {/* Generate */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="e.g. Climate Change"
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg py-2 text-sm font-medium transition-colors"
            >
              {loading ? "Generating..." : "Generate Deck"}
            </button>
          </div>

          {/* AI Edit */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400">AI Edit (Slide {currentSlide + 1})</label>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="e.g. Make this slide more concise"
              rows={3}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <button
              onClick={handleEdit}
              disabled={editLoading || !editPrompt.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg py-2 text-sm font-medium transition-colors"
            >
              {editLoading ? "Editing..." : "Apply Edit"}
            </button>
          </div>

          {error && (
            <div className="text-red-400 text-xs p-2 bg-red-950 rounded-lg border border-red-800">
              {error}
            </div>
          )}

          {/* Slide Thumbnails */}
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-sm font-medium text-gray-400">Slides ({deck.slides.length})</p>
            {deck.slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`text-left px-3 py-2 rounded-lg text-xs truncate transition-colors ${
                  i === currentSlide
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-800"
                }`}
              >
                {i + 1}. {s.title}
              </button>
            ))}
          </div>
        </aside>

        {/* Main canvas */}
        <section className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
          <div className="w-full max-w-4xl">
            <SlidePreview slide={slide} palette={deck.colorPalette} />
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded-lg text-sm transition-colors"
              >
                &larr; Previous
              </button>
              <span className="text-sm text-gray-500">
                Slide {currentSlide + 1} of {deck.slides.length}
              </span>
              <button
                onClick={() => setCurrentSlide(Math.min(deck.slides.length - 1, currentSlide + 1))}
                disabled={currentSlide === deck.slides.length - 1}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded-lg text-sm transition-colors"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
