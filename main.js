/* Navbar: mobile menu toggle (tablet widths) */
(function () {
  var navbar = document.querySelector(".navbar");
  var toggle = document.querySelector(".navbar__toggle");
  if (!navbar || !toggle) return;

  function setOpen(open) {
    navbar.classList.toggle("navbar--open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  toggle.addEventListener("click", function () {
    setOpen(!navbar.classList.contains("navbar--open"));
  });

  document.querySelectorAll(".navbar__nav a").forEach(function (link) {
    link.addEventListener("click", function () { setOpen(false); });
  });
})();

/* Menu filter: All / Pizza / Pasta */
(function () {
  var filters = document.querySelectorAll(".menu__filter");
  var cards = document.querySelectorAll(".menu-card");

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var category = btn.getAttribute("data-filter");

      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });

      cards.forEach(function (card) {
        card.hidden = category !== "all" && card.getAttribute("data-category") !== category;
      });
    });
  });
})();

// Tab bar: highlight the section in view, tap the active Home tab to jump to the top
(function () {
  var items = document.querySelectorAll(".tabbar__item");
  if (!items.length) return;
  var ids = ["home", "menu", "our-story", "gallery", "contact"];
  var ticking = false;
  function setActive(id) {
    items.forEach(function (item) {
      var on = item.getAttribute("data-target") === id;
      item.classList.toggle("is-active", on);
      if (on) item.setAttribute("aria-current", "page"); else item.removeAttribute("aria-current");
    });
  }
  function update() {
    ticking = false;
    var line = window.innerHeight * 0.4, current = ids[0];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) current = id;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6) current = "contact";
    setActive(current);
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  items.forEach(function (item) {
    item.addEventListener("click", function (e) {
      var id = item.getAttribute("data-target");
      if (navigator.vibrate) navigator.vibrate(8);
      if (id === "home" && item.classList.contains("is-active")) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setActive(id);
    });
  });
  update();
})();

/* PWA: service worker + "Install App" button */
(function () {
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

  var btn = document.getElementById("install-btn");
  var hint = document.getElementById("install-hint");
  var deferred = null;
  var toast = document.getElementById("install-toast");
  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    clearTimeout(showToast.t);
    showToast.t = setTimeout(function () { toast.hidden = true; }, 9000);
  }
  if (toast) toast.addEventListener("click", function () { toast.hidden = true; });
  var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (!btn || standalone) return;

  // Android / Chrome: native install prompt
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferred = e;
    btn.hidden = false;
  });
  btn.addEventListener("click", function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.then(function (r) { deferred = null; btn.hidden = true; if (r && r.outcome === "accepted") showToast(); });
  });
  window.addEventListener("appinstalled", function () { btn.hidden = true; if (hint) hint.hidden = true; showToast(); });

  // iOS Safari has no install prompt: show the manual steps instead
  var ua = navigator.userAgent;
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) {
    btn.hidden = false;
    btn.addEventListener("click", function () { if (hint) hint.hidden = false; });
  }
})();

// Loader: wait for the logo animation to finish, hold a moment, then reveal the site
(function () {
  var loader = document.getElementById("loader");
  var logo = loader.querySelector(".final-logo");
  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    loader.classList.add("is-done");
    document.documentElement.classList.remove("is-loading");
    loader.addEventListener("animationend", function () { loader.remove(); });
    setTimeout(function () { if (loader.parentNode) loader.remove(); }, 1500);
  }
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  logo.addEventListener("animationend", function () { setTimeout(finish, 700); });
  setTimeout(finish, reduced ? 800 : 3000); // safety net
})();
