import { createFileRoute } from "@tanstack/react-router";

import { ScrollBackground } from "@/components/ScrollBackground";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Neural RAG — Documents to Answers" },
      {
        name: "description",
        content:
          "A futuristic retrieval pipeline: documents become chunks, chunks become embeddings, and a neural search feeds the LLM that writes the answer.",
      },
      { property: "og:title", content: "Neural RAG — Documents to Answers" },
      {
        property: "og:description",
        content:
          "Watch information travel through the neural chain: documents, chunks, embeddings, neural search, LLM, answer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Neural RAG",
          url: "/",
          description: "Documents to answers through a neural retrieval chain.",
        }),
      },
    ],
  }),
});

const stages = [
  { label: "Documents", caption: "Your knowledge enters the chain." },
  { label: "Chunks", caption: "Split into context-sized pieces." },
  { label: "Embeddings", caption: "Meaning becomes coordinates." },
  { label: "Neural network", caption: "Vectors link by similarity." },
  { label: "Query", caption: "A question enters the field." },
  { label: "Neural search", caption: "Relevant nodes ignite." },
  { label: "LLM", caption: "Context flows into the model." },
  { label: "Answer", caption: "Grounded, sourced, instant." },
];

function LandingPage() {
  return (
    <main className="relative font-body text-foreground">
      <ScrollBackground />

      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <span className="mb-6 rounded-full border border-primary/30 bg-primary/5 px-4 py-1 font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
          Retrieval augmented generation
        </span>
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Documents in.
          <br />
          <span className="text-primary">Answers out.</span>
        </h1>
        <p className="mt-6 max-w-md text-sm text-muted-foreground sm:text-lg">
          Scroll to follow a single thought through the neural chain.
        </p>
        <Button size="lg" className="mt-10 gap-2">
          Start building <ArrowRight className="size-4" />
        </Button>
        <ChevronDown className="absolute bottom-10 size-5 animate-bounce text-primary/70" />
      </section>

      {stages.map((stage, i) => (
        <section
          key={stage.label}
          className="flex min-h-screen items-center px-6"
          aria-label={stage.label}
        >
          <div className={i % 2 === 0 ? "mr-auto max-w-xs" : "ml-auto max-w-xs text-right"}>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary/70">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight sm:text-4xl">
              {stage.label}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">{stage.caption}</p>
          </div>
        </section>
      ))}

      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl">
          Build the chain
        </h2>
        <p className="mt-4 max-w-sm text-sm text-muted-foreground sm:text-base">
          One pipeline from raw content to grounded AI answers.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg">Get started</Button>
          <Button size="lg" variant="outline">
            Read the docs
          </Button>
        </div>
        <p className="mt-16 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          © {new Date().getFullYear()} Neural RAG
        </p>
      </section>
    </main>
  );
}
