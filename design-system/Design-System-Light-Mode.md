# Design System — Light Mode

*Light mode counterpart of the InstaPay-inspired design system. Same brand DNA (purple + orange), inverted for bright, clean surfaces.*

*Source: [Notion — Design System Light Mode](https://www.notion.so/karimtamer/Design-System-Light-Mode-76da6aac609b48a989bd1dea85a50947)*

---

## Target

**Insta Checkout** — Clean, bright, high-trust fintech aesthetic aligned with the InstaPay brand palette. White-dominant with deep purple text/accents and warm orange CTAs.

---

## Pattern

**Name:** Funnel (3-Step Conversion)

- **Conversion:** Progressive disclosure. Show only essential info per step. Use progress indicators. Multiple CTAs.
- **CTA:** Each step has a mini-CTA. Final section: main CTA.
- **Sections:**
  1. Hero (value prop + primary CTA)
  2. Pain Points (problem)
  3. How It Works (3-step solution)
  4. Features (benefits)
  5. Social Proof / Trust
  6. Pricing
  7. Final CTA

---

## Style

**Name:** Light Mode + Vibrant Block-based (hybrid)

- **Keywords:** Clean white, purple accents, warm orange CTAs, modern, professional, trust-forward, light theme
- **Best For:** Fintech, payment platforms, modern SaaS, conversion-focused landing pages, dashboard UIs
- **Performance:** ⚡ Excellent
- **Accessibility:** ✓ WCAG AAA (dark purple on white)
- **Effects:** Subtle shadows for elevation, light purple tint sections, bold hover states (color shift), smooth transitions (200–300ms)

---

## Colors (light mode mapping)

| Token        | Hex       | Usage                                      |
|--------------|-----------|---------------------------------------------|
| Background   | `#FAFAFA` | Warm white — page background                |
| Background Alt | `#F3EEFA` | Very light purple tint — alternating sections |
| Surface      | `#FFFFFF` | Cards, inputs, elevated surfaces            |
| Primary      | `#F97316` | Orange — primary CTAs, action buttons       |
| Primary Hover| `#EA580C` | Darker orange — hover/active states         |
| Secondary    | `#7C3AED` | Violet — secondary accents, badges, links  |
| Secondary Hover | `#6D28D9` | Darker violet — hover states             |
| Text         | `#1E0A3C` | Very dark purple — headings, body text      |
| Text Muted   | `#6B5B7B` | Muted purple-gray — captions, labels, hints |
| Border       | `#E4D8F0` | Light purple-gray borders                   |
| Icon         | `#F97316` | Orange — decorative icons, step badges, avatars |
| Icon Secondary | `#FB923C` | Gradient end for icon badges              |
| Icon BG      | `#FFEDD5` | Light orange — icon container backgrounds  |
| Success      | `#10B981` | Emerald — confirmations, checkmarks         |
| Error        | `#EF4444` | Red — error states                          |
| On Primary   | `#FFFFFF` | Icons/text on primary/CTA backgrounds       |
| Footer BG    | `#F3EEFA` | Light purple tint — footer (not dark)       |

**Design rationale:**
- **Orange stays identical** — CTAs must be consistent across modes for brand recognition
- **Orange is the accent** for decorative elements (icons, step badges, avatars) — keeps focus on CTAs
- **Text flips to very dark purple** (`#1E0A3C`) instead of pure black — maintains the brand tint
- **Background Alt uses a light purple wash** (`#F3EEFA`) instead of gray — keeps the page on-brand

---

## Typography

- **Heading:** Outfit (bold, modern, confident)
- **Body:** Rubik (clean, readable)
- **Arabic:** Cairo (weights 400, 500, 600, 700)
- **Monospace (numbers, codes):** JetBrains Mono

---

## Key Effects

- Light purple tinted section backgrounds (alternating `#FAFAFA` and `#F3EEFA`)
- Subtle purple-tinted shadows on cards: `box-shadow: 0 2px 8px rgba(45, 10, 78, 0.08)`
- Orange CTA glow on hover: `box-shadow: 0 0 20px rgba(249, 115, 22, 0.25)`
- Smooth transitions (200–300ms)
- Hero and Final CTA use **deep purple background** (`#2D0A4E`) with white text as contrast blocks
- **Footer** uses light purple tint (`#F3EEFA`) — not dark purple

---

## Dark Accent Blocks

Hero and Final CTA sections use a **dark purple background** even in light mode:
- **Hero section** — Deep purple (`#2D0A4E`) bg, white text, orange CTA
- **Final CTA section** — Same deep purple bg

---

## Anti-Patterns (Avoid)

- Pure gray backgrounds (use purple-tinted whites)
- Pure black text (use dark purple `#1E0A3C` instead)
- Flat cards with no elevation (light mode needs shadows for depth)
- Orange on white for small text (use for large buttons only)

---

## Pre-Delivery Checklist

- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] Hero and Final CTA use dark purple accent blocks
