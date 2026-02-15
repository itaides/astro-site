# Arctica Digital

Personal website for [Arctica Digital](https://arctica.digital) — solo web development & digital design by Itai Ben Zeev.

## Tech Stack

- **[Astro](https://astro.build)** — Static site generator (v5, Output: Static + Server Actions)
- **[Lightning CSS](https://lightningcss.dev)** — CSS transformer & minifier
- **[Zod](https://zod.dev)** — Type-safe schema validation
- **[Astro Actions](https://docs.astro.build/en/guides/actions/)** — Type-safe backend logic
- **[Biome](https://biomejs.dev)** — High-performance toolchain (Format/Lint)
- **[Cloudflare Pages](https://pages.cloudflare.com)** — Hosting & Serverless Functions
- **[Bun](https://bun.sh)** — Package manager

## Getting Started

```bash
# Install dependencies
bun install

# Start local dev server (Standard)
bun run dev

# Start local dev server (With Cloudflare Bindings)
# Use this to test Contact Form email sending locally
bun run dev:pages

# Production build
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
├── docs/               # PRD, design system, site vision
├── src/
│   ├── actions/        # Backend logic (contact form submission)
│   ├── components/     # Header, Footer, UI components
│   ├── content/blog/   # Blog posts (Markdown)
│   ├── layouts/        # Base layout
│   ├── pages/          # Routes (Home, About, Works, Contact, Insights)
│   ├── scripts/        # Client-side TypeScript (View Transitions compatible)
│   └── styles/         # BEM CSS (base, components, pages)
├── astro.config.mjs    # Astro (Cloudflare Adapter) + Lightning CSS config
├── wrangler.jsonc      # Cloudflare Pages config & bindings
└── package.json
```

## Deployment

The site is deployed to **Cloudflare Pages** via Git integration.

### Configuration

- **Build Command**: `bun run build`
- **Output Directory**: `dist`
- **Compatibility Flags**: `nodejs_compat` (Required for build artifact compatibility)

### Contact Form

The contact form is powered by **Astro Actions** (`src/actions/index.ts`).
- **Validation**: Server-side Zod validation.
- **Email**: Uses Cloudflare `send_email` binding (Email Routing) to deliver messages without third-party APIs.
- **Spam Protection**: Honeypot field (`website`) + server-side verification.
