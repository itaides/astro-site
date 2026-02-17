# Design System: Arctica Digital

## 1. Visual Theme & Atmosphere

The design exudes **warm, premium minimalism** — a sophisticated blend of calm confidence and playful modernity. The aesthetic feels like a high-end boutique studio: approachable yet authoritative, detail-obsessed yet effortlessly clean. A warm beige canvas provides a soft, organic foundation, punctuated by bursts of vibrant electric blue that inject energy and forward-thinking personality.

The atmosphere is **airy and spacious**, with generous whitespace that lets content breathe. Depth is achieved through layered, whisper-soft shadows and a signature frosted-glass header that floats above the page. Motion is deliberate and smooth — elements glide into view with spring-like ease, creating a sense of crafted intentionality rather than mechanical precision.

**Mood keywords:** Sophisticated, warm minimalism, playful professionalism, premium boutique, modern craftsmanship, confident but approachable, detail-oriented, tech-forward.

## 2. Color Palette & Roles

### Foundations

| Descriptive Name | Hex Code | Role |
|---|---|---|
| Warm Parchment | `#f7f6f3` | Primary background — sets the warm, organic canvas |
| Toasted Linen | `#f2f0ec` | Warmer background variant for layered sections |
| Cool Fog | `#eef0f5` | Cooler background variant for contrast sections |
| Pure White | `#ffffff` | Card and surface backgrounds — creates elevation |
| Whisper White | `#faf9f7` | Barely-there off-white for subtle surface distinction |

### Text Hierarchy

| Descriptive Name | Hex Code | Role |
|---|---|---|
| Espresso Black | `#1a1715` | Primary text — warm near-black for comfortable reading |
| Charcoal Warm | `#4a4540` | Secondary text — supporting copy and descriptions |
| Warm Stone | `#8a8580` | Muted text — tertiary labels, timestamps, metadata |
| Sandstone Light | `#b5b0a8` | Dim text — placeholders and decorative numbers |
| Inverse White | `#ffffff` | Text on dark backgrounds |

### Accents

| Descriptive Name | Hex Code | Role |
|---|---|---|
| Electric Cobalt | `#3b3bff` | Primary brand accent — CTAs, links, focus states, selection highlight |
| Deep Cobalt | `#2929d6` | Hover state for primary accent |
| Soft Cobalt Wash | `rgba(59, 59, 255, 0.08)` | Accent background tint for hover states |
| Amethyst Purple | `#8b5cf6` | Secondary accent — gradient endpoints, decorative elements |
| Arctic Cyan | `#06b6d4` | Tertiary accent — gradient terminus, tech-forward highlights |
| Verdant Green | `#10b981` | Success states and positive indicators |
| Signal Red | `#ef4444` | Error states and form validation |

### Borders

| Descriptive Name | Value | Role |
|---|---|---|
| Hair-thin Warm | `rgba(26, 23, 21, 0.07)` | Default borders — nearly invisible structural lines |
| Subtle Hover | `rgba(26, 23, 21, 0.16)` | Border hover emphasis |
| Ghost Line | `rgba(26, 23, 21, 0.04)` | Ultra-subtle dividers |
| Defined Edge | `rgba(26, 23, 21, 0.22)` | Strong emphasis borders |

### Gradients

- **Accent Sweep:** Electric Cobalt → Amethyst Purple (135°) — used for button hover overlays and text highlights
- **Full Spectrum:** Cobalt → Amethyst → Cyan (135°) — wide gradient for decorative emphasis
- **Warm Drift:** Parchment → Toasted Linen (180°) — subtle background transitions
- **Dark Foundation:** `#1a1715` → `#2d2a26` (135°) — dark section backgrounds (footer, CTAs)
- **Glass Surface:** White 90% → White 60% (135°) — frosted glass overlays

## 3. Typography Rules

**Headings** use **Outfit** — a bold, geometric typeface with confident character. Weights range from 500 (medium) to 800 (extra-bold), with tight letter-spacing (-0.035em to -0.045em) that creates a dense, authoritative presence at large sizes. Line height is kept ultra-tight at 1.05 for dramatic impact.

**Body text** uses **Inter** — a clean, highly legible typeface designed for screens. Weights 400–600 are employed, with OpenType features enabled (`cv01`, `cv03`, `cv04`, `cv11`) for refined character rendering. Line height is a comfortable 1.65 for easy reading, with paragraph widths capped at 52 characters for optimal readability.

