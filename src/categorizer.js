// Repository categorizer utility
export function categorizeRepos(repos) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const cooking = [];
  const shipped = [];
  const backlog = [];

  repos.forEach(repo => {
    // Skip the portfolio repo itself
    if (repo.name === 'portfolio' || repo.name === 'akshayaa-403') {
      return;
    }

    const updatedAt = new Date(repo.updated_at);
    const isArchived = repo.archived;
    const hasPages = repo.has_pages;
    const hasHomepage = !!repo.homepage;
    const starCount = repo.stargazers_count || 0;

    // Priority: recent activity (last 7 days)
    if (updatedAt > sevenDaysAgo && !isArchived) {
      cooking.push(repo);
    }
    // Secondary: has live demo or notable description + not too old
    else if ((hasPages || hasHomepage) && !isArchived && starCount >= 1) {
      shipped.push(repo);
    }
    // Fallback: everything else (archived or inactive)
    else {
      backlog.push(repo);
    }
  });

  // Sort each category
  cooking.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  shipped.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
  backlog.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  return {
    cooking,
    shipped,
    backlog,
  };
}

// Format relative date (e.g., "2 days ago")
export function getRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Get language badge color (simple palette)
export function getLanguageColor(language) {
  const colors = {
    'JavaScript': '#f7df1e',
    'Python': '#3776ab',
    'Jupyter Notebook': '#f37726',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'TypeScript': '#3178c6',
    'Java': '#007396',
    'C++': '#00599c',
    'Swift': '#fa7343',
    'Go': '#00add8',
    'Rust': '#ce422b',
    'Ruby': '#cc342d',
  };

  return colors[language] || '#858585';
}
