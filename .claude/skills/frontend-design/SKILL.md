---
name: frontend-design
description: "Build production-grade frontend UI for Insta Checkout with high design quality and UX best practices. Use this skill whenever building any UI for Insta Checkout — pages, components, sections, layouts, forms, or any visual output. Trigger on: 'build a hero section', 'create a pricing card', 'make a landing page', 'design a checkout component', 'add a section', 'create a UI for', 'build a form', 'fix the layout', 'improve the design', or any time you're producing HTML, JSX/TSX, or styled output for this project. Also trigger when reviewing or auditing existing UI for quality. Always use this skill for any frontend or visual work in Insta Checkout, even if the user doesn't mention branding or design."
---

# Insta Checkout — Frontend Design

Build production-grade, visually polished frontend interfaces for Insta Checkout. This skill combines the project's design system with UX best practices, accessibility standards, and intentional design craft.

---

## Design System

White-dominant with purple as the primary accent. Clean, bright, high-trust fintech aesthetic.

### Colors

| Token          | Hex       | Tailwind                  | Usage                                     |
|----------------|-----------|---------------------------|-------------------------------------------|
| Background     | `#FAFAFA` | `bg-[#FAFAFA]`            | Page background                           |
| Background Alt | `#F3EEFA` | `bg-[#F3EEFA]`            | Alternating sections                      |
| Surface        | `#FFFFFF` | `bg-white`                | Cards, elevated surfaces                  |
| Primary        | `#7C3AED` | `bg-[#7C3AED]`            | CTAs, icons, step badges, avatars         |
| Primary Hover  | `#6D28D9` | `hover:bg-[#6D28D9]`      | Hover states                              |
| Secondary      | `#8B5CF6` | `bg-[#8B5CF6]`            | Lighter purple — gradient end             |
| Icon           | `#7C3AED` | `text-[#7C3AED]`          | Decorative icons                          |
| Icon BG        | `#EDE9FE` | `bg-[#EDE9FE]`            | Icon container backgrounds                |
| Text           | `#1E0A3C` | `text-[#1E0A3C]`          | Headings, body                            |
| Text Muted     | `#6B5B7B` | `text-[#6B5B7B]`          | Muted purple-gray                         |
| Border         | `#E4D8F0` | `border-[#E4D8F0]`        | Light purple-gray borders                 |
| Deep Purple    | `#2D0A4E` | `bg-[#2D0A4E]`            | Hero & Final CTA section backgrounds      |
| Footer BG      | `#F3EEFA` | `bg-[#F3EEFA]`            | Light purple tint                         |

**Orange rule:** Orange is never used for standalone buttons. It only appears in gradient CTA buttons and subtle decorative elements (ambient glows, background orbs).

### Typography

| Role     | Font              | Weight   | Import                                        |
|----------|-------------------|----------|-----------------------------------------------|
| Headings | Outfit            | 600–800  | `next/font/google` — `Outfit`                 |
| Body/UI  | Plus Jakarta Sans | 400–600  | `next/font/google` — `Plus_Jakarta_Sans`       |
| Arabic   | Cairo             | 400–700  | `next/font/google` — `Cairo`                   |

### Buttons

**1. Gradient (Primary CTA)** — Hero CTA, final CTA, key conversion buttons:
```
bg-gradient-to-r from-[#7C3AED] to-[#EA580C]
shadow-lg shadow-[#7C3AED]/25
hover: from-[#6D28D9] to-[#C2410C] hover:shadow-xl hover:shadow-[#7C3AED]/30
```
White text, bold, `rounded-2xl`. Always include the purple glow shadow by default (not just on hover) — it makes the CTA pop, especially on dark backgrounds.

**2. Solid Purple (Secondary CTA)** — Navbar CTA, in-section actions:
```
bg-[#7C3AED] hover:bg-[#6D28D9]
```
White text, bold, `rounded-xl`.

**3. Outlined / Ghost** — Low-emphasis actions:
```
border border-[#E4D8F0] text-[#7C3AED] hover:bg-[#F3EEFA]
```

### Core Components

**Card:**
```jsx
<div className="bg-white rounded-xl border border-[#E4D8F0] shadow-sm p-6">
```

**Icon Badge:**
```jsx
<div className="w-12 h-12 bg-[#EDE9FE] rounded-full flex items-center justify-center">
  <Icon className="w-6 h-6 text-[#7C3AED]" />
</div>
```

