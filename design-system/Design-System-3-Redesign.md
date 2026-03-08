# Design System 3 — Redesign (`/redesign`)

*Extracted from the live `/redesign` route — purple variations, glassmorphism dark*

---

## Route

**Path:** `/redesign`

**Source:** `apps/landing/app/redesign/redesign.css`, `apps/landing/components/redesign/*`

---

## Pattern

**Name:** Conversion-Optimized

- Hero → Pain Points → How It Works → Demo → Features → Social Proof → Pricing → Final CTA
- Sticky navbar with backdrop blur on scroll
- Section anchors: #features, #how-it-works, #pricing

---

## Style

**Name:** Glassmorphism (dark)

- **Keywords:** Frosted glass, translucent overlays, dark slate background, purple accents, layered depth
- **Effects:** `backdrop-blur-xl`, `backdrop-blur-sm`, translucent borders, gradient icon badges
- **Best For:** Modern SaaS, fintech, conversion-focused landing pages

---

## Colors

| Token        | Hex / Value                    | Usage                                      |
|--------------|--------------------------------|--------------------------------------------|
| Background   | `#0F172A`                      | Page background (slate-900)                 |
| Elevated     | `#1E293B`                      | Cards, elevated surfaces (slate-800)        |
| Text         | `#F8FAFC`                      | Primary text (slate-50)                    |
| Text Muted   | `#94A3B8`                      | Captions, labels (slate-400)               |
| Primary      | `#8B5CF6`                      | Violet-500 — CTAs, accents, gradients       |
| Primary Hover| `#7C3AED`                      | Violet-600 — hover states                  |
| Secondary    | `#A78BFA`                      | Violet-400 — gradient accents             |
| CTA          | `#8B5CF6`                      | Same as primary                            |
| CTA Hover    | `#7C3AED`                      | Same as primary-hover                      |
| Border       | `rgba(255, 255, 255, 0.12)`    | Subtle borders                             |
| Glass        | `rgba(255, 255, 255, 0.06)`    | Glass/translucent overlays                 |
| Glass Border | `rgba(255, 255, 255, 0.15)`    | Glass card borders                         |
| Accent       | `rgba(139, 92, 246, 0.2)`      | Accent tint background                     |
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
.redesign-theme {
  --r-bg: #0F172A;
  --r-bg-elevated: #1E293B;
  --r-text: #F8FAFC;
  --r-text-muted: #94A3B8;
  --r-primary: #8B5CF6;
  --r-primary-hover: #7C3AED;
  --r-secondary: #A78BFA;
  --r-cta: #8B5CF6;
  --r-cta-hover: #7C3AED;
  --r-border: rgba(255, 255, 255, 0.12);
  --r-glass: rgba(255, 255, 255, 0.06);
  --r-glass-border: rgba(255, 255, 255, 0.15);
}
```

---

## Accessibility

- `prefers-reduced-motion` respected (animations reduced to 0.01ms)
- High contrast: white text on dark slate
- Primary CTA: dark text on violet (primary-foreground: #0F172A)

---

## Pre-Delivery Checklist

- [ ] No emojis as icons (use Lucide)
- [ ] `cursor-pointer` on clickable elements
- [ ] Hover states with `transition-colors duration-200`
- [ ] Glass elements use `backdrop-blur-xl` or `backdrop-blur-sm`
- [ ] Gradient badges: primary → secondary
- [ ] Responsive: 375px, 768px, 1024px, 1440px
