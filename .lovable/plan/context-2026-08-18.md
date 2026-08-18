Landing page animation refresh: neuron-chain variants

## Context
The current landing page uses a RAG-themed scroll-driven canvas animation: random nodes drift and converge into a central retrieval constellation as the user scrolls. The user wants to keep the "neurons / chain" metaphor but make it feel different.

## Goal
Replace the current constellation animation with a new scroll-driven neuron/chain concept that still communicates the pipeline from content to AI answer, but has a distinct visual personality.

## Proposed directions

### 1. Horizontal signal chain (recommended)
A clear left-to-right "neural cord" runs behind the page. Nodes are arranged in eight stage clusters (Writer → CRM → Articles/Blogs/Docs → Chunk → Embed → Vector DB → RAG API → AI → Answer). As the user scrolls, a bright pulse travels from left to right, activating each cluster in order. Dendritic threads connect nearby nodes within and between clusters. This directly mirrors the pipeline sections on the page.

- Pros: reinforces the narrative, easy to read, product-focused.
- Cons: slightly more structured, less abstract.

### 2. Deep-space neural network
Nodes are placed in multiple depth planes (z-layers). Scroll rotates the entire 3D network and pulls the camera forward through the network, with nodes lighting up as they pass the "retrieval point" in the center. This feels like traveling through a neural network rather than watching one collapse inward.

- Pros: cinematic, immersive, premium.
- Cons: can be visually busy on small screens.

### 3. Synaptic pulse tree
A single central "spine" runs vertically down the page. At each pipeline stage, a branch of neurons sprouts outward. The spine lights up progressively as the user scrolls, and each branch briefly flashes when reached. The metaphor is a growing nervous system / decision tree.

- Pros: vertical scroll mapping is perfect, clearly tied to page sections.
- Cons: needs careful spacing with mobile layout.

## Implementation
- All variants stay inside `src/components/ScrollBackground.tsx` as a `<canvas>`-based animation.
- Scroll progress remains the single driver (no idle auto-animation beyond subtle drift).
- Keep `prefers-reduced-motion` support.
- Use the existing Slate & Steel palette and semantic tokens.
- No changes to page structure, only the background animation.

## Next step
Choose one of the three directions above and I will implement it in the next build pass.