# PROJECT_EDITING_GUIDE.md

This document is the single source of truth for safely extending and maintaining the portfolio
codebase. Follow every section carefully. The system is predictable and will scale cleanly as long
as the structural rules below are respected. A developer who has never seen this project before
should be able to add a new project, skill, or experience entry in under five minutes by following
this guide.

---

## 1. Project Structure Overview

### Core Files

| File                                  | Role                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| `index.html`                          | Layout shell, SEO metadata, modal containers, contact form   |
| `pages/about.html`                    | About / Story page - bio, timeline, certifications, currently|
| `pages/services.html`                 | Services page - tiers, process, mailto CTAs only             |
| `styles/style.css`                    | Design system, animation engine, responsive breakpoints      |
| `styles/about.css`                    | About / certifications page-specific styles                  |
| `scripts/app.js`                      | All render functions, state, animations, theme logic         |
| `scripts/projects-data.js`            | Single source of truth for all project objects               |
| `scripts/skills-data.js`              | `skillCategories` array - tabbed skills grid                 |
| `scripts/experience-data.js`          | `experience` array - paginated timeline                      |
| `scripts/clients-data.js`             | `clients` array - logo carousel                              |
| `scripts/testimonials-data.js`        | `testimonials` array - carousel + modal                      |
| `scripts/certification-modal-logic.js`| Cert card → modal wiring (`about.html` only)                 |
| `scripts/contact-form-validation.js`  | Dual-mode contact form logic (`index.html` only)             |
| `assets/`                             | Images, credentials, work screenshots                        |
| `docs/`                               | Project documentation (this file and DESIGN_SYSTEM.md)       |

### Script Load Order

All HTML pages must load scripts in this exact sequence. `app.js` reads from the variables
populated by the preceding data files — order is mandatory:

```html
<script src="./scripts/projects-data.js"></script>
<script src="./scripts/skills-data.js"></script>
<script src="./scripts/experience-data.js"></script>
<script src="./scripts/clients-data.js"></script>
<script src="./scripts/testimonials-data.js"></script>
<script src="./scripts/app.js"></script>
<!-- page-specific scripts load after app.js -->
<script src="./scripts/contact-form-validation.js"></script>   <!-- index.html only -->
<script src="./scripts/certification-modal-logic.js"></script>  <!-- about.html only -->
```

### Rendering Pattern

Every dynamic section follows the same contract:

1. `index.html` (or a page file) contains an **empty container** with a specific `id`.
2. A **render function** in `app.js` selects that container by `id`.
3. The function **maps an array** of data objects into HTML template strings.
4. The result is **injected** into the container via `innerHTML`.

If content does not appear on screen, check the container `id` first, then the array object
structure, then the browser console. All render functions log to `console.error` on failure.

---

## 2. Editing Static Hero Content

Static text lives directly in `index.html`. Find elements by class or `id` and edit the text
content only. Do not remove class names — they are required for CSS targeting and animation.

| Content               | Selector to find                                            |
| --------------------- | ----------------------------------------------------------- |
| Hero name             | `<h1 id="hero-title">`                                      |
| Role subtitle         | `<h2 class="hero-subtitle">`                                |
| Description paragraph | `<p class="hero-description">`                              |
| CV download button    | `<a class="cta-button" download>` - update `href` path only |

The hero entrance animation (`heroFadeUp`) fires automatically on page load. Do not wrap the hero
section in an `animate-on-scroll` class — it will conflict.

---

## 3. Profile Coin-Toss Card

The hero profile is a **3D flip card** rendered in pure CSS and HTML. Understanding the class
hierarchy is important before touching this section.

```
.profile-coin-container     <- perspective wrapper (perspective: 1500px)
  .coin-inner               <- rotating element (transform: rotateY)
    .coin-front             <- front face (profile photo)
    .coin-back              <- back face (TRUSTED EXPERT badge)
```

### To Replace the Profile Photo

1. Drop the new image file into `assets/`.
2. In `index.html`, find the `.coin-front` block and update the `src` attribute:

