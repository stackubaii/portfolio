# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] - 2026-05

This release is a structural and content overhaul following the v2.x series. The JavaScript
architecture has been fully modularised into dedicated data files. The testimonial section has
been rebuilt as a production-grade carousel. A dual-mode contact form has been re-introduced
to the homepage. The About page now carries a Certifications section backed by its own modal
system. Non-existent pages (`contact.html`, `projects.html`) have been retired and their
responsibilities folded back into `index.html` and `pages/about.html` respectively.

---

### Added

#### Script Modularisation - Five-File Architecture

- `script.js` retired and fully replaced by `app.js`. All render functions, state variables,
  animation logic, and initialisation calls now live in `scripts/app.js`.
- Four data files extracted from the monolithic `script.js` into dedicated modules, each
  loaded via `<script>` before `app.js`:
  - `scripts/skills-data.js` — `skillCategories` array (tabbed skills section).
  - `scripts/experience-data.js` — `experience` array (paginated timeline).
  - `scripts/clients-data.js` — `clients` array (logo carousel).
  - `scripts/testimonials-data.js` — `testimonials` array (carousel + modal).
- `scripts/projects-data.js` was already a separate file and is unchanged.
- Load order in all HTML pages: `projects-data.js` → `skills-data.js` →
  `experience-data.js` → `clients-data.js` → `testimonials-data.js` → `app.js` →
  `contact-form-validation.js`.

#### Certifications Section (`pages/about.html`)

- New `.cert-grid` section added to `pages/about.html` below the career timeline.
  Section is accessible via `aria-labelledby="certifications-title"` and linked from the
  mobile sub-navigation under the About anchor.
- Four `.cert-card.glass-card` components, each carrying:
  - `data-cert-name` — certificate title.
  - `data-cert-institute` — issuing institution.
  - `data-cert-date` — issue date or `"Coming Soon"` placeholder.
  - `data-cert-img` — relative path to the credential image asset.
- Current credential inventory:
  - **Introduction to Jupyter** — 365 DataScience, November 04 2024.
  - **Legacy Responsive Web Design V8** — freeCodeCamp, April 6 2026.
  - **JavaScript Programming** — freeCodeCamp, Coming Soon.
  - **Responsive Web Design** — freeCodeCamp, Coming Soon.
- `#certModal` overlay with `.modal-content.glass-card` renders the full credential image
  on card click. Modal exposes `id="certModalTitle"` and `id="certModalSub"` for
  accessible labelling and `id="certModalBody"` for the image injection target.
- Falls back to a `.cert-modal-placeholder` block (with `fa-certificate` icon) when
  `data-cert-img` is empty.
- `scripts/certification-modal-logic.js` — new IIFE that wires all `.cert-card` elements
  to the modal: click, `Enter`/`Space` keydown, close-button click, backdrop click, and
  `Escape` keydown. Loaded on `pages/about.html` only.

#### Dual-Mode Contact Form (`index.html`)

- Contact form re-introduced on `index.html` under `id="contact"` section. The form
  (`id="contactForm"`) is now a dual-mode widget supporting two send paths:
  - **Mail mode** — builds and opens a `mailto:` URI; email input visible, WhatsApp
    field hidden.
  - **WhatsApp mode** — builds and opens a `https://wa.me/` deep-link; contact number
    input visible, email field hidden.
- Tab selector (`.cf-tab-pill` animated indicator) switches between `data-mode="mail"`
  and `data-mode="whatsapp"` tabs.
- Fields: name, email / WhatsApp number (conditional), subject (mail only), message.
  Each field has a corresponding inline error span for real-time validation feedback.
- Toast notification (`#cfToast`) displayed on successful submission or validation failure.
- Submit button (`#cfSubmitBtn`) label and icon update dynamically per active mode.
- `scripts/contact-form-validation.js` handles all form logic: mode switching, field
  visibility toggling, validation, URI construction, and toast lifecycle.

#### Homepage Sections

- `#collaboration` section added to `index.html` — a CTA block encouraging project
  enquiries, positioned after the projects carousel.
