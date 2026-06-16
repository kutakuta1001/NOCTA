---
version: alpha
name: NOCTA-design-system
description: "A dark editorial serif-led music-brand interface anchored on warm-black canvas (#0A0906) and off-white type (#E8E0D0), where brand voltage comes from a single cool-silver accent (#B8B4AE) used sparingly for CTAs, section tags, and selective hover glow — never as a wall of color. Display type runs EB Garamond serif at modest weights; emphasis comes from size and silver contrast, not bold weight. Glass cards over a grain-noise field carry the depth; whitespace and 96px section rhythm do the framing. Two heading dialects coexist — Bebas Neue all-caps for portfolio surfaces, section-tag + Noto Sans JP for explanatory surfaces."

colors:
  primary: "#B8B4AE"
  accent: "#B8B4AE"
  ink: "#E8E0D0"
  muted: "#9A8A7A"
  canvas: "#0A0906"
  surface: "#0F0D0A"
  border: "#221c10"
  on-accent: "#0A0906"
  glass-fill: "rgba(255,255,255,0.03)"
  glass-fill-hover: "rgba(255,255,255,0.06)"
  glass-border: "rgba(255,255,255,0.08)"
  glass-border-hover: "rgba(255,255,255,0.14)"
  glow-accent: "rgba(184,180,174,0.40)"
  badge-works-bg: "rgba(245,158,11,0.20)"
  badge-works-ink: "#fbbf24"
  badge-art-bg: "rgba(184,180,174,0.20)"
  badge-art-ink: "#B8B4AE"

typography:
  display-hero:
    fontFamily: "EB Garamond, serif"
    fontSize: 100px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "4px"
  display-stat:
    fontFamily: "Bebas Neue, sans-serif"
    fontSize: 72px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: 0
  title-page:
    fontFamily: "Syne, sans-serif"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: 0
  title-section:
    fontFamily: "Syne, sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0
  title-section-jp:
    fontFamily: "Noto Sans JP, sans-serif"
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  title-card:
    fontFamily: "Syne, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  body:
    fontFamily: "Noto Sans JP, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: 0
  section-tag:
    fontFamily: "Syne, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "3px"
  badge:
    fontFamily: "Syne, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "1px"

rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px
  section-lg: 128px

components:
  glass-card:
    backgroundColor: "{colors.glass-fill}"
    textColor: "{colors.ink}"
    typography: "{typography.title-card}"
    rounded: "{rounded.lg}"
    padding: 24px
  glass-card-hover:
    backgroundColor: "{colors.glass-fill-hover}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.section-tag}"
    rounded: "{rounded.pill}"
    padding: 12px 32px
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: 12px 32px
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.section-tag}"
    rounded: "{rounded.pill}"
    padding: 12px 32px
  button-secondary-hover:
    backgroundColor: transparent
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    padding: 12px 32px
  filter-pill:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.section-tag}"
    rounded: "{rounded.pill}"
    padding: 8px 20px
  filter-pill-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.section-tag}"
    rounded: "{rounded.pill}"
    padding: 8px 20px
  section-tag:
    backgroundColor: transparent
    textColor: "{colors.accent}"
    typography: "{typography.section-tag}"
  text-gradient:
    backgroundColor: transparent
    textColor: "{colors.accent}"
    typography: "{typography.display-hero}"
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.section-tag}"
    height: 64px
  badge-works:
    backgroundColor: "{colors.badge-works-bg}"
    textColor: "{colors.badge-works-ink}"
    typography: "{typography.badge}"
    rounded: "{rounded.sm}"
    padding: 4px 12px
  badge-art:
    backgroundColor: "{colors.badge-art-bg}"
    textColor: "{colors.badge-art-ink}"
    typography: "{typography.badge}"
    rounded: "{rounded.sm}"
    padding: 4px 12px
---

## Overview

NOCTA's surfaces are dark and quietly editorial. The base atmosphere is warm-black canvas (`{colors.canvas}`), off-white type (`{colors.ink}`), generous whitespace, and a single cool-silver accent (`{colors.accent}`) — nothing is fighting for attention until a section needs it. The brand voltage doesn't come from multiple neon accents or color walls; it comes from **silver used sparingly** — CTA buttons, section tags, and selective hover glow — punctuating a long, calm, magazine-like scroll. Between the silver moments the page reads like a print spread: a section tag, a serif headline, supporting copy, a glass card cluster, then breathing room. The silver-on-warm-black pairing reads metallic and restrained rather than warm.

Type voice is **EB Garamond** (serif) for display and **Syne** for headings/labels, at modest weights. Display headlines lean on size and silver contrast for emphasis — **never bold weight for its own sake** (a serif display at 600 is already its ceiling). Body copy stays at 14px Noto Sans JP throughout. Depth is delegated to **glass cards** (translucent fill + backdrop blur) floating over a permanent **grain-noise field**, not to heavy shadows.

