// =========================================================
//  DATA - loaded via separate files before this script:
//    skills-data.js      → skillCategories
//    experience-data.js  → experience
//    clients-data.js     → clients
//    testimonials-data.js→ testimonials
// =========================================================

// =========================================================
//                           STATE
// =========================================================
let currentSkillCategory = skillCategories[0].category;

// --- Testimonial Carousel State ----------------------------
let carouselIndex = 0; // currently visible slide index
let carouselTimer = null; // auto-advance interval handle
let carouselAnimating = false; // guard against mid-transition clicks
const TC_INTERVAL = 120_000; // 2 minutes (ms)

// =========================================================
//          SCROLL DIRECTION TRACKING
// Continuously updated by a passive scroll listener so the
// IntersectionObserver knows which way the user is scrolling.
// =========================================================
let _lastScrollY = window.scrollY;
let _currentScrollY = window.scrollY;
window.addEventListener(
  "scroll",
  () => {
    _lastScrollY = _currentScrollY;
    _currentScrollY = window.scrollY;
  },
  { passive: true },
);

// =========================================================
//            EXPERIENCE PAGINATION CONSTANTS
// =========================================================
const INITIAL_EXP_COUNT = 2; // cards shown on first render
const EXP_BATCH_SIZE = 3; // cards revealed per "Load More" click

// =========================================================
//            BI-DIRECTIONAL SCROLL OBSERVER
// Stored at module level so loadMoreExperience can reuse it.
// =========================================================
let scrollObserver = null;

/**
 * initScrollAnimations
 * Registers elements with the bi-directional IntersectionObserver.
 * Pass an array/NodeList to register specific elements (e.g. newly
 * revealed "Load More" items), or call with no argument to register
 * every .animate-on-scroll element on the page.
 *
 * Bi-directional logic:
 *   - Scrolling DOWN → element enters with "from-below" class (slides up)
 *   - Scrolling UP   → element enters with "from-above" class (slides down)
 *   - On exit the direction classes are cleared so re-entry re-evaluates.
 */
function initScrollAnimations(elements = null) {
  if (!scrollObserver) {
    scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Determine direction at the moment of entry
            const scrollingDown = _currentScrollY >= _lastScrollY;

            // Clear any previous direction class
            entry.target.classList.remove("from-below", "from-above");

            // Set directional class BEFORE adding visible so the
            // CSS transition starts from the correct offset position.
            entry.target.classList.add(
              scrollingDown ? "from-below" : "from-above",
            );

            // requestAnimationFrame ensures the browser has painted the
            // initial offset before the transition kicks in.
            requestAnimationFrame(() => {
              entry.target.classList.add("visible");
            });
          } else {
            // Remove all state so the next entry re-animates correctly.
            entry.target.classList.remove(
              "visible",
              "from-below",
              "from-above",
            );
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      },
    );
  }

  const els = elements || document.querySelectorAll(".animate-on-scroll");
  els.forEach((el) => {
    el.classList.remove("visible", "from-below", "from-above");
    scrollObserver.observe(el);
  });
}

// =========================================================
//                UTILITY - Animated Counter
// =========================================================
function animateCounter(element, target, duration = 1500) {
  if (!element) return;
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const current = Math.min((target * progress) / duration, target);
    element.textContent = Math.floor(current);
    if (progress < duration) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = target;
    }
  }
  window.requestAnimationFrame(step);
}

// =========================================================
//                        MOBILE MENU
// =========================================================
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeMobileMenu = document.getElementById("closeMobileMenu");

  if (!mobileMenuBtn || !mobileMenu || !closeMobileMenu) return;

  // --- Open / close overlay ---
  mobileMenuBtn.addEventListener("click", () =>
    mobileMenu.classList.add("active"),
  );
  closeMobileMenu.addEventListener("click", () =>
    mobileMenu.classList.remove("active"),
  );
  mobileMenu.addEventListener("click", (e) => {
    if (e.target === mobileMenu) mobileMenu.classList.remove("active");
  });

  // --- Sub-nav accordion: tap parent link to expand/collapse ---
  const navGroups = mobileMenu.querySelectorAll(".mobile-nav-group");
  navGroups.forEach((group) => {
    const parentLink = group.querySelector(":scope > .mobile-nav-link");
    if (!parentLink) return;

    parentLink.addEventListener("click", (e) => {
      // Only intercept if there IS a subnav - otherwise navigate normally
      const subnav = group.querySelector(".mobile-subnav");
      if (!subnav) return;

      const isActive = group.classList.contains("is-active");

      // Collapse all groups first
      navGroups.forEach((g) => g.classList.remove("is-active"));

      // Re-open this one if it was closed
      if (!isActive) {
        group.classList.add("is-active");
        e.preventDefault(); // stay on page while expanding
      }
    });
  });

  // --- Close overlay when a sub-link (non-group) link is tapped ---
  mobileMenu
    .querySelectorAll(".mobile-subnav a, .mobile-nav > .mobile-nav-link")
    .forEach((link) => {
      link.addEventListener("click", () =>
        mobileMenu.classList.remove("active"),
      );
    });
}

