/* ZOJO — strona główna: nawigacja, dostępność, animacje */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nagłówek: cień przy przewijaniu ---------- */
  var header = document.querySelector('.header');
  var onScroll = function () {
    header.classList.toggle('is-scrolled', window.scrollY > 4);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Nawigacja mobilna ---------- */
  var navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', function () {
    var open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    document.body.classList.toggle('nav-open', !open);
  });

  /* ---------- Rozwijane podmenu ---------- */
  var subItems = Array.prototype.slice.call(document.querySelectorAll('.nav__item.has-sub'));

  var closeAll = function (except) {
    subItems.forEach(function (item) {
      if (item !== except) {
        item.classList.remove('is-open');
        item.querySelector('.nav__link').setAttribute('aria-expanded', 'false');
      }
    });
  };

  subItems.forEach(function (item) {
    var btn = item.querySelector('.nav__link');

    btn.addEventListener('click', function () {
      var open = item.classList.contains('is-open');
      closeAll(item);
      item.classList.toggle('is-open', !open);
      btn.setAttribute('aria-expanded', String(!open));
    });

    // Desktop: otwieranie po najechaniu
    item.addEventListener('mouseenter', function () {
      if (window.matchMedia('(min-width: 1025px)').matches) {
        closeAll(item);
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    item.addEventListener('mouseleave', function () {
      if (window.matchMedia('(min-width: 1025px)').matches) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav__item.has-sub')) { closeAll(null); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAll(null);
      if (document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    }
  });

  /* ---------- Wyszukiwarka ---------- */
  var searchToggle = document.getElementById('searchToggle');
  var searchBar = document.getElementById('searchBar');
  searchToggle.addEventListener('click', function () {
    var open = searchToggle.getAttribute('aria-expanded') === 'true';
    searchToggle.setAttribute('aria-expanded', String(!open));
    searchBar.hidden = open;
    if (!open) { document.getElementById('searchInput').focus(); }
  });

  /* ---------- Dostępność: kontrast ---------- */
  var contrastToggle = document.getElementById('contrastToggle');
  var applyContrast = function (on) {
    document.body.classList.toggle('contrast', on);
    contrastToggle.setAttribute('aria-pressed', String(on));
  };
  contrastToggle.addEventListener('click', function () {
    var on = !document.body.classList.contains('contrast');
    applyContrast(on);
    try { localStorage.setItem('zojo-contrast', on ? '1' : '0'); } catch (e) {}
  });
  try {
    if (localStorage.getItem('zojo-contrast') === '1') { applyContrast(true); }
  } catch (e) {}

  /* ---------- Dostępność: rozmiar czcionki ---------- */
  var fontBtns = Array.prototype.slice.call(document.querySelectorAll('[data-fontsize]'));
  var applyFontSize = function (size) {
    document.documentElement.classList.remove('fs-112', 'fs-125');
    if (size === '112') { document.documentElement.classList.add('fs-112'); }
    if (size === '125') { document.documentElement.classList.add('fs-125'); }
    fontBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-fontsize') === size));
    });
  };
  fontBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var size = btn.getAttribute('data-fontsize');
      applyFontSize(size);
      try { localStorage.setItem('zojo-fontsize', size); } catch (e) {}
    });
  });
  try {
    var savedSize = localStorage.getItem('zojo-fontsize');
    if (savedSize) { applyFontSize(savedSize); }
  } catch (e) {}

  /* ---------- Animacje wejścia + liczniki ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var donut = document.querySelector('.donut');

  var animateCount = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var formatter = new Intl.NumberFormat('pl-PL');
    if (prefersReducedMotion) { el.textContent = formatter.format(target); return; }
    var duration = 1200;
    var start = null;
    var step = function (ts) {
      if (!start) { start = ts; }
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatter.format(Math.round(target * eased));
      if (progress < 1) { requestAnimationFrame(step); }
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    var counted = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add('is-visible');

        if (entry.target.closest('.stats') && !counted) {
          counted = true;
          Array.prototype.forEach.call(document.querySelectorAll('.stats__num'), animateCount);
        }
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { io.observe(el); });

    if (donut) {
      var ioDonut = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            donut.classList.add('is-filled');
            ioDonut.disconnect();
          }
        });
      }, { threshold: 0.4 });
      ioDonut.observe(donut);
    }
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
    if (donut) { donut.classList.add('is-filled'); }
  }

  /* ---------- Rok w stopce ---------- */
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
