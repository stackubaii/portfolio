# Ubaid Ahmad - Full-Stack MERN Developer & UI/UX Designer

A high-performance, multi-page developer portfolio built on a **data-driven vanilla JavaScript
architecture**. Engineered for speed, structured for long-term scalability, and designed without a
single build dependency. The 2026 edition introduces a premium 3D interaction layer, direction-aware
scroll animations, smart pagination, a universal shimmer-gradient design system, a runtime 10-palette
theme customizer, a full certifications section, and a dual-mode contact form — all written in
pure HTML, CSS, and JavaScript.

---

## Live Preview

**[opsubaid.github.io](https://opsubaid.github.io/portfolio)**

---

## What is This Project?

This is a personal developer portfolio for **Ubaid Ahmad**, a Full-Stack MERN developer and UI/UX
designer. The portfolio is not a template or a theme — it is a custom, production-grade static site
engineered to communicate technical depth, design sensibility, and professional credibility to
prospective clients and collaborators.

Every design decision in this codebase serves a purpose. The gold/dark glassmorphism system was
chosen for visual authority. The 3D coin-toss profile card was engineered to demonstrate front-end
physics knowledge before a single line of copy is read. The data-driven rendering architecture was
chosen so that adding a new project, experience entry, or testimonial requires zero HTML changes.

The portfolio is fully static. No server, no database, no build step. One `index.html` file opened
in a browser is a running site.

---

## Tech Stack

### Core

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)

### MERN Stack (Projects Showcased)

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React.js-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)

### Design & Tooling

