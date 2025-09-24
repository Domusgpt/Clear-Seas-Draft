(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealElements = document.querySelectorAll('[data-reveal]');

  const showElement = (element) => {
    element.classList.add('is-visible');
  };

  if (revealElements.length) {
    revealElements.forEach((element) => {
      const delay = element.dataset.revealDelay;
      if (delay) {
        element.style.setProperty('--reveal-delay', delay);
      }
    });

    if (prefersReducedMotion.matches || typeof IntersectionObserver === 'undefined') {
      revealElements.forEach(showElement);
    } else {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            showElement(entry.target);
            obs.unobserve(entry.target);
          });
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -10% 0px',
        }
      );

      revealElements.forEach((element) => observer.observe(element));
    }
  }

  if (prefersReducedMotion.addEventListener) {
    prefersReducedMotion.addEventListener('change', (event) => {
      if (event.matches) {
        revealElements.forEach(showElement);
      }
    });
  }

  const header = document.querySelector('.site-header');
  const updateHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-condensed', window.scrollY > 24);
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  const yearElement = document.getElementById('footer-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }
})();
