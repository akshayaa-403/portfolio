/**
 * Theme Management & Accessibility Utilities
 */

export function setupThemeToggle() {
  // Create theme toggle button
  const header = document.createElement('header');
  header.className = 'page-header';
  header.innerHTML = `
    <nav class="header-nav">
      <div class="logo">
        <a href="#" class="logo-link">Codex</a>
      </div>
      <button id="theme-toggle" class="theme-toggle" title="Toggle dark/light theme" aria-label="Toggle dark/light theme">
        <span class="theme-icon">🌙</span>
      </button>
    </nav>
  `;
  
  // Insert at the beginning of app
  const app = document.getElementById('app');
  app.insertBefore(header, app.firstChild);
  
  // Setup toggle functionality
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  // Check for saved preference or system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  // Apply theme
  applyTheme(currentTheme, html);
  updateToggleIcon(toggle, currentTheme);
  
  // Listen for toggle click
  toggle.addEventListener('click', () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme, html);
    updateToggleIcon(toggle, newTheme);
    localStorage.setItem('theme', newTheme);
  });
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      applyTheme(newTheme, html);
      updateToggleIcon(toggle, newTheme);
    }
  });
}

function applyTheme(theme, html) {
  if (theme === 'light') {
    html.style.colorScheme = 'light';
  } else {
    html.style.colorScheme = 'dark';
  }
}

function updateToggleIcon(button, theme) {
  button.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
  button.title = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
}

/**
 * Setup keyboard navigation for scroll anchor
 */
export function setupKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    // Skip if Ctrl+K or Cmd+K is pressed (common for search)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      return;
    }
  });
}

/**
 * Ensure all links open in new tab have proper attributes
 */
export function enhanceAccessibility() {
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    // Ensure proper aria-label exists
    if (!link.getAttribute('aria-label') && !link.title) {
      link.setAttribute('aria-label', `${link.textContent} (opens in new tab)`);
    }
  });
  
  // Ensure all images have alt text
  document.querySelectorAll('img:not([alt])').forEach(img => {
    img.setAttribute('alt', 'Decorative image');
  });
  
  // Ensure all form controls are properly labeled
  document.querySelectorAll('button, [role="button"]').forEach(btn => {
    if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
      btn.setAttribute('aria-label', 'Button');
    }
  });
}

/**
 * Setup smooth scroll behavior
 */
export function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * Performance: Lazy load images if needed
 */
export function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Setup performance monitoring (optional)
 */
export function setupPerformanceMonitoring() {
  if ('PerformanceObserver' in window) {
    try {
      // Observe long tasks (tasks taking > 50ms)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('⚠️ Long task detected:', entry.name, entry.duration.toFixed(2) + 'ms');
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // longtask not supported in all browsers
    }
  }
}
