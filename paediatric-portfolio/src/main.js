import "./style.css";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Footer year ----
document.getElementById("year").textContent = new Date().getFullYear();

// ---- Sticky header: shadow + reduced height once scrolled past the hero ----
const header = document.querySelector(".site-header");
const heroEl = document.querySelector(".hero");

if (heroEl && "IntersectionObserver" in window) {
  const headerHeight = header.offsetHeight;
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle("scrolled", !entry.isIntersecting);
    },
    { rootMargin: `-${headerHeight}px 0px 0px 0px`, threshold: 0 }
  );
  heroObserver.observe(heroEl);
} else {
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

// ---- Mobile nav toggle ----
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");

navToggle.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

primaryNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    primaryNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ---- Active nav link on scroll ----
const navLinks = Array.from(primaryNav.querySelectorAll("a[href^='#']"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = navLinks.find(
          (a) => a.getAttribute("href") === `#${entry.target.id}`
        );
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((section) => sectionObserver.observe(section));
}

// ---- Scroll-reveal ----
const revealEls = document.querySelectorAll(".reveal");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

// ---- Publications expand/collapse (accordion-style height transition) ----
const pubToggle = document.getElementById("pubToggle");
const pubMore = document.getElementById("pubMore");
const pubToggleLabel = pubToggle.querySelector(".pub-toggle-label");

pubToggle.addEventListener("click", () => {
  const isOpen = pubToggle.getAttribute("aria-expanded") === "true";
  const next = !isOpen;
  pubToggle.setAttribute("aria-expanded", String(next));
  pubMore.setAttribute("data-open", String(next));
  pubMore.setAttribute("aria-hidden", String(!next));
  pubToggleLabel.textContent = next ? "Show fewer publications" : "Show all 19 publications";
  if (next) {
    pubMore.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
  }
});

// ---- Staggered entrance for grouped items (skills chips, featured publications) ----
const staggerGroups = document.querySelectorAll(".skills-grid, .pub-cascade");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  staggerGroups.forEach((el) => el.classList.add("is-visible"));
} else {
  const staggerObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  staggerGroups.forEach((el) => staggerObserver.observe(el));
}

// ---- Timeline: continuous track that draws downward as you scroll ----
const timelineWrap = document.querySelector(".timeline-wrap");
const timelineTrack = document.querySelector(".timeline-track");
const timelineFill = document.querySelector(".timeline-track-fill");

if (timelineWrap && timelineTrack && timelineFill) {
  const nodes = Array.from(timelineWrap.querySelectorAll(".timeline-node"));

  const layoutTrack = () => {
    if (nodes.length < 2) return;
    const wrapRect = timelineWrap.getBoundingClientRect();
    const first = nodes[0].getBoundingClientRect();
    const last = nodes[nodes.length - 1].getBoundingClientRect();
    const x = first.left + first.width / 2 - wrapRect.left;
    const top = first.top + first.height / 2 - wrapRect.top;
    const bottom = last.top + last.height / 2 - wrapRect.top;
    timelineTrack.style.left = `${x}px`;
    timelineTrack.style.top = `${top}px`;
    timelineTrack.style.height = `${bottom - top}px`;
  };

  layoutTrack();
  window.addEventListener("resize", layoutTrack, { passive: true });
  window.addEventListener("load", layoutTrack);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layoutTrack);
  }

  if (prefersReducedMotion) {
    timelineFill.style.transform = "scaleY(1)";
  } else {
    let ticking = false;
    const updateFill = () => {
      const rect = timelineTrack.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const start = viewportH * 0.85;
      const end = viewportH * 0.35;
      const total = rect.height + (start - end);
      const progress = Math.min(1, Math.max(0, (start - rect.top) / total));
      timelineFill.style.transform = `scaleY(${progress})`;
      ticking = false;
    };
    updateFill();
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateFill);
          ticking = true;
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", updateFill, { passive: true });
  }
}
