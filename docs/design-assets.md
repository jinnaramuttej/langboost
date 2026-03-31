# LangBoost — UI/UX Design Assets Reference

This document captures the visual design system used across the LangBoost landing page and app, and lists every design asset in the repository together with usage guidance.

---

## 1. Color Palette

| Token | Hex | Usage |
|---|---|---|
| Background | `#070A08` / `#090C0A` | Page background, darkest surfaces |
| Surface / Card | `#101916` / `#0F1714` / `#0C1210` | Card backgrounds |
| Surface raised | `#111A16` / `#111713` | Hover / elevated cards |
| Border subtle | `rgba(255,255,255,0.08)` | Card borders |
| Border accent | `rgba(255,255,255,0.14)` | Highlighted card borders |
| Primary (lime) | `#D8F19F` | CTAs, highlights, active state |
| Primary soft | `#E3F5BE` / `#CCEE8A` | Secondary lime tints |
| Accent (sky) | `#7FC6FF` / `#93D4FF` | Secondary accent, charts |
| Text primary | `#F4F8F3` | Headings |
| Text secondary | `#9BA39F` / `#B0B8B3` | Body, captions |
| Text muted | `#7A8782` / `#6E7870` | Labels, meta |
| Gradient accent | `#D8F19F → #93D4FF` (linear) | Bars, lines, dividers |

---

## 2. Typography

| Role | Font | Weight | Size range |
|---|---|---|---|
| Display / Headings | **Syne** | 700 | 17 – 72 px |
| Body / UI labels | **Inter** | 400 / 600 | 10 – 18 px |
| Letter-spacing display | `tracking-display` | — | ≈ −0.02 em |
| Letter-spacing label | `letter-spacing: 2–3px` (uppercase) | — | 10 – 13 px |

---

## 3. Visual Language

### Surfaces & Glass
- Rounded corners: `rx="16–34"` (14 px – 34 px in Tailwind: `rounded-2xl` to `rounded-[34px]`)
- Backdrop blur on floating elements
- Subtle `rgba(255,255,255,0.08–0.14)` borders
- Layered gradients (dark bg → radial lime glow + radial sky glow)

### Ambient Glow Pattern
Every hero / section background uses two radial glows blurred with `feGaussianBlur stdDeviation="60–80"`:
```
Glow 1 — lime (#D9F2A6, 12–20% opacity) — positioned top-left or center-left
Glow 2 — sky  (#7FC6FF, 10–18% opacity) — positioned bottom-right or center-right
```

### Grid / Dot Texture
- `pattern` with `stroke-opacity="0.04–0.06"` applied over the background for depth.

### Accent Lines
- Gradient strokes (`#D8F19F → #93D4FF`) used for progress bars, dividers, chart lines.

---

## 4. Asset Inventory

### `public/images/landing/`

| File | Dimensions | Section | Description |
|---|---|---|---|
| `hero-scene.svg` | 1600 × 1200 | Hero | Full hero background showing the app UI (voice practice, dashboard, flashcard, XP) |
| `features-visual.svg` | 1400 × 800 | Features | Four-column illustration: AI Tutor · Spaced Repetition · Streak/XP · Lesson Library + Quizzes |
| `how-it-works.svg` | 1400 × 520 | How it works | Three-step visual: language picker → lesson card → progress/achievements |
| `testimonials-bg.svg` | 1400 × 400 | Testimonials | Decorative background with star ratings, quote glyphs, and avatar initials |

---

## 5. Icon Set

LangBoost uses **Lucide Icons** (already installed via `lucide-react`).

Key icons in use:

| Icon | Context |
|---|---|
| `Brain` | AI Tutor feature |
| `Layers` | Spaced Repetition feature |
| `BookOpen` | Lesson Library feature |
| `Flame` | Streak & XP |
| `ArrowRight` | CTA buttons |
| `Check` | Pricing feature list |
| `Moon` / `Sun` | Theme toggle |

---

