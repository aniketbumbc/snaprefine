# Coder's Banana

An AI-powered image editor built with Next.js and the OpenAI image generation API. Upload a photo, paint a mask over the region you want to change, describe the edit, and let AI regenerate just that area — plus one-click background removal, style filters, and aspect-ratio expansion (outpainting).

## Features

- **Masked editing** — brush/erase tools to select a region, then prompt an edit that's applied only inside the mask while the rest of the image stays untouched.
- **AI filters** — one-click style transfers (Toonify, Ghibli Studio, Cyberpunk, Oil Painting) that preserve composition while restyling color/lighting.
- **Background removal** — strip the background from the current image.
- **AI expansion (outpainting)** — extend the canvas to a new aspect ratio (square, 16:9, 9:16, etc.) while keeping the original subject intact.
- **Edit history** — undo/redo through prior edits via the right sidebar (in-memory only, cleared on refresh).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com) primitives (`components/ui`)
- [Zustand](https://github.com/pmndrs/zustand) for editor state (`store/useEditorState.ts`)
- [OpenAI SDK](https://github.com/openai/openai-node) (`responses.create` with the `image_generation` tool) for edits/filters/expansion
- pnpm workspace

## Getting started

Install dependencies:

```bash
pnpm install
```

Create a `.env.local` file in the project root with:

```bash
OPENAI_API_KEY=sk-...
```

> `GEMINI_API_KEY` / `@google/genai` are present in the project but not currently wired into any code path.

Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.tsx              # main editor screen
  api/editImage/route.ts # OpenAI image edit/generation endpoint
components/
  image-editor.tsx       # canvas + masking UI
  left-sidebar.tsx        # tools, brush, filters, expansion options
  right-sidebar.tsx       # edit history
  prompt-input.tsx        # prompt bar
  ai-elements/            # generic chat/agent UI primitives
  ui/                     # shadcn/radix-based UI primitives
lib/
  editImage.ts            # client wrapper around /api/editImage
  constants.ts             # filters, aspect ratios, tool types
store/
  useEditorState.ts        # zustand store: image state, history, AI actions
```
