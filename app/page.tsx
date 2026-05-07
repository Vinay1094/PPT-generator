"use client";

import { useState, useCallback } from "react";
import { SAMPLE_DECK } from "@/lib/sample-data";
import type { Deck, Slide, ContentBlock, AgentEditRequest, AgentEditResponse } from "@/lib/types";
import PptxGenJS from "pptxgenjs";
import { exportToPptx } from "@/lib/pptx";

// Layout class map for Tailwind
const LAYOUT_MAP: Record<string, string> = {
  title: "flex flex-col items-center justify-center text-center h-full gap-8",
  split: "grid grid-cols-2 gap-8 h-full",
  grid: "grid grid-cols-2 gap-6 h-full",
  body: "flex flex-col gap-6 h-full",
  quote: "flex flex-col items-center justify-center text-center h-full",
  comparison: "grid grid-cols-2 gap-8 h-full",
  "image-focused": "grid grid-cols-3 gap-4 h-full",
  "data-viz": "flex flex-col gap-4 h-full",
};

export default function Home() {
  const [deck, setDeck] = useState<Deck>(SAMPLE_DECK);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>("");
  const [editInstruction, setEditInstruction] = useState("");
  const [showSources, setShowSources] = useState(false);

  // Generate deck via API
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setAgentStatus("researcher:searching-web");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          slideCount: 10,
          tone: "professional",
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const result = await res.json();
      setDeck(result.deck);
      setCurrentSlide(0);
    } catch (err) {
      console.error("Generate error:", err);
      setAgentStatus("error:generation-failed");
    } finally {
      setIsGenerating(false);
      setAgentStatus("");
    }
  };

  // Agent edit slide
  const handleEdit = async () => {
    if (!editInstruction.trim()) return;
    setAgentStatus("designer:re-rendering");

    try {
      const slide = deck.slides[currentSlide];
      const res = await fetch("/api/agent-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slideNumber: slide.slideNumber,
          instruction: editInstruction,
        }),
      });
      if (!res.ok) throw new Error("Edit failed");
      const result: AgentEditResponse = await res.json();

      // Update slide with agent response
      const updatedSlides = deck.slides.map((s) =>
        s.slideNumber === result.slideNumber
          ? { ...s, blocks: result.updatedBlocks }
          : s
      );
      setDeck({ ...deck, slides: updatedSlides });
      setEditInstruction("");
    } catch (err) {
      console.error("Edit error:", err);
    } finally {
      setAgentStatus("");
    }
  };

  // Export to PPTX
  const handleExport = useCallback(() => {
    try {
      const pres = exportToPptx(deck);
      pres.writeFile({ fileName: `${deck.title.replace(/\s+/g, "_")}.pptx` });
    } catch (err) {
      console.error("Export error:", err);
    }
  }, [deck]);

  const slide = deck.slides[currentSlide];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">OS</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">OpenSpark</h1>
            <p className="text-xs text-gray-500">AI Presentation Generator</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 italic">
            {agentStatus && (
              <span className="agent-thinking">[{agentStatus}]</span>
            )}
          </span>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
          >
            Export PPTX
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Left Sidebar - Slide Thumbnails */}
        <aside className="w-48 bg-white border-r border-gray-200 overflow-y-auto slide-preview flex-shrink-0">
          <div className="p-2 space-y-2">
            {deck.slides.map((s, i) => (
              <button
                key={s.slideNumber}
                onClick={() => setCurrentSlide(i)}
                className={`w-full text-left p-2 rounded-lg border transition ${
                  i === currentSlide
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className="w-full aspect-video bg-gray-100 rounded mb-1 text-xs flex items-center justify-center"
                  style={{ backgroundColor: s.colorPalette.background }}
                >
                  <span style={{ color: s.colorPalette.text }}>{s.title.slice(0, 20)}{s.title.length > 20 ? "..." : ""}</span>
                </div>
                <span className="text-xs text-gray-600">{s.slideNumber}. {s.title.slice(0, 18)}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Canvas Area */}
        <section className="flex-1 flex flex-col">
          {/* Topic Input Bar */}
          <div className="bg-white border-b border-gray-200 p-3 flex gap-3 items-center">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic... e.g., 'Agentic AI'"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>

          {/* Slide Canvas - 1280x720 container */}
          <div className="flex-1 bg-gray-100 overflow-auto p-8 flex items-center justify-center">
            <div
              id="slide-canvas"
              className="slide-canvas shadow-xl"
              style={{
                backgroundColor: slide.colorPalette.background,
                color: slide.colorPalette.text,
              }}
            >
              <div className={LAYOUT_MAP[slide.layoutType] || LAYOUT_MAP.body}>
                {slide.layoutType === "title" ? (
                  <>
                    <h2 className="text-5xl font-bold" style={{ color: slide.colorPalette.text }}>
                      {slide.title}
                    </h2>
                    <p className="text-xl" style={{ color: slide.colorPalette.text, opacity: 0.8 }}>
                      {slide.subtitle}
                    </p>
                  </>
                ) : (
                  <>
                    {slide.blocks.map((block, idx) => (
                      <div key={idx}>
                        {block.type === "heading" && (
                          <h3 className="text-3xl font-bold" style={{ color: slide.colorPalette.text }}>
                            {block.content}
                          </h3>
                        )}
                        {block.type === "body" && (
                          <p className="text-lg" style={{ color: slide.colorPalette.text, opacity: 0.9 }}>
                            {block.content}
                          </p>
                        )}
                        {block.type === "bullet" && (
                          <div className="flex items-start gap-2" style={{ color: slide.colorPalette.text }}>
                            <span className="text-blue-500">&#9679;</span>
                            <span>{block.content}</span>
                          </div>
                        )}
                        {block.type === "callout" && (
                          <div
                            className="p-3 rounded-lg text-base font-medium"
                            style={{
                              backgroundColor: slide.colorPalette.accent,
                              color: slide.colorPalette.background,
                            }}
                          >
                            {block.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Fact Check Badge */}
              {showSources && slide.sources && slide.sources.length > 0 && (
                <div className="fact-check-overlay credible">
                  <p className="font-bold mb-1">Verified Sources</p>
                  <ul className="space-y-1">
                    {slide.sources.slice(0, 3).map((src, i) => (
                      <li key={i} className="text-xs truncate">
                        {src.title} ({Math.round(src.credibilityScore * 100)}% trustworthy)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Navigation & Edit Bar */}
          <div className="bg-white border-t border-gray-200 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
                disabled={currentSlide === 0}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
              >
                &#8592; Prev
              </button>
              <span className="text-sm text-gray-600">
                {slide.slideNumber} / {deck.slides.length}
              </span>
              <button
                onClick={() =>
                  setCurrentSlide((s) => Math.min(deck.slides.length - 1, s + 1))
                }
                disabled={currentSlide === deck.slides.length - 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
              >
                Next &#8594;
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSources(!showSources)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                {showSources ? "Hide Sources" : "Show Sources"}
              </button>
              <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
                <input
                  type="text"
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  placeholder="Ask AI: 'make this more professional'..."
                  className="w-64 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleEdit}
                  disabled={!editInstruction.trim()}
                  className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  AI Edit
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
