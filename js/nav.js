/**
 * Fábio Junior Decor - Header Navigation (shared by all pages)
 * Handles the mobile drawer: backdrop, scroll lock, ESC, focus and a11y state.
 */

(function () {
  'use strict';

  const DESKTOP_BREAKPOINT = 1320; // matches the media query in styles.css

  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (!toggleBtn || !navMenu) return;

    // Backdrop is injected here so every page gets it without markup duplication
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);

    if (!navMenu.id) navMenu.id = 'nav-menu';
    toggleBtn.setAttribute('aria-controls', navMenu.id);
    toggleBtn.setAttribute('aria-expanded', 'false');

    const isOpen = () => navMenu.classList.contains('active-mobile');

    function openMenu() {
      navMenu.classList.add('active-mobile');
      backdrop.classList.add('active');
      toggleBtn.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Fechar Menu');
      document.body.style.overflow = 'hidden';

      const firstLink = navMenu.querySelector('a');
      if (firstLink) firstLink.focus({ preventScroll: true });
    }

    function closeMenu(returnFocus) {
      navMenu.classList.remove('active-mobile');
      backdrop.classList.remove('active');
      toggleBtn.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Abrir Menu');
      document.body.style.overflow = '';

      if (returnFocus) toggleBtn.focus({ preventScroll: true });
    }

    toggleBtn.addEventListener('click', () => {
      if (isOpen()) closeMenu(false);
      else openMenu();
    });

    backdrop.addEventListener('click', () => closeMenu(false));

    // Any navigation closes the drawer (anchors on the same page included)
    navMenu.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) closeMenu(true);
    });

    // Going back to desktop must never leave the page scroll-locked
    let resizeTimer;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (window.innerWidth > DESKTOP_BREAKPOINT && isOpen()) closeMenu(false);
      }, 120);
    });
  });
})();
