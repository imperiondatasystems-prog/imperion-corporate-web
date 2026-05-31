/* =============================================
   animations.js — Scroll Reveal & Counters
   Minimal: reveal + counter only
   ============================================= */
(function () {

  function initReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
    );
    els.forEach(el => obs.observe(el));
  }

  function initCounters() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target   = parseFloat(el.dataset.count);
        const suffix   = el.dataset.suffix   || '';
        const prefix   = el.dataset.prefix   || '';
        const decimals = parseInt(el.dataset.decimals || '0');
        const duration = 1600;
        const start    = performance.now();
        const update   = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + (target * ease).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
        obs.unobserve(el);
      }),
      { threshold: 0.5 }
    );
    els.forEach(el => obs.observe(el));
  }

  function init() { initReveal(); initCounters(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