**Key Characteristics:**
- Single accent system: `{colors.accent}` (cool silver #B8B4AE) is the only brand voltage color. There is no second accent, no gold, no lavender, no pastel wall. (The retired neon-green / lavender palette and the earlier gold direction are both abandoned — see Known Gaps.)
- Primary CTA is a silver pill (`{component.button-primary}`) with `{colors.on-accent}` text — confident and final, used at most once per viewport.
- Secondary CTA is a transparent outline pill (`{component.button-secondary}`) that brightens to silver on hover. The two together form NOCTA's button pair.
- Hero is warm-black canvas with grain noise and orbital rings — no light gradient, no aurora, no white background. Brand strength comes from serif type, silver accent, and whitespace.
- Glass cards (`{component.glass-card}`) carry every content cluster; depth is **glass-blur first, glow second** — glow appears only on hover/active, never always-on.
- Two heading dialects coexist: **Bebas Neue all-caps** (`{typography.display-stat}` / large display) for portfolio surfaces (WORKS, VISUAL), and **section-tag + Noto Sans JP headline** (`{typography.title-section-jp}`) for explanatory surfaces (About, Services). Pick by section character, never mix within one section.
- Section rhythm is `{spacing.section}` (96px, `{spacing.section-lg}` 128px at desktop) of vertical breathing room between every major band — universal across every page.
- Border radius is hierarchical: `{rounded.lg}` (16px) for glass cards, `{rounded.pill}` for all buttons and filter pills, `{rounded.sm}` (8px) for badges.

## Colors

### Brand & Accent
- **Accent** (`{colors.accent}` — #B8B4AE): The single brand voltage color, a cool silver. Used for the primary CTA, section tags, active filter pills, and selective hover glow (`{colors.glow-accent}`). Used sparingly — it reads as confident, never decorative. In the live Tailwind config the legacy token names `primary` / `secondary` / `gold` / `vgreen` are all remapped to this one value.

### Surface
- **Canvas** (`{colors.canvas}` — #0A0906): The default warm-black page surface; the floor of every editorial body.
- **Surface** (`{colors.surface}` — #0F0D0A): Cards and inset panels (paired with glass treatment).
- **Border** (`{colors.border}` — #221c10): The hairline tone for dividers and secondary-button outlines.

### Text
- **Ink** (`{colors.ink}` — #E8E0D0): The off-white main text — headings, logo, body emphasis.
- **Muted** (`{colors.muted}` — #9A8A7A): Warm-grey subtext, captions, inactive filter labels.
- **On Accent** (`{colors.on-accent}` — #0A0906): Text color on silver CTA buttons and active pills (canvas color reused for maximum contrast).

### Glass & Glow
- **Glass fill / border** (`{colors.glass-fill}` / `{colors.glass-border}`): Translucent white at low alpha over a backdrop blur; brightens one step on hover (`{colors.glass-fill-hover}` / `{colors.glass-border-hover}`).
- **Accent glow** (`{colors.glow-accent}` — rgba(184,180,174,0.40)): A 50px soft silver glow applied only on hover / active state. Never always-on (it tires the eye).

### Badges
- **Works** (`{colors.badge-works-bg}` / `{colors.badge-works-ink}` — amber): Works-section badges (amber is a category color, the one sanctioned exception to the single-accent rule).
- **Art / Music** (`{colors.badge-art-bg}` / `{colors.badge-art-ink}` — silver): Art and Music visual badges.

## Typography

### Font Family
The system loads four families: **EB Garamond** (serif display / hero titles), **Syne** (headings, labels, nav, brand logo), **Bebas Neue** (numerals, dramatic all-caps display), and **Noto Sans JP** (Japanese body and explanatory headlines). No other font is loaded — adding one costs page speed and is off-system. (Inter and Space Grotesk appear in legacy fallback strings but are NOT loaded; treat them as dead references to remove.)

### Hierarchy

| Token | Size | Weight | Family | Use |
|---|---|---|---|---|
| `{typography.display-hero}` | clamp(52–100px) | 600 | EB Garamond | Pattern-A portfolio headlines (WORKS / VISUAL) |
| `{typography.display-stat}` | clamp(48–72px) | 400 | Bebas Neue | Large statistics / dramatic numerals |
| `{typography.title-page}` | 48px | 700 | Syne | Page titles |
| `{typography.title-section}` | clamp(30–36px) | 700 | Syne | Latin section headings |
| `{typography.title-section-jp}` | clamp(34–56px) | 700 | Noto Sans JP | Pattern-B Japanese explanatory headlines |
| `{typography.title-card}` | 18px | 600 | Syne | Card titles |
| `{typography.body}` | 14px | 400 | Noto Sans JP | Body copy, descriptions |
| `{typography.section-tag}` | 11px | 600 | Syne | Section tags (uppercase, 3px tracking) |
| `{typography.badge}` | 12px | 600 | Syne | Badge labels |

> **Note on tokens vs. clamp:** `display-hero`, `display-stat`, `title-section`, and `title-section-jp` are fluid in production via `clamp()` (ranges shown above). The front-matter tokens carry the **upper bound** (the `@google/design.md` schema accepts a single dimension); the lower bound and viewport unit live in the CSS `clamp()`.

### Principles
Emphasis is delegated to **size and silver contrast, not weight** — a serif display headline never needs to go bolder than 600. Where the system wants emphasis it goes bigger, or it adds the silver accent; it does not reach for 900. Noto Sans JP 900 is reserved for the rare heavy Japanese headline, never for body. Latin text never uses `font-jp` (Noto Sans JP sets Latin poorly).

**Two heading dialects** — decide per section, never mix within one section:
- **Pattern A (Bebas / EB Garamond all-caps):** for portfolio / collection surfaces where the work is the point (impact-first).
- **Pattern B (section-tag + Noto Sans JP headline):** for About / Services / Contact where copy must be read (read-first).

## Layout

### Spacing System
- **Base unit:** 4px (all spacing snaps to 4-multiples).
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 96px · `{spacing.section-lg}` 128px.
- **Section padding (vertical):** `{spacing.section}` (96px) is the universal minimum vertical rhythm; desktop bands open to `{spacing.section-lg}` (128px). Every major editorial band uses this rhythm.
- **Card internal padding:** `{spacing.lg}` (24px) inside glass cards. Never below `{spacing.xs}` (8px) — cramped cards read as cheap.
- **Gutters:** `{spacing.lg}` (24px) between cards in grids; `{spacing.xl}` (32px) in 2-column splits.

### Grid & Container
- **Max content width:** `max-w-7xl` centered, with `{spacing.lg}` (24px) horizontal breathing room on mobile, `{spacing.xxl}` (48px) at desktop.
- **Card grids:** 1 column on mobile, 2 at small, 3 at large.
- **2-column split:** stacks vertically below `md`, splits left/right above.

### Whitespace Philosophy
NOCTA uses whitespace as the dominant atmospheric tool — content should "float" in its margin rather than fill the frame. Hero sections sit in 96px+ of canvas with grain noise and orbital rings as the only ambient elements: no light gradient, no aurora, no white background. Body text caps at a readable measure (`max-w-2xl`) rather than spanning the full width. The system trusts whitespace and a single silver accent to do the framing.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border; grain noise field beneath | Body sections, top nav, footer |
| Glass | `{colors.glass-fill}` + backdrop blur + 1px `{colors.glass-border}` | All content cards, panels |
| Glass hover | Fill/border brighten one step (`{colors.glass-fill-hover}`) | Card hover state |
| Accent glow | 50px `{colors.glow-accent}` soft glow | CTA hover, active filter pill — hover/active only |
| Grain noise | Fixed fractal-noise overlay at ~0.35 opacity | Whole page (prevents flat, cheap look) |

The elevation philosophy is **glass-and-noise first, glow second**. Heavy drop shadows are absent; depth comes from translucent glass over the noise field and from the contrast of off-white type on warm black. Glow is an interaction signal (hover / active), never an always-on decoration.

### Decorative Depth
- **Orbital rings** appear in the hero only — slowly counter-rotating concentric rings (spin 80s / 50s / 30s). A single-surface signature, not a system-wide pattern.
- **Scroll line** at the hero base pulses vertically as a scroll affordance.
- **Grain noise** is permanent and system-wide — removing it flattens the brand.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Inline chips, tight inset corners |
| `{rounded.sm}` | 8px | Badges (Works / Art / Music) |
| `{rounded.md}` | 12px | Small inputs, secondary content corners |
| `{rounded.lg}` | 16px | Glass cards (the default card corner) |
| `{rounded.pill}` | 9999px | All buttons and filter pills (NOCTA's button signature) |
| `{rounded.full}` | 9999px | Avatars, circular icon affordances |

### Image Geometry
Visual-section art cards are portrait `aspect-[3/4]`. Works (video thumbnails) and Apps (screenshots) cards are `aspect-video` (16:9). Card images crop to fit their container rather than scaling up.

## Components

> **Hover IS in scope for NOCTA** (unlike a no-hover system): glow and glass-brightening are core interaction signals. Each component documents Default and Hover/Active. Variants live as separate entries in `components:`.

**`top-nav`** — A 64px warm-black bar. Brand wordmark (Syne) at left; nav items in `{typography.section-tag}`; a silver `{component.button-primary}` at right. Stays dark on every page — NOCTA never inverts to a light nav.

### Buttons

**`button-primary`** — The silver pill CTA. Background `{colors.accent}`, text `{colors.on-accent}`, type `{typography.section-tag}`, rounded `{rounded.pill}`, padding 12px × 32px. Used at most once per viewport.
- Hover: `button-primary-hover` adds a 50px `{colors.glow-accent}` glow.

**`button-secondary`** — Transparent outline pill. Border `{colors.border}`, text `{colors.ink}`, rounded `{rounded.pill}`. The "less-committed" pair to the primary.
- Hover: `button-secondary-hover` recolors border and text to `{colors.accent}`.

**`filter-pill`** — Collection filter (ALL / Instrumental …). Transparent with `{colors.muted}` label.
- Active: `filter-pill-active` fills `{colors.accent}`, text `{colors.on-accent}`, with `{colors.glow-accent}` glow.

### Cards & Containers

**`glass-card`** — The base content card. `{colors.glass-fill}` over backdrop blur, 1px `{colors.glass-border}`, rounded `{rounded.lg}` (16px), padding `{spacing.lg}` (24px). Carries works, apps, blog, visual content.
- Hover: `glass-card-hover` brightens fill and border one step.

### Tags & Type Treatments

**`section-tag`** — A small uppercase silver label (`{typography.section-tag}`, 3px tracking) with an auto 24px silver line prefix. Opens both heading patterns.

**`text-gradient`** — A silver-toned gradient fill on the brand name / hero title only. Never on body or description copy (unreadable).

### Badges

**`badge-works`** — Amber badge (`{colors.badge-works-bg}` / `{colors.badge-works-ink}`) for Works items.
**`badge-art`** — Silver badge (`{colors.badge-art-bg}` / `{colors.badge-art-ink}`) for Art / Music visuals.

## Do's and Don'ts

### Do
- Keep silver (`{colors.accent}`) as the single accent. One brand color, used sparingly, is the system.
- Reserve `{component.button-primary}` for one primary action per viewport — scarcity at the brand-action layer.
- Pair `{component.button-primary}` with `{component.button-secondary}` (outline pill) as the natural button row.
- Trust whitespace + grain noise + orbital rings as the hero atmosphere. No light gradient, no aurora, no white background.
- Emphasize with size and silver contrast before weight. Bigger before bolder — always (especially serif display).
- Apply glow (`{colors.glow-accent}`) only on hover / active. Never always-on.
- Anchor every editorial band with `{spacing.section}` (96px+) vertical padding.
- Pick one heading dialect per section (Pattern A for portfolio, Pattern B for explanatory) and stay in it.
- Keep the grain-noise field and the silver scrollbar — they are brand signatures.

### Don't
- Don't add a second accent color. The retired neon-green (#39FF6A) / lavender (#C8A2FF) palette and the earlier gold (#C4942A) direction are gone — do not reintroduce them.
- Don't use a white (#FFF) background or any light-mode style. NOCTA is dark-only.
- Don't bold serif display type past 600. Going heavier reads as a marketing-page template.
- Don't load a new font (no Inter, no Space Grotesk). Only EB Garamond / Syne / Bebas Neue / Noto Sans JP are in-system.
- Don't set Latin text in `font-jp` (Noto Sans JP), and don't put `text-gradient` on body copy.
- Don't leave glow on permanently, and don't drop the grain-noise overlay (the page goes flat and cheap).
- Don't set `z-index` ≥ 9999 (collides with the noise layer).
- Don't use Bebas Neue for section headings (it is for numerals / dramatic all-caps only).

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 640px | Single-column grids; nav collapses; horizontal padding `{spacing.lg}` (24px) |
| Small | 640–768px | 2-column card grids begin |
| Medium | 768–1024px | Type sizes step up; padding opens to `{spacing.xxl}` (48px); 2-column splits go side-by-side |
| Large | 1024–1280px | 3-column card grids; section padding opens to `{spacing.section-lg}` (128px) |
| Wide | > 1280px | Max content width caps at `max-w-7xl`; page adds outer margin rather than scaling type up |

### Collapsing Strategy
- Card grids reduce column count rather than scaling cards down.
- 2-column splits stack vertically (text above visual) below `md`.
- Body text holds its readable measure (`max-w-2xl`) rather than spanning full width at any breakpoint.

## Iteration Guide

1. Focus on ONE component at a time. Reference its YAML key directly (`{component.button-primary}`, `{component.glass-card}`).
2. When adding a component, decide first which heading dialect / surface it serves (portfolio Pattern A vs explanatory Pattern B).
3. Variants of an existing component (`-hover`, `-active`) live as separate entries in `components:` — never as nested state objects.
4. Use `{token.refs}` everywhere prose mentions a color, radius, typography role, or spacing value. Hex codes appear at most once next to the reference.
5. Always document Default and Hover/Active (NOCTA uses hover as a core signal).
6. Run `npx @google/design.md lint DESIGN.md` after edits — `broken-ref`, `contrast-ratio`, and `orphaned-tokens` warnings flag issues automatically.
7. When in doubt about emphasis: bigger type before bolder type; size and silver contrast before a second color.

## Visual Asset Generation Guide

When generating visuals with Claude Design / GPT Image 2 / Kling / Runway, reference this section so the brand definition need not be re-written each time. GPT Image 2 is generated manually in ChatGPT Plus (Thinking Mode recommended); no metered API use.

### Common Brand Specification (applies to all uses)

```
Dark warm black background #0A0906, off-white text #E8E0D0,
cool silver #B8B4AE accent glow, grain noise texture overlay,
EB Garamond serif display, Syne heading typography,
no bright colors, no white background, no red/pink/orange,
no neon green, no lavender purple, no warm gold
```

### Album Art

| Item | Value |
|---|---|
| Aspect | 1:1 (3000×3000px) |
| Background | `{colors.canvas}` (#0A0906) base with cosmos / nebula / glitch noise |
| Accent | `{colors.accent}` (#B8B4AE) silver glow |
| Typography | Bebas Neue or Syne; off-white or `{component.text-gradient}` lettering |
| Forbidden | Photoreal faces / light backgrounds / red tones |

```
deep space noir album cover, [title / world keywords],
cool silver #B8B4AE light streaks and accent glow,
dark warm-black background #0A0906, grain noise film texture,
ultra detailed, cinematic, square 1:1
```

### SNS Banner

| Platform | Size | Use |
|---|---|---|
| X header | 1500×500px (3:1) | Profile header |
| X post (landscape) | 1200×675px (16:9) | Release / standard |
| X post (portrait) | 1080×1350px (4:5) | Vertical content |
| Instagram square | 1080×1080px (1:1) | Feed |
| Instagram story | 1080×1920px (9:16) | Stories |

```
# X release banner (16:9)
NOCTA music release banner, [title / release info],
dark warm-black background #0A0906, cool silver #B8B4AE glow and accent lights,
glass morphism overlay, Bebas Neue title text, Syne subtitle,
grain noise texture, 16:9 aspect ratio, ultra high quality
```

```
# X header (3:1)
NOCTA music entertainment brand header,
deep space noir panoramic, cool silver #B8B4AE color scheme,
abstract sound wave or orbital rings motif, minimal text "NOCTA",
Syne bold typography, grain noise, 3:1 ultra wide
```

### Works Thumbnail (track card)

| Item | Value |
|---|---|
| Aspect | 16:9 (`aspect-video`) |
| Accent | `{colors.accent}` (#B8B4AE) silver glow |
| Background | `{colors.canvas}` (#0A0906) → `{colors.surface}` (#0F0D0A) gradient |

```
NOCTA music track thumbnail, [title / genre / world keywords],
cool silver #B8B4AE glow accent, dark warm-black background #0A0906,
Syne title typography, grain noise overlay, 16:9
```

### Apps Thumbnail (tool card)

| Item | Value |
|---|---|
| Aspect | 16:9 (`aspect-video`) |
| Accent | `{colors.accent}` (#B8B4AE) silver glow + glass morphism |
| Background | `{colors.canvas}` (#0A0906) + subtle geometric grid / circuit |

```
minimal tech app thumbnail, [tool name / function keywords],
dark warm-black background #0A0906, cool silver #B8B4AE glow,
subtle geometric circuit grid overlay, glass card element,
Syne label text, grain noise, 16:9
```

### Blog Cover (article header)

| Item | Value |
|---|---|
| Aspect | 16:9 (`aspect-video`) |
| Accent | `{colors.accent}` (#B8B4AE); distinguish AI/Tech vs Music **by motif, not hue** (single-accent system) |
| Tag | Category (AI / Music / Tech) top-left in `{component.section-tag}` style |

```
# AI / Tech motif
NOCTA blog cover image, [article theme keywords],
dark abstract background #0A0906, cool silver #B8B4AE glow,
neural network or circuit motif, editorial minimal style,
Syne category label text, grain noise texture, 16:9
```

```
# Music / production motif
NOCTA blog cover image, [article theme keywords],
dark abstract background #0A0906, cool silver #B8B4AE accent,
sound wave or synthesizer motif, editorial minimal style,
Syne category label text, grain noise texture, 16:9
```

### Visual Art (portrait card)

| Item | Value |
|---|---|
| Aspect | 3:4 (`aspect-[3/4]`) |
| Style | AI-generated art; cosmos / organic / cyberpunk |
| Badge | Art/Music: `{component.badge-art}` |

```
deep space concept art portrait, [theme keywords],
organic cyberpunk aesthetic, cool silver #B8B4AE color scheme,
dark warm-black background #0A0906, ultra detailed, grain film texture, 3:4 portrait
```

### GPT Image 2 Common Settings

Manual generation in ChatGPT Plus: open ChatGPT → set model to GPT Image 2 → turn Thinking Mode ON → paste the prompt (no API, no metered cost).

Always append this avoidance clause:
```
Avoid: bright colors, white background, daylight, cute, cartoon, pink, orange, red, realistic portrait photography, neon green, lavender purple, warm gold.
```

Aspect ratio (state in natural language inside the prompt):
```
1:1  → "in a 1:1 square format"
16:9 → "in a 16:9 landscape ratio"
3:4  → "in a 3:4 portrait ratio"
9:16 → "in a 9:16 vertical ratio"
3:1  → "in a 3:1 ultra-wide panoramic ratio"
```

Japanese text (≈99% accuracy):
```
Include Japanese text "〇〇" at [top/center/bottom]-[left/center/right] of the image, in bold off-white lettering.
```

### Claude Design Workflow

**Visuals (jackets / SNS banners):**
1. Run `/visual-prompt` to generate the GPT Image 2 prompt.
2. ChatGPT → GPT Image 2 → Thinking Mode ON.
3. Paste and generate manually (no API).
4. Upload the chosen image to IPFS.
5. Add the CIDv1 hash (59 chars) to `visual-data.js` via `/visual-add`.

**LP / UI pages:**
1. Run `/lp-create [target]` (handles both track LPs and explainer LPs).
2. The skill writes `drafts/design-brief-[target].md` — use its "Claude Design injection prompt".
3. The injection prompt is compressed to ≤800 tokens.

## Emotion-to-Visual Conversion Table

Referenced by `/lp-create` and Claude Design injection. **Rebuilt for the single-accent (silver) system** — the retired version varied the accent *hue* per emotion (lavender / green / gold); with one accent that no longer holds. Emotion is now expressed through **dominant surface, silver intensity/placement, layout, and noise**, not hue.

> This is a redesign of the old §12 semantics, not a mechanical color swap. Confirm with CEO before relying on it heavily.

| Emotion | Dominant surface | Silver usage | Layout tendency | Forbidden |
|---|---|---|---|---|
| Solitude / introspection | `{colors.canvas}` heavy, wide margins | Minimal — a single silver line or accent | Generous whitespace, centered, vertical | Crowds, busy color |
| Hope / awakening | `{colors.canvas}` opening to lighter off-white type | Silver glow increased, upward placement | Upward gaze guidance, open | Heavy shadow, claustrophobia |
| Tension / unease | `{colors.canvas}` near-pure, low light | Silver trace only (sparse) | Tight framing, asymmetry, tilt | Calm curves, brightness |
| Late-night / stillness | `{colors.surface}` (#0F0D0A) heavy | Muted; lean on `{colors.muted}` text | Horizontal spread, low contrast | High saturation, busy motion |
| Release / dynamism | `{colors.canvas}` with strong silver | Silver dominant, dynamic glow | Less whitespace, dynamic angles | Stagnation, single dark flat field |
| Melancholy / nostalgia | `{colors.surface}` warm grade | Silver as a restrained cool highlight | Centered, heavier grain noise | Over-bright, techno feel |
| Mystery / fantasy | `{colors.canvas}` + deep gradient | Silver stippling / floating points | Non-linear, floating | Rigid linear layout, inorganic |

Example: "solitude / dawn / hope" → solitude (canvas-heavy, wide margins) + hope (increased silver glow, upward composition), composited.

## Layout Pattern Library

Reference patterns for Claude Design / `/lp-create` LP construction.

### Pattern A: Centered hero (track LP, emotion-first)
```
[full-screen background: {colors.canvas} + grain noise]
  [center] logo / key visual (silver glow)
  [center] track title (Bebas Neue, all-caps)
  [center] tagline (Syne, small)
  [center] CTA button ({component.button-primary}, silver)
  [bottom] scroll line
```
Use: track LP (inheritance low/medium), impact-first.

### Pattern B: Text + visual 2-column (explainer LP, balanced)
```
[left] text block (section-tag → heading → body → CTA)
[right] key visual / screenshot (glass card)
※ side-by-side above md, stacked below
```
Use: product explainer LP (inheritance high).

### Pattern C: Feature grid (functions / characteristics)
```
[top] section-tag + heading (centered)
[bottom] 3-column grid: glass cards × 3–6
  each card: icon or numeral → heading → description
```
Use: service LP, product UI intro.

### Pattern D: Full-bleed quote (emotional track LP)
```
[full-screen] track theme image (darkened)
  [text overlay] a lyric line / catchcopy
  [bottom] track info + streaming links
```
Use: track LP (inheritance low), immersive.

## Homepage Composition & Rhythm (index.html)

The live homepage realizes the editorial principles below. Treat this section as the canonical spec for `index.html` structure.

### Section order & surface rhythm
`hero → stats → about (flat) → statement band (raised) → works (sink) → tools/apps (flat) → visual (sink) → blog (flat) → contact (flat) → footer`

- **Surface rhythm:** content bands alternate between flat canvas and a recessed `bg-black/30 border-y` "sink" so the dark scroll never reads as one uniform band (Airtable principle: never repeat the same surface mode in consecutive bands). Sink bands keep glass-card contrast high. Currently `works` and `visual` are sink; `about / apps / blog` are flat.
- Every band keeps `{spacing.section}`+ vertical rhythm (`py-32`).

### Statement band (voltage moment)
A full-bleed **raised glassy band** (`bg-white/[0.02] backdrop-blur-sm border-y`) sits between about and works, carrying a `{component.section-tag}` eyebrow ("Statement") and one large `{typography.display-hero}` line with a single italic-silver emphasis word. It is the dark-mode analog of a signature card: voltage from scale + surface lift, not from a second color. Copy is editorial/brand and CEO-owned (currently "遊ぶことで人生を彩ろう"). Keep to one such band per page.

### Featured-first grid
The Works grid renders the **first card at `lg:col-span-2`** (a wide featured card) to break the uniform 3-up "spec sheet" feel. Remaining cards stay uniform. Generated in the `NOCTA_WORKS.map` render (`i === 0`). md/mobile fall back to normal cards.

### Stats bar (four pillars)
Four data-driven counts, dynamically computed from the data arrays (auto-update as content grows):
`楽曲数` = `NOCTA_WORKS` · `ビジュアル数` = `NOCTA_VISUALS_WORKS + ART + MUSIC` · `ブログ数` = `NOCTA_BLOG` · `アプリ数` = `NOCTA_APPS`.
The retired stats (公開楽曲数 / 公開PV本数 / 制作中 / 可能性∞) are gone.

### Multi-domain identity
NOCTA is framed as a **multi-domain creative project, not a music-only label**. The four pillars (music / visual / words / code) appear in the stats, in the About copy ("音楽、映像、画像、言葉"), in the "越境 (Crossing)" value card, and in the footer tagline `Music × Visual × Words × Code`. Do not re-narrow copy to music-only, and do not reintroduce vocal-synthesis (歌声合成 / VOCALOID) as a headline theme.

### About signature visual (four-pillar orbital)
The About section's right column is a signature diagram: **Music / Visual / Words / Code** nodes converge by thin silver lines onto a center **living orb**. The orb is a metallic radial-gradient sphere (`.nocta-orb`: highlight top-left → silver → shadow edge) that gently breathes/floats (`orbFloat` 6s + `orbShine` 7s) — no text label (an earlier "SOUL" / "NOCTA" wordmark was removed as it read cheap). Two slow rotating rings (`orbit-1/2`) frame it. The diagram visually restates the four-pillar identity; keep the labels in sync with the stats pillars.

### Hero background loop (geometric)
The hero's decorative background (formerly a giant faint "2026") is a **seamless geometric loop**: concentric rotating polygons + dashed rings + pulsing orbiting dots, faint silver line-art, bottom-right, behind content (`z-0`, clipped by the hero's `overflow-hidden`). Every element's period is a divisor of the **30s master loop** (30s / 15s) so the whole composition returns to its first frame exactly every 30s (rotations are individually seamless). Respects `prefers-reduced-motion`. CSS lives under `.hero-geo` / `.geo-*` with `@keyframes geoSpinCW/CCW/geoBreathe/geoPulse`.

### Brand descriptor
The public descriptor is **"Creative" / 「クリエイティブ」**, not "Music Entertainment / 音楽エンタメ" (changed 2026-06-15 across `<title>`, hero eyebrow, and footer). Keep it domain-neutral — NOCTA is not a music-only label.

### Cat motif & AI/play duality
The page runs a narrative spine: **geometry = AI** (Hero geo loop, About orbital + silver orb, Tools — intentionally cat-free/clean) vs **play = a silver cat** that appears only **from Statement onward** and brings color. Arc: About 4-pillar dots colored red/yellow/blue/purple (the colors the cat will play with) → Statement (cat dips paint, `silver-paint.png`) → Portfolio (colorful SVG paw trail, slow) → Visual (cat sits watching, `silver-sit.png`) → Blog (cat walks, `silver-walk.png`) → paw-divider → Footer (cat sleeps, `silver-sleep.png`). Use the **silver** cat (dark bg). Keep cats **scarce** (~5 beats); never add to Hero/About/Tools. Assets in `website/img/cat/`. Full rationale: `DESIGN-NOTES.md` §7.

## Brand Inheritance Guide

Detail for the `/lp-create` brand-inheritance parameter.

| Inheritance | Use case | Can change | Must not change |
|---|---|---|---|
| **High** | Product UI / explainer LP | Layout, copy | Color system, fonts, animation |
| **Medium** | Genre-consistent track LP | Accent weighting (silver intensity) | `{colors.canvas}`, `{colors.accent}`, fonts |
| **Low** | Track-specific world LP (the-first-flower method) | Whole custom color scheme, partial fonts | Grain-noise texture, scrollbar, whitespace philosophy |

**Low-inheritance implementation example (the-first-flower):**
```css
/* Define track-specific colors in Tailwind config */
'tff-base': '#FCFBF5',    /* track main background */
'tff-accent': '#B168A8',  /* track accent */
```
Define in a separate namespace; do not overwrite NOCTA global colors. (the-first-flower's custom palette is intentional and exempt from the retired-color cleanup.)

## New Page / Section Checklist
- [ ] Background is `{colors.canvas}` (#0A0906) or `{colors.surface}` (#0F0D0A)
- [ ] Text is `{colors.ink}` (#E8E0D0) or `{colors.muted}` (#9A8A7A)
- [ ] Section opens with a `{component.section-tag}` label
- [ ] Headings use EB Garamond (`{typography.display-hero}`) or Syne (`{typography.title-section}`)
- [ ] Japanese body uses Noto Sans JP (`{typography.body}`)
- [ ] Glass cards use `{component.glass-card}` + hover
- [ ] CTA uses `{component.button-primary}` (silver)
- [ ] No retired colors (#39FF6A / #C8A2FF / #C4942A / #05050F) and no unloaded fonts (Inter / Space Grotesk)
- [ ] Image card aspect ratio respected (3/4 or video)
- [ ] Reveal animations staggered by delay
- [ ] Sections separated by `{spacing.section}` (96px+)
- [ ] Grain noise + scrollbar untouched

## Known Gaps

- **section-tag font:** Resolved — the live heading stack is `['Syne', 'Space Grotesk', ...]` where Syne is the loaded font and Space Grotesk is a dead fallback. This spec maps section-tag to **Syne** and the site cleanup removes the dead Space Grotesk fallback.
- **Palette history:** NOCTA moved gold (#C4942A) → silver (#B8B4AE) × off-white (#E8E0D0) on 2026-06-04; this spec reflects the silver decision (the live site). The earlier gold tokenization was reverted on 2026-06-15.
- **NOCTA-unique sections (color-cleaned):** Visual Asset Generation Guide, Emotion-to-Visual Conversion Table, Layout Pattern Library, and Brand Inheritance Guide were ported from the live doc's §11–14, remapped to the silver/off-white/warm-black palette. The **Emotion table was redesigned**, not swapped — its old per-emotion hue logic does not survive the single-accent system; needs CEO sign-off.
- **Live-site reconciliation (in progress):** The live `index.html` declares `brand.bg #0A0906` in its Tailwind config but hardcodes `body { background:#05050F; color:#F0F0F8 }`, and carries dead font fallbacks (Inter / Space Grotesk) and a leftover lavender glow. Secondary pages (`brand_assets.html`, `brandkit.html`, `success.html`, `blog/post.html`) still hold retired hexes. Cleanup unifies these to the tokens above; `the-first-flower/` is intentional and exempt.
- **Lint contrast warnings are expected (not failures):** `npx @google/design.md lint` reports contrast warnings because it composites alpha colors over **white** before measuring. NOCTA is dark-only, so off-white-on-glass and badge overlays render over `{colors.canvas}` (warm black) where real contrast is high. The borderline is `{colors.muted}` (#9A8A7A) — acceptable for non-essential subtext but avoid for primary copy.
- **Lint orphan-token warnings are expected (not failures):** `{colors.border}`, `{colors.glass-border}`, `{colors.glass-border-hover}`, and `{colors.glow-accent}` warn as "not referenced by any component" because the schema's component model has no `borderColor` or `glow` sub-token. These tokens are real and referenced in prose (outline buttons, glass borders, hover glow); keep them.
- **Animation timings** (reveal delays, orbit speeds, scroll-line) are described structurally but not formalized as tokens.