```html
<div class="coin-front">
  <img src="./assets/your-new-photo.jpg" alt="Ubaid Ahmad" />
</div>
```

Use a square crop for best results. The coin renders at `180px` on desktop and `140px` at the
480px breakpoint, both controlled by the `--coin-size` CSS variable.

### To Change the Back-Face Text

Find `.coin-back` in `index.html` and edit the `.coin-back-title` and `.coin-back-sub` spans.

### Classes That Must Not Be Changed or Removed

Do not change or remove `.coin-inner`, `.coin-front`, `.coin-back`, or `.profile-coin-container`.
These are all required for the 3D animation. The behaviour and timing are controlled entirely in
`style.css` under the `PREMIUM 3D PROFILE COIN-TOSS` comment block. Do not remove
`backface-visibility: hidden` from either face.

---

## 4. Editing Animated Stat Counters

The animated stat counters trigger once when the stats bar scrolls into the viewport. They are
driven by the `animateCounter()` function in `app.js`.

### Existing Counter IDs

| ID                | What it counts                 |
| ----------------- | ------------------------------ |
| `experienceCount` | Years or entries of experience |
| `projectsCount`   | Total projects shipped         |
| `clientsCount`    | Clients served                 |
| `techCount`       | Technologies in active use     |

### To Change a Counter's Target Value

Inside `initCounters()` in `app.js`, change the second argument of `animateCounter()`:

```js
animateCounter(projectsCountEl, 12); // change 12 to your target number
```

### To Add a Completely New Counter

**Step 1 - HTML.** Inside the `.stats-bar` element in `index.html`, add a new stat item:

```html
<div class="stat-item">
  <h3 id="awardsCount">0</h3>
  <p>Awards Won</p>
</div>
```

**Step 2 - JS.** Inside `initCounters()` in `app.js`, wire up the new counter:

```js
const awardsCountEl = document.getElementById("awardsCount");
animateCounter(awardsCountEl, 5); // 5 is the target value
```

The counter animates from 0 to the target over a fixed duration when the stats bar enters the
viewport. It fires only once per page load.

---

## 5. Adding and Editing Skills

Skills live in the `skillCategories` array in `scripts/skills-data.js`.

### Add a Skill to an Existing Category

Find the correct category object and append a new skill object to its `skills` array:

```js
{
  category: "Frontend",
  skills: [
    { name: "React.js" },
    { name: "Tailwind CSS" },
    { name: "Your New Skill" }, // append here
  ],
},
```

No HTML changes required. `renderSkills()` in `app.js` rebuilds the grid automatically.

### Add a New Category Tab

Append a new object to the `skillCategories` array in `scripts/skills-data.js`:

```js
{
  category: "Mobile",
  skills: [
    { name: "React Native" },
    { name: "Flutter" },
  ],
},
```

`renderSkills()` automatically creates a new tab button and grid view. Do not rename the
`category` or `skills` keys — the render function expects these exact key names.

---

## 6. Adding and Managing Experience Entries

Experience entries live in the `experience` array in `scripts/experience-data.js`.

### Required Object Shape

```js
{
  title: "Role Title",
  company: "Company Name or Context",
  period: "Month YYYY - Month YYYY",
  description: "What you did, built, learned, and the impact it had.",
}
```

### Deprecated Field

The `isInitiallyVisible` boolean from v1.0.0 is no longer read by `renderExperience()`. It can
remain in existing entries without causing errors, but has no effect. Visibility is controlled
entirely by array index position.

### Pagination Logic

The Experience section uses two constants defined near the top of `app.js`:

```js
const INITIAL_EXP_COUNT = 2; // cards shown on first render
const EXP_BATCH_SIZE = 3;    // cards revealed per "Show More" click
```

The first `INITIAL_EXP_COUNT` entries always render immediately. Every entry beyond that index
is hidden and revealed in batches of `EXP_BATCH_SIZE`. The "Show Less" button collapses back to
`INITIAL_EXP_COUNT` cards and smooth-scrolls to the section header.

### Practical Rules

