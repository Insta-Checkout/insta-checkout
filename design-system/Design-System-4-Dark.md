# Design System 4 — Dark (`/dark`)

*Extracted from the live `/dark` route — teal variations, glassmorphism dark*

---

## Route

**Path:** `/dark`

**Source:** `apps/landing/app/dark/dark-theme.css`, `apps/landing/components/redesign/*` (shared components)

---

## Pattern

**Name:** Conversion-Optimized

- Same section structure as `/redesign`: Hero → Pain Points → How It Works → Demo → Features → Social Proof → Pricing → Final CTA
- Sticky navbar with backdrop blur on scroll
- Section anchors: #features, #how-it-works, #pricing
- **Shared components** with `redesign` — only theme differs (teal vs purple)

---

## Style

**Name:** Glassmorphism (dark) — Teal variant

- **Keywords:** Frosted glass, translucent overlays, dark slate background, teal accents, layered depth
- **Effects:** `backdrop-blur-xl`, `backdrop-blur-sm`, translucent borders, gradient icon badges
- **Best For:** Modern SaaS, fintech, conversion-focused landing pages
- **Differentiator:** Teal palette matches main landing (`/`) — consistent brand identity

---

## Colors

| Token        | Hex / Value                    | Usage                                      |
|--------------|--------------------------------|--------------------------------------------|
| Background   | `#0F172A`                      | Page background (slate-900)                 |
| Elevated     | `#1E293B`                      | Cards, elevated surfaces (slate-800)        |
| Text         | `#F8FAFC`                      | Primary text (slate-50)                    |
| Text Muted   | `#94A3B8`                      | Captions, labels (slate-400)               |
| Primary      | `#0D9488`                      | Teal-600 — CTAs, accents, gradients        |
| Primary Hover| `#0F766E`                      | Teal-700 — hover states                    |
| Secondary    | `#14B8A6`                      | Teal-500 — gradient accents                |
| CTA          | `#0D9488`                      | Same as primary                            |
| CTA Hover    | `#0F766E`                      | Same as primary-hover                      |
| Border       | `rgba(255, 255, 255, 0.12)`    | Subtle borders                             |
| Glass        | `rgba(255, 255, 255, 0.06)`    | Glass/translucent overlays                 |
| Glass Border | `rgba(255, 255, 255, 0.15)`    | Glass card borders                         |
| Accent       | `rgba(13, 148, 136, 0.2)`      | Accent tint background                     |
| Footer BG    | `#020617`                      | Footer (slate-950)                         |

---

## Typography

- **Font:** Plus Jakarta Sans (weights 300, 400, 500, 600, 700)
- **Source:** `next/font/google`
- **Variable:** `--font-plus-jakarta`
- **Usage:** `font-sans antialiased`

---

## Component Tokens

| Element        | Usage                                                                 |
|----------------|-----------------------------------------------------------------------|
| Logo badge     | `bg-gradient-to-br from-[var(--r-primary)] to-[var(--r-secondary)]` + `shadow-[var(--r-primary)]/20` |
| Navbar (scrolled) | `bg-[var(--r-bg)]/80 backdrop-blur-xl border-b border-[var(--r-glass-border)]` |
| Glass card     | `bg-[var(--r-glass)]/50 backdrop-blur-xl border border-[var(--r-glass-border)]` |
| Glass card alt | `bg-[var(--r-glass)] backdrop-blur-sm`                               |
| Button (primary) | `bg-[var(--r-cta)]` + `hover:bg-[var(--r-cta-hover)]`               |
| Button (outline) | `border border-[var(--r-cta)] text-[var(--r-cta)]` + `hover:bg-[var(--r-cta)] hover:text-white` |
| Icon container | `rounded-xl` or `rounded-2xl`, gradient or solid primary              |

---

## CSS Variables (Raw)

```css
.dark-theme {
  --r-bg: #0F172A;
  --r-bg-elevated: #1E293B;
  --r-text: #F8FAFC;
  --r-text-muted: #94A3B8;
  --r-primary: #0D9488;
  --r-primary-hover: #0F766E;
  --r-secondary: #14B8A6;
  --r-cta: #0D9488;
  --r-cta-hover: #0F766E;
  --r-border: rgba(255, 255, 255, 0.12);
  --r-glass: rgba(255, 255, 255, 0.06);
  --r-glass-border: rgba(255, 255, 255, 0.15);
}
```

---

## Accessibility

- `prefers-reduced-motion` respected (animations reduced to 0.01ms)
- High contrast: white text on dark slate
- Primary CTA: white text on teal (primary-foreground: #FFFFFF)

---

## Relationship to Main Landing

| Token    | `/dark` (this) | Main landing (`/`) |
|---------|----------------|---------------------|
| Primary | `#0D9488`      | `#0D9488` ✓         |
| Primary Hover | `#0F766E` | `#0F766E` ✓     |
| Accent  | `#14B8A6`      | `#10B981` (emerald) |

The `/dark` route uses the same teal palette as the main landing for brand consistency across light and dark variants.

---

## Pre-Delivery Checklist

- [ ] No emojis as icons (use Lucide)
- [ ] `cursor-pointer` on clickable elements
- [ ] Hover states with `transition-colors duration-200`
- [ ] Glass elements use `backdrop-blur-xl` or `backdrop-blur-sm`
- [ ] Gradient badges: primary → secondary
- [ ] Responsive: 375px, 768px, 1024px, 1440px
