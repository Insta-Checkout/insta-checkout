# Insta Checkout — Design System

*White background with purple accents. Clean, bright, high-trust fintech aesthetic.*

---

## Target

**Insta Checkout** — White-dominant with purple as the primary accent (CTAs, icons, badges).

---

## Pattern

**Name:** Funnel (3-Step Conversion)

- Section structure: Hero, Pain Points, How It Works, Features, Social Proof, Pricing, Final CTA
- Hero, Social Proof, and Final CTA use **deep purple background** (`#2D0A4E`) with white text
- All dark purple sections should include subtle orange ambient orbs (`bg-[#F97316]/10–15 blur-[80–100px]`) for warmth

---

## Style

- **Keywords:** Clean white, purple accents, modern, professional, trust-forward
- **Effects:** Subtle shadows, light purple tint sections, smooth transitions (200–300ms)

---

## Colors

| Token          | Hex       | Usage                                       |
|----------------|-----------|---------------------------------------------|
| Background     | `#FAFAFA` | Page background                             |
| Background Alt | `#F3EEFA` | Alternating sections                        |
| Surface        | `#FFFFFF` | Cards, elevated surfaces                    |
| Primary        | `#7C3AED` | Purple — CTAs, icons, step badges, avatars  |
| Primary Hover  | `#6D28D9` | Darker purple — hover states                |
| Secondary      | `#8B5CF6` | Lighter purple — gradient end               |
| Icon           | `#7C3AED` | Purple — decorative icons                   |
| Icon BG        | `#EDE9FE` | Light purple — icon container backgrounds   |
| Text           | `#1E0A3C` | Dark purple — headings, body                |
| Text Muted     | `#6B5B7B` | Muted purple-gray                           |
| Border         | `#E4D8F0` | Light purple-gray borders                   |
| Footer BG      | `#F3EEFA` | Light purple tint                           |

**Orange is never used for standalone buttons.** It may appear in gradient CTA buttons and subtle decorative elements (ambient glows, background orbs).

---

## Buttons

Buttons come in two styles. **Never use orange for buttons.**

### 1. Gradient (Primary CTA)

Use for high-emphasis actions — hero CTA, final CTA, key conversion buttons.

```
bg-gradient-to-r from-[#7C3AED] to-[#EA580C]
hover: from-[#6D28D9] to-[#C2410C]
```

- Purple-to-orange gradient — the only place orange appears in the design system
- White text, bold weight
- Rounded corners (`rounded-2xl`)
- Optional: subtle shadow on hover (`shadow-lg shadow-[#7C3AED]/25`)

### 2. Solid Purple (Secondary CTA)

Use for all other buttons — navbar CTA, in-section actions, secondary calls to action.

```
bg-[#7C3AED]
hover: bg-[#6D28D9]
```

- White text, bold weight
- Rounded corners (`rounded-xl`)

### Outlined / Ghost Buttons

For low-emphasis actions (language switcher, tertiary links):

```
border border-[#E4D8F0] text-[#7C3AED]
hover: bg-[#F3EEFA]
```

---

## Typography

- **Headings:** Plus Jakarta Sans / Outfit
- **Body:** Plus Jakarta Sans
- **Arabic:** Cairo
