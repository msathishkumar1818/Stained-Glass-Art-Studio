/* ==============================================================
   STAINED GLASS ART STUDIO — Shared JavaScript
   assets/js/main.js
   ============================================================== */

/* ── Immediate Theme & Direction Init (prevents FOUC) ─────── */
(function () {
  try {
    var s = localStorage.getItem('sg-theme');
    var p = window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches;
    if (s === 'dark' || (s === null && p)) document.documentElement.classList.add('dark');
    document.documentElement.dir = localStorage.getItem('sg-dir') || 'ltr';
  } catch (e) {}

  window.tailwind = window.tailwind || {};
  window.tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          'sg-gold':     '#C49A2A',
          'sg-gold-l':   '#E4B44A',
          'sg-sapphire': '#1A4472',
          'sg-ruby':     '#8B1520',
          'sg-emerald':  '#1A5C3A',
          'sg-amber':    '#D4952A',
          'sg-violet':   '#5A2A7A',
        },
        fontFamily: {
          display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
          ui:      ['Inter', 'system-ui', 'sans-serif'],
        }
      }
    }
  };
})();

(function () {
  'use strict';

  /* ── Utilities ─────────────────────────────────────────────── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on  = (el, ev, fn, opts)    => el && el.addEventListener(ev, fn, opts);

  /* ── Site Loader ───────────────────────────────────────────── */
  function initLoader() {
    const loader = qs('#site-loader');
    if (!loader) return;

    const dismiss = () => {
      loader.classList.add('loader-hide');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    };

    if (document.readyState === 'complete') {
      setTimeout(dismiss, 500);
    } else {
      on(window, 'load', () => setTimeout(dismiss, 500));
    }
  }

  /* ── Dark Mode ─────────────────────────────────────────────── */
  function initDarkMode() {
    const html   = document.documentElement;
    const isDark = html.classList.contains('dark');
    let dark = isDark;

    qsa('[data-theme-toggle]').forEach(btn => {
      syncThemeBtn(btn, dark);
      on(btn, 'click', () => {
        dark = !dark;
        html.classList.toggle('dark', dark);
        localStorage.setItem('sg-theme', dark ? 'dark' : 'light');
        qsa('[data-theme-toggle]').forEach(b => syncThemeBtn(b, dark));
      });
    });
  }

  function syncThemeBtn(btn, dark) {
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('aria-pressed', String(dark));
  }

  /* ── RTL / LTR ─────────────────────────────────────────────── */
  function initRTL() {
    const html = document.documentElement;
    const dir = html.dir || 'ltr';

    qsa('[data-rtl-toggle]').forEach(btn => {
      syncRTLBtn(btn, dir);
      on(btn, 'click', () => {
        const next = html.dir === 'rtl' ? 'ltr' : 'rtl';
        html.dir = next;
        localStorage.setItem('sg-dir', next);
        qsa('[data-rtl-toggle]').forEach(b => syncRTLBtn(b, next));
      });
    });
  }

  function syncRTLBtn(btn, dir) {
    btn.setAttribute('aria-label', dir === 'ltr' ? 'Switch to RTL layout' : 'Switch to LTR layout');
  }

  /* ── Mobile Menu ───────────────────────────────────────────── */
  function initMobileMenu() {
    const menu     = qs('#mobile-menu');
    if (!menu) return;
    const backdrop = qs('.mobile-backdrop', menu);

    const openBtns  = qsa('[data-mobile-open]');
    const closeBtns = qsa('[data-mobile-close]');

    const openMenu = () => {
      menu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      openBtns.forEach(b => {
        b.setAttribute('aria-expanded', 'true');
        b.classList.add('is-active');
      });
    };

    const closeMenu = () => {
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
      openBtns.forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.classList.remove('is-active');
      });
    };

    openBtns.forEach(btn => on(btn, 'click', () => {
      if (menu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    }));
    closeBtns.forEach(btn => on(btn,      'click', closeMenu));
    if (backdrop) on(backdrop, 'click', closeMenu);

    // Close on any link clicked inside mobile menu (Home 1, Home 2, Products, etc.)
    on(menu, 'click', e => {
      const link = e.target.closest('a');
      if (link) {
        closeMenu();
      }
    });

    on(document, 'keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });

    // Close mobile menu if resized to desktop screens (> 1024px)
    on(window, 'resize', () => {
      if (window.innerWidth > 1024 && menu.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  /* ── Home Dropdown — CLICK ONLY ────────────────────────────── */
  function initHomeDropdown() {
    const dropdown = qs('#home-dropdown');
    if (!dropdown) return;

    const trigger = qs('[data-dropdown-trigger]', dropdown);
    const panel   = qs('.nav-dropdown-menu', dropdown);
    if (!trigger || !panel) return;

    const open  = () => { dropdown.classList.add('open');    trigger.setAttribute('aria-expanded', 'true'); };
    const close = () => { dropdown.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); };
    const toggle = () => dropdown.classList.contains('open') ? close() : open();

    on(trigger, 'click', e => { e.stopPropagation(); toggle(); });

    // Click outside
    on(document, 'click', e => { if (!dropdown.contains(e.target)) close(); });

    // Items close dropdown
    qsa('.dropdown-item', panel).forEach(item => on(item, 'click', close));

    // Escape
    on(document, 'keydown', e => {
      if (e.key === 'Escape' && dropdown.classList.contains('open')) {
        close();
        trigger.focus();
      }
    });
  }

  /* ── Mobile Accordion ──────────────────────────────────────── */
  function initMobileAccordion() {
    qsa('[data-accordion]').forEach(trigger => {
      const panel = trigger.nextElementSibling;
      if (!panel || !panel.classList.contains('mobile-accordion-panel')) return;

      on(trigger, 'click', () => {
        const isOpen = trigger.classList.contains('is-open');

        // Close all open accordions
        qsa('[data-accordion].is-open').forEach(t => {
          t.classList.remove('is-open');
          if (t.nextElementSibling) t.nextElementSibling.classList.remove('is-open');
          t.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          trigger.classList.add('is-open');
          panel.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ── Active Navigation ─────────────────────────────────────── */
  function initActiveNav() {
    const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

    const map = {
      'index.html':       'home',
      'home-2.html':      'home',
      'products.html':    'products',
      'commissions.html': 'commissions',
      'classes.html':     'classes',
      'about.html':       'about',
      'contact.html':     'contact',
    };

    const active = map[page] || 'home';
    qsa(`[data-page="${active}"]`).forEach(el => el.classList.add('active'));
  }

  /* ── Header Scroll ─────────────────────────────────────────── */
  function initHeaderScroll() {
    const header = qs('#site-header');
    if (!header) return;
    const update = () => header.classList.toggle('scrolled', window.scrollY > 24);
    on(window, 'scroll', update, { passive: true });
    update();
  }

  /* ── Scroll to Top ─────────────────────────────────────────── */
  function initScrollTop() {
    const btn = qs('#scroll-top');
    if (!btn) return;
    const update = () => btn.classList.toggle('is-visible', window.scrollY > 400);
    on(window, 'scroll', update, { passive: true });
    on(btn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    update();
  }

  /* ── Section Reveal ────────────────────────────────────────── */
  function initReveal() {
    const items = qsa('[data-reveal], [data-reveal-group]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    );

    items.forEach(el => observer.observe(el));
  }

  /* ── Footer Year ───────────────────────────────────────────── */
  function initFooterYear() {
    const el = qs('#footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ── Hero Parallax & Loaded State ──────────────────────────── */
  function initHeroParallax() {
    const heroEl = qs('.hero');
    if (heroEl) heroEl.classList.add('loaded');

    const heroBg = qs('#hero-bg');
    if (heroBg) {
      window.addEventListener('scroll', () => {
        const offset = window.scrollY;
        if (offset < window.innerHeight) {
          heroBg.style.transform = `scale(1) translateY(${offset * 0.25}px)`;
        }
      }, { passive: true });
    }
  }

  /* ── Product Catalog Filtering ─────────────────────────────── */
  function initProductFilters() {
    const filterBtns = qsa('.prod-filter-btn');
    const cards = qsa('.prod-card');
    const countText = qs('.prod-count-text');
    if (!filterBtns.length || !cards.length) return;

    filterBtns.forEach(btn => {
      on(btn, 'click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter') || 'all';
        let visibleCount = 0;

        cards.forEach(card => {
          const cat = card.getAttribute('data-category') || '';
          if (filter === 'all' || cat === filter) {
            card.classList.remove('hidden');
            visibleCount++;
          } else {
            card.classList.add('hidden');
          }
        });

        if (countText) {
          countText.textContent = `Showing ${visibleCount} handcrafted piece${visibleCount === 1 ? '' : 's'}`;
        }
      });
    });
  }

  /* ── Commission Price Estimator ────────────────────────────── */
  function initCommissionEstimator() {
    const slider = qs('#calc-sqft');
    const sqftVal = qs('#calc-sqft-val');
    const glassSelect = qs('#calc-glass');
    const compSelect = qs('#calc-complexity');
    const resultBox = qs('#calc-result-val');
    const timeBox = qs('#calc-result-time');
    if (!slider || !resultBox) return;

    function calculate() {
      const sqft = parseFloat(slider.value) || 6;
      if (sqftVal) sqftVal.textContent = `${sqft} sq ft`;

      const glassRate = parseFloat(glassSelect ? glassSelect.value : '1.0') || 1.0;
      const compRate = parseFloat(compSelect ? compSelect.value : '1.0') || 1.0;

      const basePerSqFt = 120;
      const totalBase = sqft * basePerSqFt * glassRate * compRate;
      const low = Math.round(totalBase * 0.9);
      const high = Math.round(totalBase * 1.2);

      resultBox.textContent = `₹${low.toLocaleString()} – ₹${high.toLocaleString()}`;

      if (timeBox) {
        if (sqft <= 5) timeBox.textContent = 'Estimated completion: 3–4 weeks';
        else if (sqft <= 12) timeBox.textContent = 'Estimated completion: 5–7 weeks';
        else timeBox.textContent = 'Estimated completion: 8–12 weeks';
      }
    }

    on(slider, 'input', calculate);
    if (glassSelect) on(glassSelect, 'change', calculate);
    if (compSelect) on(compSelect, 'change', calculate);
    calculate();
  }

  /* ── Classes FAQ Accordion ─────────────────────────────────── */
  function initClassFAQ() {
    const items = qsa('.class-faq-item');
    items.forEach(item => {
      const header = qs('.class-faq-header', item);
      if (!header) return;
      on(header, 'click', () => {
        const isOpen = item.classList.contains('active');
        items.forEach(i => {
          i.classList.remove('active');
          const h = qs('.class-faq-header', i);
          if (h) h.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('active');
          header.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ── Interactive Forms (Commission & Contact) ──────────────── */
  function initInteractiveForms() {
    qsa('form[data-ajax-form]').forEach(form => {
      on(form, 'submit', e => {
        e.preventDefault();
        const submitBtn = qs('button[type="submit"]', form);
        const originalText = submitBtn ? submitBtn.textContent : 'Submit';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending...';
        }

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.textContent = '✓ Received — We Will Contact You Soon';
          }
          form.reset();
          setTimeout(() => {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalText;
            }
          }, 3500);
        }, 800);
      });
    });
  }

  /* ── Init All ──────────────────────────────────────────────── */
  function init() {
    initLoader();
    initDarkMode();
    initRTL();
    initMobileMenu();
    initHomeDropdown();
    initMobileAccordion();
    initActiveNav();
    initHeaderScroll();
    initScrollTop();
    initReveal();
    initFooterYear();
    initHeroParallax();
    initProductFilters();
    initCommissionEstimator();
    initClassFAQ();
    initInteractiveForms();
  }

  if (document.readyState === 'loading') {
    on(document, 'DOMContentLoaded', init);
  } else {
    init();
  }

})();
