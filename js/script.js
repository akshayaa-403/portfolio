// ---------- Fetch GitHub repositories ----------
    const username = 'akshayaa-403';
    const projectsContainer = document.getElementById('projects-container');

    // Map programming languages to colors
    const languageColors = {
      JavaScript: '#f7df1e',
      TypeScript: '#3178c6',
      Python: '#306998',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Java: '#b07219',
      'C++': '#f34b7d',
      Rust: '#dea584',
      Go: '#00ADD8',
    };

    function createProjectCard(repo) {
      const lang = repo.language || 'N/A';
      const langColor = languageColors[lang] || '#a5b4fc';
      const updated = new Date(repo.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });

      return `
        <div class="project-card">
          <div class="project-language">
            <span class="language-dot" style="background: ${langColor};"></span>
            ${lang}
          </div>
          <h3>${repo.name}</h3>
          <p>${repo.description || 'No description provided.'}</p>
          <div class="project-footer">
            <span>⭐ ${repo.stargazers_count}</span>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub ↗</a>
          </div>
        </div>
      `;
    }

    async function fetchRepos() {
      try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        if (!response.ok) throw new Error('Failed to fetch');
        const repos = await response.json();
        // Filter out the portfolio repo itself and forks
        const filtered = repos.filter(repo => repo.name !== 'portfolio' && !repo.fork);

        if (filtered.length === 0) {
          projectsContainer.innerHTML = '<p class="loading-text">No public projects yet. Check back soon!</p>';
          return;
        }

        projectsContainer.innerHTML = filtered.map(createProjectCard).join('');
      } catch (error) {
        console.error(error);
        projectsContainer.innerHTML = `<p class="loading-text">Couldn't load projects right now. Try refreshing.</p>`;
      }
    }

    // ---------- Writing cards (placeholders) ----------
    const writingCardsContainer = document.getElementById('writing-cards');
    const blogData = [
      {
        img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop',
        title: 'The Art of Digital Alchemy',
        tagline: 'Turning ideas into interactive experiences',
        medium: 'https://medium.com/@akshayaa-403',
        substack: 'https://substack.com/@akshayaa',
      },
      {
        img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop',
        title: 'Lessons from Open Source',
        tagline: 'What 100 pull requests taught me about collaboration',
        medium: 'https://medium.com/@akshayaa-403',
        substack: 'https://substack.com/@akshayaa',
      },
      {
        img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop',
        title: 'Designing for the Quiet Moments',
        tagline: 'Why white space is the loudest element',
        medium: 'https://medium.com/@akshayaa-403',
        substack: 'https://substack.com/@akshayaa',
      },
    ];

    function createBlogCard(blog) {
      return `
        <div class="blog-card">
          <img src="${blog.img}" alt="${blog.title}" loading="lazy" />
          <div class="blog-card-body">
            <h3>${blog.title}</h3>
            <p class="tagline">${blog.tagline}</p>
            <div class="social-icons">
              <a href="${blog.medium}" target="_blank" rel="noopener noreferrer" title="Read on Medium">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
              </a>
              <a href="${blog.substack}" target="_blank" rel="noopener noreferrer" title="Read on Substack">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>
              </a>
            </div>
          </div>
        </div>
      `;
    }

    writingCardsContainer.innerHTML = blogData.map(createBlogCard).join('');

    // Initialize GitHub repos
    fetchRepos();