import { Deck } from "./types";

export const SAMPLE_DECK_TOPIC = "Agentic AI";

export const SAMPLE_DECK: Deck = {
  title: "Agentic AI",
  subtitle: "From Prompts to Autonomous Agents",
  author: "OpenSpark AI",
  topic: SAMPLE_DECK_TOPIC,
  colorPalette: {
    primary: "#6366f1",
    secondary: "#4f46e5",
    accent: "#a5b4fc",
    background: "#0f172a",
    text: "#f1f5f9",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
  slides: [
    {
      id: "slide-1",
      title: "Agentic AI",
      layout: "title",
      content: [
        { type: "heading", content: "Agentic AI" },
        { type: "subheading", content: "From Prompts to Autonomous Agents" },
      ],
      notes: "Welcome to Agentic AI - the next frontier in artificial intelligence.",
    },
    {
      id: "slide-2",
      title: "What is Agentic AI?",
      layout: "bullets",
      content: [
        { type: "heading", content: "What is Agentic AI?" },
        {
          type: "bullets",
          content: [
            "AI systems that autonomously plan and execute multi-step tasks",
            "Agents perceive environment, reason, and take actions",
            "Can use tools: web search, code execution, APIs",
            "Loop: Observe → Think → Act → Observe",
          ],
        },
      ],
      notes: "Agentic AI goes beyond simple Q&A - it can act in the world.",
    },
    {
      id: "slide-3",
      title: "Core Components",
      layout: "split",
      content: [
        { type: "heading", content: "Core Components" },
        {
          type: "bullets",
          content: ["Planning module", "Memory (short & long term)", "Tool use"],
        },
        {
          type: "bullets",
          content: ["Reasoning engine", "Feedback loops", "Safety guardrails"],
        },
      ],
      notes: "Every agent system needs these six building blocks.",
    },
    {
      id: "slide-4",
      title: "Key Insight",
      layout: "quote",
      content: [
        { type: "heading", content: "Key Insight" },
        {
          type: "quote",
          content:
            "The shift from chatbots to agents is the shift from answering questions to solving problems.",
        },
      ],
      notes: "This captures the fundamental transformation happening in AI.",
    },
    {
      id: "slide-5",
      title: "Real-World Applications",
      layout: "bullets",
      content: [
        { type: "heading", content: "Real-World Applications" },
        {
          type: "bullets",
          content: [
            "Software development automation (Devin, GitHub Copilot Workspace)",
            "Research assistants (Perplexity, Deep Research)",
            "Business process automation",
            "Customer support escalation",
            "Data analysis pipelines",
          ],
        },
      ],
      notes: "These are live products people are using today.",
    },
    {
      id: "slide-6",
      title: "Challenges",
      layout: "bullets",
      content: [
        { type: "heading", content: "Challenges & Risks" },
        {
          type: "bullets",
          content: [
            "Hallucination and compounding errors",
            "Security: prompt injection attacks",
            "Cost: many LLM calls per task",
            "Evaluation: hard to measure agent performance",
            "Trust & alignment concerns",
          ],
        },
      ],
      notes: "We must be honest about the challenges before deploying agents.",
    },
    {
      id: "slide-7",
      title: "Getting Started",
      layout: "bullets",
      content: [
        { type: "heading", content: "Getting Started" },
        {
          type: "bullets",
          content: [
            "Start with LangChain, LangGraph, or CrewAI",
            "Pick a simple, well-defined task",
            "Add tools incrementally",
            "Measure, iterate, improve",
          ],
        },
      ],
      notes: "The best way to learn agents is to build one.",
    },
    {
      id: "slide-8",
      title: "Thank You",
      layout: "closing",
      content: [
        { type: "heading", content: "Thank You" },
        { type: "subheading", content: "Questions about Agentic AI?" },
        { type: "text", content: "Let's continue the conversation." },
      ],
      notes: "Open the floor for questions and discussion.",
    },
  ],
};
