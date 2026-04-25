// GitHub API module with localStorage caching (30-min TTL)
const CACHE_KEY = 'github_repos_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function fetchUserRepos(username = 'akshayaa-403') {
  const cached = getCachedRepos();
  if (cached) {
    console.log('📦 Using cached repos');
    return cached;
  }

  try {
    console.log('🔄 Fetching repos from GitHub API...');
    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();
    
    // Cache the response
    setCachedRepos(repos);
    console.log(`✅ Fetched ${repos.length} repos`);
    
    return repos;
  } catch (error) {
    console.error('❌ Failed to fetch repos:', error);
    // Return empty array if fetch fails
    return [];
  }
}

function getCachedRepos() {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return null;

    const { data, timestamp } = JSON.parse(stored);
    const now = Date.now();

    // Check if cache is still valid
    if (now - timestamp < CACHE_TTL) {
      return data;
    }

    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
}

function setCachedRepos(repos) {
  try {
    const data = {
      data: repos,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Cache write error:', error);
  }
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️  Cache cleared');
}
