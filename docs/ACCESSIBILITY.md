# ACCESSIBILITY.md

This document covers every accessibility pattern implemented across the portfolio — ARIA roles,
keyboard navigation contracts, focus management, and screen reader conventions. Every interactive
element in this codebase has an explicit accessibility contract. Follow it when adding new
components.

---

## 1. ARIA Roles and Attributes

### 1.1 Landmark Roles

Every page uses semantic HTML5 landmarks. Do not replace these with generic `<div>` elements.

| Element     | Role         | Used For                                         |
| ----------- | ------------ | ------------------------------------------------ |
| `<header>`  | `banner`     | Site navigation and logo                         |
| `<main>`    | `main`       | Primary page content                             |
| `<nav>`     | `navigation` | Desktop nav bar and mobile menu                  |
| `<footer>`  | `contentinfo`| Footer links, social row, copyright              |
| `<section>` | `region`     | Each named section with `aria-labelledby`        |

All `<section>` elements with visible headings use `aria-labelledby` pointing to the heading's
`id`. Example:

```html
<section id="skills" aria-labelledby="skills-title">
  <h2 id="skills-title" class="section-title">Skills</h2>
</section>
```

---

### 1.2 Interactive Components

#### Modals (`#projectModal`, `#testimonialModal`, `#certModal`)

| Attribute             | Value                               | Purpose                               |
| --------------------- | ----------------------------------- | ------------------------------------- |
| `role`                | `"dialog"`                          | Identifies the overlay as a dialog    |
| `aria-modal`          | `"true"`                            | Tells screen readers focus is trapped |
| `aria-labelledby`     | ID of the modal's heading element   | Names the dialog for screen readers   |

On open: focus is moved to the modal container or the first focusable element inside it.
On close: focus is returned to the element that triggered the open.

#### Testimonial Carousel (`#testimonialCarousel`)

| Attribute        | Value        | Purpose                                    |
| ---------------- | ------------ | ------------------------------------------ |
| `role`           | `"carousel"` | Identifies the widget type                 |
| `aria-live`      | `"polite"`   | Announces slide changes without interrupting |
| `aria-roledescription` | `"slide"` | Applied to each `.carousel-slide`        |

Previous / next buttons carry `aria-label="Previous testimonial"` and
`aria-label="Next testimonial"`. Dot buttons carry `aria-label="Go to testimonial {n}"` and
`aria-pressed="true"` on the active dot.

#### Certification Cards (`.cert-card`)

```html
role="button"
tabindex="0"
aria-label="View {Certificate Name} certificate"
```

These are `<div>` elements acting as buttons. The `role="button"` and `tabindex="0"` pair
makes them keyboard-accessible. `certification-modal-logic.js` binds both `click` and
`keydown` (Enter and Space) events.

#### Mobile Menu (`#mobileMenu`)

| Attribute      | Value                                        |
| -------------- | -------------------------------------------- |
| `role`         | `"dialog"`                                   |
| `aria-modal`   | `"true"`                                     |
| `aria-label`   | `"Mobile navigation menu"`                   |

`#mobileMenuBtn` carries `aria-expanded="false"` at rest, toggled to `"true"` when the
overlay is open. Updated by `initMobileMenu()` in `app.js`.

#### Theme Toggle (`#themeToggle`)

Carries `aria-label` updated dynamically: `"Switch to light mode"` in dark mode,
`"Switch to dark mode"` in light mode.

#### Theme Customizer (`#cs-panel`)

| Attribute       | Value                   |
| --------------- | ----------------------- |
| `role`          | `"dialog"`              |
| `aria-label`    | `"Theme customizer"`    |

Each swatch button carries `title` and `aria-label` set to the palette display name.
The active swatch receives `aria-pressed="true"`.

---

## 2. Keyboard Navigation

### 2.1 Global Keyboard Contracts

| Key            | Scope                   | Behaviour                                  |
| -------------- | ----------------------- | ------------------------------------------ |
| `Tab`          | Entire page             | Cycles through all focusable elements      |
| `Shift+Tab`    | Entire page             | Reverse tab order                          |
| `Enter`        | Any `role="button"`     | Activates the element                      |
| `Space`        | Any `role="button"`     | Activates the element                      |
| `Escape`       | Open modal or panel     | Closes the modal / panel                   |
| `ArrowLeft`    | Testimonial carousel    | Navigates to the previous slide            |
| `ArrowRight`   | Testimonial carousel    | Navigates to the next slide                |

