# Portfolio | Akshayaa Kashyap

The source of my portfolio site: an AI engineer's work, written up as case studies.

Live site: [akshayaa-403.github.io/portfolio](https://akshayaa-403.github.io/portfolio/)

---

## About me

I'm an AI engineer. For a year and a half, across three roles, I've built LLM agents, AI voice agents and the data pipelines that feed them, mostly in Python on AWS. I choose models by measuring them, and I'm looking for AI engineering roles that put LLM systems into production.

- **Education:** B.Tech, Robotics & Automation, Symbiosis Institute of Technology
- **Certifications:** HarvardX STAT110x Introduction to Probability; IBM SkillsBuild AI Literacy
- **Résumé:** [public/assets/resume.pdf](public/assets/resume.pdf)

## Skills

- **Languages:** Python, SQL, TypeScript, JavaScript
- **AI / LLM:** LLM agents, RAG, prompt engineering, LLM benchmarking, Hugging Face Transformers, Bland AI, Retell AI, OCR (PaddleOCR, Mistral)
- **ML & data:** PyTorch, scikit-learn, OpenCV, Pandas, NumPy, Matplotlib, Plotly, Streamlit, Power BI
- **Cloud & DevOps:** AWS (Lambda, SQS, DynamoDB, Cognito, Lex, Bedrock), Google Cloud, Docker, Git, Vercel
- **Web:** Next.js, React, React Native, Vite, Tailwind, Supabase, REST APIs, OAuth 2.0
- **Automation:** Google Maps Places API, Selenium, BeautifulSoup, email deliverability (SPF, DKIM, DMARC)

---

## What's on the site

- **Home:** a desk drawn around the name. The lamp switches the theme, and the plant has one leaf per project, each wilting as its repo goes stale. Then Projects, About (with the skills as a charm bracelet), Contact, and "Outside work": two photo galleries and a bookshelf with every book at its real size.
- **Case studies:** one long article per project, each with interactive figures, margin notes and a "What I'd do differently" section. Every number in them is footnoted to the repo it came from.
- **Colour:** one of Sanzo Wada's 1933 three-colour combinations, picked by date, so the accent changes daily. Every colour is checked for WCAG AA contrast when the page loads.
- **Time of day:** the theme follows the visitor's clock (morning, afternoon, evening, night), and the header lets you pick one.

## How it's built

Static and buildless: plain HTML, CSS and JavaScript, with no framework, no package.json and no build step. GitHub Pages serves the files as they are.

| Path | What it is |
|---|---|
| `index.html`, `project.html`, `hobby.html`, `404.html` | The four pages |
| `js/project-data.js`, `js/hobby-data.js`, `js/readings-data.js` | The content, as plain data |
| `js/articles/<id>.js`, `css/articles/<id>.css` | One case study each, rendered by `js/article.js` |
| `work/`, `hobbies/`, `sitemap.xml` | Generated share pages, one per project and gallery, so link previews carry the right title and image |
| `tools/` | Scripts run by hand, with their output committed |

### Tools

```bash
node tools/check.js               # the test suite: links, assets, nav, data, articles
node tools/build-share-pages.js   # run after editing project or hobby data
python tools/build-og-images.py   # the 1200x630 JPEG share cards
python tools/build-image-variants.py  # the 600px gallery images
```

## Run it locally

```bash
git clone https://github.com/akshayaa-403/portfolio.git
cd portfolio
python -m http.server 8000
```

Then open `http://localhost:8000`.

---

## Get in touch

- Email: [akshayaakashyap5@gmail.com](mailto:akshayaakashyap5@gmail.com)
- GitHub: [github.com/akshayaa-403](https://github.com/akshayaa-403)
- LinkedIn: [linkedin.com/in/akshayaa-kashyap](https://linkedin.com/in/akshayaa-kashyap)

## License

[MIT](LICENSE)
