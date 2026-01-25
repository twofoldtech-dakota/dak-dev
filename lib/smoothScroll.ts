/**
 * Smooth scroll to anchor links
 * Respects prefers-reduced-motion
 */
export function smoothScrollTo(targetId: string) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  target.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });
}

/**
 * Initialize smooth scroll for all anchor links on the page
 * Call this in a useEffect on route changes
 */
export function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        smoothScrollTo(targetId);
        // Update URL without triggering navigation
        window.history.pushState(null, '', href);
      }
    });
  });
}
