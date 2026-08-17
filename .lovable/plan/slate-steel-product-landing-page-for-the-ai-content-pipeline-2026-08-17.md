Slate & Steel product landing page for the AI content pipeline

Design foundation
- Replace the placeholder in `src/routes/index.tsx` with a full scroll-driven landing page.
- Adopt the selected Slate & Steel palette: cool gray family (#2d3748, #4a5568, #718096, #a0aec0) implemented as oklch tokens in `src/styles.css`.
- Use Space Grotesk for headings and DM Sans for body text via `<link>` in `src/routes/__root.tsx` and `@theme` font tokens.
- Keep the look product-focused: generous whitespace, subtle rounded cards, restrained accent color, clear hierarchy, no decorative gradients unless minimal.

Landing page structure
- Hero section
  - Short headline about turning content into AI-ready answers.
  - Subheadline describing the unified pipeline: Writer → CRM/Content Editor → Chunks → Embeddings → Vector DB → RAG API/MCP → AI models.
  - Two CTAs: primary ("Explore the pipeline") and secondary ("View docs").
- Animated pipeline diagram
  - Scroll-driven vertical timeline showing each stage from Writer to User Answer.
  - Each stage is a card with an icon, title, and one-sentence description.
  - As the user scrolls, active stages highlight, connector lines fill, and a small indicator progresses.
- Capabilities section
  - Three product cards: Articles, Blogs, Documentation.
  - One-line benefit per card and a minimal icon.
- Technical stack section
  - Four cards for Chunk Engine, Embeddings, Vector Database, RAG API/MCP Server.
  - Clean, slightly more technical copy.
- Integrations / output section
  - Logo or label row for ChatGPT, Claude, Gemini, and "Other AI".
- Closing CTA section
  - Centered headline, short supporting line, primary CTA button.
- Footer
  - Minimal copyright and links.

Scroll animation approach
- Prefer CSS scroll-driven animations (`animation-timeline: scroll()`, `view()` transitions) where supported.
- Use a reduced-motion fallback for users who prefer reduced motion.
- If more complex orchestration is needed, add `motion` as a dependency and implement scroll-linked transforms with `useScroll` / `useTransform`.

SEO & metadata
- Add a `head()` function to `src/routes/index.tsx` with a unique title under 60 characters, meta description under 160 characters, og:type, twitter:card, and matching og:title/og:description.
- Keep the root route metadata generic but make the leaf route specific to the product.

Responsive behavior
- Single column on mobile, wider max-width centered container on desktop.
- Cards reflow as needed; timeline stays readable on small screens.

Out of scope
- No backend, database, auth, or server functions for this landing page only.
- No navigation to other routes unless strictly internal anchors.
