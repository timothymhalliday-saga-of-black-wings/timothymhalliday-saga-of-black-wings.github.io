(() => {
  'use strict';

  const marks = [
    ...document.querySelectorAll('[data-symbol]')
  ];
  const entries = [
    ...document.querySelectorAll('.readings details')
  ];

  function highlight(id) {
    marks.forEach(mark => {
      if (mark.dataset.symbol === id) {
        mark.setAttribute('aria-current', 'true');
      } else {
        mark.removeAttribute('aria-current');
      }
    });
  }

  function reveal(id, focus = false) {
    const entry = entries.find(item => item.id === id);
    if (!entry) return;

    entry.open = true;
    highlight(id);

    if (focus) {
      entry.querySelector('summary').focus({
        preventScroll: true
      });
    }
  }

  marks.forEach(mark => {
    mark.addEventListener('click', () => {
      reveal(mark.dataset.symbol, true);
    });
  });

  entries.forEach(entry => {
    entry.addEventListener('toggle', () => {
      if (entry.open) highlight(entry.id);
    });
  });

  window.addEventListener('hashchange', () => {
    reveal(location.hash.slice(1));
  });

  reveal(location.hash.slice(1) || 'ravens');

  const art = document.querySelector('.medallion');

  const allowLight = window.matchMedia(
    '(hover: hover) and (pointer: fine) and ' +
    '(prefers-reduced-motion: no-preference)'
  ).matches;

  if (art && allowLight) {
    art.addEventListener('pointermove', event => {
      const box = art.getBoundingClientRect();

      art.style.setProperty(
        '--light-x',
        `${100 * (event.clientX - box.left) / box.width}%`
      );

      art.style.setProperty(
        '--light-y',
        `${100 * (event.clientY - box.top) / box.height}%`
      );
    });

    art.addEventListener('pointerleave', () => {
      art.style.removeProperty('--light-x');
      art.style.removeProperty('--light-y');
    });
  }
})();
