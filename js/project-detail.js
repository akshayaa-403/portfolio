// Load project from query param
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');

const detailContainer = document.querySelector('.project-detail');

if (!projectId || !projectDetails[projectId]) {
  detailContainer.innerHTML = `
    <h1>Project Not Found</h1>
    <p>Sorry, we couldn't find that project. <a href="index.html">Go back</a>.</p>
  `;
} else {
  const proj = projectDetails[projectId];
  detailContainer.innerHTML = `
    <h1>${proj.title}</h1>
    <p class="subtitle">${proj.subtitle}</p>

    <section>
      <h2>Motivation / Why I Built This</h2>
      <p>${proj.motivation}</p>
    </section>

    <section>
      <h2>Key Features</h2>
      <ul>
        ${proj.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </section>

    <section>
      <h2>Tech Stack & Architecture</h2>
      <p><strong>Tech stack:</strong> ${proj.techStack}</p>
      <div class="arch-diagram">[Architecture Diagram Placeholder]<br>${proj.architecture}</div>
    </section>

    <section>
      <h2>Implementation Walkthrough</h2>
      ${proj.codeWalkthrough.map(cw => `<p>${cw}</p>`).join('')}
    </section>

    <section>
      <h2>How to Use</h2>
      <p>${proj.howToUse}</p>
    </section>

    <section>
      <h2>Results / Impact</h2>
      <p>${proj.results}</p>
    </section>

    <section>
      <h2>Future Plans</h2>
      <p>${proj.futurePlans}</p>
    </section>

    <a href="index.html" class="back-link">← Back to Portfolio</a>
  `;
}

// Theme toggle (same as main page)
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