// =========================================================
//              RENDER SKILLS - Tabbed layout
// =========================================================
function renderSkills() {
  const bar = document.getElementById("skillsCategoryBar");
  const grid = document.getElementById("skillsDisplayGrid");
  if (!bar || !grid) return;

  bar.innerHTML = skillCategories
    .map(
      (cat) => `
      <button
        class="category-btn${cat.category === currentSkillCategory ? " active" : ""}"
        data-category="${cat.category}"
        role="tab"
        aria-selected="${cat.category === currentSkillCategory}"
        aria-label="Show ${cat.category} skills"
      >${cat.category}</button>`,
    )
    .join("");

  bar.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category;
      if (currentSkillCategory === cat) return;
      currentSkillCategory = cat;
      renderSkills();
    });
  });

  const activeData = skillCategories.find(
    (c) => c.category === currentSkillCategory,
  );
  if (!activeData) return;

  grid.innerHTML = activeData.skills
    .map(
      (s, i) => `
      <div
        class="skill-card glass-card skill-card-anim animate-on-scroll fade-in"
        style="animation-delay: ${i * 0.07}s"
        aria-label="${s.name}"
      ><span>${s.name}</span></div>`,
    )
    .join("");

  // Register newly-rendered skill cards with the observer
  const newCards = grid.querySelectorAll(".animate-on-scroll");
  if (typeof initScrollAnimations === "function")
    initScrollAnimations(newCards);
}

// =========================================================
//                    RENDER EXPERIENCE
// Always renders the full dataset but hides items beyond
// INITIAL_EXP_COUNT. Button state is managed separately.
// =========================================================
function renderExperience() {
  const timeline = document.getElementById("experienceTimeline");
  if (!timeline) return;

  timeline.innerHTML = experience
    .map(
      (exp, index) => `
      <div class="experience-item glass-card animate-on-scroll slide-up${
        index >= INITIAL_EXP_COUNT ? " hidden" : ""
      }">
        <div class="exp-header">
          <h3 class="experience-title">${exp.title}</h3>
          <button class="exp-toggle" aria-expanded="false" aria-label="Expand card">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <div class="exp-body" aria-hidden="true">
          <p class="experience-company">${exp.company}</p>
          <p class="experience-period">${exp.period}</p>
          <p class="experience-description">${exp.description}</p>
        </div>
      </div>`,
    )
    .join("");

  // Event delegation - handles current + future cards automatically
  // --- Shared collapse helper (used by accordion + outside-click) ---
  function collapseExpCard(cardEl) {
    const b = cardEl.querySelector(".exp-body");
    const bt = cardEl.querySelector(".exp-toggle");
    const ic = bt && bt.querySelector("i");
    if (!b || !bt || bt.getAttribute("aria-expanded") !== "true") return;
    b.style.maxHeight = b.scrollHeight + "px";
    b.offsetHeight; // force reflow
    b.style.maxHeight = "0";
    b.style.opacity = "0";
    bt.setAttribute("aria-expanded", "false");
    bt.setAttribute("aria-label", "Expand card");
    if (ic) {
      ic.classList.remove("fa-minus");
      ic.classList.add("fa-plus");
    }
    cardEl.classList.remove("exp-expanded");
    b.setAttribute("aria-hidden", "true");
  }

  timeline.addEventListener("click", function handleExpToggle(e) {
    const btn = e.target.closest(".exp-toggle");
    if (!btn) return;
    const card = btn.closest(".experience-item");
    const body = card.querySelector(".exp-body");
    const icon = btn.querySelector("i");
    const isExpanded = btn.getAttribute("aria-expanded") === "true";

    if (isExpanded) {
      collapseExpCard(card);
    } else {
      // Collapse every other open card first (accordion behaviour)
      timeline
        .querySelectorAll(".experience-item.exp-expanded")
        .forEach((other) => {
          if (other !== card) collapseExpCard(other);
        });

      body.style.maxHeight = body.scrollHeight + "px";
      body.style.opacity = "1";
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Collapse card");
      icon.classList.remove("fa-plus");
      icon.classList.add("fa-minus");
      card.classList.add("exp-expanded");
      body.setAttribute("aria-hidden", "false");
      body.addEventListener(
        "transitionend",
        () => {
          if (btn.getAttribute("aria-expanded") === "true") {
            body.style.maxHeight = "none";
          }
        },
        { once: true },
      );
    }
  });

  // --- Collapse on outside click ---
  document.addEventListener("click", function collapseOnOutside(e) {
    if (e.target.closest("#experienceTimeline")) return; // click was inside
    timeline
      .querySelectorAll(".experience-item.exp-expanded")
      .forEach(collapseExpCard);
  });

  updateExperienceButtons();
}

