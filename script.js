/*
  =====================================================
  script.js
  פיצ'רים בסיסיים (יעילים לדף נחיתה קצר):
  1) יצירת קישור WhatsApp עם הודעה מובנית + ברכה לפי שעה
  2) Reveal on scroll (אנימציית הופעה)
  3) שנה אוטומטית בפוטר
  4) תפריט מובייל (פתיחה/סגירה)
  =====================================================
*/

// ===============================
// [1] WhatsApp CTA
// ===============================
const DEFAULT_PHONE = "972558813090";

/*
  הודעה מובנית לוואטסאפ:
  - השארתי מקומות למילוי כדי שהליד יקליד מהר
  - אפשר לשנות ניסוח בקלות
*/
const BASE_MESSAGE =
  "היי! אני רוצה להתחיל ליווי אונליין ב-D.K fitness. " +
  "אשמח לשיחת אפיון קצרה ולהבין מה התהליך. " +
  "היעד שלי: _______. " +
  "הניסיון שלי באימונים/תזונה: _______.";

function getGreetingByHour() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "בוקר טוב";
  if (h >= 12 && h < 18) return "צהריים טובים";
  if (h >= 18 && h < 23) return "ערב טוב";
  return "היי";
}

function buildWhatsAppUrl(phone, message) {
  const cleanPhone = String(phone).replace(/[^\d]/g, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

function wireWhatsAppButtons() {
  const buttons = document.querySelectorAll("[data-wa]");
  const greeting = getGreetingByHour();

  buttons.forEach((btn) => {
    const phone = btn.getAttribute("data-phone") || DEFAULT_PHONE;
    const finalMessage = `${greeting}! ${BASE_MESSAGE}`;

    btn.setAttribute("href", buildWhatsAppUrl(phone, finalMessage));
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener noreferrer");

    // לוג בסיסי (בעתיד אפשר לחבר לאנליטיקס)
    btn.addEventListener("click", () => {
      console.log("[WA CLICK]", { phone });
    });
  });
}

// ===============================
// [2] Reveal on scroll
// ===============================
function revealOnScroll() {
  const items = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("revealed"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => io.observe(el));
}

// ===============================
// [3] Footer year
// ===============================
function setFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

// ===============================
// [4] Mobile nav toggle
// ===============================
function wireMobileNav() {
  const toggle = document.querySelector(".navToggle");
  const nav = document.querySelector("[data-nav]");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // סגירה בלחיצה על לינק (נוח במובייל)
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // סגירה בלחיצה מחוץ לתפריט
  document.addEventListener("click", (e) => {
    const clickedInside = nav.contains(e.target) || toggle.contains(e.target);
    if (!clickedInside) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  wireWhatsAppButtons();
  revealOnScroll();
  setFooterYear();
  wireMobileNav();
});