**Section Label/Tag:**
```jsx
<span className="inline-block bg-[#EDE9FE] text-[#7C3AED] text-sm font-semibold px-4 py-1.5 rounded-full">
```

**Gradient Heading:**
```jsx
<h2 className="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">
```

### Effects

| Property       | Value                                              |
|----------------|-----------------------------------------------------|
| Card shadow    | `shadow-sm` with optional `shadow-[#7C3AED]/5`     |
| Transitions    | `duration-200` (interactions), `duration-300` (layout) |
| Border radius  | `rounded-xl` (cards/sections), `rounded-lg` (inputs), `rounded-full` (badges/avatars) |
| Borders        | `border border-[#E4D8F0]`                          |
| Ambient orbs   | `bg-[#F97316]/10–15 blur-[80–100px]` on dark purple sections |

### 7-Section Funnel Layout

| Section       | Background          | Text Color  | Notes                           |
|---------------|---------------------|-------------|----------------------------------|
| Hero          | `#2D0A4E`           | White       | + subtle orange ambient orbs     |
| Pain Points   | `#FAFAFA`           | `#1E0A3C`   |                                  |
| How It Works  | `#F3EEFA`           | `#1E0A3C`   |                                  |
| Features      | `#FAFAFA`           | `#1E0A3C`   |                                  |
| Social Proof  | `#F3EEFA`           | `#1E0A3C`   |                                  |
| Pricing       | `#FAFAFA`           | `#1E0A3C`   |                                  |
| Final CTA     | `#2D0A4E`           | White       | + subtle orange ambient orbs     |

---

## Design Thinking

Before coding any UI, pause and think about the context:

- **Purpose:** What does this interface solve? Who interacts with it?
- **Hierarchy:** What's the single most important action or message? Design around that.
- **Differentiation:** Even within the brand system, each section should have its own visual rhythm. Avoid monotony by varying layout patterns (centered, left-aligned, split, full-width).
- **Intentionality:** Every spacing choice, every shadow, every transition should be deliberate. Default values are the enemy of craft.

### Typography as Design

Typography isn't just readable text — it's a structural element:
- Hero headings should be bold and large: `text-4xl sm:text-5xl lg:text-6xl` with tight line height (`leading-[1.1]`). Center them in a single column for maximum impact.
- Use font weight and size to create hierarchy — not just color
- Line height: `leading-tight` (1.1–1.2) for headings, `leading-relaxed` (1.6–1.75) for body
- Line length: cap body text at 65–75 characters per line (`max-w-2xl` or `max-w-3xl`)

### Spatial Composition

- Use generous whitespace between sections (`py-20` to `py-32`)
- Consistent container widths (`max-w-6xl` or `max-w-7xl` with `mx-auto px-6`)
- Vary layout patterns across consecutive sections — don't use the same grid layout twice in a row
- On dark purple sections, let text breathe with extra padding

### Motion with Purpose

Animations should feel natural and purposeful, not decorative:
- Page load: staggered fade-ups with `animation-delay` (0.05–0.1s between items)
- Scroll reveals: fade-up or slide-in, triggered once (not on every scroll)
- Hover states: color and shadow transitions, not scale transforms that shift layout
- Keep all motion under 300ms for interactions, 500ms for entrances

---

## UX Best Practices

### Accessibility (CRITICAL)

These are non-negotiable. Every UI element must meet these standards:

- **Color contrast:** Minimum 4.5:1 ratio for normal text, 3:1 for large text (WCAG AA). The brand colors are pre-validated: `#1E0A3C` on `#FAFAFA` = 14.5:1, white on `#2D0A4E` = 13.2:1.
- **Focus states:** Visible focus rings on all interactive elements. Use `focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2`.
- **Alt text:** Descriptive alt text for meaningful images. Decorative images get `alt=""`.
- **ARIA labels:** Icon-only buttons must have `aria-label`.
- **Keyboard navigation:** Tab order matches visual order. All interactive elements reachable via keyboard.
- **Form labels:** Every input needs a visible `<label>` with `htmlFor`.
- **Reduced motion:** Wrap animations in `prefers-reduced-motion` media query or use `motion-safe:` Tailwind prefix.