- `#social` section added to `index.html` — a social-icon grid using
  `.social-icon.glass-card.glow-hover` cards for GitHub, LinkedIn, Instagram, WhatsApp,
  Telegram, and email links.

#### Testimonial Carousel State Constants

- `TC_INTERVAL = 120_000` (2 minutes) — auto-advance interval for the testimonial
  carousel, defined at module level in `app.js`.
- `carouselIndex`, `carouselTimer`, `carouselAnimating` state variables added to manage
  carousel position, auto-advance handle, and mid-transition guard respectively.

---

### Changed

#### Testimonials — Grid → Single-Card Carousel

- The static testimonial grid has been fully replaced with a single-card carousel
  (`id="testimonialCarousel"`, `role="carousel"`).
- Bidirectional slide animation: `tcGoTo(newIndex, direction)` slides the outgoing card
  out (`exit-left` or `exit-right`) and the incoming card in (`enter-left` or
  `enter-right`) simultaneously via CSS class toggling and `transitionend` cleanup.
- Auto-advance: `tcStart()` calls `setInterval(tcNavigate("next"), TC_INTERVAL)`.
  `tcPause()` and `tcResume()` are bound to `mouseenter`/`mouseleave` and
  `focusin`/`focusout` events on the carousel container.
- `tcResetTimer()` cancels and restarts the interval on any manual navigation to prevent
  a skip immediately after a user interaction.
- Dot navigation: `id="tcDots"` container renders one `.carousel-dot` per testimonial.
  `tcUpdateDots(activeIndex)` toggles the `.tc-dot-active` class on every state change.
- Previous / next buttons (`.carousel-prev`, `.carousel-next`) with `fa-chevron-left` /
  `fa-chevron-right` icons.
- Keyboard support: `ArrowLeft` calls `tcNavigate("prev")`, `ArrowRight` calls
  `tcNavigate("next")`.
- Clicking a carousel slide opens the testimonial detail modal (unchanged modal behaviour).
- `renderTestimonials()` output uses `#tcTrack` as the slide container and injects
  `.carousel-slide` wrappers around each `.testimonial-card`.

#### Services Page — Tier 3 Renamed

- Service tier 3 title changed from **"Agentic AI"** (named in v2.0.0 README) to
  **"Consultation & Discovery"**. The tier now covers project scoping, requirements
  analysis, tech stack recommendation, UI/UX audits, information architecture planning,
  and actionable roadmap delivery. Turnaround: 2–5 days.

#### Pages Retired

- `pages/contact.html` removed from the codebase. Contact functionality now lives
  exclusively in `index.html#contact` via the dual-mode contact form.
- `pages/projects.html` removed from the codebase. No projects filter page is
  currently active.

---

### Fixed

#### Testimonial Carousel - Mid-Transition Guard

- `carouselAnimating` boolean flag prevents `tcGoTo()` from being called while a slide
  transition is already in progress, eliminating stacked transitions that previously caused
  the carousel track to desync on rapid keyboard or button input.

---

### Removed

- `scripts/script.js` — fully retired; replaced by `scripts/app.js` and the four
  dedicated data files.
- `pages/contact.html` — removed (contact absorbed into `index.html`).
- `pages/projects.html` — removed.
- Clients carousel hidden: the `#clients` section in `index.html` is currently commented
  out pending updated client asset data.

---

## [2.10.0] - 2026-03

### Added

#### Complete Palette Consistency System

- `--accent-rgb` CSS variable introduced as a raw `R,G,B` triplet (e.g. `212,175,55`) stored in
  `:root` and updated dynamically by `applyPalette()` in `initThemeCustomizer()`. This variable
  is consumed inside `rgba()` expressions throughout the CSS - notably the client initial pill
  background (`rgba(var(--accent-rgb), 0.12)`) and shimmer tint variants.
- All 10 palette objects in `PALETTES` updated with the `rgb` field so `--accent-rgb` is set
  correctly on every palette switch.
- Global `transition` softness added to key variables on palette/mode change to prevent hard
  colour snaps across background, border, and shadow properties.

### Changed