![Figma](https://img.shields.io/badge/Figma-F24E1E?style=flat&logo=figma&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat&logo=linux&logoColor=black)

### CDN Dependencies (No npm Required)

| Dependency        | Source       | Purpose                               |
| ----------------- | ------------ | ------------------------------------- |
| Tailwind CSS      | CDN          | Utility classes and responsive grid   |
| Lucide Icons      | unpkg CDN    | SVG icon system (replaces all emojis) |
| Font Awesome 6.5  | CDN          | Supplemental icon library             |
| Plus Jakarta Sans | Google Fonts | Primary typeface                      |

---

## File Structure

```
Ubaid Ahmad/
|
|- index.html                          # Home page - layout shell, SEO metadata, contact form
|
|- assets/
|   |- hero-profile-portrait.png       # Profile photo (coin card front face)
|   |- favicon.png                     # Favicon
|   |- avatars/                        # Testimonial reviewer headshots
|   |   |- muhammad-dawood-devops-engineer-avatar.jpg
|   |   |- umair-amjad-software-engineer-avatar.jpg
|   |   |- wajeeha-sultan-frontend-developer-avatar.jpg
|   |   `- zaheer-abbas-fullstack-dev-avatar.jpg
|   |- credentials/                    # Certificate images for About page modal
|   |   |- Introduction to Jupyter.jpg
|   |   `- Legacy Responsive Web Design V8.png
|   `- work/                           # Project screenshot thumbnails
|       |- hadaf-immigration.jpeg
|       |- portfolio-landing-page.png
|       `- study-station.jpeg
|
|- pages/
|   |- about.html                      # About / Story page (bio, timeline, certifications, philosophy)
|   `- services.html                   # Services / Hire Me (3 tiers, 5-step process)
|
|- scripts/
|   |- projects-data.js                # window.projects — all project objects
|   |- skills-data.js                  # skillCategories — tabbed skills grid
|   |- experience-data.js              # experience — paginated timeline
|   |- clients-data.js                 # clients — logo carousel
|   |- testimonials-data.js            # testimonials — carousel + modal
|   |- app.js                          # All render functions, state, animations, theme toggle,
|   |                                  #   theme customizer, mobile menu, testimonial carousel
|   |- certification-modal-logic.js    # Cert card → modal wiring (about.html only)
|   `- contact-form-validation.js      # Dual-mode contact form logic (index.html only)
|
|- styles/
|   |- style.css                       # Design system, animation engine, responsive rules
|   `- about.css                       # About / certifications page-specific styles
|
|- docs/
|   |- PROJECT_EDITING_GUIDE.md        # How to safely extend and maintain the codebase
|   `- DESIGN_SYSTEM.md               # Complete design token and component reference
|
|- README.md
|- CHANGELOG.md
`- LICENSE
```

The project enforces strict separation of concerns:

- **HTML** handles structure, static metadata, and modal scaffold containers only.
- **CSS** owns every presentational rule, animation keyframe, and responsive breakpoint.
- **JavaScript** owns all data arrays, render logic, state management, and DOM output.
- **Data files** (`*-data.js`) are the single source of truth for all content — edit these
  to add, remove, or update entries with zero HTML changes.

### Script Load Order

All HTML pages load scripts in this sequence:

```html
<script src="./scripts/projects-data.js"></script>
<script src="./scripts/skills-data.js"></script>
<script src="./scripts/experience-data.js"></script>
<script src="./scripts/clients-data.js"></script>
<script src="./scripts/testimonials-data.js"></script>
<script src="./scripts/app.js"></script>
<!-- page-specific scripts after app.js -->
<script src="./scripts/contact-form-validation.js"></script>  <!-- index.html only -->
<script src="./scripts/certification-modal-logic.js"></script> <!-- about.html only -->
```

`app.js` reads from the data variables set by the preceding files, so load order is mandatory.

---

## Pages

| Page     | File                 | Status | Description                                                        |
| -------- | -------------------- | ------ | ------------------------------------------------------------------ |
| Home     | `index.html`         | Live   | Hero, stats, skills, experience, projects, testimonials, contact   |
| About    | `pages/about.html`   | Live   | Bio, career timeline, certifications, tech philosophy, currently   |
| Services | `pages/services.html`| Live   | 3 service tiers, 5-step process, mailto CTAs only                  |

---

## What is New in v3.0

### Script Modularisation

`script.js` has been retired. All render and animation logic lives in `scripts/app.js`. All
content data has been extracted into four dedicated files: `skills-data.js`, `experience-data.js`,
`clients-data.js`, and `testimonials-data.js`. This means editing content never requires opening
`app.js`. Each data file is self-contained, documented, and independently editable.

### Testimonial Carousel

The static testimonial grid is replaced with a production-grade single-card carousel
(`id="testimonialCarousel"`). Features: bidirectional slide animation (`enter-left`/`enter-right`
CSS class toggling), dot navigation, previous/next buttons, keyboard support (`ArrowLeft`/`ArrowRight`),
auto-advance every 2 minutes (`TC_INTERVAL`), and hover/focus pause. Clicking any slide still
opens the full testimonial modal. A `carouselAnimating` guard prevents stacked transitions on
rapid input.

### Certifications Section

`pages/about.html` now includes a `.cert-grid` section with four credential cards. Each card
carries `data-cert-*` attributes and opens a full-screen `#certModal` displaying the certificate
image. Falls back to a placeholder icon when the image asset is not yet available. Wired by
`scripts/certification-modal-logic.js` (loaded on `about.html` only).

### Dual-Mode Contact Form

The contact form is back on `index.html` — rebuilt as a dual-mode widget. A tab selector
switches between **Mail** mode (builds a `mailto:` URI) and **WhatsApp** mode (builds a
`https://wa.me/` deep-link). Fields show/hide conditionally per mode. Each field has an inline
error span for real-time validation. A toast notification confirms send or reports errors. All
logic lives in `scripts/contact-form-validation.js`.

### Homepage Sections Added

- `#collaboration` — a CTA block positioned after the projects carousel.
- `#social` — a social-icon grid with `.social-icon.glass-card.glow-hover` cards for
  GitHub, LinkedIn, Instagram, WhatsApp, Telegram, and email.

---

## What is New in the 2026 Edition (v2.x)

### Dynamic 3D Coin-Toss Profile Card

The hero profile image is a fully interactive 3D flip card. On hover, `.coin-inner` performs a
**720-degree rotation** (two full Y-axis turns) in `0.9s` using a springy
`cubic-bezier(0.34, 1.56, 0.64, 1)` easing. A gold-gradient **"TRUSTED EXPERT"** verification
badge renders on the reverse face. `perspective: 1500px` and `backface-visibility: hidden` on
both faces ensure mathematically correct depth. The `coinGlow` keyframe pulses the outer ring
at idle. The CSS custom property `--coin-size` controls diameter at all breakpoints.

### Direction-Aware Scroll Animations

A passive `scroll` event listener continuously tracks `_lastScrollY` vs `_currentScrollY`. The
shared `IntersectionObserver` reads this delta at the exact moment an element enters the viewport,
then stamps either a `from-below` class (scrolling down) or `from-above` class (scrolling up)
before firing the `visible` transition. A `requestAnimationFrame` wrapper prevents the
"flash then animate" artifact.

### Smart Experience Pagination

`INITIAL_EXP_COUNT = 2` controls the initial render; `EXP_BATCH_SIZE = 3` controls how many cards
are revealed per click. A `updateExperienceButtons()` function syncs both **Show More** and
**Show Less** buttons on every state change, updating label text dynamically. The system is
array-length-agnostic.

### Auto-Pinned Projects

The first three entries in `window.projects` are automatically detected and receive a gold
`.pinned-badge` ribbon. No manual tagging required.

### Universal Shimmer-Gradient Hover

All `.glass-card`, `.cta-button`, `.load-more-btn`, `.connect-btn`, `.modal-link`, and
`.category-btn` elements carry a `::after` pseudo-element shimmer stripe.
`.modal-content` is deliberately excluded via `:not(.modal-content)`.

### Theme Customizer - 10-Palette Runtime Switcher

A floating palette trigger button (`#cs-trigger`) opens a slide-in panel (`#cs-panel`) that
allows visitors to switch between 10 colour palettes at runtime. Palettes: Gold Noir,
Amethyst, Cyber Teal, Rose Prestige, Emerald, Arctic Frost, Amber Forge, Crimson, Silver Ghost,
and Coral Flame. The selected palette persists across page loads via `localStorage('ua-palette')`.
The `--accent-rgb` CSS variable is updated per-palette to keep rgba-based component colours
consistent with the active accent.

### Interactive Client Carousel

The `clients` array (in `scripts/clients-data.js`) accepts `link` and `linkType` fields.
Cards with no `logo` field render a gold initial pill + company name. A link-type badge icon
renders in the card corner based on `linkType`. `mouseenter` pauses the animation; `mouseleave`
resumes it. The clients section is currently commented out in `index.html` pending updated asset
data.

### Light / Dark Mode Toggle

A persistent theme toggle backed by `localStorage("theme")` allows users to switch between dark
and light modes. Light mode is applied via `data-theme="light"` on the `<html>` element. The
active theme persists across page loads.

### Available for Work Badge

A sticky "Available for Work" badge is fixed to the bottom-right corner of every page. It uses
a `bounce` keyframe animation and links directly to the primary contact `mailto:` address.

### Mobile Menu Sub-Navigation

The mobile hamburger menu supports an accordion sub-navigation system. Tapping a top-level link
with a `.mobile-subnav` block expands it while collapsing any previously open group.

---

## Data-Driven Rendering

All dynamic content lives in dedicated data files under `scripts/`:

| Array             | Renders Into              | File                        |
| ----------------- | ------------------------- | --------------------------- |
| `window.projects` | Featured projects carousel | `scripts/projects-data.js` |
| `skillCategories` | Tabbed skills grid        | `scripts/skills-data.js`    |
| `experience`      | Paginated timeline        | `scripts/experience-data.js`|
| `clients`         | Infinite logo carousel    | `scripts/clients-data.js`   |
| `testimonials`    | Single-card carousel      | `scripts/testimonials-data.js`|

To add content, append a correctly structured object to the relevant array. No HTML editing
required. For the full object shape of each array, see `docs/PROJECT_EDITING_GUIDE.md`.

---

## Design System

### Color Tokens (`styles/style.css`)

| Variable         | Value                                     | Role                                 |
| ---------------- | ----------------------------------------- | ------------------------------------ |
| `--bg-dark`      | `#1a1a1a`                                 | Page background                      |
| `--text-dark`    | `#e8e8e8`                                 | Body text                            |
| `--accent-dark`  | `#d4af37`                                 | Gold accent - borders, glows, icons  |
| `--accent-light` | `#f0d896`                                 | Lighter gold for gradient text       |
| `--accent-rgb`   | `212,175,55`                              | Raw RGB triplet for rgba() calls     |
| `--glass-dark`   | `rgba(255,255,255,0.05)`                  | Card fill                            |
| `--border-dark`  | `rgba(212,175,55,0.2)`                    | Card borders                         |
| `--shadow-color` | `rgba(212,175,55,0.5)`                    | Glow shadows                         |
| `--spring`       | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Default spring easing                |
| `--coin-size`    | `180px` (desktop), `140px` (480px)        | Profile coin diameter (CSS variable) |

Changing `--accent-dark` in `:root` propagates the new colour across every border, glow, hover
effect, and gradient instance simultaneously. Always update `--accent-rgb` to match.

### Glass Cards

Apply `.glass-card` to any new container to inherit the full glassmorphism treatment:
`backdrop-filter: blur(15px)`, semi-transparent fill, gold border, and depth shadow. See
`docs/DESIGN_SYSTEM.md` for the complete component reference.

### Scroll Animations

Add `animate-on-scroll` to any element, then pair it with one of three modifier classes:

| Modifier   | Effect                                              |
| ---------- | --------------------------------------------------- |
| `slide-up` | Slides from +/-40px Y depending on scroll direction |
| `zoom-in`  | Scales from 0.88 to 1.0                             |
| `fade-in`  | Fades from +/-12px Y depending on scroll direction  |

---

## Performance

- **IntersectionObserver** — animations fire only when elements enter the viewport.
- **Passive scroll listener** — direction-tracking listener is `{ passive: true }`.
- **Lazy loading** — project images and certificate images use `loading="lazy"`.
- **Event delegation** — modal open/close handled with minimal document-level listeners.
- **Zero build step** — no bundler, no transpiler, no Node.js.
- **CDN-only dependencies** — all third-party libraries load from CDN.

---

## Installation and Local Development

No build process required.

```bash
# Option 1 - Open directly in a browser
open index.html

# Option 2 - Serve locally with npx (recommended for consistent behaviour)
npx serve .

# Option 3 - Python server
python -m http.server 8080
```

Navigate to `http://localhost:8080` (or the port shown in the terminal).

VS Code with the Live Server extension also works and provides hot-reload on file save.

---

## Deployment

This is a fully static site. Push to any static host with no configuration required.

| Platform     | Method                                                  |
| ------------ | ------------------------------------------------------- |
| GitHub Pages | Push to `main`; Pages serves `index.html` automatically |
| Netlify      | Drag-and-drop the project folder or connect via Git     |
| Vercel       | Run `vercel --prod` from the project root               |

The live site is currently deployed at [bugcurator.github.io](https://bugcurator.github.io/Ubaid-Dev).

---

## Extending the Portfolio

See `docs/PROJECT_EDITING_GUIDE.md` for the complete reference. Quick summary:

- **New project** — Append to `window.projects` in `scripts/projects-data.js`. First 3 entries auto-pin.
- **New skill** — Append to the correct `skillCategories[n].skills` array in `scripts/skills-data.js`.
- **New experience entry** — Append to the `experience` array in `scripts/experience-data.js`.
- **New testimonial** — Append to the `testimonials` array in `scripts/testimonials-data.js`.
- **New client** — Append to the `clients` array in `scripts/clients-data.js`.
- **New certification** — Add a `.cert-card` block in `pages/about.html` and drop the image into `assets/credentials/`.
- **New palette** — Add a palette object to `PALETTES` in `initThemeCustomizer()` inside `app.js`.
- **New section** — Apply `.section`, `.container-custom`, `.section-wrapper`, and `.animate-on-scroll`.

---

## Engineering Philosophy

This project favors:

- **Simplicity over abstraction** — if vanilla JS solves it cleanly, no library is added.
- **Data-driven rendering** — arrays own all content; functions own all layout logic.
- **Modular data files** — content and logic are always in separate files.
- **Performance over decoration** — every animation serves a UX purpose and costs nothing at idle.
- **Clear structure over framework complexity** — the codebase is readable by any developer in under 10 minutes.

Strong structure signals strong thinking.

---

## Documentation

All extended documentation lives in the `docs/` directory.

| File                            | Purpose                                                        |
| ------------------------------- | -------------------------------------------------------------- |
| `docs/PROJECT_EDITING_GUIDE.md` | Step-by-step instructions for adding and modifying all content |
| `docs/DESIGN_SYSTEM.md`         | Complete design token reference, component classes, animation  |

---

## License

All rights reserved. See `LICENSE` for full terms.

This source code is the proprietary work of Ubaid Ahmad. Viewing for reference is permitted.
Copying, redistribution, modification, and commercial use are strictly prohibited without explicit
written permission from the author.

Copyright 2026 Ubaid Ahmad.
