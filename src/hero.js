/**
 * Hero Section Component
 */
export function createHeroSection() {
  const hero = document.createElement('section');
  hero.className = 'hero-section';
  hero.id = 'hero';
  
  const taglines = [
    'I build gentle productivity tools',
    'machine learning pipelines',
    'and playful UI experiments'
  ];
  
  hero.innerHTML = `
    <div class="hero-inner">
      <div class="hero-content">
        <h1 class="hero-title">Akshayaa Kashyap</h1>
        <div class="hero-tagline-container">
          <p class="hero-tagline" id="hero-tagline">${taglines[0]}</p>
        </div>
        <p class="hero-subtitle">A collection of projects & ideas</p>
        
        <a href="#codex" class="hero-cta">
          Jump to Codex
          <span class="cta-arrow">↓</span>
        </a>
      </div>
      
      <!-- Animated blob background -->
      <div class="hero-blob"></div>
    </div>
  `;
  
  // Setup tagline rotation
  setupTaglineRotation(taglines);
  
  return hero;
}

/**
 * Rotate taglines every 4 seconds
 */
function setupTaglineRotation(taglines) {
  let currentIndex = 0;
  const taglineEl = document.getElementById('hero-tagline');
  
  if (!taglineEl) return;
  
  setInterval(() => {
    currentIndex = (currentIndex + 1) % taglines.length;
    
    // Fade out, change text, fade in
    taglineEl.style.opacity = '0';
    taglineEl.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      taglineEl.textContent = taglines[currentIndex];
      taglineEl.style.opacity = '1';
      taglineEl.style.transform = 'translateY(0)';
    }, 200);
  }, 4000);
}

/**
 * Footer Section Component
 */
export function createFooterSection() {
  const footer = document.createElement('footer');
  footer.className = 'footer-section';
  
  footer.innerHTML = `
    <div class="footer-content">
      <div class="footer-bio">
        <h3 class="footer-title">About ⌘</h3>
        <p class="footer-text">
          Full-stack developer exploring the intersection of productivity, design, and machine learning. 
          Passionate about building tools that feel good to use and solve real problems.
        </p>
      </div>
      
      <div class="footer-socials">
        <h3 class="footer-title">Connect</h3>
        <div class="social-links">
          <a href="https://github.com/akshayaa-403" target="_blank" rel="noopener noreferrer" class="social-link" title="GitHub">
            <span class="social-icon">⚙️</span>
            GitHub
          </a>
          <a href="https://linkedin.com/in/akshayaa-kashyap" target="_blank" rel="noopener noreferrer" class="social-link" title="LinkedIn">
            <span class="social-icon">💼</span>
            LinkedIn
          </a>
          <a href="mailto:akshayaa.kashyap@example.com" class="social-link" title="Email">
            <span class="social-icon">✉️</span>
            Email
          </a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p class="footer-credit">
        Crafted with attention to detail. 
        <span class="credit-emoji">✨</span>
      </p>
    </div>
  `;
  
  return footer;
}
