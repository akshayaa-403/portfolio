import './style.css'
import { fetchUserRepos } from './github.js'
import { categorizeRepos } from './categorizer.js'
import { createRepoSection, setupCardAnimations } from './card.js'
import { createHeroSection, createFooterSection } from './hero.js'
import { setupThemeToggle, setupSmoothScroll, enhanceAccessibility } from './utils.js'

// Initialize the app
async function initApp() {
  try {
    console.log('🚀 Initializing Codex...');
    
    const app = document.getElementById('app');
    
    // Setup theme toggle
    setupThemeToggle();
    
    // Add hero section
    app.appendChild(createHeroSection());
    
    // Create main content wrapper
    const mainContent = document.createElement('main');
    mainContent.id = 'codex';
    
    // Fetch repos from GitHub
    const repos = await fetchUserRepos();
    
    // Categorize repos
    const { cooking, shipped, backlog } = categorizeRepos(repos);
    
    // Log results
    console.log('Categories:');
    console.log(`  Currently cooking ☺︎: ${cooking.length} repos`);
    console.log(`  Recently Shipped ▶: ${shipped.length} repos`);
    console.log(`  The Backlog ⁕: ${backlog.length} repos`);
    
    // Create container
    const container = document.createElement('div');
    container.className = 'container';
    container.style.paddingTop = 'var(--spacing-xl)';
    container.style.paddingBottom = 'var(--spacing-xl)';
    
    // Add sections
    if (cooking.length > 0) {
      container.appendChild(createRepoSection('Currently cooking', '☺︎', cooking));
    }
    
    if (shipped.length > 0) {
      container.appendChild(createRepoSection('Recently Shipped', '▶', shipped));
    }
    
    if (backlog.length > 0) {
      container.appendChild(createRepoSection('The Backlog', '⁕', backlog));
    }
    
    mainContent.appendChild(container);
    app.appendChild(mainContent);
    
    // Add footer
    app.appendChild(createFooterSection());
    
    // Setup scroll animations
    setupCardAnimations();
    
    // Setup accessibility features
    setupSmoothScroll();
    enhanceAccessibility();
    
    console.log('✅ Codex initialized successfully');
    
  } catch (error) {
    console.error('Fatal error:', error);
    const app = document.getElementById('app');
    app.innerHTML = `<div style="padding: 40px; color: #ff6b6b;">
      <h2>Error Loading Portfolio</h2>
      <p>${error.message}</p>
      <p>Check the browser console for more details.</p>
    </div>`;
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