**Size scale** is fully fluid, using CSS `clamp()` for seamless responsive scaling:
- **Display:** 52px → 104px — hero headlines, maximum impact
- **Hero:** 44px → 96px — page titles
- **H1:** 34px → 56px — section headings
- **H2:** 28px → 42px — subsection headings
- **H3:** 18px → 23px — card titles, feature names
- **Body Large:** 19px — emphasized paragraphs
- **Body:** 17px — standard reading text
- **Small:** 15px — secondary information
- **Label:** 13px — UI labels, buttons, uppercase tags (tracked wide at 0.08–0.12em)
- **XS:** 12px — fine print, metadata
- **XXS:** 11px — smallest UI elements

## 4. Component Stylings

### Buttons

- **Primary:** Pill-shaped (fully rounded, 100px radius), dark Espresso Black background with light text. On hover, a Cobalt-to-Amethyst gradient fades in as an overlay, the button lifts upward by 2px, and a soft accent shadow appears beneath. Font is 13px, semi-bold, with slightly widened letter-spacing (0.03em) for a refined, uppercase feel.
- **Secondary:** Pill-shaped, white background with a hair-thin border. On hover, the border darkens to full Espresso Black and the button lifts subtly. Clean and minimal.
- **Ghost:** Borderless text link with an animated underline that grows from left to right in Electric Cobalt on hover. An arrow icon slides rightward. On hover, a soft Cobalt wash background appears. Used for "View more" and navigation links.

### Cards & Containers

- **Standard Cards:** Generously rounded corners (28px), white background, hair-thin warm border, soft layered shadow. On hover, the card lifts upward by 4px with an intensified shadow — creating a "picked up" feeling. Internal padding is spacious (48px).
- **Stat Cards:** More compact with 20px rounded corners, 16px/24px padding. Clean and informational.
- **Project Image Cards:** Portrait aspect ratio (4:5), 28px rounded corners with hidden overflow. The contained image slowly zooms to 105% on hover over 1 second. A pill-shaped label slides up from within the image on hover.
- **Dark Section Blocks:** Use the Dark Foundation gradient background with inverse white text and inverse-opacity borders (12% white).

### Inputs & Forms

- **Text Inputs:** Subtly rounded (12px), Whisper White background, hair-thin border. On focus, the border shifts to Electric Cobalt with a soft 3px Cobalt wash ring. Error states show Signal Red border with a matching red ring.
- **Checkbox Chips:** Pill-shaped toggle chips (11px text, semi-bold). Unselected: white with border. Selected: inverts to Espresso Black background with light text. Minimum touch target of 36px height.
- **Textareas:** Same styling as inputs, with a minimum height of 140px.

### Header

- **Frosted glass panel** fixed at the top — translucent warm Parchment (72% opacity) with a saturated 20px backdrop blur. Height is 72px. A ghost-line border sits at the bottom. Navigation links use the Ghost button pattern. The CTA button in the header is the Primary pill style.

### Custom Cursor

- A 10px Electric Cobalt dot follows the mouse with slight delay. On hovering interactive elements, it expands to a 56px translucent circle (15% opacity), creating a magnetic, premium interaction feel.

## 5. Layout Principles

**Container:** Content is centered with a maximum width of 1420px and fluid padding that scales from 24px on mobile to 56px on large screens (`clamp(1.5rem, 5vw, 3.5rem)`). A narrow variant (760px) is used for long-form reading content.

**Whitespace strategy** is generous and musical — section padding ranges from 64px to 176px depending on viewport, creating dramatic breathing room between content blocks. The spacing scale follows a harmonic progression: 4 → 8 → 16 → 24 → 32 → 48 → fluid(32–64) → fluid(48–96) → fluid(64–128).

**Grid patterns:**
- Two-column content grids with wide gutters (48–96px) for about/feature sections
- Three-column card grids with 32px gaps for project showcases
- Four-column stat grids with 24px gaps for metrics
- Single-column service rows with a structured 3-column sub-grid (number | content | tags) separated by hair-thin top borders

**Responsive behavior:** Grids gracefully collapse — 3-column → 2-column → single-column. The header CTA hides below 900px, replaced by a hamburger menu with a full-screen overlay. Font sizes and spacing scale fluidly via `clamp()`, ensuring the design feels intentional at every breakpoint.

**Unique layout features:**
- Section numbering (01 —, 02 —) for wayfinding
- Alternating RTL direction on every other list item for visual rhythm
- Infinite marquee strips for tech stack and partner logos
- Staggered reveal animations with intersection observer (items enter sequentially with 0.1s delays)
