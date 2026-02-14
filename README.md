# Arctica Digital

Static website for [Arctica Digital](https://arctica.digital) — a branding and digital design agency.

## Tech Stack

- **[Astro](https://astro.build)** — Static site generator
- **[Lightning CSS](https://lightningcss.dev)** — CSS transformer & minifier
- **[Zod](https://zod.dev)** — Form validation (client + server)
- **[Bun](https://bun.sh)** — Package manager & runtime
- **[Cloudflare Pages](https://pages.cloudflare.com)** — Hosting & deployment

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Production build
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
├── docs/               # PRD, design system, site vision
├── functions/api/      # Cloudflare Pages Functions (contact form)
├── public/images/      # Static assets
├── src/
│   ├── components/     # Header, Footer
│   ├── content/blog/   # Blog posts (Markdown)
│   ├── layouts/        # Base layout
│   ├── pages/          # Routes (Home, About, Works, Contact, Insights)
│   ├── scripts/        # Client-side TypeScript
│   └── styles/         # BEM CSS (base, components, pages)
├── astro.config.mjs    # Astro + Lightning CSS config
└── wrangler.jsonc      # Cloudflare Pages config
```

## Deployment

The site is deployed to **Cloudflare Pages** with automatic builds on push to `main`.

### Setup

1. Connect the repo in [Cloudflare Pages Dashboard](https://dash.cloudflare.com)
2. Set build command: `bun run build`
3. Set output directory: `dist`
4. Enable **Email Routing** for the contact form (`hello@arctica.digital`)

### Contact Form

The contact form uses a **Cloudflare Pages Function** (`functions/api/contact.ts`) with the `send_email` binding for server-side email delivery. No third-party APIs or exposed keys.
