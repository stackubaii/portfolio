# PERFORMANCE.md

This document defines the performance budget, optimisation techniques, measurement tooling, and
Lighthouse targets for the portfolio. A fast portfolio signals engineering competence before a
recruiter reads a single line of copy. Every section below is actionable — not aspirational.

---

## 1. Performance Budget

These are hard targets. If a change causes any metric to breach its budget, address the
regression before deploying.

| Metric                              | Target     | Critical Threshold |
| ----------------------------------- | ---------- | ------------------ |
| Lighthouse Performance Score        | ≥ 90       | < 80 = block deploy|
| First Contentful Paint (FCP)        | < 1.2s     | > 2.0s             |
| Largest Contentful Paint (LCP)      | < 2.0s     | > 3.0s             |
| Total Blocking Time (TBT)           | < 100ms    | > 300ms            |
| Cumulative Layout Shift (CLS)       | < 0.05     | > 0.1              |
| Time to Interactive (TTI)           | < 2.5s     | > 4.0s             |
| Total page weight (`index.html`)    | < 1.5MB    | > 3MB              |
| Total JS payload (uncompressed)     | < 150KB    | > 300KB            |
| Total CSS payload (uncompressed)    | < 60KB     | > 120KB            |

Budgets are measured on a simulated mid-range mobile device (Moto G4 equivalent) with a
4G connection in Lighthouse DevTools mode. Desktop scores will be higher — always measure on
the mobile preset.

---

## 2. Image Optimisation

Images are consistently the largest contributor to page weight. Follow these rules for every
image asset added to the project.

### 2.1 Format Rules

| Image type                        | Format         | Reason                                              |
| --------------------------------- | -------------- | --------------------------------------------------- |
| Profile photo (hero coin)         | WebP           | Best quality-to-size ratio for photographs          |
| Project screenshots               | WebP           | Lossless compression available for UI screenshots   |
| Client logos (raster)             | WebP or PNG    | PNG for logos with transparency; WebP otherwise     |
| Testimonial avatars               | WebP           | Small dimensions — WebP savings are significant     |
| Credential / certificate images   | WebP or JPG    | Certificates are document-style images — JPG fine   |
| OG image (`og-image.png`)         | PNG            | OG scrapers have inconsistent WebP support          |
| Favicon                           | PNG            | Universal browser support required                  |

### 2.2 Dimension Targets

| Asset                          | Max dimensions     | Notes                                    |
| ------------------------------ | ------------------ | ---------------------------------------- |
| Profile photo                  | 360 × 360px        | Renders at 180px — 2× for retina         |
| Project screenshots            | 800 × 500px        | Cards render thumbnails only             |
| Client logos                   | 200 × 200px        | Carousel tiles are square                |
| Testimonial avatars            | 120 × 120px        | Rendered at 48–60px — 2× for retina      |
| Certificate images (modal)     | 1200 × 900px max   | Full-size modal display — no upscaling   |
| OG image                       | 1200 × 630px exact | Platform requirement                     |

### 2.3 Compression Targets

| Format | Tool                        | Quality setting      |
| ------ | --------------------------- | -------------------- |
| WebP   | `cwebp`, Squoosh, ImageMagick | 80–85               |
| JPG    | `jpegoptim`, Squoosh        | 80–85                |
| PNG    | `pngquant`, TinyPNG         | Lossy 256 colours    |

Target file sizes: profile photo < 60KB, project thumbnails < 80KB each, avatars < 20KB each.

### 2.4 Lazy Loading

All images below the fold carry `loading="lazy"`:

```html
<img src="./assets/work/project-screenshot.webp" alt="Project name" loading="lazy" />
```

The hero profile photo and any above-the-fold images should use `loading="eager"` (the default)
to avoid delaying LCP. Do not add `loading="lazy"` to the coin card profile image.

### 2.5 `width` and `height` Attributes

Always declare explicit `width` and `height` attributes on `<img>` elements to prevent CLS.
The browser reserves the correct space before the image downloads, eliminating layout shifts.

```html
<img src="./assets/work/project.webp" alt="..." width="800" height="500" loading="lazy" />
```

---

## 3. JavaScript Optimisation

### 3.1 Script Load Strategy

All scripts load at the bottom of `<body>` with no `defer` or `async` attribute required —
they are non-blocking by position. Do not move scripts to `<head>` without adding `defer`.

### 3.2 No Unused Dependencies

The project has no npm dependencies and no bundler. Every CDN dependency loaded on every page
must be actively used on that page. Current CDN payloads:

| Library           | CDN Size (approx) | Pages loaded on   |
| ----------------- | ----------------- | ----------------- |
| Tailwind CSS      | ~28KB (gzip)      | All               |
| Lucide Icons      | ~40KB (gzip)      | All               |
| Font Awesome 6.5  | ~70KB (gzip)      | All               |
| Plus Jakarta Sans | ~25KB (gzip)      | All               |

