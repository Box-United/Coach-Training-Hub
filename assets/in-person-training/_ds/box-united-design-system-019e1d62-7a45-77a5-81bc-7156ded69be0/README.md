# Box United Design System

> *We use boxing as a pathway for girls to unlock their full potential.*
> *Our boxing and leadership development program is designed to change the*
> *lives of girls so that they can change the world.*

This system contains everything you need to design on-brand for **Box United** and its program brand **Fight Like A Girl (F.L.A.G®)** — logos, fonts, colors, stickers, icons, graphic device, voice & tone, slide templates, and a marketing-site UI kit.

---

## At a glance

| | |
|---|---|
| **Parent brand** | Box United (501(c)(3) nonprofit) |
| **Program brand** | Fight Like A Girl (F.L.A.G®) — registered |
| **Founder / ED** | Mary Kate Vanecko — `marykate@boxunited.org` |
| **HQ** | Chicago, IL |
| **What** | Boxing + leadership development for girls — physical and mental wellbeing |
| **Vision** | A world where it's as normal for girls to grow up boxing as it is to grow up playing basketball |
| **Partners (2024–25)** | Nike, Obama Foundation, City of Chicago |

---

## Index

```
.
├── README.md              ← you are here
├── SKILL.md               ← Claude Code skill manifest
├── colors_and_type.css    ← drop-in CSS variables for color + type
├── fonts/                 ← Anton, PP Editorial New, Cooper BT
├── assets/
│   ├── logos/             ← Box United + FLAG, in Blue / Navy / Stone / White / Black
│   ├── graphic_device/    ← the abstract "B" / boxing-glove scribble
│   ├── icons/             ← 8 line-art icons × 3 colorways (Blue / Stone / Navy)
│   ├── stickers/          ← 8 die-cut sticker badges (Blue colorway)
│   └── imagery/           ← reference / campaign imagery
├── preview/               ← cards rendered in the Design System tab
├── slides/                ← deck template (Cover, Body, Divider, Statement, Thank You)
├── ui_kits/
│   └── marketing-site/    ← F.L.A.G marketing site recreation
└── research/              ← notes / sources extracted from the source PDFs
```

Source materials (provided by the client, not redistributed here):
- `FLAG Brand Guidelines` (26-page brand book — primary source of truth)
- `BRAND MANIFESTO` (positioning, voice, what-we-are/are-not)
- `Box United 2025 Annual Report`
- `BU × Obama Foundation` (program update deck)
- `Q4 Donor Update`
- `2026 Coach Training`
- `Brand Template Slides` (Canva deck — internal staff template)
- `GIRLS IN SPORT DAY` flyer (Nike partner event)
- Zips: `02_Logos`, `03_Color`, `04_Fonts`, `05_GraphicDevice`, `06_Icons`, `07_Stickers`

---

## Brand structure

There are **two locked brand marks**, used together or separately depending on context.

**Box United** — the corporate/parent mark. Custom retro-script wordmark with a registered ® inside the "O" of *Box*. Use it as the **sign-off** when F.L.A.G leads, or as the lead mark on commercial, corporate, fundraising, or operations material.

**Fight Like A Girl (F.L.A.G®)** — the program mark. More decorative script lock-up, registered. Use it as the **lead mark** on program, student, donor, and community communications. Always supported by the Box United sign-off somewhere on the piece.

> Heuristic: *Are we talking about the program (girls, classes, curriculum, stories)?* → FLAG leads.
> *Are we talking about the organization (grants, board, ops, partnerships)?* → Box United leads.

Minimum size: Box United **25 mm / 100 px** wide. F.L.A.G **30 mm / 150 px** wide. Safe-zone for Box United is the height/width of the "O" in BOX; for F.L.A.G it's the diameter of the ® mark in the lock-up.

---

## Content fundamentals

### Voice — what Box United sounds like

Read the manifesto in `research/manifesto.md`. The dial is set to **STRONG, NOT SOFT**.

