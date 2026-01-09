// script.js (מוכן להדבקה)

// שנה בפוטר
(() => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

// Nav toggle (mobile)
(() => {
  const btn = document.querySelector(".navToggle");
  const nav = document.querySelector("[data-nav]");
  if (!btn || !nav) return;

  const setOpen = (isOpen) => {
    nav.classList.toggle("is-open", isOpen);
    btn.setAttribute("aria-expanded", String(isOpen));
  };

  btn.addEventListener("click", () => {
    const isOpen = !nav.classList.contains("is-open");
    setOpen(isOpen);
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("is-open")) return;
    if (nav.contains(e.target) || btn.contains(e.target)) return;
    setOpen(false);
  });
})();

// WhatsApp links
(() => {
  const DEFAULT_TEXT = "היי דניאל, אשמח לשיחת אפיון קצרה לגבי ליווי אונליין 🙏";
  document.querySelectorAll("[data-wa]").forEach((el) => {
    const phone = (el.getAttribute("data-phone") || "").trim();
    if (!phone) return;

    el.addEventListener("click", (e) => {
      e.preventDefault();
      const msg = encodeURIComponent(DEFAULT_TEXT);
      const url = `https://wa.me/${phone}?text=${msg}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  });
})();

// Reveal on scroll
(() => {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((ent) => {
        if (ent.isIntersecting) ent.target.classList.add("revealed");
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => io.observe(el));
})();

// ✅ משתנה גלובלי קטן כדי למנוע "קליק" אחרי swipe
window.__dkLastSwipeAt = 0;

// Carousel (RTL-safe + LOOP + Progress Bar + SWIPE)
(() => {
  const carousels = document.querySelectorAll("[data-carousel]");
  if (!carousels.length) return;

  const clamp01 = (n) => Math.max(0, Math.min(1, n));

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel__track");
    const viewport = carousel.querySelector(".carousel__viewport");
    const slides = Array.from(carousel.querySelectorAll(".slide"));
    const btnPrev = carousel.querySelector(".carousel__btn--prev");
    const btnNext = carousel.querySelector(".carousel__btn--next");
    const dotsWrap = carousel.querySelector(".carousel__dots");
    if (!track || !viewport || !slides.length || !dotsWrap) return;

    let index = 0;
    const max = Math.max(0, slides.length - 1);

    // Progress Bar UI
    dotsWrap.innerHTML = `
      <div class="carousel__progressTrack" tabindex="0" role="button" aria-label="פס התקדמות (לחיצה לקפיצה לסלייד)">
        <div class="carousel__progressFill" aria-hidden="true"></div>
        <div class="carousel__progressThumb" aria-hidden="true"></div>
      </div>
    `;
    const progressTrack = dotsWrap.querySelector(".carousel__progressTrack");

    const update = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      const ratio = max === 0 ? 0 : index / max;
      carousel.style.setProperty("--progress", String(clamp01(ratio)));

      // עדכון טקסט "סלייד X/Y" אם תרצה בהמשך - כרגע לא מוסיפים
    };

    // LOOP
    const goTo = (i) => {
      const n = slides.length;
      index = ((i % n) + n) % n;
      update();
    };

    btnPrev?.addEventListener("click", () => goTo(index - 1));
    btnNext?.addEventListener("click", () => goTo(index + 1));

    // Click on progress bar -> jump
    progressTrack?.addEventListener("click", (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = clamp01(x / rect.width);
      const target = max === 0 ? 0 : Math.round(ratio * max);
      goTo(target);
    });

    // Keyboard on progress bar
    progressTrack?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(index + 1); // RTL feel
      if (e.key === "ArrowRight") goTo(index - 1);
      if (e.key === "Home") goTo(0);
      if (e.key === "End") goTo(slides.length - 1);
    });

    // Keyboard on carousel
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(index + 1);
      if (e.key === "ArrowRight") goTo(index - 1);
    });

    // SWIPE (Mobile)
    let startX = 0;
    let startY = 0;
    let isSwiping = false;
    let startTime = 0;

    const SWIPE_THRESHOLD = 40; // px
    const SWIPE_MAX_TIME = 800; // ms

    viewport.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        startTime = Date.now();
        isSwiping = false;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchmove",
      (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        const t = e.touches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
          isSwiping = true;
          e.preventDefault();
        }
      },
      { passive: false }
    );

    viewport.addEventListener(
      "touchend",
      (e) => {
        const dt = Date.now() - startTime;
        if (!isSwiping || dt > SWIPE_MAX_TIME) return;

        const ct = e.changedTouches && e.changedTouches[0];
        if (!ct) return;

        const endX = ct.clientX;
        const endY = ct.clientY;
        const dx = endX - startX;
        const dy = endY - startY;

        if (Math.abs(dx) < Math.abs(dy)) return;
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;

        // מסמנים שהיה swipe כדי שלא יפתח lightbox בגלל click "אחרי"
        window.__dkLastSwipeAt = Date.now();

        // swipe שמאלה -> הבא, ימינה -> הקודם
        if (dx < 0) goTo(index + 1);
        else goTo(index - 1);

        isSwiping = false;
      },
      { passive: true }
    );

    // init
    goTo(0);
  });
})();

// ================================
// Lightbox (להמחשה בלבד): Zoom-in + Next/Prev + Keyboard
// ================================
(() => {
  const lb = document.getElementById("lightbox");
  if (!lb) return;

  const imgEl = lb.querySelector(".lightbox__img");
  const closeBtn = lb.querySelector(".lightbox__close");
  const prevBtn = lb.querySelector(".lightbox__nav--prev");
  const nextBtn = lb.querySelector(".lightbox__nav--next");

  const getGallery = () =>
    Array.from(document.querySelectorAll("#results .ba img")).filter(
      (i) => i && i.getAttribute("src")
    );

  let gallery = getGallery();
  let current = 0;

  const refreshGallery = () => {
    gallery = getGallery();
  };

  const setNavVisibility = () => {
    const show = gallery.length > 1;
    if (prevBtn) prevBtn.style.display = show ? "" : "none";
    if (nextBtn) nextBtn.style.display = show ? "" : "none";
  };

  const showAt = (idx) => {
    if (!gallery.length) return;
    const n = gallery.length;
    current = ((idx % n) + n) % n;

    const src = gallery[current].getAttribute("src");
    const alt = gallery[current].getAttribute("alt") || "תמונה מוגדלת";

    // להפעיל אנימציה גם במעבר
    imgEl.style.animation = "none";
    imgEl.offsetHeight;
    imgEl.style.animation = "";

    imgEl.src = src;
    imgEl.alt = alt;
  };

  const openByIndex = (idx) => {
    refreshGallery();
    setNavVisibility();
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    showAt(idx);
  };

  const close = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    imgEl.src = "";
    document.body.style.overflow = "";
  };

  const next = () => showAt(current + 1);
  const prev = () => showAt(current - 1);

  // קליק על תמונה -> פותח (רק אם לא היה swipe ממש לפני רגע)
  document.addEventListener("click", (e) => {
    if (Date.now() - window.__dkLastSwipeAt < 300) return;

    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const clickedImg = target.closest("#results .ba img");
    if (!clickedImg) return;

    refreshGallery();
    const idx = gallery.findIndex((x) => x === clickedImg);
    openByIndex(Math.max(0, idx));
  });

  // סגירה
  closeBtn?.addEventListener("click", close);

  // לחיצה על הרקע סוגרת
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });

  // ניווט
  prevBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    prev();
  });

  nextBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    next();
  });

  // מקלדת
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;

    if (e.key === "Escape") close();
    // RTL feel: שמאלה -> הבא, ימינה -> הקודם
    if (e.key === "ArrowLeft") next();
    if (e.key === "ArrowRight") prev();
  });
})();