### Touch & Interaction (CRITICAL)

- **Touch targets:** Minimum 44x44px for all interactive elements on mobile.
- **Cursor pointer:** Add `cursor-pointer` to every clickable element — cards, buttons, links, toggles.
- **Loading buttons:** Disable button and show spinner during async operations. Never let users double-submit.
- **Error feedback:** Display clear error messages adjacent to the problem, not in a generic toast.
- **Hover feedback:** Every interactive element needs a visible hover state (color, shadow, or border change).

### Performance (HIGH)

- **Images:** Use Next.js `<Image>` with WebP/AVIF, proper `width`/`height` to prevent layout shift, and `loading="lazy"` for below-fold images.
- **Content jumping:** Reserve space for async content (skeleton screens or fixed-height containers).
- **Animations:** Only animate `transform` and `opacity` — never `width`, `height`, or `margin`.

### Layout & Responsive (HIGH)

- **Mobile-first:** Design for 375px, then scale up to 768px, 1024px, 1440px.
- **No horizontal scroll:** Ensure all content fits viewport width. Test with `overflow-x-hidden` as a safety net, but fix root causes.
- **Readable font size:** Minimum 16px (`text-base`) for body text on mobile.
- **Fixed elements:** If using a fixed navbar, add corresponding `pt-` padding to the page content below it.
- **Z-index scale:** Use a defined scale: `z-10` (dropdowns), `z-20` (sticky nav), `z-30` (modals), `z-50` (toasts).

---

## Icons

Use SVG icons from **Lucide React** (`lucide-react`). Never use emojis as UI icons.

- Consistent sizing: `w-5 h-5` for inline, `w-6 h-6` for icon badges
- Color: `text-[#7C3AED]` for decorative, `text-[#1E0A3C]` for functional
- Always include `aria-hidden="true"` on decorative icons

---

## Pre-Delivery Checklist

Before presenting any UI code, verify every item:

### Brand Compliance
- [ ] All colors match the design system tokens (no arbitrary grays or blues)
- [ ] Headings use Outfit, body uses Plus Jakarta Sans
- [ ] Primary CTAs use the purple-to-orange gradient
- [ ] Secondary CTAs use solid purple
- [ ] No standalone orange buttons anywhere
- [ ] Cards use `border-[#E4D8F0]` and `shadow-sm`
- [ ] Section backgrounds alternate correctly per the funnel layout
- [ ] Dark purple sections include subtle orange ambient orbs

### Visual Quality
- [ ] No emojis used as icons (Lucide React SVGs only)
- [ ] Hover states don't cause layout shift (no `scale` transforms on cards)
- [ ] Transitions are smooth (`duration-200` for interactions)
- [ ] Typography hierarchy is clear (size + weight, not just color)
- [ ] Generous whitespace between sections

### Interaction & Accessibility
- [ ] All clickable elements have `cursor-pointer`
- [ ] All interactive elements have visible focus states
- [ ] All images have appropriate alt text
- [ ] All form inputs have labels
- [ ] Touch targets are 44x44px minimum
- [ ] `prefers-reduced-motion` respected for animations

### Responsive
- [ ] Works at 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop)
- [ ] No horizontal scroll on any breakpoint
- [ ] Font sizes are readable on mobile (16px+ body)
- [ ] Fixed/sticky elements don't overlap content

---

## Anti-Patterns to Avoid

These are common mistakes that make UI look unprofessional:

| Don't | Do Instead |
|-------|------------|
| Use emojis as icons | Use Lucide React SVGs |
| Use `scale` on hover for cards | Use color/shadow/border transitions |
| Mix container max-widths | Pick one (`max-w-6xl`) and use it everywhere |
| Leave default cursor on clickable elements | Add `cursor-pointer` |
| Use arbitrary colors outside the system | Stick to the design tokens |
| Use `Inter`, `Roboto`, or system fonts | Use Outfit (headings) + Plus Jakarta Sans (body) |
| Animate `width`/`height`/`margin` | Animate `transform` and `opacity` only |
| Skip focus states | Add `focus-visible:ring-2 focus-visible:ring-[#7C3AED]` |
| Put error messages in generic toasts | Show errors inline next to the problem |
| Use transparent/glass cards with low opacity | Use `bg-white` with `border-[#E4D8F0]` and `shadow-sm` |
