// hover-play.js
// Reproduce videos con clase .hover-play al pasar el mouse (mouseenter) y los pausa en mouseleave.
// En móviles, permite tocar para alternar reproducción.

(function () {
  'use strict';

  function initHoverPlay(root = document) {
    const videos = root.querySelectorAll('video.hover-play');
    if (!videos.length) return;

    videos.forEach(video => {
      // ensure autoplay attribute is removed
      try { video.removeAttribute('autoplay'); } catch (e) {}

      // keep videos muted by default to avoid intrusive audio
      video.muted = true;

      // pause initially
      video.pause();

      // desktop: play on hover (attach to wrapper so poster img hover works)
      const wrapper = video.closest('.bg-video-wrapper') || video.parentElement;
      if (wrapper) {
        wrapper.addEventListener('mouseenter', () => {
          video.play().catch(() => {});
        });
        wrapper.addEventListener('mouseleave', () => {
          video.pause();
          video.currentTime = 0; // reset to start; remove if you want to keep position
        });
      }

      // mobile / touch: tap to toggle play/pause
      let touchTimeout = null;
      video.addEventListener('click', () => {
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });

      // toggle .playing on wrapper to allow CSS to show/hide video
      const setPlayingClass = (isPlaying) => {
        if (!wrapper) return;
        if (isPlaying) wrapper.classList.add('playing');
        else wrapper.classList.remove('playing');
      };

      video.addEventListener('play', () => setPlayingClass(true));
      video.addEventListener('playing', () => setPlayingClass(true));
      video.addEventListener('pause', () => setPlayingClass(false));
      video.addEventListener('ended', () => setPlayingClass(false));

      // accessibility: keyboard support when focused
      video.setAttribute('tabindex', '0');
      video.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (video.paused) video.play().catch(() => {});
          else video.pause();
        }
      });
    });
  }

  // init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initHoverPlay());
  } else {
    initHoverPlay();
  }

  // expose init function for dynamically added content
  window.__hoverPlayInit = initHoverPlay;
})();