| Lean into | Avoid |
|---|---|
| Strong | Soft |
| Disciplined | Chaotic |
| Empowering | Performative |
| Intense (focus, presence, urgency) | Intimidating |
| Welcoming | Watered down |
| Excellent | Average |

> "We do not believe fragility should be reinforced. We believe girls are capable of far more than the world often expects from them. We believe confidence is built through action, not endless discussion."

### How copy is written

- **Case**: Mix UPPERCASE (Anton, headlines, call-outs) with Title Case (Editorial + Cooper body). Sentence-case appears in app/web UI body and in playful sticker messages. Don't use ALL CAPS for body paragraphs.
- **Person**: *We* (the organization) and *girls / our girls / students* (the audience). Direct address ("you") is used in CTAs and donor/coach asks ("Your donation will…"). The student is rarely "you" — she is "her" or "she" in third person to keep the storytelling cinematic.
- **Punctuation**: Periods end full sentences; one-word sentences ("Strong." "Disciplined.") for rhythm. Em-dashes ok. Oxford comma. Title-style ampersands & in two-word callouts ("Serving Major Looks, & Right Hooks.").
- **Numerals**: Spell out one through nine in body; numerals for 10+ and any stat. Currency: `$50,000`, `$75k` (lowercase k in casual contexts).
- **Emoji**: Used **sparingly inside the org's internal deck system only** (e.g. 💥 🧠 🛠 🌱 in coach-training materials). **Do not use emoji on public-facing brand surfaces** — the brand's expressive load is carried by stickers and icons, not emoji.
- **No clinical language**. The brand is intentionally *not* therapy: no "trauma recovery," "treatment," "psychotherapy," "PTSD," "counseling." Say *confidence-building, mental wellbeing, emotional resilience, healthy coping tools, movement-based wellbeing* instead.
- **No political/activist framing**. Box United is not ideological; it serves girls from all backgrounds. Avoid "restorative justice," activist or identity-political phrasing.

### Brand vocabulary — preferred phrases

`physical and mental wellbeing` · `confidence` · `resilience` · `growth mindset` · `discipline` · `self-trust` · `emotional regulation` · `empowerment` · `strength` · `transformation` · `mind-body connection` · `fighter's mindset` · `healthy habits` · `leadership` · `challenge` · `consistency` · `capability` · `excellence` · `intensity`

Signature taglines and bigger phrases:
- **Empowering Girls to Become Leaders in Life.**
- **Train your body. Strengthen your mind.**
- **Build confidence from the inside out.**
- **Boxing builds resilience.** / **Boxing as transformation.** / **Confidence through movement.**
- Playful, social-ready callouts (use on stickers, posts, gear): **Serving Major Looks, & Right Hooks.** · **Hittin' The Bag, With Total Swag.** · **Nails On Fleek. Jab Ain't Weak.**
- Operating principle headers: **Be Unrealistic.** · **Embrace Intensity.** · **Operate With a Growth Mindset.** · **Return to Results.** · **Relentless Focus.**

### The Box United Energy

> Strong. Not soft.
> Disciplined. Not chaotic.
> Empowering. Not performative.
> Intense. Not intimidating.
> Welcoming. Not watered down.
> Excellent. Not average.

When in doubt, write the sentence twice — once "soft," once with this energy. Ship the second one.

---

## Visual foundations

### Colors

Four-color palette. Electric Blue is the signature. **The palette is intentionally tight — do not introduce new hues.**

| Token | Hex | RGB | Use |
|---|---|---|---|
| **Electric Blue** | `#0080F2` | `0 128 242` | Signature. Hero surfaces, sticker outlines, link/CTA, all logo line art. |
| **Navy** | `#001C33` | `0 28 51` | Grounding dark. Body text, dark backgrounds, navy product, F.L.A.G alt mark. |
| **Stone** | `#F7F5ED` | `247 245 237` | Paper. Default page background, sticker fill, soft contrast surface. |
| **White** | `#FFFFFF` | `255 255 255` | Crisp surface. Cards on stone, photo overlays. |