- **Most recent role goes first.** The timeline renders top-to-bottom in array order.
- **Adjust the constants freely.** Changing `INITIAL_EXP_COUNT` or `EXP_BATCH_SIZE` in `app.js`
  is the only code change needed — the pagination system adapts automatically.
- The system is array-length-agnostic. It works with 2 entries or 80.

---

## 7. Adding and Managing Projects

Projects live in `window.projects` inside `scripts/projects-data.js`.

### Required Object Shape

```js
{
  id: 4,                           // Must be a unique integer
  title: "Project Title",
  type: ["featured"],              // include "featured" to show on homepage carousel
  image: "assets/your-screenshot.png",
  demo: "https://your-live-demo.com",
  visitEnabled: true,              // false = Visit button is greyed-out / disabled
}
```

### The Auto-Pin System

The first three entries in the `projects` array (index 0, 1, 2) are automatically pinned.
`renderProjects()` uses `projectsData.indexOf(project)` to detect position and injects a
`.pinned-badge` ribbon. No type tag or manual flag is needed. To change which projects are
pinned, **reorder the array**.

---

## 8. Adding Client Logos

Clients live in the `clients` array in `scripts/clients-data.js`.

### Required Object Shape

```js
{
  name: "Client or Company Name",
  logo: "./assets/client-logo.png",  // optional - omit key entirely if no logo yet
  link: "https://client-website.com",
  linkType: "website",               // "website" | "facebook" | "instagram"
}
```

`link` and `linkType` are both required. `linkType` controls the badge icon: `"website"` → globe,
`"facebook"` → Facebook icon, `"instagram"` → Instagram icon. If `logo` is omitted, the card
auto-renders a gold initial pill using the first letter of `name`.

> **Note:** The `#clients` section in `index.html` is currently commented out. Uncomment it when
> real client asset data is ready.

---

## 9. Adding Testimonials

Testimonials live in the `testimonials` array in `scripts/testimonials-data.js`.

### Required Object Shape

```js
{
  name: "Full Name",
  role: "Job Title at Company",
  avatar: "./assets/avatars/their-photo.jpg",
  text: "The full testimonial text. As long as needed — the modal shows it all.",
  stars: 5, // Integer from 1 to 5
}
```

Testimonials render in a single-card carousel (`id="testimonialCarousel"`). The carousel
auto-advances every 2 minutes (`TC_INTERVAL = 120_000`), pauses on hover and focus, and supports
keyboard navigation (`ArrowLeft` / `ArrowRight`). Clicking any slide opens the full testimonial
modal. The carousel order follows the array order.

---

## 10. Adding Certifications

Certifications are static HTML in the `.cert-grid` section of `pages/about.html`. Unlike other
sections, they are not data-driven and do not use a render function.

### To Add a New Certification Card

Copy this block and paste it inside `.cert-grid`, above the `ADD NEW CERTIFICATION CARDS` comment:

```html
<div
  class="cert-card glass-card animate-on-scroll fade-in"
  role="button"
  tabindex="0"
  aria-label="View Your Certificate Name certificate"
  data-cert-name="Your Certificate Name"
  data-cert-institute="Issuing Institution"
  data-cert-date="Month DD, YYYY"
  data-cert-img="../assets/credentials/your-cert-image.jpg"
>
  <div class="cert-icon-wrap"><i class="fas fa-certificate"></i></div>
  <p class="cert-name">Your Certificate Name</p>
  <p class="cert-institute">Issuing Institution</p>
  <span class="cert-date-badge">Month DD, YYYY</span>
  <p class="cert-view-hint">
    <i class="fas fa-expand-alt" style="font-size: 0.65rem"></i>
    View Certificate
  </p>
</div>
```

### `data-cert-img` Behaviour

- **Filled** — the `#certModal` displays the certificate image at full size.
- **Empty string `""`** — the modal falls back to a `.cert-modal-placeholder` block with a
  `fa-certificate` icon and the message "Certificate image coming soon."

### Adding the Image Asset

Drop the credential image into `assets/credentials/`. The path in `data-cert-img` is relative
to `pages/about.html`, so prefix with `../`:

```
data-cert-img="../assets/credentials/your-cert-image.jpg"
```

The modal is wired entirely by `scripts/certification-modal-logic.js` (an IIFE). It automatically
registers every `.cert-card` found on the page — no JavaScript changes needed when adding new cards.

---

## 11. Dual-Mode Contact Form

The contact form on `index.html` (`id="contactForm"`) supports two send paths:

| Mode      | Tab selector                  | Send action                          |
| --------- | ----------------------------- | ------------------------------------ |
| Mail      | `data-mode="mail"`            | Opens a `mailto:` URI                |
| WhatsApp  | `data-mode="whatsapp"`        | Opens a `https://wa.me/` deep-link   |

All logic lives in `scripts/contact-form-validation.js`. The form is loaded on `index.html` only.

### To Update the Recipient Email Address

In `contact-form-validation.js`, find the `mailto:` URI builder and update the address string.

### To Update the WhatsApp Number

In `contact-form-validation.js`, find the `wa.me/` URI builder and update the phone number
(international format, no `+`, no spaces — e.g. `923001234567`).

### Form Field IDs

| Field        | ID              | Visible in mode     |
| ------------ | --------------- | ------------------- |
| Name         | `cf-name`       | Both                |
| Email        | `cf-email`      | Mail only           |
| WhatsApp no. | `cf-contact`    | WhatsApp only       |
| Subject      | `cf-subject`    | Mail only           |
| Message      | `cf-message`    | Both                |
| Submit btn   | `cfSubmitBtn`   | Both                |
| Toast        | `cfToast`       | Both (confirmation) |

---

## 12. Scroll Animation Classes

Apply `animate-on-scroll` plus one modifier class to any new element. The `IntersectionObserver`
in `app.js` handles timing automatically — no additional JavaScript is needed.

| Class combination             | Effect                                              |
| ----------------------------- | --------------------------------------------------- |
| `animate-on-scroll slide-up`  | Slides from +/-40px Y depending on scroll direction |
| `animate-on-scroll zoom-in`   | Scales from 0.88 to 1.0, direction-agnostic         |
| `animate-on-scroll fade-in`   | Fades from +/-12px Y depending on scroll direction  |

Direction awareness is automatic. Both direction classes (`from-below` and `from-above`) are
cleared on exit so every scroll pass re-evaluates correctly.

Example usage on a new section:

```html
<div class="my-new-section glass-card animate-on-scroll slide-up">
  Content goes here
</div>
```

---

## 13. Shimmer-Gradient Hover Effect

The shimmer sweep is applied automatically by CSS to:

```
.glass-card:not(.modal-content)
.cta-button
.load-more-btn
.connect-btn
.modal-link
.category-btn
```

To add the shimmer to a new element type, append its selector to the three shimmer rule blocks
in `style.css` under the `UNIVERSAL SHIMMER-GRADIENT HOVER` comment block.

**Critical:** Never add `.modal-content` to these selectors. The `:not(.modal-content)` exclusion
protects modal scroll. Adding `overflow: hidden` to `.modal-content` would break `overflow-y: auto`
and trap long content inside an invisible crop.

---

## 14. Styling Rules

### Change the Accent Colour

In `styles/style.css`, edit `--accent-dark` inside `:root`:

```css
:root {
  --accent-dark: #d4af37; /* Change this single value to retheme the entire site */
}
```

Always update `--accent-rgb` to the matching raw `R,G,B` triplet:

```css
--accent-rgb: 212,175,55; /* Must match --accent-dark as raw R,G,B */
```

### Add a New Glass Section

```html
<section id="my-section" class="section">
  <div class="container-custom">
    <div class="section-wrapper">
      <h2 class="section-title">Section Title</h2>
      <div class="glass-card animate-on-scroll fade-in">
        Content goes here
      </div>
    </div>
  </div>
</section>
```

### Mobile Breakpoints

- `768px` — Desktop nav hides; mobile hamburger shows. Grids collapse to single column.
- `480px` — Hero padding reduces. Profile coin shrinks to `140px` via `--coin-size`. Font
  sizes reduce for readability on small screens.