- Customizer panel fully made palette- and light/dark-aware. Panel background, close button,
  section labels, and active-label text all now use CSS variables that respond to the active
  palette and the current light/dark mode simultaneously.
- Available for Work badge and `#cs-trigger` button unified under the same variable-based
  colour system so both elements correctly reflect the active palette in light mode.
- Tech tags (`.type-*` classes) updated to use `rgba` with the full variable palette where
  applicable, keeping tag colours legible across all 10 palettes.
- `#cs-trigger` positioning confirmed as `bottom: 5.5rem` to maintain visual separation from
  the Available for Work badge at `bottom: 2rem`.

### Fixed

- Mobile menu overlay (`#mobileMenu`) `z-index` confirmed above the customizer panel to prevent
  the panel from bleeding through the mobile overlay on small screens.
- Light mode `:root[data-theme="light"]` selector block extended to cover `#cs-panel`,
  `.cs-close`, `.cs-active-label`, `.available-badge`, `#cs-trigger`, `.mobile-menu-content`,
  and `.loader-text` - all of which were rendering with incorrect colours in light mode before
  this pass.

---

## [2.9.0] - 2026-03

### Added

#### Theme Customizer - 10-Palette Runtime Switcher

- `initThemeCustomizer()` function added to `script.js`. Builds and appends two DOM elements
  on `DOMContentLoaded` - no HTML scaffold required on any page:
  - `#cs-trigger` - fixed-position button at bottom-right (`z-index: 1000`) with a
    `fa-palette` icon. Opens and closes the panel on click.
  - `#cs-panel` - slide-in panel (`role="dialog"`) containing the palette swatch grid and
    active palette label.
- 10 built-in palettes defined in the `PALETTES` array:
  `gold-noir`, `royal-amethyst`, `cyber-teal`, `rose-prestige`, `emerald-elite`,
  `arctic-frost`, `amber-forge`, `crimson-luxe`, `silver-ghost`, `coral-flame`.
- Each palette sets: `--accent-dark`, `--accent-light`, `--bg-dark`, `--glass-dark`,
  `--border-dark`, `--shadow-color`, and the liquid background blob gradients.
- `applyPalette(id)` applies all CSS variable overrides via `root.style.setProperty()` and
  injects a `<style id="cs-dyn">` tag for liquid blob gradients. Active swatch receives a
  `.cs-active` ring class.
- Selected palette persisted in `localStorage` under the key `'ua-palette'`. Restored on every
  page load. Defaults to `'gold-noir'` if no saved value is found.
- Panel closes on outside click and on close button (`fa-times`) click.
- Swatch buttons have `title` and `aria-label` attributes for screen reader accessibility.

### Changed

- `style.css` extended with full customizer panel styling under `THEME CUSTOMIZER`
  comment block: trigger button, swatch grid, panel slide-in animation, responsive mobile
  bottom-sheet variant.

---

## [2.8.0] - 2026-03

### Fixed

#### Process Flow - Equal-Height Cards

- The 5-step process section on `pages/services.html` was displaying staggered vertical
  alignment because cards with shorter content were shorter than adjacent cards.
- Fixed with `align-items: stretch` on `.process-flow` at `min-width: 641px`, combined with
  `display: flex; flex-direction: column` on each `.process-step`, and `flex: 1` on `.process-step p`
  so descriptions fill remaining card height. Cards now bottom-align naturally.
- Mobile treatment mirrors the desktop fix with `min-height: 160px` on `.process-step` at
  `max-width: 640px`.

---

## [2.5.0] - 2026-02

### Added

#### Client Carousel - Upgrade

- `clients` array objects updated to use `link` (URL string) and `linkType`
  (`"website"` | `"facebook"` | `"instagram"`) fields in place of the previous `url` field.
- **No-logo card variant** - when a `clients` entry has no `logo` field, `renderClients()`
  renders a `.client-logo-text` card showing a gold initial pill (`.client-initial-pill`) and
  the company name (`.client-name-label`) instead of a blank image slot.
