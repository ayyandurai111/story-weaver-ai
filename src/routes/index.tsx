import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Binary,
  BookOpen,
  Bot,
  ChevronDown,
  Database,
  FileText,
  FolderKanban,
  Layers,
  MessageSquare,
  Newspaper,
  PenLine,
  Server,
  Sparkles,
} from "lucide-react";
import type { ComponentType } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Content to AI Answers — Unified Pipeline" },
      {
        name: "description",
        content:
          "Writer, CRM, chunk engine, embeddings, vector DB and RAG API in one pipeline. Turn your content into answers for ChatGPT, Claude, Gemini and more.",
      },
      { property: "og:title", content: "Content to AI Answers — Unified Pipeline" },
      {
        property: "og:description",
        content:
          "Writer, CRM, chunk engine, embeddings, vector DB and RAG API in one pipeline. Turn your content into answers for ChatGPT, Claude, Gemini and more.",
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
          name: "Content to AI Answers",
          url: "/",
          description:
            "Writer, CRM, chunk engine, embeddings, vector DB and RAG API in one pipeline.",
        }),
      },
    ],
  }),
});

const pipeline = [
  {
    icon: PenLine,
    title: "Writer",
    description: "Capture ideas, drafts and long-form content in one place.",
  },
  {
    icon: FolderKanban,
    title: "CRM / Content Editor",
    description: "Organise, review and publish articles, blogs and docs.",
  },
  { icon: Newspaper, title: "Articles", description: "Structured long-form pieces ready for reuse." },
  { icon: FileText, title: "Blogs", description: "Short, topical posts that stay fresh." },
  { icon: BookOpen, title: "Documentation", description: "Reference guides and technical knowledge." },
  { icon: Layers, title: "Chunk Engine", description: "Split content into context-aware chunks." },
  { icon: Binary, title: "Embeddings", description: "Turn chunks into searchable vector representations." },
  { icon: Database, title: "Vector Database", description: "Store and index vectors for fast retrieval." },
  { icon: Server, title: "RAG API / MCP Server", description: "Serve context to any AI through a single API." },
  { icon: Bot, title: "ChatGPT / Claude / Gemini", description: "Connect the leading LLMs with one integration." },
  { icon: MessageSquare, title: "User Answer", description: "Deliver precise, grounded answers." },
];

const capabilities = [
  {
    icon: Newspaper,
    title: "Articles",
    description: "Long-form, structured content built for depth and reuse.",
  },
  {
    icon: FileText,
    title: "Blogs",
    description: "Short, timely posts that stay relevant and easy to update.",
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Reference material that AI agents can trust and retrieve.",
  },
];

const stack = [
  {
    icon: Layers,
    title: "Chunk Engine",
    description: "Semantic chunking tuned for context retention.",
  },
  {
    icon: Binary,
    title: "Embeddings",
    description: "High-quality vector representations of your content.",
  },
  {
    icon: Database,
    title: "Vector Database",
    description: "Fast, scalable similarity search at query time.",
  },
  {
    icon: Server,
    title: "RAG API / MCP Server",
    description: "One endpoint for every LLM and agent.",
  },
];

const models = ["ChatGPT", "Claude", "Gemini", "Other AI"];

function LandingPage() {
  return (
    <main className="min-h-screen bg-background font-body text-foreground">
      <Hero />
      <PipelineSection />
      <CapabilitiesSection />
      <StackSection />
      <IntegrationsSection />
      <CTASection />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mx-auto max-w-4xl hero-fade">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
          <Sparkles className="size-4" />
          Product-focused AI pipeline
        </span>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Turn content into{" "}
          <span className="text-primary">AI-ready answers</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-xl">
          One pipeline from writing to retrieval. Organise articles, blogs and docs, chunk them into
          vectors, and serve the right context to ChatGPT, Claude, Gemini and any other AI.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <a href="#pipeline">
              Explore the pipeline <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline">
            View docs
          </Button>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ChevronDown className="size-6 animate-bounce text-muted-foreground" />
      </div>
    </section>
  );
}

function PipelineSection() {
  return (
    <section id="pipeline" className="relative px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 text-center scroll-reveal">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">The full pipeline</h2>
          <p className="mt-4 text-muted-foreground">Every stage, from first draft to final answer.</p>
        </div>
        <div className="relative">
          <div className="absolute bottom-0 left-8 top-0 w-px bg-border sm:left-1/2 sm:-translate-x-1/2" />
          <div className="space-y-12">
            {pipeline.map((stage, index) => (
              <PipelineStage key={stage.title} {...stage} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PipelineStage({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  index: number;
}) {
  const isLeft = index % 2 === 0;
  return (
    <div
      className={`relative flex items-center gap-8 scroll-reveal sm:gap-0 ${isLeft ? "sm:flex-row" : "sm:flex-row-reverse"}`}
    >
      <div
        className={`hidden rounded-xl border bg-card p-6 shadow-sm sm:block sm:w-1/2 ${isLeft ? "sm:mr-12 sm:text-right" : "sm:ml-12 sm:text-left"}`}
      >
        <div
          className={`mb-3 flex items-center gap-3 ${isLeft ? "sm:justify-end" : "sm:justify-start"}`}
        >
          <div className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <h3 className="font-heading text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="absolute left-8 z-10 flex size-4 items-center justify-center rounded-full border-2 border-background bg-muted-foreground sm:left-1/2 sm:-translate-x-1/2 pipeline-dot" />

      <div className="pl-16 sm:hidden">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <div className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
            <h3 className="font-heading text-base font-semibold">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

function CapabilitiesSection() {
  return (
    <section className="bg-secondary/30 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center scroll-reveal">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Content types, unified
          </h2>
          <p className="mt-4 text-muted-foreground">Manage every format in one editor.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {capabilities.map((item) => (
            <Card key={item.title} className="scroll-reveal">
              <CardHeader>
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <CardTitle className="font-heading">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function StackSection() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center scroll-reveal">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Built for retrieval</h2>
          <p className="mt-4 text-muted-foreground">Everything you need to turn content into context.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stack.map((item) => (
            <Card key={item.title} className="scroll-reveal">
              <CardHeader>
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <CardTitle className="font-heading">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntegrationsSection() {
  return (
    <section className="bg-secondary/30 px-4 py-24">
      <div className="mx-auto max-w-4xl text-center scroll-reveal">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Serve any AI</h2>
        <p className="mt-4 text-muted-foreground">One RAG API. Multiple models. Grounded answers.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {models.map((model) => (
            <div
              key={model}
              className="rounded-full border bg-card px-5 py-2 text-sm font-medium text-card-foreground shadow-sm"
            >
              {model}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-3xl scroll-reveal rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-12">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to turn content into answers?
        </h2>
        <p className="mt-4 text-muted-foreground">Start building your AI pipeline today.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg">Get started</Button>
          <Button size="lg" variant="outline">
            Talk to sales
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Content to AI Answers. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