---

## 15. Container IDs — Never Delete or Rename

These HTML element IDs are referenced directly by functions in `app.js` or the page-specific
scripts. Removing or renaming any of them will silently break the corresponding function.

| ID                        | Used by                               |
| ------------------------- | ------------------------------------- |
| `skillsCategoryBar`       | `renderSkills()`                      |
| `skillsDisplayGrid`       | `renderSkills()`                      |
| `experienceTimeline`      | `renderExperience()`                  |
| `loadMoreExperience`      | `loadMoreExperience()`                |
| `showLessExperience`      | `showLessExperience()`                |
| `projectsGrid`            | `renderProjects()`                    |
| `clientsTrack`            | `renderClients()`                     |
| `testimonialCarousel`     | `renderTestimonials()`, keyboard nav  |
| `tcTrack`                 | `renderTestimonials()`, `tcGoTo()`    |
| `tcDots`                  | `renderTestimonials()`, `tcUpdateDots()`|
| `projectModal`            | `openProjectModal()`                  |
| `projectModalContent`     | `openProjectModal()`                  |
| `testimonialModal`        | `openTestimonialModal()`              |
| `testimonialModalContent` | `openTestimonialModal()`              |
| `closeProjectModal`       | modal close listener                  |
| `closeTestimonialModal`   | modal close listener                  |
| `page-loader`             | `hideLoader()`                        |
| `themeToggle`             | `initThemeToggle()`                   |
| `mobileMenuBtn`           | `initMobileMenu()`                    |
| `mobileMenu`              | `initMobileMenu()`                    |
| `closeMobileMenu`         | `initMobileMenu()`                    |
| `contactForm`             | `contact-form-validation.js`          |
| `cfSubmitBtn`             | `contact-form-validation.js`          |
| `cfToast`                 | `contact-form-validation.js`          |
| `certModal`               | `certification-modal-logic.js`        |
| `certModalTitle`          | `certification-modal-logic.js`        |
| `certModalSub`            | `certification-modal-logic.js`        |
| `certModalBody`           | `certification-modal-logic.js`        |
| `closeCertModal`          | `certification-modal-logic.js`        |

---

## 16. Safe Editing Rules

**Never:**

- Delete or rename any container ID from the table in section 15.
- Duplicate project `id` integer values in the `projects` array.
- Add `overflow: hidden` to `.modal-content` directly or via a global rule.
- Rename `animate-on-scroll`, `glass-card`, or `skill-card-anim` CSS classes.
- Remove `backface-visibility: hidden` from `.coin-front` or `.coin-back`.
- Wrap the hero section in `animate-on-scroll`. The hero uses its own `heroFadeUp` keyframe.

**Always:**

- Keep project `id` values as unique positive integers.
- Verify that asset paths exist in `assets/` before referencing them in arrays.
- Test in both desktop and mobile viewports (768px and 480px) after any structural change.
- Check the browser console after changes — all render functions log `console.error` on failure.
- Call `createIcons()` after any render function that injects Lucide placeholder elements.
- Maintain script load order (data files → `app.js` → page-specific scripts).

---

## 17. Debugging Checklist