Font Awesome 6.5 is the largest dependency. If Font Awesome usage is reduced in future, consider
switching to a subsetting approach or an SVG sprite to reduce payload.

### 3.3 Render-Blocking Avoidance

The theme initialisation script in `<head>` is intentionally synchronous and tiny (< 200 bytes).
It reads `localStorage` and applies `data-theme` before the DOM renders to prevent a flash of
the wrong theme. This is a justified blocking script. Do not add any other synchronous scripts
to `<head>`.

### 3.4 Debouncing and Passive Listeners

The scroll direction tracker in `app.js` uses `{ passive: true }`:

```js
window.addEventListener('scroll', handler, { passive: true });
```

Any future scroll listeners must also use `{ passive: true }` unless they call
`preventDefault()`. Non-passive scroll listeners block the browser's compositor thread and
directly increase TBT.

---

## 4. CSS Optimisation

### 4.1 `backdrop-filter` Performance

`backdrop-filter: blur()` on `.glass-card` is GPU-accelerated on modern browsers but expensive
on low-end devices. The portfolio currently applies it to every card. If Lighthouse flags high
rendering times on mobile, reduce the blur radius from `15px` to `10px` in `style.css` as a
first step.

### 4.2 `will-change` Guidance

Do not add `will-change: transform` globally to `.glass-card`. It promotes every card to its
own GPU layer, which increases memory usage faster than it improves animation performance. Add
`will-change: transform` only to elements actively animating (the coin, active carousel slides)
and remove it after the animation completes via JavaScript if performance profiling shows it
helps.

### 4.3 Unused CSS

`style.css` is a single file and not processed by a bundler. There is no automatic dead code
elimination. Periodically audit with the Chrome DevTools Coverage panel (`Ctrl+Shift+P` →
"Coverage") to identify CSS rules that fire on no page. Remove genuinely unused rules — do not
remove rules that fire only on scroll or interaction, as the Coverage panel marks those as unused
on initial load.

---

## 5. Font Loading

### 5.1 Google Fonts Preconnect

All pages should carry preconnect hints before the Google Fonts `<link>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

`preconnect` establishes the TCP connection and TLS handshake to Google's font servers before
the browser parses the `<link>` tag, reducing font load latency by 100–300ms on most connections.

### 5.2 `font-display: swap`

The Google Fonts URL uses `display=swap` by default. This ensures the browser renders text in
the fallback `sans-serif` font immediately, then swaps to Plus Jakarta Sans when it loads.
Without `swap`, text is invisible until the font file downloads, directly hurting FCP.

---

## 6. Caching and Compression

The portfolio is served as a static site from GitHub Pages, Netlify, or Vercel. All three
platforms apply the following automatically:

| Platform     | GZIP / Brotli | Asset caching         | HTTP/2  |
| ------------ | ------------- | --------------------- | ------- |
| GitHub Pages | Gzip          | 1 hour (HTML), 1 year (assets with hash) | Yes |
| Netlify      | Brotli + Gzip | Configurable via `netlify.toml` | Yes |
| Vercel       | Brotli + Gzip | Automatic edge caching | Yes    |

No configuration is required on GitHub Pages. On Netlify, add cache-control headers in
`netlify.toml` for improved asset longevity:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

---

## 7. Lighthouse Measurement Procedure

Run Lighthouse on the live URL, not `localhost`, for accurate results. Local server timings
exclude real network latency and CDN cold starts.

1. Open Chrome DevTools → **Lighthouse** tab.
2. Set **Device** to `Mobile`.
3. Check: **Performance**, **Accessibility**, **Best Practices**, **SEO**.
4. Click **Analyze page load**.
5. Record scores in the table below.

### Score History

| Date       | Version | Perf | A11y | Best Practices | SEO  | Notes              |
| ---------- | ------- | ---- | ---- | -------------- | ---- | ------------------ |
| 2026-05    | v3.0.0  |  —   |  —   |       —        |  —   | Baseline pending   |

Update this table after every major deployment. If Performance drops below 80, investigate
using the **Opportunities** and **Diagnostics** sections of the Lighthouse report before
deploying.

---

## 8. Performance Checklist

Run through this list before every production deployment:

- [ ] All new images are in WebP format (except OG image and favicon).
- [ ] All new images have explicit `width` and `height` attributes.
- [ ] All below-the-fold images carry `loading="lazy"`.
- [ ] Hero profile photo does not carry `loading="lazy"`.
- [ ] No new synchronous scripts added to `<head>`.
- [ ] Any new scroll listeners use `{ passive: true }`.
- [ ] CDN dependencies are only loaded on pages that use them.
- [ ] Lighthouse Performance score is ≥ 90 on mobile preset against the live URL.
- [ ] CLS is < 0.05 (no layout shifts on load or during scroll animations).
- [ ] Total page weight for `index.html` is under 1.5MB.
