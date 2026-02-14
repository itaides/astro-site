# Design System: Arctica Digital

## 1. Visual Theme & Atmosphere

A sleek, arctic-inspired dark theme that feels **premium, confident, and modern**. The overall vibe is sophisticated and high-contrast — deep navy backgrounds with electric arctic-blue and soft violet accents that suggest cold precision and creative energy. The design breathes with generous whitespace and smooth transitions, creating an atmosphere that is simultaneously minimal and bold. Think "northern lights over dark water."

## 2. Color Palette & Roles

- **Deep Navy** (#0f1b2d) — Primary background, the "night sky" canvas for all content
- **Dark Surface** (#111827) — Card backgrounds, elevated surfaces, subtle layering over navy
- **Arctic Blue** (#4fc3f7) — Primary accent, used for interactive elements, links, highlights, and gradient starts
- **Soft Violet** (#a78bfa) — Secondary accent, used for gradient endpoints, hover states, and decorative elements
- **Light Text** (#f1f5f9) — Primary text, headings, strong copy — high contrast against navy
- **Muted Text** (#94a3b8) — Secondary text, descriptions, labels — softer contrast
- **Glass White** (rgba(255,255,255,0.05)) — Semi-transparent surfaces for glass-effect cards and overlays
- **Border Subtle** (rgba(255,255,255,0.08)) — Fine borders on cards and dividers
- **Gradient Accent** — Linear gradient from Arctic Blue (#4fc3f7) to Soft Violet (#a78bfa), used on CTAs, hero accents, and decorative lines

## 3. Typography Rules

- **Headings:** Outfit (Google Fonts), weights 600-700, tight letter-spacing (-0.02em for large headings, -0.01em for smaller). Clean, geometric sans-serif that feels modern and authoritative.
- **Body:** Inter (Google Fonts), weights 400-500, normal letter-spacing. Highly readable, neutral sans-serif optimized for screens.
- **Scale:** 4rem (hero) → 2.5rem (h2) → 1.5rem (h3) → 1.125rem (body) → 0.875rem (small)
- **Line height:** 1.1 for headings, 1.7 for body text

## 4. Component Stylings

- **Buttons:** Pill-shaped (border-radius: 100px). Primary buttons use the Gradient Accent background with Light Text. On hover, subtle glow effect (box-shadow with Arctic Blue at 30% opacity). Secondary buttons have transparent backgrounds with Arctic Blue borders.
- **Cards/Containers:** Gently rounded corners (16px). Glass-effect backgrounds using Glass White with 1px Border Subtle. On hover, cards lift slightly (translateY -4px) with a faint Arctic Blue glow.
- **Navigation:** Semi-transparent sticky header with backdrop-blur (12px). Links in Muted Text, active/hover in Arctic Blue.
- **Inputs/Forms:** Dark Surface backgrounds, 1px Border Subtle, gently rounded (12px). Focus state adds Arctic Blue border glow.

## 5. Layout Principles

- **Container:** Max-width 1200px, centered, with 24px horizontal padding
- **Grid:** CSS Grid, 12-column base, responsive collapse to 6-col (tablet) and single-col (mobile)
- **Spacing scale:** 4px base unit — 8, 16, 24, 32, 48, 64, 96px increments
- **Section padding:** 96px vertical padding between major sections, 48px on mobile
- **Whitespace philosophy:** Generous — content breathes. Avoid visual density.

## 6. Design System Notes for Stitch Generation

When generating screens for Arctica Digital, include this block in every prompt:

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, Desktop-first, responsive
- Theme: Dark, sleek, arctic-inspired, premium agency
- Background: Deep Navy (#0f1b2d)
- Surface: Dark Surface (#111827) for cards
- Primary Accent: Arctic Blue (#4fc3f7) for links, buttons, highlights
- Secondary Accent: Soft Violet (#a78bfa) for gradients, decorative elements
- Text Primary: Light (#f1f5f9) for headings and body
- Text Secondary: Muted (#94a3b8) for descriptions
- Headings Font: Outfit, semi-bold to bold, tight letter-spacing
- Body Font: Inter, regular to medium
- Buttons: Pill-shaped, gradient background (Arctic Blue → Soft Violet)
- Cards: Rounded (16px), glass-effect (semi-transparent white bg, subtle border)
- Spacing: Generous whitespace, 96px between sections