| Symptom                             | First Thing to Check                                                  |
| ----------------------------------- | --------------------------------------------------------------------- |
| Section content not rendering       | Container `id` matches the JS selector exactly (case-sensitive)       |
| Project card not appearing          | Array object has all required fields; `id` is a unique integer        |
| Animation not triggering            | Element has both `animate-on-scroll` and exactly one modifier class   |
| Modal not scrolling                 | `.modal-content` accidentally received `overflow: hidden` somewhere   |
| Pinned badge not showing            | Project is at array index 0, 1, or 2 in the `projects` array         |
| Coin-toss not animating             | `.coin-front` or `.coin-back` missing `backface-visibility: hidden`   |
| Shimmer sweep not appearing         | Element selector missing from all three shimmer CSS rule blocks       |
| Lucide icon renders as empty        | `createIcons()` not being called after the element renders            |
| Experience count wrong              | `INITIAL_EXP_COUNT` or `EXP_BATCH_SIZE` constants set incorrectly    |
| Theme not persisting on reload      | `localStorage.setItem('theme', ...)` not called on toggle click       |
| CV button downloads wrong file      | `href` on the CV `<a>` does not point to the correct path             |
| Palette not restoring on reload     | `localStorage.getItem('ua-palette')` key is correct; see section 18  |
| Client card has no link icon        | `linkType` field is missing or uses an unrecognised string            |
| Mobile sub-nav not toggling         | `.mobile-nav-group` missing or `initMobileMenu()` not called          |
| Testimonial carousel not advancing  | `TC_INTERVAL` constant; check `tcStart()` is called after render      |
| Cert modal not opening              | `certification-modal-logic.js` not loaded; `data-cert-*` attrs set   |
| Contact form not sending            | `contact-form-validation.js` not loaded; `id="contactForm"` present  |
| Data array changes not rendering    | Script load order violated — data file must load before `app.js`      |

---

## 18. Theme Customizer

The portfolio includes a runtime palette-switching panel (v2.9+) managed by
`initThemeCustomizer()` in `app.js` and styled under the `v2.9 — THEME CUSTOMIZER` comment
block in `style.css`.

### Quick Reference

- **Trigger button:** `#cs-trigger` — fixed-position, bottom-right, above the Available for
  Work badge.
- **Panel:** `#cs-panel` — slides in from the right on trigger click.
- **Palette storage key:** `localStorage.getItem('ua-palette')` — persists selection across
  page loads.
- **Apply programmatically:** `applyPalette(paletteId)` where `paletteId` is one of the ten
  `id` strings in the `PALETTES` array inside `initThemeCustomizer()`.
- **The `--accent-rgb` variable:** Each palette sets this as a raw `R,G,B` triplet (e.g.
  `212,175,55`) for use inside `rgba()` calls. It is required for the clients carousel initial
  pill and shimmer tints to follow the active palette.

### Adding a New Palette

Inside `initThemeCustomizer()` in `app.js`, append to the `PALETTES` array:

```js
{
  id: "your-palette-name",
  label: "Display Name",
  accent: "#HEXVAL",
  light: "#HEXVAL",
  bg: "#HEXVAL",
  glass: "rgba(...)",
  border: "rgba(...)",
  shadow: "rgba(...)",
  rgb: "R,G,B",       // Must match accent as raw R,G,B — no spaces
  blobs: ["#HEXVAL", "#HEXVAL"],
}
```

---

## 19. Mobile Menu Sub-Navigation

### Class Hierarchy

```
#mobileMenu                   <- full-screen overlay
  .mobile-menu-content        <- inner card
    .mobile-nav               <- nav list
      .mobile-nav-group       <- parent item with sub-nav
        .mobile-nav-link      <- parent link (tap to expand)
        .mobile-subnav        <- collapsible sub-section
          <a>                 <- individual sub-links
      .mobile-nav-link        <- standalone link (no sub-nav)
```

### Behaviour

- Tapping a `.mobile-nav-group`'s parent link adds `is-active` to that group, expanding
  `.mobile-subnav` via a CSS height transition. Only one group can be active at a time.
- Tapping a standalone `.mobile-nav-link` navigates normally and closes the overlay.
- Tapping any sub-link also closes the overlay.
- The close button (`#closeMobileMenu`) and backdrop tap both close the overlay.

### Adding a Sub-Nav Group

```html
<div class="mobile-nav-group">
  <a href="#section" class="mobile-nav-link">Section Name</a>
  <div class="mobile-subnav">
    <a href="#subsection-1">Sub-section 1</a>
    <a href="#subsection-2">Sub-section 2</a>
  </div>
</div>
```

`initMobileMenu()` in `app.js` handles all accordion events automatically.

---

The system is predictable. Follow the structure and it will scale cleanly from 3 projects to 300,
from 2 experience entries to 80, and from one page to ten. When in doubt, look at how an existing
working section is built and mirror its structure exactly.
