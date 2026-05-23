// ===== GitHub Repos =====
async function fetchRepos() {
  const container = document.getElementById('projects-container');
  const username = 'akshayaa-403';

  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
    if (!res.ok) throw new Error('Failed to fetch repos');

    const repos = await res.json();
    const filtered = repos.filter(repo => !repo.fork && repo.name !== 'portfolio');

    if (filtered.length === 0) {
      container.innerHTML = '<p>No projects to show right now.</p>';
      return;
    }

    container.innerHTML = filtered.map(repo => {
      const lang = repo.language || 'Other';
      const langClass = (repo.language || '').toLowerCase();
      const stars = repo.stargazers_count;

      return `
        <div class="project-card">
          <div class="repo-name">${repo.name}</div>
          <div class="repo-desc">${repo.description || 'No description'}</div>
          <div class="repo-meta">
            <span class="lang-dot ${langClass}"></span> ${lang}
            <span>★ ${stars}</span>
          </div>
          <a href="${repo.html_url}" target="_blank" rel="noopener">View on GitHub →</a>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<p>Could not load projects. Please try again later.</p>';
    console.error(err);
  }
}

// ===== Blog Cards =====
function renderBlogCards() {
  const container = document.getElementById('writing-cards');
  const articles = [
    {
      img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
      title: 'Designing with Intent',
      desc: 'Why every pixel must earn its place.',
      medium: 'https://medium.com',
      substack: 'https://substack.com'
    },
    {
      img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
      title: 'The Humble Developer',
      desc: 'Lessons from three years of shipping code.',
      medium: 'https://medium.com',
      substack: 'https://substack.com'
    },
    {
      img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600',
      title: 'Building in Public',
      desc: 'Why I share everything I learn.',
      medium: 'https://medium.com',
      substack: 'https://substack.com'
    }
  ];

  container.innerHTML = articles.map(a => `
    <div class="blog-card">
      <img src="${a.img}" alt="${a.title}">
      <div class="card-body">
        <h4>${a.title}</h4>
        <p>${a.desc}</p>
        <div class="social-links">
          <a href="${a.medium}" target="_blank" rel="noopener" title="Medium">M</a>
          <a href="${a.substack}" target="_blank" rel="noopener" title="Substack">S</a>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== Theme Toggle =====
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Load saved theme (default: dark)
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
  body.classList.add('light-mode');
  themeToggle.innerHTML = '☀️'; // sun for light mode
} else {
  themeToggle.innerHTML = '🌙'; // moon for dark mode
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  const isLight = body.classList.contains('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  themeToggle.innerHTML = isLight ? '☀️' : '🌙';
});

// ===== Init =====
fetchRepos();
renderBlogCards();