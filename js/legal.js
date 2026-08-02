/**
 * Fábio Junior Decor - Páginas legais
 * Destaca no índice lateral a seção que está sendo lida.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const toc = document.querySelector('.legal-toc');
    const sections = [...document.querySelectorAll('.legal-prose section[id]')];

    if (!toc || !sections.length) return;

    const links = new Map();
    toc.querySelectorAll('a[href^="#"]').forEach((a) => {
      links.set(a.getAttribute('href').slice(1), a);
    });

    let current = null;

    function setActive(id) {
      if (id === current) return;
      if (current && links.has(current)) links.get(current).classList.remove('is-active');
      if (links.has(id)) links.get(id).classList.add('is-active');
      current = id;
    }

    // A seção ativa é a última cujo topo já passou da linha de leitura
    const observer = new IntersectionObserver(
      () => {
        const line = window.innerHeight * 0.28;
        let active = sections[0].id;
        for (const s of sections) {
          if (s.getBoundingClientRect().top <= line) active = s.id;
        }
        setActive(active);
      },
      { rootMargin: '-25% 0px -70% 0px', threshold: [0, 1] }
    );

    sections.forEach((s) => observer.observe(s));
  });
})();
