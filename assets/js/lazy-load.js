/* ========================================
   SAGAR BAGS - Enhanced Lazy Loading
   Blur-up effect for better perceived performance
   ======================================== */

const LazyLoad = {
  // Configuration
  config: {
    rootMargin: '50px 0px',
    threshold: 0.1
  },

  // Initialize lazy loading
  init() {
    // Check for IntersectionObserver support
    if ('IntersectionObserver' in window) {
      this.setupObserver();
    } else {
      // Fallback: load all images immediately
      this.loadAllImages();
    }

    // Observe DOM changes for dynamically added images
    this.setupMutationObserver();
  },

  // Setup IntersectionObserver
  setupObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, this.config);

    // Observe all images with data-lazy-src
    this.observeImages();
  },

  // Observe existing lazy images
  observeImages() {
    document.querySelectorAll('img[data-lazy-src]:not(.lazy-loaded)').forEach(img => {
      this.observer.observe(img);
    });
  },

  // Setup MutationObserver for dynamic content
  setupMutationObserver() {
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // Check if node is an image
            if (node.matches && node.matches('img[data-lazy-src]')) {
              if (this.observer) {
                this.observer.observe(node);
              } else {
                this.loadImage(node);
              }
            }
            // Check children
            const lazyImages = node.querySelectorAll && node.querySelectorAll('img[data-lazy-src]');
            if (lazyImages) {
              lazyImages.forEach(img => {
                if (this.observer) {
                  this.observer.observe(img);
                } else {
                  this.loadImage(img);
                }
              });
            }
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  },

  // Load a single image
  loadImage(img) {
    const src = img.dataset.lazySrc;
    if (!src) return;

    // Create a new image to preload
    const tempImg = new Image();

    tempImg.onload = () => {
      img.src = src;
      img.classList.add('lazy-loaded');
      img.removeAttribute('data-lazy-src');
    };

    tempImg.onerror = () => {
      // Use placeholder on error
      img.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
      img.classList.add('lazy-loaded', 'lazy-error');
    };

    tempImg.src = src;
  },

  // Fallback: load all images
  loadAllImages() {
    document.querySelectorAll('img[data-lazy-src]').forEach(img => {
      this.loadImage(img);
    });
  }
};

// Video Lazy Loading
const VideoLazyLoad = {
  config: {
    rootMargin: '100px 0px',
    threshold: 0.1
  },

  init() {
    if ('IntersectionObserver' in window) {
      this.setupObserver();
    } else {
      this.loadAllVideos();
    }
  },

  setupObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadVideo(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, this.config);

    // Observe videos with data-lazy-src
    document.querySelectorAll('video[data-lazy-src], video source[data-lazy-src]').forEach(el => {
      const video = el.tagName === 'SOURCE' ? el.parentElement : el;
      this.observer.observe(video);
    });
  },

  loadVideo(video) {
    // Handle video elements
    if (video.dataset.lazySrc) {
      video.src = video.dataset.lazySrc;
      video.removeAttribute('data-lazy-src');
    }

    // Handle source elements inside video
    const sources = video.querySelectorAll('source[data-lazy-src]');
    sources.forEach(source => {
      source.src = source.dataset.lazySrc;
      source.removeAttribute('data-lazy-src');
    });

    // Load the video
    if (sources.length > 0 || video.dataset.lazySrc) {
      video.load();
    }

    video.classList.add('lazy-loaded');
  },

  loadAllVideos() {
    document.querySelectorAll('video[data-lazy-src], video source[data-lazy-src]').forEach(el => {
      const video = el.tagName === 'SOURCE' ? el.parentElement : el;
      this.loadVideo(video);
    });
  }
};

// Add native lazy loading attribute to images that don't have it
function addNativeLazyLoading() {
  document.querySelectorAll('img:not([loading])').forEach(img => {
    // Don't add to above-the-fold images
    const rect = img.getBoundingClientRect();
    if (rect.top > window.innerHeight) {
      img.setAttribute('loading', 'lazy');
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  LazyLoad.init();
  VideoLazyLoad.init();
  addNativeLazyLoading();
});

// Export
window.LazyLoad = LazyLoad;
window.VideoLazyLoad = VideoLazyLoad;
