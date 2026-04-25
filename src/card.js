import { getRelativeDate, getLanguageColor } from './categorizer.js'

/**
 * Repository Card Component
 * Creates an HTML element for displaying a single repository
 */
export function createRepoCard(repo) {
  const card = document.createElement('article');
  card.className = 'repo-card';
  
  // Extract data
  const title = repo.name;
  const description = repo.description || 'No description available';
  const language = repo.language || 'Unknown';
  const stars = repo.stargazers_count || 0;
  const lastUpdated = getRelativeDate(repo.updated_at);
  const repoUrl = repo.html_url;
  const demoUrl = repo.homepage;
  const langColor = getLanguageColor(language);
  
  // Build HTML
  card.innerHTML = `
    <div class="card-inner">
      <!-- Visual Preview (placeholder) -->
      <div class="card-preview" style="background: linear-gradient(135deg, ${langColor}22, ${langColor}11);">
        <div class="card-preview-text">${repo.name.charAt(0).toUpperCase()}</div>
      </div>
      
      <!-- Content -->
      <div class="card-content">
        <h3 class="card-title">${escapeHtml(title)}</h3>
        <p class="card-description">${escapeHtml(description)}</p>
        
        <!-- Metadata -->
        <div class="card-meta">
          <span class="card-language" style="border-color: ${langColor}; color: ${langColor};">
            <span class="language-dot" style="background-color: ${langColor};"></span>
            ${escapeHtml(language)}
          </span>
          <span class="card-date">${lastUpdated}</span>
        </div>
        
        <!-- Footer with Links -->
        <div class="card-footer">
          <span class="card-stars">
            <span class="star-icon">⭐</span>
            ${stars}
          </span>
          
          <div class="card-links">
            ${demoUrl ? `
              <a href="${demoUrl}" target="_blank" rel="noopener noreferrer" class="card-link card-link-demo" title="View live demo">
                🔗 Demo
              </a>
            ` : ''}
            <a href="${repoUrl}" target="_blank" rel="noopener noreferrer" class="card-link card-link-github" title="View on GitHub">
              ⚙️ Code
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add animation class (will be triggered by Intersection Observer)
  card.dataset.animated = 'false';
  
  return card;
}

/**
 * Create a section with multiple repo cards
 */
export function createRepoSection(title, emoji, repos) {
  const section = document.createElement('section');
  section.className = 'repo-section';
  
  // Section header
  const header = document.createElement('div');
  header.className = 'section-header';
  header.innerHTML = `
    <h2 class="section-title">${emoji} ${escapeHtml(title)}</h2>
    <p class="section-count">${repos.length} ${repos.length === 1 ? 'project' : 'projects'}</p>
  `;
  section.appendChild(header);
  
  // Grid container
  const grid = document.createElement('div');
  grid.className = 'grid-cards';
  
  // Add cards
  repos.forEach((repo, index) => {
    const card = createRepoCard(repo);
    card.style.setProperty('--card-index', index);
    grid.appendChild(card);
  });
  
  section.appendChild(grid);
  return section;
}

/**
 * Safely escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Setup Intersection Observer for card animations
 */
export function setupCardAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.dataset.animated === 'false') {
        entry.target.dataset.animated = 'true';
        entry.target.classList.add('card-revealed');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  // Observe all cards
  document.querySelectorAll('.repo-card').forEach(card => {
    observer.observe(card);
  });
}