- **Link-type badge** - a `.client-link-badge` span is injected into every card with the
  appropriate Font Awesome icon: `fa-globe` for website, `fab fa-facebook` for Facebook,
  `fab fa-instagram` for Instagram.
- **Section subtitle** - `.clients-subtitle` class added for the descriptive text below the
  section heading.

### Changed

- `renderClients()` in `script.js` rebuilt around a `buildCard(client)` helper function that
  handles both logo and no-logo variants through a `hasLogo` boolean branch.
- Carousel hover-pause logic moved to reference the outer `.clients-carousel` container rather
  than the track directly, so the pause area covers the full visible region.

---

## [2.3.0] - 2026-02

### Fixed

#### Mobile Hamburger Button

- `AUDIT` had introduced a CSS rule that caused the mobile hamburger button
  (`.mobile-menu-btn`) to disappear on viewports below 768px.
- Fixed by adding an explicit `display: flex !important` rule in the `max-width: 768px` media
  query to restore the button on mobile.

#### Mobile Sub-Navigation Accordion

- Mobile menu links that contained sub-sections were previously non-expandable - tapping the
  parent link navigated away rather than revealing the sub-items.
- Added `.mobile-nav-group` / `.mobile-subnav` accordion CSS: `max-height: 0; overflow: hidden`
  at rest, `max-height: 400px` when the parent group has `.is-active`. Transition is `0.3s ease`.
- `.mobile-nav-group.is-active > .mobile-nav-link` receives a gold accent tint to indicate the
  expanded state visually.
- `initMobileMenu()` in `script.js` updated with sub-nav accordion logic: clicking a group's
    parent link adds `is-active` to that group, collapses all other groups, and calls
  `e.preventDefault()` to stay on page while expanding. Sub-links close the overlay on tap.

#### Theme Toggle Button Sizing

- Theme toggle button was rendering at an inconsistent size compared to the hamburger button
  on desktop and mobile viewports.
- Fixed by applying `width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--border-dark)`
  to `.theme-toggle-btn` to exactly match the hamburger button's dimensions.

---

## [2.2.0] - 2026-02

### Fixed

#### Project Type Tags - Inline Display

- Type tag badges inside `.project-type-tags` were stretching to full card width on some
  viewport sizes, making individual tags appear as wide block elements.
- Fixed by enforcing `display: inline-flex; flex-wrap: wrap` on `.project-type-tags` and
  `display: inline-block` on individual `.project-type-tag` elements.

---

## [2.1.0] - 2026-02

### Fixed

#### Mobile Menu Z-Index

- The mobile menu overlay (`#mobileMenu`) was rendering beneath the Available for Work badge
  and other fixed-position elements in certain scroll positions.
- Fixed by setting `.mobile-menu { z-index: 50000 !important }` to guarantee the overlay sits
  above all other fixed-position UI elements.

---

## [2.0.0] - 2026-03-01

This release is a complete visual, interaction, and structural overhaul. Every animated element,
hover effect, interactive widget, and navigation model has been rebuilt from scratch or significantly
upgraded. The data architecture is unchanged - all content still lives in arrays inside `script.js`
and `projects-data.js` - but the rendering layer, animation system, page structure, and CSS design
system have all moved to their next major version.

This release was driven by a full three-role panel audit covering Design, Development, and Strategy.
Every weakness identified was cross-referenced against the source code and implemented directly.

---

### Added

#### New Pages

- `pages/about.html` - Full About / Story page containing: a hero bio section, a CSS-only career
  timeline, a three-card tech philosophy grid, a "Currently" block (music, reading, building), and a
  CTA banner linking to contact and CV download.
- `pages/services.html` - Services / Hire Me page with three service tiers (Full-Stack MERN,
  UI/UX Design) and a five-step engagement process. All CTAs use `mailto:` links only.
- `pages/contact.html` - Dedicated contact page using channel cards (email, GitHub, LinkedIn,
  Calendly). Every link is a `mailto:` address or direct `href`. The contact form has been
  permanently removed from the codebase.

#### 3D Coin-Toss Profile Card

- Replaced the static profile `<img>` with a multi-layer 3D flip card hierarchy:
  `.profile-coin-container` wraps `.coin-inner`, which holds `.coin-front` and `.coin-back`.
