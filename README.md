# Dokan Zaman — V4 landing page (prototype)

دكان زمان للتوريدات العمومية — «شريككم الموثوق في التوريدات والتشغيل»

**Live Website:** [Visit Dokan Zaman](https://ebthalgamal2020.github.io/dokan-zaman-landing-page-v4/)

A one-page Arabic (RTL) website built around a **scroll-driven supply box**: the navy box with
orange tape sits closed in the hero, the tape splits and the flaps open as the visitor scrolls,
the nine supply categories rise out in three waves and become the category gallery, a small
courier box travels the six purchasing stages, and at the quotation section the box closes
and seals.

**Status:** development prototype, published on GitHub Pages (static files from `main`, repository
root; no custom domain). Search engines may index it (no `noindex`; canonical URL set). By client
decision the page shows no visible prototype notice or "concept image" labels. The quotation form
never sends or stores anything; after a valid submit it says plainly that the request was not sent.

V4 is fully independent of V1–V3: every asset is a copy inside this folder, nothing is loaded
from another version, and V1–V3 were not modified.

## Run it

```bash
python -m http.server 8080      # from this folder, then open http://localhost:8080
```

## Build

HTML/CSS/vanilla JS; Tailwind 3.4.17 compiled ahead of time, terser for JS (dev dependencies only).

```bash
npm install
python tools/build-page.py      # index.html from tools/index.template.html (edit the template, not index.html)
npm run build                   # site.min.css + main.min.js
```

## Structure

| Path | Purpose |
|---|---|
| `tools/index.template.html` | Page source. Markers like `<!-- box:story -->` are filled by `build-page.py`. |
| `tools/build-page.py` | Injects the header logo, the three boxes, gallery, services and form options (category/service data lives here). |
| `assets/css/style.css` | All styles (Tailwind input) — typography, the CSS 3D box, sections. |
| `assets/css/fonts.css` | Alexandria + IBM Plex Sans Arabic (self-hosted, OFL) + size-matched fallbacks (no layout shift on font swap). |
| `assets/js/main.js` | Logo clean-up, header, mobile menu, current section, gallery, sectors. |
| `assets/js/story.js` | The box: story sequence, courier box on the track, seal at the quote. |
| `assets/js/quote-form.js` | Prototype form: validation, category/service preselection, honest "not sent" message. |
| `assets/images/logo/` | Official logo (unchanged file) and V1's generated animated-logo markup (unchanged artwork). |
| `assets/images/categories/` | Category images 01–09 (+ `-640` versions). |
| `docs/review-07-09-before-after.png` | Before/after sheet of the 07–09 logo removal (kept locally; not in the repository). |

## The box

- Pure CSS 3D (no library, no 3D files): bottom, four walls and four hinged flaps, each with an
  outer and inner side; flat shades of the brand navy for lit/shaded faces; orange tape; a cream
  shipping label with the **official logo file** (the logo is never drawn on navy).
- `story.js` only **reads** the scroll position and poses the box — it never prevents, snaps,
  smooths or moves the page scroll. One `requestAnimationFrame` per scroll event at most, and each
  box only updates while on screen.
- Motion runs only with `html.motion`: no reduced-motion preference and a screen ≥ 520px tall.
  Otherwise (and with JavaScript off) the box is shown **open with the first three categories
  risen**, the courier box waits at the end of the track, and the seal box is closed. All text
  content is always in the page.

## Typography

Navy `#1A3659` is the text colour; orange `#F37221` marks selected words, phrases, numbers and
interactive states. Orange text is used at heading/label sizes only (2.7:1 on cream); inside
running text, emphasis stays navy with an orange underline (`.em`). No gradients.

## Content sources

All copy comes from `Dokan_Zaman_Corporate_Presentation.pptx` and the purchasing-management
proposal (`نموذج العمل لإدارة عمليات المشتريات نيابة عن الشركة.docx`), read-only. Deliberately
**not** published: savings percentages, cycle-time reduction, fee / savings-share model, team
structure and implementation phases. Category names follow the list approved for V4 (slide 3 uses
slightly different wording for four of them — see Pending).

## Images

All nine category images are **AI concept images, not photographs of Dokan Zaman products**
(no longer labelled on the page, by client decision — replace them before launch). 01–06 are copies of the V1/V3 set. 07–09 are copies of V1's
`ai-temp` images with the inaccurate AI-generated Dokan marks, brand swooshes and garbled text
removed locally (OpenCV) in these copies only — approved by the client from
`docs/review-07-09-before-after.png` (kept locally). 07–09 are 4:3 and are shown in the same 1216 × 832 frame as
01–06 by trimming only empty background (`object-position: 50% 72%`); no product is cropped.

## Pending before launch

- Real photography (or approved images) for all nine categories.
- Confirmed phone, email and website (the presentation uses a placeholder phone and spells the domain "dakan").
- A confirmed destination for quotation requests (then `QUOTE.mode = 'live'` in `quote-form.js`).
- Confirm category wording against slide 3 (الورقيات / الورق ومستلزماته, مستلزمات الضيافة والبوفيه / مستلزمات البوفيه والضيافة, معدات / مهمات الصحة والسلامة, الأدوات والماكينات الخفيفة / العدد والآلات الخفيفة).
- Confirm the meaning of «إجراءات وسياسات مُتعددة» (reason ٠٨, verbatim from slide 5).
