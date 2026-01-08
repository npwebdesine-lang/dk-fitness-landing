// script.js

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

    // ✅ Progress Bar UI
    dotsWrap.innerHTML = `
      <div class="carousel__progressTrack" tabindex="0" role="button" aria-label="פס התקדמות (לחיצה לקפיצה לסלייד)">
        <div class="carousel__progressFill" aria-hidden="true"></div>
        <div class="carousel__progressThumb" aria-hidden="true"></div>
      </div>
    `;
    const progressTrack = dotsWrap.querySelector(".carousel__progressTrack");

    const update = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      const ratio = max === 0 ? 0 : index / max; // 0..1
      carousel.style.setProperty("--progress", String(clamp01(ratio)));
    };

    // ✅ LOOP
    const goTo = (i) => {
      const n = slides.length;
      index = ((i % n) + n) % n;
      update();
    };

    btnPrev?.addEventListener("click", () => goTo(index - 1));
    btnNext?.addEventListener("click", () => goTo(index + 1));

    // ✅ Click on progress bar -> jump to nearest slide
    progressTrack?.addEventListener("click", (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = clamp01(x / rect.width);
      const target = max === 0 ? 0 : Math.round(ratio * max);
      goTo(target);
    });

    // ✅ Keyboard on progress bar
    progressTrack?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(index + 1); // RTL feel
      if (e.key === "ArrowRight") goTo(index - 1);
      if (e.key === "Home") goTo(0);
      if (e.key === "End") goTo(slides.length - 1);
    });

    // ✅ Keyboard on carousel container
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(index + 1); // RTL feel
      if (e.key === "ArrowRight") goTo(index - 1);
    });

    // =========================
    // ✅ SWIPE (Mobile)
    // =========================
    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    const SWIPE_THRESHOLD = 40; // px
    const SWIPE_MAX_TIME = 800; // ms
    let startTime = 0;

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

        // אם זה יותר אופקי מאנכי — ננעל על swipe ומונעים גלילה צדדית
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
          isSwiping = true;
          e.preventDefault(); // חשוב כדי שלא "יזרוק" את הדף לצדדים
        }
      },
      { passive: false }
    );

    viewport.addEventListener(
      "touchend",
      () => {
        const dt = Date.now() - startTime;
        if (!isSwiping || dt > SWIPE_MAX_TIME) return;

        // אין לנו touch כאן, אז נשמור את הדלתא מה-move האחרון?
        // פתרון: נחשב שוב לפי startX מול touchend? אין נתון.
        // לכן נשתמש ב-ChangedTouches כשהוא קיים
      },
      { passive: true }
    );

    // TouchEnd עם changedTouches כדי לדעת לאן זה נגמר
    viewport.addEventListener(
      "touchend",
      (e) => {
        if (!isSwiping) return;
        const ct = e.changedTouches && e.changedTouches[0];
        if (!ct) return;

        const endX = ct.clientX;
        const endY = ct.clientY;
        const dx = endX - startX;
        const dy = endY - startY;

        if (Math.abs(dx) < Math.abs(dy)) return; // בעצם גלילה אנכית
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;

        // Swipe שמאלה -> הבא | Swipe ימינה -> הקודם
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