- On hover, `.coin-inner` executes a **720-degree Y-axis rotation** in
  `0.9s cubic-bezier(0.34, 1.56, 0.64, 1)`.
- `perspective: 1500px` on the outer container gives mathematically accurate depth.
- Back face renders a **"TRUSTED EXPERT"** verification badge using `fa-certificate` + `fa-check`.
- `backface-visibility: hidden` on both faces prevents bleed-through during mid-spin frames.
- `coinGlow` keyframe pulses the outer ring at idle.
- `--coin-size` CSS variable controls diameter: `180px` desktop, `140px` at 480px.

#### Bi-Directional Scroll Animations

- Passive `scroll` event listener updates `_lastScrollY` and `_currentScrollY`.
- `IntersectionObserver` stamps `.from-below` (scrolling down) or `.from-above` (scrolling up)
  at the moment of entry, then fires the `visible` transition.
- `requestAnimationFrame` wrapper prevents the "flash then animate" artifact.
- Both direction classes cleared on exit for clean re-evaluation on every scroll pass.

#### Smart Experience Pagination

- `INITIAL_EXP_COUNT = 2` and `EXP_BATCH_SIZE = 3` drive the system.
- `updateExperienceButtons()` syncs both **Show More** and **Show Less** buttons and updates
  the "Show More" label to reflect the next batch count.
- **Show Less** button collapses to `INITIAL_EXP_COUNT` and smooth-scrolls to section header.
- System is array-length-agnostic.

#### Auto-Pinned Project Badges

- `renderProjects()` uses `projectsData.indexOf(project)` to pin projects at index 0, 1, 2.
- `.pinned-badge` HTML injected with `fa-thumbtack` icon rotated 45 degrees.

#### Universal Shimmer-Gradient Hover Effect

- `::after` pseudo-element shimmer on `.glass-card:not(.modal-content)`, `.cta-button`,
  `.load-more-btn`, `.connect-btn`, `.modal-link`, `.category-btn`.
- `skewX(-18deg)` stripe sweeps from `left: -110%` to `left: 160%` in `0.65s ease`.

#### Interactive Client Carousel

- Hover-pause: `mouseenter` pauses animation; `mouseleave` resumes.
- Logo images render with `object-fit: cover` for consistent tile fill.

#### Light / Dark Mode Toggle

- `initThemeToggle()` in `script.js` toggles `data-theme="light"` on `:root` (`<html>`).
- Persists in `localStorage` under the key `"theme"`.
- Inline `<head>` script reads and applies theme before DOM renders to prevent flash.

#### Available for Work Badge

- Fixed bottom-right badge on every page with `bounce` keyframe animation.
- Links to primary `mailto:` contact address.

#### Navigation Expanded

- Nav updated from section anchors to five full page links: Home, About, Projects, Services,
  Contact.
- Active nav state via `IntersectionObserver` on all pages (`.nav-active` class).

#### Footer Upgraded

- All pages share an upgraded footer with quick links, full social row (Lucide icons),
  availability dot, and CV download link.

#### Miscellaneous Additions

- 4th stat counter: "Technologies: 15+".
- `heroFadeUp` entrance animation on all pages - visible on load without scroll trigger.
- Lucide Icons CDN on all pages, replacing all emoji usage in dynamic content.
- CSS-only career timeline in `pages/about.html`.
- Tech philosophy three-card grid in `pages/about.html`.
- Currently block (music, reading, building) in `pages/about.html`.
- CV download button in `pages/about.html` and upgraded footer.
- `assets/ubaid-ahmad-cv.pdf` placeholder file created.
- Social proof CTA section beneath testimonials on `index.html`.
- Currently Building card with progress indicator on `pages/projects.html`.
- Outcome tags on project cards using Font Awesome icons (check-circle, bolt, star).

---

### Changed

#### Experience Array - `isInitiallyVisible` Deprecated

- The `isInitiallyVisible` boolean is no longer read by `renderExperience()`. It can remain
  in array entries without causing errors but has no effect. Visibility is now controlled
  entirely by array index position relative to `INITIAL_EXP_COUNT`.

