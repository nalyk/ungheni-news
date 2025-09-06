/**
 * Main JavaScript Controller
 * Handles lazy loading of non-critical functionality
 */

class PerformanceManager {
  constructor() {
    this.observers = new Map();
    this.loadedModules = new Set();
    this.init();
  }

  init() {
    // Initialize critical features immediately
    this.setupImageOptimizations();
    this.setupLazyLoading();
    
    // Wait for DOM to be fully loaded before setting up non-critical features
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupNonCriticalFeatures());
    } else {
      this.setupNonCriticalFeatures();
    }
  }

  setupImageOptimizations() {
    // Intersection Observer for lazy loading images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Load the actual image
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            
            // Load srcset if available
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset');
            }
            
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observe all lazy images
      document.querySelectorAll('img[data-src], img.lazy').forEach(img => {
        imageObserver.observe(img);
      });

      this.observers.set('images', imageObserver);
    }
  }

  setupLazyLoading() {
    // Lazy load search functionality when search input gets focus
    const searchTriggers = document.querySelectorAll('#search-input, [data-search-trigger]');
    
    if (searchTriggers.length > 0) {
      const loadSearch = () => {
        if (!this.loadedModules.has('search')) {
          this.loadSearchModule();
          this.loadedModules.add('search');
        }
      };

      searchTriggers.forEach(trigger => {
        trigger.addEventListener('focus', loadSearch, { once: true });
        trigger.addEventListener('click', loadSearch, { once: true });
      });
    }
  }

  async loadSearchModule() {
    try {
      const { default: SearchManager } = await import('./search-lazy.js');
      const searchManager = new SearchManager();
      await searchManager.init();
      
      // Store reference for potential cleanup
      window.searchManager = searchManager;
    } catch (error) {
      console.error('Failed to load search module:', error);
    }
  }

  setupNonCriticalFeatures() {
    // Smooth scroll for anchor links
    this.setupSmoothScrolling();
    
    // Prefetch visible links on hover
    this.setupLinkPrefetching();
    
    // Performance metrics reporting (if needed)
    this.setupPerformanceMetrics();
  }

  setupSmoothScrolling() {
    // Modern smooth scrolling for anchor links
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        event.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL without triggering scroll
        if (history.pushState) {
          history.pushState(null, null, `#${targetId}`);
        }
      }
    });
  }

  setupLinkPrefetching() {
    if (!('requestIdleCallback' in window)) return;

    // Prefetch links on hover with idle callback
    document.addEventListener('mouseover', (event) => {
      const link = event.target.closest('a[href^="/"], a[href^="./"]');
      if (!link || link.dataset.prefetched) return;
      
      requestIdleCallback(() => {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = link.href;
        document.head.appendChild(prefetchLink);
        
        link.dataset.prefetched = 'true';
      }, { timeout: 2000 });
    });
  }

  setupPerformanceMetrics() {
    // Report Core Web Vitals if needed
    if ('PerformanceObserver' in window) {
      try {
        // LCP (Largest Contentful Paint)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.debug('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS (Cumulative Layout Shift)
        new PerformanceObserver((entryList) => {
          let clsValue = 0;
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          if (clsValue > 0) {
            console.debug('CLS:', clsValue);
          }
        }).observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        // Performance Observer not supported or failed
        console.debug('Performance Observer not available');
      }
    }
  }

  // Cleanup method for SPA-like behavior
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.loadedModules.clear();
  }
}

// Initialize when script loads
new PerformanceManager();