// =========================================================
//          EXPERIENCE - Dual-button state sync
// =========================================================
function updateExperienceButtons() {
  const loadMoreBtn = document.getElementById("loadMoreExperience");
  const showLessBtn = document.getElementById("showLessExperience");
  const total = experience.length;
  const visibleCount = document.querySelectorAll(
    "#experienceTimeline .experience-item:not(.hidden)",
  ).length;

  // "Load More" only visible when hidden cards remain
  if (loadMoreBtn) {
    loadMoreBtn.style.display = visibleCount >= total ? "none" : "inline-flex";
    // Update label to reflect how many remain
    const remaining = total - visibleCount;
    const nextBatch = Math.min(remaining, EXP_BATCH_SIZE);
    loadMoreBtn.innerHTML = `<i class="fas fa-chevron-down"></i> Show ${nextBatch} More Experience`;
  }

  // "Show Less" only visible once we're beyond the initial count
  if (showLessBtn) {
    showLessBtn.style.display =
      visibleCount > INITIAL_EXP_COUNT ? "inline-flex" : "none";
  }
}

// =========================================================
//              EXPERIENCE - Load More
// Reveals up to EXP_BATCH_SIZE hidden items at a time.
// =========================================================
function loadMoreExperience() {
  const hiddenItems = Array.from(
    document.querySelectorAll("#experienceTimeline .experience-item.hidden"),
  );
  hiddenItems.slice(0, EXP_BATCH_SIZE).forEach((item) => {
    item.classList.remove("hidden");
    initScrollAnimations([item]);
  });
  updateExperienceButtons();
}

// =========================================================
//            EXPERIENCE - Show Less
// Collapses back to the initial INITIAL_EXP_COUNT cards.
// =========================================================
function showLessExperience() {
  const allItems = document.querySelectorAll(
    "#experienceTimeline .experience-item",
  );
  allItems.forEach((item, index) => {
    if (index >= INITIAL_EXP_COUNT) item.classList.add("hidden");
  });
  updateExperienceButtons();

  // Gently scroll back to the top of the Experience section
  const section = document.getElementById("experience");
  if (section) {
    const header = document.querySelector(".glass-header");
    const headerHeight = header ? header.offsetHeight : 0;
    window.scrollTo({
      top:
        section.getBoundingClientRect().top +
        window.pageYOffset -
        (headerHeight + 16),
      behavior: "smooth",
    });
  }
}

