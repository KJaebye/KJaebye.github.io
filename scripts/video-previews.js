// Load previews on demand; pause them outside the viewport or in a hidden tab.
(() => {
  const touch = window.matchMedia('(hover: none)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const previews = [];

  document.querySelectorAll('.video-card').forEach(card => {
    const video = card.querySelector('video');
    const overlay = video?.closest('.two');
    if (!video || !overlay) return;
    let visible = false;
    let hovered = false;
    let focused = false;
    let requested = false;

    const stop = () => {
      video.pause();
      overlay.classList.remove('is-playing');
    };
    const update = () => {
      requested = visible && !document.hidden && !reducedMotion.matches &&
        (touch.matches || hovered || focused);
      if (!requested) return stop();
      video.querySelectorAll('source[data-src]').forEach(source => {
        source.src = source.dataset.src;
        source.removeAttribute('data-src');
        video.load();
      });
      video.play().catch(stop);
    };
    video.addEventListener('playing', () => {
      if (requested) overlay.classList.add('is-playing');
      else stop();
    });
    video.addEventListener('error', stop);
    card.addEventListener('mouseenter', () => { hovered = true; update(); });
    card.addEventListener('mouseleave', () => { hovered = false; update(); });
    card.addEventListener('focusin', () => { focused = true; update(); });
    card.addEventListener('focusout', event => {
      focused = card.contains(event.relatedTarget);
      update();
    });
    previews.push(update);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        update();
      });
      observer.observe(video.closest('.one'));
    } else {
      visible = true;
    }
  });
  const updateAll = () => previews.forEach(update => update());
  document.addEventListener('visibilitychange', updateAll);
  touch.addEventListener('change', updateAll);
  reducedMotion.addEventListener('change', updateAll);
})();
