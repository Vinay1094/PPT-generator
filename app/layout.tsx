import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenSpark - AI Presentation Generator",
  description:
    "A free, open-source alternative to Genspark. Generate boardroom-ready presentations with verified research, multi-agent orchestration, and native PPTX export.",
  keywords: [
    "AI presentation",
    "OpenSpark",
    "Genspark alternative",
    "PPT generator",
    "agentic AI",
    "CrewAI",
    "LangGraph",
  ],
  authors: [{ name: "Databloom AI and Tech" }],
  openGraph: {
    title: "OpenSpark - AI Presentation Generator",
    description: "Free, high-performance PPT generator with research-first workflow",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