> 📎 Note: the printed brand book lists `#40987d` next to the Navy CMYK/RGB values — that hex is a typo in the source PDF. The Navy RGB `(0, 28, 51)` correctly resolves to `#001C33`, which is what the deck template confirms and what every visual asset (logos, icons, photos) actually uses. We use **`#001C33`**.

Color rules:
- **Pair, don't mix.** Pick a surface (Stone or White or Navy or Blue), and one accent, then commit. Don't put Electric Blue on Navy text on Stone all at once; pick a relationship.
- **Electric Blue is loud.** It looks best as: full bleed background + white type, or as line-art icons/stickers on stone, or as CTA fills. Not as long-form body text.
- **Photography always has Blue in it.** When shooting or selecting stock, find an accent of brand blue in the frame (sky, headband, gloves, gym mats, branded apparel). This is how photography stays on-brand.
- Derived tints (`--bu-blue-tint`, `--bu-blue-deep`, `--bu-navy-soft`, `--bu-ink-60/40`) exist in `colors_and_type.css` for hover/secondary states only. Don't expose them as named brand colors.

### Type

Three families. All three are required for an on-brand piece — the contrast between Anton (bold), PP Editorial (feminine), and Cooper BT (warm body) **is** the brand voice in visual form.

| Role | Family | Treatment |
|---|---|---|
| Headline 1 — Bold, journalistic, billboard | **Anton Regular** | UPPERCASE · 0 kerning · tight leading (~0.92) |
| Headline 2 — Editorial, feminine, sophisticated | **PP Editorial New — Light** | Title Case · 0 kerning · medium leading (~1.1) |
| Body — Human, personable | **Cooper BT — Light & Medium** | Title Case (or sentence case in UI) · +10 tracking · medium leading (~1.45) |

**Pairing rules:**
- A page or slide typically uses *all three* — Anton as eyebrow/title, PP Editorial as the lyrical statement, Cooper as the body + CTAs.
- Anton sets emphasis. When you need to YELL, use Anton at scale.
- PP Editorial is the brand's *feminine register* — pull quotes, statements, hero editorial titles. Don't use it for buttons.
- Cooper is the workhorse. Buttons (Medium), running copy (Light), captions, form labels.

> 📎 Brand inconsistency note: the internal Canva slide deck (`Brand Template Slides.pdf`) instructs staff to fall back on **League Spartan / Futura Condensed Extra Bold** (headline) and **Roboto / Tex Gyre Termes** (body) when Anton / PP Editorial / Cooper aren't available in Canva. Those are Canva-shop fallbacks, not the brand. **Always prefer the three primary families above** when you have control over the typography.

### Backgrounds and surfaces

- **Default surface is Stone.** Print and digital. Slide deck pages, marketing pages, donor letters — all stone.
- **Hero / divider surfaces are Electric Blue or Navy.** Full bleed, big quote in PP Editorial or Anton.
- **Photography is full-bleed and often runs to the edge.** When over photography, type sits on a "container" (a Graphic Device shape filled with stone) or as an overlay (white type, no scrim).
- **No gradients.** No mesh gradients, no purple-to-pink fades, no glow. The brand is flat.
- **No patterns, no textures, no grain.** The only "decoration" is the Graphic Device line, stickers, and the icon set.
- **No drop shadows on cards.** The exception is the **sticker offset shadow** — a hard, single-color, ~6px down offset that gives die-cut stickers their tactile feel.

### Imagery vibe

- Real girls, real gyms, real sweat. Documentary-leaning sports photography.
- **Warm + saturated.** Not muted, not desaturated, not black-and-white as a default. Sunlight, skin tones true, brand blue accents popping.
- **Strength over softness in pose** — the camera is below eye level, the subject looks past the lens or directly into it. Avoid passive over-the-shoulder shots.
- Compositional negative space welcome — type or stickers will land on it.