### 2.2 Focus Trap — Modals

When any modal opens, focus must not be allowed to leave the modal container. `app.js` and
`certification-modal-logic.js` implement a basic focus trap: `Escape` closes the modal and
returns focus to the trigger element. When implementing new modals, follow the same pattern:

```js
// On open
modal.focus();
// On Escape keydown inside modal
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
// On close
triggerElement.focus();
```

### 2.3 Skip Navigation

A visually hidden "Skip to main content" link should be the first focusable element on every
page. It becomes visible only when focused, allowing keyboard and screen reader users to bypass
the navigation bar. Pattern:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 1rem;
  background: var(--accent-dark);
  color: #1a1a1a;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-bold);
  z-index: 9999;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 1rem;
}
```

---

## 3. Colour and Contrast

### 3.1 Contrast Ratios

| Pairing                              | Ratio   | WCAG Level |
| ------------------------------------ | ------- | ---------- |
| `--text-dark` on `--bg-dark`         | 12.5:1  | AAA        |
| Gold `#d4af37` on `--bg-dark`        | 6.2:1   | AA         |
| `#1a1a1a` on gold `#d4af37`          | 8.1:1   | AAA        |
| `--text-muted-dark` on `--bg-dark`   | 5.1:1   | AA         |

> These ratios apply to the default Gold Noir palette. Alternative palettes in the Theme
> Customizer are not contrast-audited. If adding a new palette, verify contrast ratios for body
> text and interactive labels before shipping.

### 3.2 Focus Indicators

Never remove the browser default focus ring with `outline: none` without replacing it. The
portfolio replaces default outlines with a gold ring:

```css
:focus-visible {
  outline: 2px solid var(--accent-dark);
  outline-offset: 3px;
}
```

Use `:focus-visible` rather than `:focus` so the ring only appears for keyboard navigation,
not mouse clicks.

---

## 4. Images and Media

### 4.1 `alt` Text Rules

| Image context                  | `alt` rule                                             |
| ------------------------------ | ------------------------------------------------------ |
| Profile photo (coin front)     | `"Ubaid Ahmad"` — identifies the person                |
| Project screenshots            | Brief description of what the screenshot shows         |
| Client logos                   | `"{Client name} logo"`                                 |
| Testimonial avatars            | `"{Reviewer name} photo"`                              |
| Certificate images in modal    | `"{Certificate name} credential"`                      |
| Decorative blobs / backgrounds | `alt=""` with `role="presentation"` or `aria-hidden`   |

Never use the filename as alt text. Never leave `alt` undefined.

### 4.2 `aria-hidden` on Decorative Icons

All purely decorative Font Awesome and Lucide icons carry `aria-hidden="true"`. Icons that
convey meaning (e.g., the star rating icons in testimonials) should not use `aria-hidden` and
should have a visually hidden label nearby:

```html
<span class="sr-only">5 out of 5 stars</span>
<i class="fas fa-star" aria-hidden="true"></i>
```

---

## 5. Forms

### 5.1 Contact Form (`#contactForm`)

Every input in the dual-mode contact form is associated with its label via `for` / `id` pairing.
Inline error spans carry `role="alert"` so screen readers announce validation failures
immediately:

```html
<label for="cf-name">Name</label>
<input id="cf-name" type="text" autocomplete="name" />
<span id="cf-name-error" role="alert" class="cf-error"></span>
```

The form element itself carries `novalidate` to suppress browser-native validation bubbles —
all validation is handled by `contact-form-validation.js` with accessible error messaging.

### 5.2 Toast Notification (`#cfToast`)

The toast uses `role="status"` and `aria-live="polite"` so screen readers announce the
confirmation message after a successful send without interrupting other announcements.

---

## 6. Checklist for New Components

Before shipping any new interactive component, verify all of the following:

- [ ] Is the element a native interactive element (`<button>`, `<a>`)? If not, does it carry
      `role` and `tabindex="0"`?
- [ ] Does it respond to `Enter` and `Space` if it acts as a button?
- [ ] Does it have a visible and programmatic label (`aria-label` or `aria-labelledby`)?
- [ ] Is focus returned to the trigger element after any modal or overlay it opens is closed?
- [ ] Are decorative icons marked `aria-hidden="true"`?
- [ ] Is the colour contrast ratio at least 4.5:1 for normal text, 3:1 for large text?
- [ ] Does the element use `:focus-visible` for its focus ring, not `outline: none`?
- [ ] If it contains images, is `alt` text provided and accurate?
