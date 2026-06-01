/* =========================================================================
   TERMS a.s. — интерактив прототипа
   ========================================================================= */
(function () {
  "use strict";

  /* --------------------------------------------------------------------- */
  /* 1. Аккордеон «Naše odvetví» (single-open)                              */
  /* --------------------------------------------------------------------- */
  const accItems = Array.from(document.querySelectorAll(".acc"));
  const odvImg = document.getElementById("odvetviImg");

  // смена изображения отрасли: входящее проявляется диагональной градиентной маской
  let swapTimer = null;
  function setOdvetviImage(acc) {
    if (!odvImg) return;
    const src = acc.getAttribute("data-img");
    if (!src) return;
    odvImg.style.setProperty("--next-img", "url('" + src + "')");  // входящее изображение в ::after
    odvImg.classList.remove("is-swapping");
    void odvImg.offsetWidth;                                       // рестарт транзишна маски
    odvImg.classList.add("is-swapping");
    if (swapTimer) clearTimeout(swapTimer);
    swapTimer = setTimeout(function () {
      odvImg.style.backgroundImage = "url('" + src + "')";         // фиксируем новое как базовое
      odvImg.classList.remove("is-swapping");                       // прячем слои ::before/::after
    }, 950);
  }

  accItems.forEach((acc) => {
    const head = acc.querySelector(".acc__head");
    head.addEventListener("click", () => {
      if (acc.classList.contains("is-open")) return;   // всегда одна открыта
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
  /* 2. Карусель «Naše realizace»                                           */
  /* --------------------------------------------------------------------- */
  const track = document.getElementById("projectsTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (track && prevBtn && nextBtn) {
    const projects = Array.from(track.children);
    let index = 0;

    // межкарточный отступ берём из CSS (он fluid: clamp 16→24)
    function gap() {
      return parseFloat(getComputedStyle(track).columnGap) || 0;
    }
    function step() {
      // ширина одного проекта + текущий отступ
      return projects[0].getBoundingClientRect().width + gap();
    }
    function maxIndex() {
      // не уезжаем за последний проект (учитываем «выглядывающий» след. слайд)
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
  /* 3. Бесшовная бегущая строка логотипов (дублируем набор)                */
  /* --------------------------------------------------------------------- */
  const logoTrack = document.getElementById("logoTrack");
  if (logoTrack) {
    logoTrack.innerHTML += logoTrack.innerHTML;
  }

  /* --------------------------------------------------------------------- */
  /* 4. Форма «Napište nám» (валидация + состояние «отправлено»)            */
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

      if (!ok) return;            // невалидно — поля подсвечены красным

      // здесь позже подключим реальную отправку (fetch на endpoint)
      form.reset();
    });

    // убираем подсветку ошибки при вводе
    form.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("input", () => {
        const group = el.closest(".field");
        if (group) group.classList.remove("has-error");
      });
    });
  }

  /* --------------------------------------------------------------------- */
  /* 5. Хедер: прячется при скролле вниз, появляется при скролле вверх       */
  /* --------------------------------------------------------------------- */
  const header = document.querySelector(".header");
  if (header) {
    const TOP_ZONE = 120;   // у самого верха хедер в исходном виде поверх hero
    const DELTA = 6;        // порог, чтобы не дёргаться от микродвижений
    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
      ticking = false;
      if (document.body.classList.contains("nav-open")) return;   // меню открыто — хедер не трогаем
      const y = window.scrollY;

      if (y <= TOP_ZONE) {                 // у самого верха — парящий хедер над hero
        header.classList.remove("is-pinned", "is-hidden");
        lastY = y;
        return;
      }
      if (Math.abs(y - lastY) < DELTA) return;

      if (y > lastY) {                     // вниз — плавно уезжает наверх
        header.classList.add("is-hidden");
      } else {                             // вверх — закрепляем у края и показываем
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
  /* 6. Мобильное меню (гамбургер → полноэкранный оверлей)                  */
  /* --------------------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (navToggle && mobileMenu) {
    const setMenu = (open) => {
      mobileMenu.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("nav-open", open);
      if (open && header) header.classList.remove("is-hidden");   // пока меню открыто — хедер виден
    };

    navToggle.addEventListener("click", () => {
      setMenu(!mobileMenu.classList.contains("is-open"));
    });
    // клик по пункту — закрываем (плавный скролл к якорю отрабатывает сам)
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setMenu(false));
    });
    // Esc закрывает
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) setMenu(false);
    });
    // ушли на десктоп с открытым меню — закрываем, чтобы не зависло
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && mobileMenu.classList.contains("is-open")) setMenu(false);
    });
  }

  /* --------------------------------------------------------------------- */
  /* 7. Плавное появление секций при скролле                                */
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
