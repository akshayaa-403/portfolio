// ===== Hardcoded Projects (the 8 specified repos) =====
const projects = [
  {
    id: 'artezas',
    name: 'Arteza',
    description: 'A digital canvas for collaborative sketching and art sharing.',
    language: 'JavaScript',
    repoUrl: 'https://github.com/akshayaa-403/arteza'
  },
  {
    id: 'anttodo',
    name: 'AntTodo',
    description: 'Minimalist to‑do list that uses natural language input and smart prioritisation.',
    language: 'TypeScript',
    repoUrl: 'https://github.com/akshayaa-403/anttodo'
  },
  {
    id: 'habita',
    name: 'Habita',
    description: 'Habit tracker with streak visualisation and daily reflections.',
    language: 'JavaScript',
    repoUrl: 'https://github.com/akshayaa-403/Habita'
  },
  {
    id: 'yosemite-image-translation-gan',
    name: 'Yosemite GAN',
    description: 'Translates satellite images to map tiles using a CycleGAN trained on Yosemite National Park data.',
    language: 'Python',
    repoUrl: 'https://github.com/akshayaa-403/yosemite-image-translation-gan'
  },
  {
    id: 'quantamental-screener',
    name: 'Quantamental Screener',
    description: 'Stock screener blending fundamental metrics with quantitative technical indicators.',
    language: 'Python',
    repoUrl: 'https://github.com/akshayaa-403/quantamental-screener'
  },
  {
    id: 'smart_pricing_retention',
    name: 'Smart Pricing & Retention',
    description: 'Customer churn prediction and dynamic pricing engine for subscription businesses.',
    language: 'Python',
    repoUrl: 'https://github.com/akshayaa-403/smart_pricing_retention'
  },
  {
    id: 'Wikipedia-Summarizer',
    name: 'Wikipedia Summarizer',
    description: 'Extractive & abstractive summarisation of Wikipedia articles using BART and TF‑IDF.',
    language: 'Python',
    repoUrl: 'https://github.com/akshayaa-403/Wikipedia-Summarizer'
  },
  {
    id: 'Twitter-Sentiment-Analyzer',
    name: 'Twitter Sentiment Analyzer',
    description: 'Real‑time sentiment dashboard for Twitter trends and keyword tracking.',
    language: 'Python',
    repoUrl: 'https://github.com/akshayaa-403/Twitter-Sentiment-Analyzer'
  }
];

function renderProjects() {
  const container = document.getElementById('projects-container');
  if (projects.length === 0) {
    container.innerHTML = '<p>No projects to show right now.</p>';
    return;
  }

  container.innerHTML = projects.map(project => `
    <div class="project-card">
      <div class="repo-name">${project.name}</div>
      <div class="repo-desc">${project.description}</div>
      <div class="repo-links">
        <a href="${project.repoUrl}" target="_blank" rel="noopener" class="repo-link">View Repository →</a>
        <a href="project.html?id=${project.id}" class="read-more">Read More →</a>
      </div>
    </div>
  `).join('');
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
          <a href="${a.medium}" target="_blank" rel="noopener" title="Medium">
            <!-- Medium SVG icon -->
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
            </svg>
          </a>
          <a href="${a.substack}" target="_blank" rel="noopener" title="Substack">
            <!-- Substack SVG icon -->
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== Theme Toggle =====
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
  body.classList.add('light-mode');
  themeToggle.innerHTML = '☀️';
} else {
  themeToggle.innerHTML = '🌙';
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  const isLight = body.classList.contains('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  themeToggle.innerHTML = isLight ? '☀️' : '🌙';
});

// ===== Init =====
renderProjects();
renderBlogCards();