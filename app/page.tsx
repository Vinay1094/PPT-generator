"use client";

import { useState, useCallback } from "react";
import { SAMPLE_DECK } from "@/lib/sample-data";
import type { Deck, Slide, ContentBlock, AgentEditRequest, AgentEditResponse } from "@/lib/types";
import { exportDeckToPptx, base64ToBlob } from "@/lib/pptx";

// Layout class map for Tailwind
const LAYOUT_MAP: Record<string, string> = {
  title: "flex flex-col items-center justify-center text-center h-full gap-8",
  split: "grid grid-cols-2 gap-8 h-full",
  grid: "grid grid-cols-2 gap-6 h-full",
  bullets: "flex flex-col gap-4 h-full",
  body: "flex flex-col gap-4 h-full",
  quote: "flex flex-col items-center justify-center h-full",
  comparison: "grid grid-cols-2 gap-6 h-full",
  "image-focused": "grid grid-cols-3 gap-4 h-full",
  "data-viz": "flex flex-col gap-4 h-full",
  "two-column": "grid grid-cols-2 gap-6 h-full",
  image: "flex flex-col gap-4 h-full",
  closing: "flex flex-col items-center justify-center text-center h-full gap-6",
};

function BlockRenderer({ block }: { block: ContentBlock }) {
  if (block.type === "bullets") {
    const items = Array.isArray(block.content)
      ? (block.content as string[])
      : typeof block.content === "string"
      ? block.content.split("\n")
      : [];
    return (
      <ul className="list-disc list-inside space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-base">{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote className="italic text-xl border-l-4 border-blue-400 pl-4">
        {typeof block.content === "string" ? block.content : JSON.stringify(block.content)}
      </blockquote>
    );
  }
  if (block.type === "heading") {
    return <h2 className="text-2xl font-bold">{typeof block.content === "string" ? block.content : ""}</h2>;
  }
  if (block.type === "subheading") {
    return <h3 className="text-xl font-semibold">{typeof block.content === "string" ? block.content : ""}</h3>;
  }
  return (
    <p className="text-base">
      {typeof block.content === "string"
        ? block.content
        : Array.isArray(block.content)
        ? (block.content as string[]).join(", ")
        : JSON.stringify(block.content)}
    </p>
  );
}

function SlidePreview({ slide, palette }: { slide: Slide; palette: Deck["colorPalette"] }) {
  const layoutClass = LAYOUT_MAP[slide.layout] ?? "flex flex-col gap-4 h-full";
  return (
    <div
      className="w-full rounded-lg p-8 flex flex-col gap-4"
      style={{ backgroundColor: palette.background, color: palette.text, minHeight: 360 }}
    >
      <h1 className="text-3xl font-bold" style={{ color: palette.primary }}>
        {slide.title}
      </h1>
      <div className={layoutClass}>
        {slide.content.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [deck, setDeck] = useState<Deck>(SAMPLE_DECK);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [editing, setEditing] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: Deck = await res.json();
      setDeck(data);
      setCurrentSlide(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [topic]);

  const handleEdit = useCallback(async () => {
    if (!editInstruction.trim()) return;
    setEditing(true);
    setError(null);
    try {
      const reqBody: AgentEditRequest = {
        deck,
        slideIndex: currentSlide,
        instruction: editInstruction,
      };
      const res = await fetch("/api/agent-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: AgentEditResponse = await res.json();
      setDeck(data.deck);
      setEditInstruction("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Edit failed");
    } finally {
      setEditing(false);
    }
  }, [deck, currentSlide, editInstruction]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      // exportDeckToPptx returns base64 string; convert to Blob for download
      const base64 = await exportDeckToPptx(deck);
      const blob = base64ToBlob(base64);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${deck.title.replace(/\s+/g, "-")}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, [deck]);

  const slide = deck.slides[currentSlide];

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-gray-900 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-blue-400">OpenSpark PPT Generator</h1>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50 transition"
          >
            {exporting ? "Exporting..." : "Download PPTX"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col gap-4 p-4 overflow-y-auto">
          {/* Generate */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400">Generate Presentation</label>
            <input
              type="text"
              placeholder="Enter topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium disabled:opacity-50 transition"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>

          {/* Slide list */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-400">Slides ({deck.slides.length})</label>
            {deck.slides.map((s, i) => (
              <button
                key={s.id ?? i}
                onClick={() => setCurrentSlide(i)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition ${
                  i === currentSlide
                    ? "bg-blue-700 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                }`}
              >
                <span className="text-gray-500 mr-2">{i + 1}.</span>
                {s.title}
              </button>
            ))}
          </div>

          {/* AI Edit */}
          <div className="flex flex-col gap-2 mt-auto">
            <label className="text-sm font-medium text-gray-400">AI Edit Slide {currentSlide + 1}</label>
            <textarea
              rows={3}
              placeholder="Instruction, e.g. Make it more concise..."
              value={editInstruction}
              onChange={(e) => setEditInstruction(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              onClick={handleEdit}
              disabled={editing || !editInstruction.trim()}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium disabled:opacity-50 transition"
            >
              {editing ? "Editing..." : "Apply AI Edit"}
            </button>
          </div>
        </aside>

        {/* Main canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
          {error && (
            <div className="w-full max-w-3xl mb-4 px-4 py-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {slide ? (
            <div className="w-full max-w-4xl">
              <SlidePreview slide={slide} palette={deck.colorPalette} />

              {/* Slide navigation */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
                  disabled={currentSlide === 0}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-40 transition"
                >
                  ← Prev
                </button>
                <span className="text-gray-400 text-sm">
                  {currentSlide + 1} / {deck.slides.length}
                </span>
                <button
                  onClick={() => setCurrentSlide((p) => Math.min(deck.slides.length - 1, p + 1))}
                  disabled={currentSlide === deck.slides.length - 1}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-40 transition"
                >
                  Next →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-lg">No slides yet. Generate a presentation above.</div>
          )}
        </div>
      </div>
    </main>
  );
}
