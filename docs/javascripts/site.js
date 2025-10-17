(function () {
  const onLoad = () => {
    const animated = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    document.querySelectorAll('[data-animate]').forEach((node) => {
      if (animated.has(node)) return;
      animated.add(node);
      node.classList.add('will-animate');
      observer.observe(node);
    });
  };

  if (window.document$) {
    window.document$.subscribe(onLoad);
  }

  document.addEventListener('DOMContentLoaded', onLoad);
})();