// =========================================================
//   RENDER PROJECTS - Scroll-Preview Carousel
//   Shows all featured projects.
//   ▸ Desktop (≥1101px) → 3 cards visible  - arrows/dots hidden if ≤3 total
//   ▸ Tablet  (681–1100px) → 2 cards visible  - arrows always shown
//   ▸ Mobile  (≤680px)   → 1 card visible  - arrows always shown
//   ▸ 4th card added → arrows auto-enabled on desktop too
//   ▸ Transition: 1 s, bidirectional slide
// =========================================================
function renderProjects() {
  const track = document.getElementById("pcTrack");
  const dotsWrap = document.getElementById("pcDots");
  const prevBtn = document.getElementById("pcPrev");
  const nextBtn = document.getElementById("pcNext");

  if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

  const projectsData = window.projects || [];
  const isSubPage = window.location.pathname.includes("/pages/");
  const resolvePath = (p) => (isSubPage ? `../${p}` : p);
  const featured = projectsData.filter(
    (p) => p.type && p.type.includes("featured"),
  );

  if (featured.length === 0) {
    track.innerHTML = `<p style="opacity:0.6;padding:2rem;">No projects to display yet.</p>`;
    return;
  }

  // --- Build cards ----------------------------
  track.innerHTML = featured
    .map(
      (project) => `
    <div class="pc-card glass-card" data-project-id="${project.id}">
      <div class="pc-preview" data-img-container>
        <img
          src="${resolvePath(project.image)}"
          alt="Screenshot of ${project.title}"
          class="pc-preview-img"
          loading="lazy"
          draggable="false"
        />
      </div>
      <div class="pc-info">
        <span class="pc-title">${project.title}</span>
        ${
          project.demo
            ? project.visitEnabled === false
              ? `<span
                class="pc-visit-btn pc-visit-btn--disabled"
                aria-disabled="true"
                title="Live site currently unavailable"
              >Visit <i class="fas fa-external-link-alt" style="font-size:0.7rem;"></i></span>`
              : `<a
              href="${project.demo}"
              target="_blank"
              rel="noopener noreferrer"
              class="pc-visit-btn"
              onclick="event.stopPropagation()"
              aria-label="Visit ${project.title} live demo"
            >Visit <i class="fas fa-external-link-alt" style="font-size:0.7rem;"></i></a>`
            : ""
        }
      </div>
    </div>`,
    )
    .join("");

  // --- Scroll-preview: image scrolls T→B on hover, B→T on leave ─
  track.querySelectorAll(".pc-preview").forEach((preview) => {
    const img = preview.querySelector(".pc-preview-img");
    const calcDist = () => {
      const renderedImgH =
        (img.naturalHeight / img.naturalWidth) * preview.offsetWidth;
      return Math.max(0, renderedImgH - preview.offsetHeight);
    };
    preview.addEventListener("mouseenter", () => {
      const dist = calcDist();
      const dur = Math.min(5, 2 + dist / 500);
      img.style.transition = `top ${dur}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      img.style.top = `-${dist}px`;
    });
    preview.addEventListener("mouseleave", () => {
      img.style.transition = "top 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      img.style.top = "0px";
    });
  });

  // --- Carousel state ----------------------------
  const totalCards = featured.length;
  let currentIndex = 0;
  // Guards: is a mouse drag (not a click) in progress?
  let isMouseDownOnTrack = false;
  let isDragging = false;

  // Returns how many cards are fully visible at current viewport width
  function getCardsPerView() {
    const w = window.innerWidth;
    if (w > 1100) return 3;
    if (w > 680) return 2;
    return 1;
  }

  // Show / hide arrows & dots based on whether navigation is possible
  function updateNavVisibility() {
    const cpv = getCardsPerView();
    const maxPg = Math.max(0, totalCards - cpv);
    const active = maxPg > 0;
    prevBtn.style.visibility = active ? "visible" : "hidden";
    nextBtn.style.visibility = active ? "visible" : "hidden";
    dotsWrap.style.visibility = active ? "visible" : "hidden";
    return maxPg;
  }

  // --- goTo: translate track, sync dots & arrow states ----------------------------
  function goTo(raw) {
    const cpv = getCardsPerView();
    const maxPg = Math.max(0, totalCards - cpv);
    const index = Math.max(0, Math.min(raw, maxPg)); // clamp
    currentIndex = index;

    const cardEl = track.querySelector(".pc-card");
    const gap = parseFloat(getComputedStyle(track).gap) || 20;
    const cardWidth = cardEl ? cardEl.offsetWidth + gap : 0;
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

    // Sync dots
    dotsWrap
      .querySelectorAll(".pc-dot")
      .forEach((d, i) => d.classList.toggle("is-active", i === currentIndex));

    // Dim arrows at boundaries
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxPg;
    prevBtn.style.opacity = currentIndex === 0 ? "0.35" : "1";
    nextBtn.style.opacity = currentIndex >= maxPg ? "0.35" : "1";
  }

  // --- Rebuild dot indicators ----------------------------
  function rebuildDots() {
    const cpv = getCardsPerView();
    const maxPg = Math.max(0, totalCards - cpv);
    const count = maxPg + 1;
    dotsWrap.innerHTML = Array.from(
      { length: count },
      (_, i) =>
        `<button class="pc-dot ${i === 0 ? "is-active" : ""}" data-index="${i}" aria-label="Go to project ${i + 1}"></button>`,
    ).join("");
    dotsWrap.querySelectorAll(".pc-dot").forEach((dot) => {
      dot.addEventListener("click", () => goTo(parseInt(dot.dataset.index)));
    });
  }

  // --- Arrow listeners ----------------------------
  prevBtn.addEventListener("click", () => goTo(currentIndex - 1));
  nextBtn.addEventListener("click", () => goTo(currentIndex + 1));

  // --- Resize: recalculate everything -------------------------------
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const maxPg = Math.max(0, totalCards - getCardsPerView());
      if (currentIndex > maxPg) currentIndex = maxPg;
      rebuildDots();
      updateNavVisibility();
      goTo(currentIndex);
    }, 80);
  });

  // --- Initial render ----------------------------
  rebuildDots();
  updateNavVisibility();
  goTo(0);

  // --- Touch / Mouse swipe support ----------------------------------
  // R→L swipe: card enters from right, exits on left  (next)
  // L→R swipe: card enters from left,  exits on right (prev)
  //
  // KEY FIX: isMouseDownOnTrack guards window-level mouseup/mousemove
  // so that clicking an arrow button NEVER triggers onDragEnd logic.
  // isDragging is only set true when actual pixel movement > threshold,
  // so a plain click on the track does not accidentally trigger goTo.
  let dragStartX = 0;
  let dragStartIdx = 0;
  const SWIPE_THRESHOLD = 50;

  const onTouchStart = (e) => {
    isDragging = false;
    dragStartX = e.touches[0].clientX;
    dragStartIdx = currentIndex;
  };

  const onTouchMove = (e) => {
    const delta = e.touches[0].clientX - dragStartX;
    if (Math.abs(delta) > SWIPE_THRESHOLD) isDragging = true;
  };

  const onTouchEnd = (e) => {
    if (!isDragging) return;
    const delta = dragStartX - e.changedTouches[0].clientX; // +ve = R→L = next
    isDragging = false;
    goTo(delta > 0 ? dragStartIdx + 1 : dragStartIdx - 1);
  };

  const onMouseDown = (e) => {
    isMouseDownOnTrack = true;
    isDragging = false;
    dragStartX = e.clientX;
    dragStartIdx = currentIndex;
    track.classList.add("is-dragging");
  };

  const onMouseMove = (e) => {
    if (!isMouseDownOnTrack) return;
    if (Math.abs(e.clientX - dragStartX) > SWIPE_THRESHOLD) isDragging = true;
  };

  const onMouseUp = (e) => {
    if (!isMouseDownOnTrack) return; // ignore clicks that didn't start on track
    isMouseDownOnTrack = false;
    track.classList.remove("is-dragging");
    if (!isDragging) return; // plain click on track - do nothing
    const delta = dragStartX - e.clientX; // +ve = R→L = next
    isDragging = false;
    goTo(delta > 0 ? dragStartIdx + 1 : dragStartIdx - 1);
  };

  // Touch events on track only
  track.addEventListener("touchstart", onTouchStart, { passive: true });
  track.addEventListener("touchmove", onTouchMove, { passive: true });
  track.addEventListener("touchend", onTouchEnd);
  // Mouse drag: start on track, move/end on window (handles fast movement)
  track.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}
// =========================================================
//        RENDER CLIENTS - infinite carousel
// --------------------------------------------------------─
// Supports two card modes:
//   • logo present  → shows the image (grayscale → color on hover)
//   • no logo yet   → shows a gold initial pill + company name
// Each card links out via website > facebook > instagram,
// indicated by a small icon badge in the corner.
// =========================================================
function renderClients() {
  const clientsTrack = document.getElementById("clientsTrack");
  if (!clientsTrack) return;
  if (!clients.length) return;

  const clientsCarousel = document.querySelector(".clients-carousel");

  // FA icon class per link type
  const linkIconMap = {
    website: "fas fa-globe",
    facebook: "fab fa-facebook",
    instagram: "fab fa-instagram",
  };

  function buildCard(client) {
    const initial = client.name.charAt(0).toUpperCase();
    const iconClass =
      linkIconMap[client.linkType] || "fas fa-external-link-alt";
    const hasLogo = Boolean(client.logo);

    const innerHTML = hasLogo
      ? `<img src="${client.logo}" alt="${client.name} logo" loading="lazy" />`
      : `<div class="client-initial-pill" aria-hidden="true">${initial}</div>
         <span class="client-name-label">${client.name}</span>`;

    return `
      <a
        href="${client.link}"
        target="_blank"
        rel="noopener noreferrer"
        class="client-logo${hasLogo ? "" : " client-logo-text"}"
        role="listitem"
        aria-label="Visit ${client.name}"
        data-tooltip="${client.name}"
      >
        ${innerHTML}
        <span class="client-link-badge" aria-hidden="true">
          <i class="${iconClass}"></i>
        </span>
      </a>`;
  }

  // Duplicate for seamless infinite scroll
  const doubled = [...clients, ...clients];
  clientsTrack.innerHTML = doubled.map(buildCard).join("");

  // Pause on hover so users can click
  if (clientsCarousel) {
    clientsCarousel.addEventListener("mouseenter", () => {
      clientsTrack.style.animationPlayState = "paused";
    });
    clientsCarousel.addEventListener("mouseleave", () => {
      clientsTrack.style.animationPlayState = "running";
    });
  }
}

// =========================================================
//                    RENDER TESTIMONIALS
// =========================================================
// =========================================================
//               TESTIMONIAL CAROUSEL
// Single-card carousel with auto-advance, bidirectional
// slide transitions, keyboard nav, and ARIA support.
// Isolated to #testimonialsGrid - no other DOM touched.
// =========================================================
function renderTestimonials() {
  const container = document.getElementById("testimonialsGrid");
  if (!container) return;

  // --- Build HTML ----------------------------
  container.innerHTML = `
    <div
      class="testimonial-carousel"
      id="testimonialCarousel"
      role="region"
      aria-label="Client testimonials"
      aria-roledescription="carousel"
      tabindex="0"
    >
      <div class="carousel-track" id="tcTrack">
        ${testimonials
          .map(
            (t, i) => `
          <div
            class="testimonial-card glass-card carousel-slide"
            id="tc-slide-${i}"
            role="group"
            aria-roledescription="slide"
            aria-label="Slide ${i + 1} of ${testimonials.length}: ${t.name}"
            aria-hidden="${i !== 0}"
            tabindex="${i === 0 ? "0" : "-1"}"
            data-tc-index="${i}"
          >
            <div class="testimonial-header">
              <img
                src="${t.avatar}"
                alt="Photo of ${t.name}"
                class="testimonial-avatar"
                loading="lazy"
              />
              <div class="testimonial-info">
                <h4>${t.name}</h4>
                <p>${t.role}</p>
              </div>
            </div>
            <p class="testimonial-text">${t.text}</p>
            <div class="testimonial-stars" aria-label="${t.stars} out of 5 stars">
              ${'<i class="fas fa-star"></i>'.repeat(t.stars)}
            </div>
          </div>`,
          )
          .join("")}
      </div>

      <!-- Navigation controls -->
      <div
        class="carousel-controls"
        role="group"
        aria-label="Carousel navigation"
      >
        <button
          class="carousel-btn carousel-prev"
          id="tcPrev"
          aria-label="Previous testimonial"
        >
          <i class="fas fa-chevron-left" aria-hidden="true"></i>
        </button>

        <div
          class="carousel-dots"
          role="tablist"
          aria-label="Jump to slide"
          id="tcDots"
        >
          ${testimonials
            .map(
              (t, i) => `
            <button
              class="carousel-dot${i === 0 ? " tc-dot-active" : ""}"
              role="tab"
              aria-selected="${i === 0}"
              aria-controls="tc-slide-${i}"
              aria-label="Slide ${i + 1}: ${t.name}"
              data-tc-dot="${i}"
            ></button>`,
            )
            .join("")}
        </div>

        <button
          class="carousel-btn carousel-next"
          id="tcNext"
          aria-label="Next testimonial"
        >
          <i class="fas fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
    </div>`;

  // --- Measure track height (all slides are position:absolute) ---
  const track = document.getElementById("tcTrack");
  const slides = Array.from(track.querySelectorAll(".carousel-slide"));

  // Temporarily make slides flow to measure their natural height
  slides.forEach((s) => {
    s.style.cssText =
      "position:relative;visibility:hidden;opacity:0;pointer-events:none;transition:none;transform:none;";
  });
  const maxH = Math.max(...slides.map((s) => s.offsetHeight));
  track.style.height = maxH + "px";

  // Restore: first slide visible, rest off to the right
  slides.forEach((s, i) => {
    if (i === 0) {
      s.style.cssText =
        "position:absolute;top:0;left:0;width:100%;transition:none;opacity:1;transform:translateX(0);pointer-events:auto;";
      s.getBoundingClientRect(); // reflow
      s.style.transition = ""; // re-enable transitions
    } else {
      s.style.cssText =
        "position:absolute;top:0;left:0;width:100%;opacity:0;transform:translateX(60px);pointer-events:none;";
    }
  });

  // --- Click → open modal ----------------------------
  slides.forEach((slide, i) => {
    const open = () => openTestimonialModal(i);
    slide.addEventListener("click", open);
    slide.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  // --- Arrow buttons ----------------------------
  document.getElementById("tcPrev").addEventListener("click", () => {
    tcNavigate("prev");
    tcResetTimer();
  });
  document.getElementById("tcNext").addEventListener("click", () => {
    tcNavigate("next");
    tcResetTimer();
  });

  // --- Dot buttons ----------------------------
  document
    .getElementById("tcDots")
    .querySelectorAll(".carousel-dot")
    .forEach((dot) => {
      dot.addEventListener("click", () => {
        const target = parseInt(dot.dataset.tcDot, 10);
        if (target === carouselIndex) return;
        tcGoTo(target, target > carouselIndex ? "next" : "prev");
        tcResetTimer();
      });
    });

  // --- Keyboard navigation ----------------------------
  const carousel = document.getElementById("testimonialCarousel");
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      tcNavigate("prev");
      tcResetTimer();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      tcNavigate("next");
      tcResetTimer();
    }
  });

  // --- Pause on hover / focus -------------------------------
  carousel.addEventListener("mouseenter", tcPause);
  carousel.addEventListener("mouseleave", tcResume);
  carousel.addEventListener("focusin", tcPause);
  carousel.addEventListener("focusout", (e) => {
    if (!carousel.contains(e.relatedTarget)) tcResume();
  });

  // --- Start auto-advance ----------------------------
  tcStart();
}

// --- Core transition engine ----------------------------
function tcNavigate(direction) {
  const total = testimonials.length;
  const next =
    direction === "next"
      ? (carouselIndex + 1) % total
      : (carouselIndex - 1 + total) % total;
  tcGoTo(next, direction);
}

function tcGoTo(newIndex, direction) {
  if (newIndex === carouselIndex || carouselAnimating) return;
  carouselAnimating = true;

  const slides = Array.from(
    document.querySelectorAll("#tcTrack .carousel-slide"),
  );
  const fromSlide = slides[carouselIndex];
  const toSlide = slides[newIndex];

  // Directional offsets
  const enterFrom = direction === "next" ? "60px" : "-60px";
  const exitTo = direction === "next" ? "-60px" : "60px";

  // 1. Snap incoming slide into start position (no transition)
  toSlide.style.transition = "none";
  toSlide.style.transform = `translateX(${enterFrom})`;
  toSlide.style.opacity = "0";
  toSlide.getBoundingClientRect(); // commit paint before re-enabling transition

  // 2. Animate both slides
  toSlide.style.transition = "";
  requestAnimationFrame(() => {
    // Incoming: slide to center + fade in
    toSlide.style.transform = "translateX(0)";
    toSlide.style.opacity = "1";
    toSlide.style.pointerEvents = "auto";
    toSlide.setAttribute("tabindex", "0");

    // Outgoing: slide out + fade out
    fromSlide.style.transform = `translateX(${exitTo})`;
    fromSlide.style.opacity = "0";
    fromSlide.style.pointerEvents = "none";
    fromSlide.setAttribute("tabindex", "-1");
  });

  // 3. Post-transition cleanup (520ms ≥ 500ms transition duration)
  setTimeout(() => {
    // Park the exited slide on the OPPOSITE side without animation
    // so it's correctly positioned for any future re-entry from that side
    fromSlide.style.transition = "none";
    fromSlide.style.transform = `translateX(${enterFrom})`;
    fromSlide.getBoundingClientRect();
    fromSlide.style.transition = "";

    // ARIA: hide exited, reveal active
    fromSlide.setAttribute("aria-hidden", "true");
    toSlide.setAttribute("aria-hidden", "false");

    // Update dot indicators
    tcUpdateDots(newIndex);

    carouselIndex = newIndex;
    carouselAnimating = false;
  }, 520);
}

function tcUpdateDots(activeIndex) {
  const dots = document.querySelectorAll("#tcDots .carousel-dot");
  dots.forEach((d, i) => {
    const active = i === activeIndex;
    d.classList.toggle("tc-dot-active", active);
    d.setAttribute("aria-selected", active ? "true" : "false");
  });
}

// --- Auto-advance timer helpers ----------------------------
function tcStart() {
  if (!carouselTimer) {
    carouselTimer = setInterval(() => tcNavigate("next"), TC_INTERVAL);
  }
}

function tcPause() {
  clearInterval(carouselTimer);
  carouselTimer = null;
}

function tcResume() {
  tcStart();
}

function tcResetTimer() {
  // After manual nav, restart the full 2-min countdown
  tcPause();
  tcStart();
}

// =========================================================
//                    TESTIMONIAL MODAL
// =========================================================
function openTestimonialModal(index) {
  const testimonial = testimonials[index];
  if (!testimonial) return;

  const modal = document.getElementById("testimonialModal");
  const modalContent = document.getElementById("testimonialModalContent");
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <div class="testimonial-header">
      <img src="${testimonial.avatar}" alt="Avatar of ${testimonial.name}" class="testimonial-avatar" />
      <div class="testimonial-info">
        <h4>${testimonial.name}</h4>
        <p>${testimonial.role}</p>
      </div>
    </div>
    <div class="testimonial-stars" aria-label="${testimonial.stars} out of 5 stars">
      ${'<i class="fas fa-star"></i>'.repeat(testimonial.stars)}
    </div>
    <p class="testimonial-modal-text">${testimonial.text}</p>`;

  setTimeout(() => {
    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }, 10);
}

function closeTestimonialModal() {
  const modal = document.getElementById("testimonialModal");
  if (!modal) return;
  modal.classList.remove("active");
  setTimeout(() => document.body.classList.remove("modal-open"), 500);
}

// =========================================================
//                            COUNTERS
// =========================================================
function initCounters() {
  const statsBar = document.querySelector(".stats-bar");
  if (!statsBar) return;

  // experienceCount is hardcoded "1+" in HTML - do not animate
  const projectsCountEl = document.getElementById("projectsCount");
  const clientsCountEl = document.getElementById("clientsCount");
  const techCountEl = document.getElementById("techCount");

  const totalProjects = 7;
  const totalClients = 3;
  const totalTech = 15;

  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(projectsCountEl, totalProjects);
          animateCounter(clientsCountEl, totalClients);
          animateCounter(techCountEl, totalTech);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  counterObserver.observe(statsBar);
}

// =========================================================
//                        PAGE LOADER
// =========================================================
function hideLoader() {
  const loader = document.getElementById("page-loader");
  if (!loader) return;
  loader.classList.add("hidden");
  // Remove from DOM after the CSS transition completes (0.5s)
  setTimeout(() => {
    if (loader.parentNode) loader.parentNode.removeChild(loader);
  }, 600);
}

// =========================================================
//                            INIT
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  try {
    // --- Render all dynamic sections ---
    // Each function guards itself with an early return if its
    // target element doesn't exist, so pages that only have a
    // subset of sections (e.g. projects.html) won't throw.
    renderSkills();
    renderExperience();
    renderProjects();
    renderClients();
    renderTestimonials();

    // Register dynamically-rendered testimonial carousel with observer
    const tcEl = document.getElementById("testimonialCarousel");
    if (tcEl) {
      tcEl.classList.add("animate-on-scroll", "slide-up");
      // Observer is initialised later in the setTimeout below - no early call needed
    }

    // --- Refresh Lucide icons for dynamically rendered content ---
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    // --- Mobile menu ---
    initMobileMenu();

    // --- Load More / Show Less Experience ---
    const loadMoreBtn = document.getElementById("loadMoreExperience");
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", loadMoreExperience);
    }
    const showLessBtn = document.getElementById("showLessExperience");
    if (showLessBtn) {
      showLessBtn.addEventListener("click", showLessExperience);
    }

    // --- Modal close buttons ---
    const closeTestimonialBtn = document.getElementById(
      "closeTestimonialModal",
    );
    if (closeTestimonialBtn) {
      closeTestimonialBtn.addEventListener("click", closeTestimonialModal);
    }

    // --- Close modals on backdrop click ---
    const testimonialModal = document.getElementById("testimonialModal");
    if (testimonialModal) {
      testimonialModal.addEventListener("click", (e) => {
        if (e.target.id === "testimonialModal") closeTestimonialModal();
      });
    }

    // --- ESC key closes testimonial modal ---
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeTestimonialModal();
      }
    });

    // --- Smooth Scroll System ----------------------------
    // Nav-click → eased animation over 1500ms via RAF.
    // User scroll (wheel/touch/keyboard) is fully native - no override.
    // ------------------------------------------------------------------
    (function () {
      // Disable CSS smooth-scroll so the nav-click RAF owns that motion
      // without fighting the browser's built-in smooth behaviour.
      document.documentElement.style.scrollBehavior = "auto";

      let rafId = null;
      let startY = 0;
      let targetY = 0;
      let startTime = null;

      // Ease: cubic in-out
      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function clampY(y) {
        const maxY = document.documentElement.scrollHeight - window.innerHeight;
        return Math.max(0, Math.min(y, maxY));
      }

      function runRAF(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const t = Math.min(elapsed / 1500, 1);
        const eased = easeInOutCubic(t);
        window.scrollTo(0, startY + (targetY - startY) * eased);
        if (t < 1) {
          rafId = requestAnimationFrame(runRAF);
        } else {
          window.scrollTo(0, targetY);
          rafId = null;
        }
      }

      function animateTo(toY) {
        if (rafId) cancelAnimationFrame(rafId);
        startY = window.scrollY;
        targetY = clampY(toY);
        startTime = null;
        rafId = requestAnimationFrame(runRAF);
      }

      // --- Nav-click: 1500ms eased scroll ----------------------------
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          const href = this.getAttribute("href");
          if (!href || href === "#") return;
          const target = document.querySelector(href);
          if (!target) return;
          e.preventDefault();
          const header = document.querySelector(".glass-header");
          const headerHeight = header ? header.offsetHeight : 0;
          const offsetY =
            target.getBoundingClientRect().top +
            window.scrollY -
            (headerHeight + 16);
          animateTo(offsetY);
        });
      });

      // User scroll (wheel, touch, keyboard) - fully native, no interception.
    })();

    // --- Kick off animations & counters after a short paint delay ---
    // The 300ms delay ensures rendered HTML is in the DOM before
    // the observer starts measuring element positions.
    setTimeout(() => {
      initScrollAnimations();
      initCounters();
    }, 300);

    // --- Theme toggle & active nav ---
    initThemeToggle();
    initActiveNav();
  } catch (err) {
    console.error("Portfolio init error:", err);
  } finally {
    // --- Guaranteed loader hide ---
    // The finally block runs even if a render step above throws,
    // so the page is never stuck on the loader screen.
    setTimeout(hideLoader, 400);
  }
});

// =========================================================
//                  LIGHT / DARK THEME TOGGLE
// =========================================================
function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  const iconDark = toggle.querySelector(".theme-icon-dark");
  const iconLight = toggle.querySelector(".theme-icon-light");

  function applyTheme(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      if (iconDark) iconDark.style.display = "none";
      if (iconLight) iconLight.style.display = "inline-block";
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (iconDark) iconDark.style.display = "inline-block";
      if (iconLight) iconLight.style.display = "none";
    }
  }

  // Read saved preference
  const saved = localStorage.getItem("theme") || "dark";
  applyTheme(saved);

  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });
}

// =========================================================
//               ACTIVE NAV STATE ON SCROLL
// =========================================================
function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".desktop-nav a");
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove("nav-active");
            if (link.getAttribute("href") === "#" + entry.target.id) {
              link.classList.add("nav-active");
            }
          });
        }
      });
    },
    { threshold: 0.4 },
  );

  sections.forEach((s) => observer.observe(s));
}
