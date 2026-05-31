/* =============================================
   nav.js — Navigation + Dark Mode Toggle
   ============================================= */
(function () {

  // ── Dark Mode Toggle ──
  const html = document.documentElement;
  const toggle = document.getElementById('theme-toggle');

  // Persist preference (FOUC prevented via inline script in <head>)
  function setTheme(dark) {
    if (dark) {
      html.classList.add('dark-mode');
      localStorage.setItem('imperion-theme', 'dark');
    } else {
      html.classList.remove('dark-mode');
      localStorage.setItem('imperion-theme', 'light');
    }
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      // Smooth transition class
      html.classList.add('theme-transitioning');
      setTheme(!html.classList.contains('dark-mode'));
      setTimeout(() => html.classList.remove('theme-transitioning'), 350);
    });
  }

  // ── Hamburger Toggle ──
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // ── Nav Scroll Elevation ──
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Active Nav Link ──
  const path = window.location.pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href')
      .replace(/\.html$/, '').replace(/\/$/, '') || '/';
    if (href === path || (href === '' && path === '/') || (href === '/' && path === '')) {
      link.classList.add('active');
    }
  });

})();