### Animation and motion

The brand is **mostly static**. When motion is used, it should feel like a snap-cut or a stamp — confident, not bouncy.

- **Easing**: `cubic-bezier(.16, 1, .3, 1)` for entrances (snappy out); `cubic-bezier(.65, 0, .35, 1)` for state changes.
- **Durations**: 120ms (hover/press), 200ms (most transitions), 360ms (page-level reveal). Never longer than ~500ms.
- **Permitted**: opacity fade, small Y/X translate (≤8 px), scale 0.97 → 1.00 on press, "stamp" reveal (scale 1.04 → 1.00 with brief shadow).
- **Avoid**: bouncy springs, parallax scrolling, marquee scrollers, particle effects, anything Lottie-cute.

### Hover / press states

- **Hover on a Blue surface** → opacity 0.85 (or `--bu-blue-deep` if filled).
- **Hover on a link/text** → opacity 0.75.
- **Hover on a card** → translateY(-2px), no shadow change.
- **Press** → scale 0.98, duration 120ms.
- **Focus** → 3 px Electric Blue ring at 35% opacity (`--shadow-focus`).
- **Disabled** → opacity 0.4, no pointer events.

### Borders, shadows, radii, transparency

- **Borders**: 1 px Stone-deep (`--line`) for dividers; 1.5 px Navy or Blue for emphasized inputs / boxed photo containers. Sticker outlines are ~3 px Blue stroke.
- **Shadows**: avoided on cards. Used only for stickers (`--shadow-sticker`, a hard offset) and floating menus (`--shadow-card`, very subtle).
- **Radii**: `0`, `4px`, `8px`, `16px`, `999px`. Square is the default — buttons are 8 px, cards 16 px, pill chips 999 px. Stickers themselves are die-cut (no fixed radius — the silhouette is the shape).
- **Transparency / blur**: avoid. The brand is flat and confident. The one exception is text on a darkened photo — but prefer no scrim at all if the photo already has the right contrast.

### Layout

- **Grid**: 12-column on desktop, 4-column on mobile, with generous margins (96 px desktop, 24 px mobile). Spacing tokens (`--space-1` through `--space-10`) follow a 4 px base.
- **Logo placement**: always anchored to top OR bottom of a composition, centered horizontally. Don't float it in the middle.
- **Type alignment**: left-aligned by default. Centered is reserved for hero / cover / statement slides.
- **Density**: low. Brand prefers air and one strong idea per surface, not info-dense pages.

---

## Iconography

Box United maintains **its own custom icon family** — eight hand-drawn line-art emblems, in three colorways (Blue / Stone / Navy). They live in `assets/icons/`. Each icon also exists as a "die-cut sticker" in `assets/stickers/` — same line art with a Stone interior and a slight offset second outline that gives the sticker a tangible, slap-on-the-laptop feel.

### Set inventory

| File | What it depicts | Use |
|---|---|---|
| `icon-01` / `sticker-01` | "Golden Glove 1948" hand-lettered boxing-glove patch | Heritage, achievement, fight history |
| `icon-02` / `sticker-02` | Crossed pennant flags with B and U monograms | Ceremony, Box United wins, mission framing |
| `icon-03` / `sticker-03` | F.L.A.G heraldic shield with hanging boxing gloves | F.L.A.G program identifier, varsity feel |
| `icon-04` / `sticker-04` | Box United wordmark sticker (parent brand) | The "stamp of approval," sign-off, swag |
| `icon-05` / `sticker-05` | Globe with B/U monogram | Vision / global reach / partnership |
| `icon-06` / `sticker-06` | Laurel wreath framing a B/U script monogram | Excellence, awards, donor recognition |
| `icon-07` / `sticker-07` | Circular "Box United · Fight Like A Girl" stamp with B scribble | All-purpose seal, partnership co-brand |
| `icon-08` / `sticker-08` | Fight Like A Girl wordmark sticker | Program identifier, signature mark |