#### Hero Section Rebuilt

- Hero copy replaced with specific, voice-driven copy communicating real expertise.
- Hero project image / browser mockup removed.
- Primary CTA changed to CV download.

#### All Contact CTAs Changed

- Every button, link, and CTA that previously linked to a contact form now links to
  `mailto:ubaid@example.com` or a direct external URL. Forms permanently removed.

#### Load More Button - Display Model

- Changed from `display: block` to `display: inline-flex` for icon + text layout.
- Spacing moved to parent `.experience-btn-group` flex container.

#### CSS Architecture - Scroll Animation Classes

- `.slide-up` and `.fade-in` modifiers split into `.from-below` / `.from-above` directional
  variants. `.zoom-in` remains direction-agnostic (scale only).

#### Stat Counter Labels

- "Years Experience" hardcoded to floor "1+".
- Labels renamed to "Projects Shipped" and "Happy Clients".

---

### Fixed

#### Modal Scroll Broken by Shimmer Overflow

- `overflow: hidden` was applied globally to `.glass-card`, silently overriding `.modal-content`'s
  `overflow-y: auto` and trapping long project descriptions.
- Fixed by scoping the shimmer overflow rule to `.glass-card:not(.modal-content)`.

#### Client Carousel - Logo Fill

- Logo images had `1.5rem` padding and `max-width/max-height` constraints leaving empty space
  around non-standard aspect ratios.
- Fixed: `padding: 0; width: 100%; height: 100%; object-fit: cover`.

#### Carousel `<a>` Wrapper Styling

- Wrapping logos in `<a>` tags introduced visible underline and default link colour.
- Fixed with `a.client-logo { text-decoration: none; color: inherit; }`.

#### Lucide Icons Initialisation Timing

- `createIcons()` was called before dynamic content rendered, leaving SVGs as empty elements.
- Fixed: `createIcons()` now called at the end of all render functions.

#### CV Download Button

- The CV download `<a>` was commented out in the original `index.html`.
- Fixed: uncommented, `href` updated to `./assets/ubaid-ahmad-cv.pdf`.

---

### Removed

- Fake client logo data (via.placeholder.com entries).
- Blog page - not built; all references removed from every nav, footer, and page file.
- All HTML `<form>`, `<input>`, and `<textarea>` elements from the entire codebase.
- Project image / browser mockup from the hero section.

---

## [1.0.0] - 2026-01-15

Initial release of the portfolio.

### Added

- Data-driven rendering architecture: `skillCategories`, `experience`, `projects`, `clients`, and
  `testimonials` arrays powering all dynamic sections from a single `script.js` file.
- Tabbed skills section with category filtering and pop-in animation per card.
- Alternating experience timeline with `isInitiallyVisible` flag and a basic "Load More" button.
- Featured projects grid (max 3 entries) on the homepage with a full database view on
  `projects.html`.
- Project detail modal with live demo link and GitHub repository link.
- Infinite-scroll client logo carousel.
- Testimonial grid with expandable modal for long testimonial text.
- Static hero section with profile image, role subtitle, and a CV download button.
- Gold / Dark glassmorphism design system using CSS custom properties throughout.
- `IntersectionObserver`-driven scroll animations (single-direction, no scroll delta tracking).
- Animated stat counters (`experienceCount`, `projectsCount`, `clientsCount`).
- Floating glass header with smooth-scroll anchor navigation.
- Mobile hamburger menu with slide-in drawer.
- Page loader with gold spinner.
- Liquid background animation (two radial blobs on a 20s float cycle).
- Custom gold scrollbar styling.
- Full responsive layout at 768px and 480px breakpoints.
- SEO metadata including Open Graph tags, Twitter Card tags, and canonical URL.
- 3D coin-flip profile card using CSS `perspective` and `backface-visibility` (single-direction
  spin, upgraded to 720-degree bi-directional spin in v2.0.0).
- Gold `#D4AF37` / dark `#1A1A1A` design system established as the permanent visual identity.

---
