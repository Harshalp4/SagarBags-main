/**
 * Shared Animations Module
 * Consolidates duplicate animation code used across pages
 */

// Counter Animation - Used in hero stats, about page, gallery page
function animateCounters(selector = '[data-target]') {
  const counters = document.querySelectorAll(selector);

  if (!counters.length) return;

  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };

  const animateCounter = (counter) => {
    const target = parseInt(counter.getAttribute('data-target'));
    const suffix = counter.getAttribute('data-suffix') || '';
    const duration = 2000;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * target);

      counter.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target + suffix;
      }
    };

    requestAnimationFrame(updateCounter);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counters.forEach(counter => observer.observe(counter));
}

// Fade In Animation on Scroll
function animateFadeInOnScroll(selector = '.fade-in-element') {
  const elements = document.querySelectorAll(selector);

  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// Stagger Animation for Grid Items
function animateStaggerGrid(containerSelector, itemSelector, delay = 100) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const items = container.querySelectorAll(itemSelector);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('animate-in');
          }, index * delay);
        });
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  observer.observe(container);
}

// Check for reduced motion preference
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Initialize all animations (call on DOMContentLoaded)
function initSharedAnimations() {
  // Skip animations if user prefers reduced motion
  if (prefersReducedMotion()) {
    // Just show final values for counters
    document.querySelectorAll('[data-target]').forEach(counter => {
      const target = counter.getAttribute('data-target');
      const suffix = counter.getAttribute('data-suffix') || '';
      counter.textContent = target + suffix;
    });
    return;
  }

  // Initialize counter animations
  animateCounters('.hero-stat-number[data-target]');
  animateCounters('.stat-number[data-target]');
  animateCounters('.counter-number[data-target]');

  // Initialize fade-in animations
  animateFadeInOnScroll('.fade-in-element');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSharedAnimations);
} else {
  initSharedAnimations();
}

// Export functions for use in other scripts
window.SagarAnimations = {
  animateCounters,
  animateFadeInOnScroll,
  animateStaggerGrid,
  prefersReducedMotion,
  initSharedAnimations
};
