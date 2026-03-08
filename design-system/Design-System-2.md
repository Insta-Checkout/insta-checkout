# Design System 2 — Insta Checkout (InstaPay Brand)

*Inspired by the InstaPay visual identity: deep purple, white, orange/coral accents*

---

## Target

**Insta Checkout** — Dark, bold, high-trust fintech aesthetic aligned with the InstaPay brand palette. Purple-dominant with warm orange accents for CTAs and energy.

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

**Name:** Dark Mode + Vibrant Block-based (hybrid)

- **Keywords:** Deep purple, bold, high contrast, vibrant accents, modern, energetic, trust-forward, dark theme
- **Best For:** Fintech, payment platforms, modern SaaS, conversion-focused landing pages
- **Performance:** ⚡ Excellent
- **Accessibility:** ✓ WCAG AAA (high contrast white on purple)
- **Effects:** Minimal glow on accents, subtle gradient overlays, bold hover states (color shift), smooth transitions (200–300ms)

---

## Colors (extracted from InstaPay brand)

| Token             | Hex       | Usage                                      |
|------------------|-----------|---------------------------------------------|
| Background       | `#2D0A4E` | Deep purple — page background               |
| Background Alt   | `#3B0F64` | Slightly lighter purple — card/elevated bg  |
| Surface          | `#4A1A7A` | Cards, inputs, elevated surfaces            |
| Primary          | `#F97316` | Orange — primary CTAs, action buttons       |
| Primary Hover    | `#EA580C` | Darker orange — hover/active states         |
| Secondary        | `#FB923C` | Light orange/coral — secondary accents      |
| Text             | `#FFFFFF` | White — headings, body text                 |
| Text Muted       | `#D4B5F0` | Light lavender — captions, labels, hints    |
| Border           | `rgba(255, 255, 255, 0.15)` | Subtle white borders          |
| Glass            | `rgba(255, 255, 255, 0.08)` | Glass/frosted overlays        |
| Success          | `#10B981` | Emerald — confirmations, checkmarks         |
| Error            | `#EF4444` | Red — error states                          |

**Notes:** Deep purple conveys tech/fintech trust. Orange accents create urgency and warmth for CTAs — matching the InstaPay chevron. White text on purple gives strong contrast (WCAG AAA).

---

## Typography

**Option A — Startup Bold (recommended for landing):**
- **Heading:** Outfit (bold, modern, confident)
- **Body:** Rubik (clean, readable)
- **Google Fonts:** https://fonts.google.com/share?selection.family=Outfit:wght@400;500;600;700|Rubik:wght@300;400;500;600;700

**Option B — Financial Trust (recommended for dashboard):**
- **Heading:** IBM Plex Sans
- **Body:** IBM Plex Sans
- **Google Fonts:** https://fonts.google.com/share?selection.family=IBM+Plex+Sans:wght@300;400;500;600;700

**Arabic:** Cairo (weights 400, 500, 600, 700)
**Monospace (numbers, codes):** JetBrains Mono

---

## Key Effects

- Subtle purple-to-dark gradient backgrounds
- Minimal glow on orange CTAs (`box-shadow: 0 0 20px rgba(249, 115, 22, 0.3)`)
- Smooth transitions (200–300ms)
- Stat counter animations (number count-up)
- Fade-in on scroll (Framer Motion, small offsets ~20–30px)
- Orange accent pulse on primary CTA hover
- Glass/frosted card borders (`backdrop-filter: blur(12px)`)

---

## CSS Variables

```css
:root {
  --bg: #2D0A4E;
  --bg-elevated: #3B0F64;
  --surface: #4A1A7A;
  --text: #FFFFFF;
  --text-muted: #D4B5F0;
  --primary: #F97316;
  --primary-hover: #EA580C;
  --secondary: #FB923C;
  --border: rgba(255, 255, 255, 0.15);
  --glass: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.15);
  --success: #10B981;
  --error: #EF4444;
}
```

---

## Anti-Patterns (Avoid)

- Light/white backgrounds (breaks the dark brand feel)
- No security indicators (fintech needs trust signals)
- Complex navigation (keep it simple, conversion-focused)
- Hidden contact info
- Low-contrast text on purple (always verify 4.5:1+)

---

## Pre-Delivery Checklist

- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Text contrast 4.5:1 minimum (white on purple)
- [ ] Orange CTA buttons clearly visible against purple bg
- [ ] Focus states visible for keyboard nav
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] Trust/security indicators present (fintech requirement)
