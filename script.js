/* =========================================================================
   TERMS a.s. — interaktivita prototypu
   ========================================================================= */
(function () {
  "use strict";

  /* --------------------------------------------------------------------- */
  /* 1. Akordeon „Naše odvětví" (single-open)                               */
  /* --------------------------------------------------------------------- */
  const accItems = Array.from(document.querySelectorAll(".acc"));
  const odvImg = document.getElementById("odvetviImg");

  // změna obrázku odvětví: příchozí se odhaluje diagonální gradientní maskou
  let swapTimer = null;
  function setOdvetviImage(acc) {
    if (!odvImg) return;
    const src = acc.getAttribute("data-img");
    if (!src) return;
    odvImg.style.setProperty("--next-img", "url('" + src + "')");  // příchozí obrázek v ::after
    odvImg.classList.remove("is-swapping");
    void odvImg.offsetWidth;                                       // restart přechodu masky
    odvImg.classList.add("is-swapping");
    if (swapTimer) clearTimeout(swapTimer);
    swapTimer = setTimeout(function () {
      odvImg.style.backgroundImage = "url('" + src + "')";         // nový obrázek zafixujeme jako základní
      odvImg.classList.remove("is-swapping");                       // skryjeme vrstvy ::before/::after
    }, 950);
  }

  accItems.forEach((acc) => {
    const head = acc.querySelector(".acc__head");
    head.addEventListener("click", () => {
      if (acc.classList.contains("is-open")) return;   // vždy je otevřené jedno
      accItems.forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector(".acc__head").setAttribute("aria-expanded", "false");
      });
      acc.classList.add("is-open");
      head.setAttribute("aria-expanded", "true");
      setOdvetviImage(acc);
    });
  });

  /* --------------------------------------------------------------------- */
  /* 2. Karusel „Naše realizace"                                            */
  /* --------------------------------------------------------------------- */
  const track = document.getElementById("projectsTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (track && prevBtn && nextBtn) {
    const projects = Array.from(track.children);
    let index = 0;

    // mezeru mezi kartami bereme z CSS (je fluid: clamp 16→24)
    function gap() {
      return parseFloat(getComputedStyle(track).columnGap) || 0;
    }
    function step() {
      // šířka jedné karty + aktuální mezera
      return projects[0].getBoundingClientRect().width + gap();
    }
    function maxIndex() {
      // nezajedeme za poslední projekt (počítáme s „vykukující" další kartou)
      const viewport = track.parentElement.getBoundingClientRect().width;
      const total = projects.length * step() - gap();
      const hidden = Math.max(0, total - viewport);
      return Math.ceil(hidden / step());
    }
    function render() {
      const max = maxIndex();
      index = Math.max(0, Math.min(index, max));
      track.style.transform = "translateX(" + -(index * step()) + "px)";
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= max;
    }

    prevBtn.addEventListener("click", () => { index--; render(); });
    nextBtn.addEventListener("click", () => { index++; render(); });
    window.addEventListener("resize", render);
    render();
  }

  /* --------------------------------------------------------------------- */
  /* 3. Nekonečně rolující pás log (duplikujeme sadu)                       */
  /* --------------------------------------------------------------------- */
  const logoTrack = document.getElementById("logoTrack");
  if (logoTrack) {
    logoTrack.innerHTML += logoTrack.innerHTML;
  }

  /* --------------------------------------------------------------------- */
  /* 4. Formulář „Napište nám" (validace polí)                              */
  /* --------------------------------------------------------------------- */
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;

      form.querySelectorAll("[required]").forEach((field) => {
        const group = field.closest(".field");
        const empty = !field.value.trim();
        const badEmail =
          field.type === "email" && field.value &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if (empty || badEmail) {
          ok = false;
          group.classList.add("has-error");
        } else {
          group.classList.remove("has-error");
        }
      });

      if (!ok) return;            // nevalidní — pole jsou podbarvená červeně

      // sem později napojíme reálné odeslání (fetch na endpoint)
      form.reset();
    });

    // při psaní odebíráme zvýraznění chyby
    form.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("input", () => {
        const group = el.closest(".field");
        if (group) group.classList.remove("has-error");
      });
    });
  }

  /* --------------------------------------------------------------------- */
  /* 5. Hlavička: skryje se při scrollu dolů, objeví se při scrollu nahoru  */
  /* --------------------------------------------------------------------- */
  const header = document.querySelector(".header");
  if (header) {
    const TOP_ZONE = 120;   // úplně nahoře hlavička v původní podobě nad hero
    const DELTA = 6;        // práh, aby neposkakovala při mikropohybech
    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
      ticking = false;
      if (document.body.classList.contains("nav-open")) return;   // menu otevřené — hlavičku neměníme
      const y = window.scrollY;

      if (y <= TOP_ZONE) {                 // úplně nahoře — plovoucí hlavička nad hero
        header.classList.remove("is-pinned", "is-hidden");
        lastY = y;
        return;
      }
      if (Math.abs(y - lastY) < DELTA) return;

      if (y > lastY) {                     // dolů — plynule odjíždí nahoru
        header.classList.add("is-hidden");
      } else {                             // nahoru — ukotvíme u okraje a ukážeme
        header.classList.add("is-pinned");
        header.classList.remove("is-hidden");
      }
      lastY = y;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------------------- */
  /* 6. Mobilní menu (hamburger → celoobrazovkový overlay)                  */
  /* --------------------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (navToggle && mobileMenu) {
    const setMenu = (open) => {
      mobileMenu.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("nav-open", open);
      if (open && header) header.classList.remove("is-hidden");   // dokud je menu otevřené, hlavička je vidět
    };

    navToggle.addEventListener("click", () => {
      setMenu(!mobileMenu.classList.contains("is-open"));
    });
    // klik na položku — zavřeme (plynulý scroll na kotvu se postará sám)
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setMenu(false));
    });
    // Esc zavírá
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) setMenu(false);
    });
    // přechod na desktop s otevřeným menu — zavřeme, ať nezůstane viset
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && mobileMenu.classList.contains("is-open")) setMenu(false);
    });
  }

  /* --------------------------------------------------------------------- */
  /* 7. Plynulé objevení sekcí při scrollu                                  */
  /* --------------------------------------------------------------------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in-view"));
  }
})();