### Iconography rules

- **Always blue line art.** Strokes (~3 px at native size), no fills (except the stone interior of stickers). Never recolor outside the three approved colorways.
- **Hand-drawn, not geometric.** Lines wobble intentionally. *Do not* try to redraw with perfect bezier curves or use a "clean" icon library like Lucide / Heroicons — that breaks the visual language.
- **Sticker = icon + ~3px outline offset + Stone fill.** A sticker is the icon "applied" as a die-cut.
- **No SVG-emoji-style icons.** No Material Symbols, no FontAwesome. The set is finite and deliberate; if you need something not in the set, ask the brand team to commission an addition rather than substituting from a third-party set.
- **No unicode/emoji as icons in public surfaces.** Internal coach-training decks may use emoji as bullet markers (💥 🧠 🛠 🌱) — this is staff-facing only.

### The Graphic Device

A separate, larger visual element from the icon set. The Graphic Device is a single flowing blue scribble that forms an abstract "B" + boxing-glove silhouette. It's available as a **container** (closed shape to put a photo inside) or as an **overlay** (line drawn over imagery). Use the container *only when the design isn't text-heavy* — the device's job is to bring identity to imagery, not compete with type.

Files in `assets/graphic_device/` (Blue / Navy / Stone / White).

### Substitutions and flags

> ⚠️ **Substitution / open question for the brand owner — please confirm.**
>
> **Functional UI icons** (chevrons, plus, close, account, cart, hamburger, search) are *not* covered by the eight custom icons. They appear in the Shopify mockup in the brand book but are unspecified. In the UI kit we substitute **Lucide Icons** (rounded, 1.75 px stroke, navy color) for these. They sit visually distinct from the custom hand-drawn brand icons. **Please confirm Lucide is acceptable, or supply a preferred system.**
>
> **PP Editorial New** is commercial type from Pangram Pangram. We use the supplied `.ttf`. If you'd like a free fallback for Canva or production code where the license isn't covered, **Cormorant Garamond Light** is the closest open-source match. Already wired into the font stack.
>
> **Cooper BT** in the kit ships as Cooper BT W03 Light + Cooper Medium CBT Regular. Where neither is available, **Cooper Black** on Adobe Fonts (Light/Std weights) is the licensed equivalent.

---

## Slides

The Canva template ships with these slide types:

- **Cover** — full-bleed Electric Blue, Anton title, big.
- **Body / content** — Stone background, Anton eyebrow + PP Editorial title + Cooper body, often a photo + stickers in the corner.
- **Statement** — Stone or Navy background, a single PP Editorial sentence, big.
- **Divider** — Electric Blue, single Anton word, full bleed.
- **Brand-principle slide** — Anton word ("Be Unrealistic") + Cooper body explanation.
- **Thank You** — Stone, Anton "THANK YOU," sticker stamp anchor.

See `slides/` for HTML recreations. Each renders at 1920×1080.

---

## UI kits

| Kit | Path | Status |
|---|---|---|
| Marketing site (F.L.A.G shop + program) | `ui_kits/marketing-site/` | Shopify-style recreation based on brand book section 7.3 |

> ⚠️ **Box United does not currently have a public product app or website beyond the F.L.A.G Shopify storefront referenced in the brand book.** If the org has another digital surface (mobile app, donor portal, coach dashboard), please attach screenshots or code and we'll build that UI kit next.

---

## Working with this system

If you're a designer or developer:

1. Import `colors_and_type.css` and reference tokens (`var(--bu-electric-blue)`, etc.).
2. Use the assets in `assets/` directly — do not redraw logos, icons, or the graphic device.
3. When in doubt about voice, re-read the manifesto excerpt at the top of this file. **Strong, not soft.**

If you're using this as a Claude Code skill: see `SKILL.md`.