## 6. Animation

Animations use **Framer Motion** (installed as `framer-motion`):

| Element | Effect |
|---|---|
| Hero text block | `opacity: 0→1, y: 20→0` over 400 ms |
| Hero visual block | Same, 150 ms delay |
| Potential additions | `whileHover: { scale: 1.02 }` on feature cards, staggered section entrances |

---

## 7. Design Inspiration & References

The following publicly available resources were used as design direction references during development. **No copyrighted material has been copied** — they inform the general aesthetic only.

### Language Learning Apps
- **Duolingo** – gamification patterns (streaks, XP, badges): <https://www.duolingo.com>
- **Pimsleur** – audio-first lesson UX: <https://www.pimsleur.com>
- **Babbel** – CEFR level progression UI: <https://www.babbel.com>

### SaaS Landing Page Design
- **Linear** – dark-theme SaaS landing with ambient glows: <https://linear.app>
- **Vercel** – minimal dark hero with code/UI previews: <https://vercel.com>
- **Liveblocks** – dark-mode feature grid layout: <https://liveblocks.io>
- **Resend** – card-based feature showcase: <https://resend.com>

### UI/UX Design Resources
- **Figma Community** – free dark-theme UI kits: <https://www.figma.com/community>
- **Dribbble** – "language app UI" search: <https://dribbble.com/search/language-app-ui>
- **Mobbin** – real app screen references: <https://mobbin.com>
- **Awwwards** – award-winning landing pages: <https://www.awwwards.com>
- **Godly** – curated web design gallery: <https://godly.website>

### Free Illustration / Image Sources
- **unDraw** – open-source SVG illustrations (MIT license): <https://undraw.co>  
  *(search "language", "learning", "study")*
- **Storyset** – animated illustrations for education: <https://storyset.com>  
  *(search "e-learning", "online education")*
- **SVGRepo** – open-source SVG icon & illustration library: <https://www.svgrepo.com>
- **Pexels** – free stock photos (CC0): <https://www.pexels.com>  
  *(search "language learning", "study", "conversation")*
- **Unsplash** – free high-res photos: <https://unsplash.com>  
  *(search "study", "language", "education")*

### Free Video / Lottie Animation Sources
- **LottieFiles** – free Lottie JSON animations: <https://lottiefiles.com>  
  *(search "language", "chat", "streak", "study")* — can replace static SVG cards with animated versions
- **Mixkit** – free stock video clips (CC0): <https://mixkit.co>  
  *(search "language learning", "students", "conversation")*
- **Coverr** – free background videos: <https://coverr.co>

### Color & Gradient Tooling
- **Coolors** – palette generation: <https://coolors.co>
- **UI Gradients** – gradient presets: <https://uigradients.com>
- **Easing Gradients** – smooth CSS gradients: <https://larsenwork.com/easing-gradients>

---

## 8. Recommended Future Assets

| Section | Asset needed | Suggested source |
|---|---|---|
| Hero | Short autoplay video loop (app walkthrough) | Record with screen capture tool; host as `/public/videos/hero-loop.mp4` |
| Features | Lottie animations per feature card | LottieFiles — replace static icons with 2–3 s loops |
| Testimonials | Real user avatars | Unavatar / DiceBear API for generated avatars |
| Community page | Forum thread screenshots | In-app screenshots once content is available |
| Loading skeleton | Animated placeholder SVGs | Build in Tailwind with `animate-pulse` |

---

## 9. Tailwind Design Tokens (Key Customisations)

From `tailwind.config.js` and `globals.css`:

```
--background       dark surface base
--foreground       #F4F8F3
--primary          lime accent (#D8F19F family)
--muted-foreground #7A8782 family
--border           rgba(255,255,255,0.1)
--card             dark raised surface
```

Typography extension:
```js
fontFamily: { syne: ['Syne', ...] }
letterSpacing: { display: '-0.02em' }
lineHeight: { display: '1.05', body: '1.65' }
```
