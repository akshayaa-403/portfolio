/* The projects, as the rest of the site needs them: the home page's list,
   the graph, the mosaic, the share pages and the case-study header all read
   this file. The case study itself — chapters, widgets, margin notes — is
   js/articles/<id>.js, fetched only by the page that shows it.

   Copy is written from what each repo actually contains.

   Fields:
     id, title, tagline, summary    summary feeds the meta/og description
     context, role, year            the list row's meta line
     group                          'research' | 'products' — which list group
     archived                       true: kept live, but no row, node or tile;
                                    one line under "Also built"
     tech                           header chips; first four are the row's stack
     repo, demo                     repo is the source, or the site when there
                                    is no public repo; demo is the live build
     created, updated               GitHub's created_at / pushed_at, transcribed
                                    (never fetched at run time)
     tags                           [[label, https url]] — the paper or spec
     glance                         { problem, built, result } at the top of
                                    the case study
     nest                           [[name, note]], outermost first: the
                                    matryoshka under "At a glance". Each doll
                                    opens to the one inside; the last is solid
     metric                         the home row's one result: plain words,
                                    then the figure in brackets
     screen                         what the home list's preview pane shows;
                                    .mp4/.webm play, anything else is a still
     thumb                          false: no image, so a text-only share card */
const projects = [
  {
    "id": "quantamental-screener",
    "title": "Quantamental Screener",
    "tagline": "Four-factor stock ranking with news sentiment, and a backtest that tests itself against luck.",
    "summary": "A Python and Streamlit screener that ranks the 50 largest liquid S&P 500 stocks each day on a weighted sum of four cross-sectional z-scores (12-minus-1 momentum, signed volume, volatility and VADER/TextBlob headline sentiment), then backtests the price-only ranking against SPY with a one-day signal lag, 10 bps costs and a 2,000-portfolio random-selection test.",
    "context": "Solo project",
    "role": "Solo project",
    "year": "2026",
    "group": "research",
    "tech": [
      "Python",
      "pandas",
      "NumPy",
      "yfinance",
      "NewsAPI",
      "VADER",
      "TextBlob",
      "Streamlit",
      "Plotly",
      "Redis",
      "Docker",
      "pydantic-settings",
      "pytest",
      "GitHub Actions",
      "Selenium"
    ],
    "repo": "https://github.com/akshayaa-403/quantamental-screener",
    "demo": "https://quantamental-screener.streamlit.app",
    "created": "2025-09-22",
    "updated": "2026-11-13",
    "tags": [
      ["Factor investing", "https://en.wikipedia.org/wiki/Factor_investing"],
      ["Momentum (12-1)", "https://doi.org/10.1111/j.1540-6261.1993.tb04702.x"],
      ["VADER", "https://ojs.aaai.org/index.php/ICWSM/article/view/14550"],
      ["Survivorship bias", "https://en.wikipedia.org/wiki/Survivorship_bias"]
    ],
    "glance": {
      "problem": "I wanted one ranking that weighs price signals and the news together, and a backtest honest enough to tell me when that ranking is luck.",
      "built": "A daily cross-sectional model: four factors z-scored per date, clipped to ±3 and summed with weights; a weekly backtest that trades yesterday's signal and resets to equal weight at each rebalance, at 10 bps; a 2,000-portfolio significance test; a 30% holdout; a Streamlit dashboard; 76 tests.",
      "result": "Re-run on 2026-11-14 at commit 6929fef, Nov 2025 to Nov 2026: +49.4% against SPY's +13.2% and the same 50 stocks' +32.9% at equal weight, but p = 0.07 against 2,000 random portfolios. On the last 30%, held out, it lost: −8.1% against +4.4%. Most of the beat is survivorship in the universe."
    },
    "nest": [
      ["The dashboard", "A Streamlit page that ranks the 50 largest liquid S&P 500 stocks, every day."],
      ["The backtest", "Trades yesterday's ranking once a week at equal weight and 10 bps, against SPY, the whole universe and 2,000 random portfolios."],
      ["The ranking", "A weighted sum of four factors, each z-scored across the 50 stocks on every date."],
      ["The factors", "12-minus-1 momentum, signed volume, volatility, and VADER/TextBlob headline sentiment."],
      ["One z-score", "One stock, one factor, one date, clipped so it never sits more than 3 from the mean."]
    ],
    "metric": "Beat the S&P 500, not luck (+49% vs +13%, p = 0.07)",
    "screen": "public/assets/projects/quant-current.webp"
  },
  {
    "id": "phase-contrast-denoising",
    "title": "Phase-Contrast Clean-Up Pipeline",
    "tagline": "One held-out microscope frame, followed through a classical filter and a residual U-Net.",
    "summary": "A Python pipeline that cleans synthetic, seeded phase-contrast frames. It has an OpenCV front end (background flattening, difference of Gaussians, then CLAHE) and an optional 7.8M-parameter residual U-Net, plus a browser port of the classical half that matches OpenCV bit for bit.",
    "context": "Research tool",
    "role": "Solo project",
    "year": "2026",
    "group": "research",
    "tech": ["Python", "PyTorch", "OpenCV", "Gradio", "JavaScript", "TensorBoard", "scikit-image"],
    "repo": "https://github.com/akshayaa-403/phase-contrast-denoising",
    "demo": "https://akshayaa-403.github.io/phase-contrast-denoising/",
    "created": "2026-07-23",
    "updated": "2026-11-11",
    "tags": [
      ["Phase-contrast microscopy", "https://en.wikipedia.org/wiki/Phase-contrast_microscopy"],
      ["U-Net", "https://arxiv.org/abs/1505.04597"],
      ["DnCNN", "https://arxiv.org/abs/1608.03981"],
      ["Residual learning", "https://arxiv.org/abs/1512.03385"],
      ["CLAHE", "https://en.wikipedia.org/wiki/Adaptive_histogram_equalization"],
      ["Difference of Gaussians", "https://en.wikipedia.org/wiki/Difference_of_Gaussians"],
      ["Otsu's method", "https://en.wikipedia.org/wiki/Otsu%27s_method"]
    ],
    "glance": {
      "problem": "Phase contrast adds a halo, uneven illumination and noise to every frame, and all three push pixels across the global threshold that segmentation starts from.",
      "built": "A seeded generator of synthetic frames (100 for training and validation, 30 more for testing); a classical path (background flattening, difference of Gaussians, then CLAHE); a hybrid path that adds a residual U-Net; and a browser port of the classical half.",
      "result": "On 30 synthetic test frames never used for training or tuning, Otsu Dice goes from 0.08 to 0.94 (PSNR 1.5 → 28.7 dB). On 34 real U373 frames the classical path alone lifts Dice from 0.10 to 0.61; the U-Net barely adds to it. The trained weights are not yet published, so the live demo runs the classical path."
    },
    "nest": [
      ["The app", "A Gradio app, and a browser port of the classical half that matches OpenCV bit for bit."],
      ["The pipeline", "A classical path (background flattening, difference of Gaussians, CLAHE) and a hybrid path that adds a U-Net."],
      ["The model", "A 7.8M-parameter residual U-Net; its weights are not yet published."],
      ["The frame", "One of 30 seeded synthetic test frames, never used for training or tuning."],
      ["One pixel", "One pixel that halo, uneven light and noise push across the threshold segmentation starts from."]
    ],
    "metric": "Cells segment far better on 30 held-out frames (Otsu Dice 0.08 → 0.94)",
    "screen": "public/assets/projects/phase-demo-metrics.webp"
  },
  {
    "id": "arteza",
    "title": "Arteza",
    "tagline": "An online gallery and shop for an original-art studio.",
    "summary": "A React storefront and portfolio for the artist Upasna: 106 original paintings across five collections, online class booking, and a cart that ends in a WhatsApp conversation instead of a card form.",
    "context": "Client work",
    "role": "Design & build",
    "year": "2026",
    "group": "products",
    "tech": [
      "React",
      "Vite",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "TanStack Query",
      "Supabase",
      "Vercel"
    ],
    "repo": "https://arteza.site",
    "tags": [
      ["Conversational commerce", "https://en.wikipedia.org/wiki/Conversational_commerce"],
      ["Supabase", "https://supabase.com/docs"],
      ["shadcn/ui", "https://ui.shadcn.com"],
      ["UPI", "https://en.wikipedia.org/wiki/Unified_Payments_Interface"]
    ],
    "glance": {
      "problem": "A working painter with a catalogue spread across Instagram posts and WhatsApp threads, and no single place a buyer could see the work.",
      "built": "A React and Supabase storefront for 106 originals across five collections, with online class booking, and a cart that records the order and hands the buyer to WhatsApp — where the sales were already happening.",
      "result": "A live site the studio sells from. Commercial figures belong to the client and are not mine to publish."
    },
    "nest": [
      ["The shop", "A live React and Supabase storefront the studio sells from."],
      ["The catalogue", "106 original paintings across five collections."],
      ["The cart", "Records the order, then hands the buyer to WhatsApp, where the sales were already happening."],
      ["The order", "One row in Supabase, priced on the server, which takes nothing the browser says on trust."],
      ["One painting", "An original. There is only one of it, so it can only be sold once."]
    ],
    "metric": "Big images download once, not four times (4 → 1 per load)",
    "screen": "public/assets/projects/arteza-home.webp"
  },
  {
    "id": "habita",
    "title": "Habita",
    "tagline": "Eisenhower matrix that writes to your real calendar.",
    "summary": "An Android task manager built on the Eisenhower Matrix. Sort tasks into four urgency-importance quadrants, then drag them onto a day timeline that writes real events into the phone’s own calendar — so time you set aside shows up wherever you already look, not only inside the app.",
    "context": "Solo project",
    "role": "Solo project",
    "year": "2026",
    "group": "products",
    "tech": [
      "JavaScript (ES6)",
      "CSS Grid",
      "SVG",
      "Capacitor",
      "Java",
      "Android CalendarContract",
      "localStorage"
    ],
    "repo": "https://github.com/akshayaa-403/Habita",
    "demo": "https://akshayaa-403.github.io/Habita/src/",
    "created": "2026-04-19",
    "updated": "2026-11-05",
    "tags": [
      ["Eisenhower Matrix", "https://en.wikipedia.org/wiki/Time_management"],
      ["Capacitor", "https://capacitorjs.com/docs"],
      [
        "Calendar Provider",
        "https://developer.android.com/guide/topics/providers/calendar-provider"
      ]
    ],
    "glance": {
      "problem": "Every task app invents its own idea of priority, and the time you set aside inside one is invisible everywhere you actually look.",
      "built": "An Android task manager on the Eisenhower matrix — four urgency/importance quadrants — with a drag-to-schedule day timeline that writes real events into the phone's own calendar.",
      "result": "Working Android app, no published APK. The browser preview runs the matrix and the day view on GitHub Pages, without calendar sync. What the app demonstrates is the calendar write: time blocked in Habita shows up in the calendar the rest of the phone already reads."
    },
    "nest": [
      ["The app", "An Android task manager built on the Eisenhower matrix."],
      ["The matrix", "Four quadrants of urgency and importance."],
      ["The day", "A timeline you drag tasks onto."],
      ["The block", "One stretch of time, written into the phone's own calendar as a real event."],
      ["One calendar row", "A single entry in Android's CalendarContract, which every other app on the phone can already read."]
    ],
    "screen": [
      "public/assets/projects/habita-phone-matrix.webp",
      "public/assets/projects/habita-phone-tilt.webp"
    ],
    "metric": "18/18 UI checks pass"
  },
  {
    "id": "outbound-pipeline",
    "title": "Outbound Sales Pipeline",
    "tagline": "From a Google Maps search to a salesperson’s phone: find the business, find a number, let an AI agent make the call.",
    "summary": "The outbound pipeline I built at Sygnius Digital in 2025 for a web-design studio selling to vacation-rental agencies around Miami: Google Places search for any query, a website scrape for the contacts listings leave out, Bland AI and Retell AI voice agents that hang up on voicemail and phone menus and transfer interested owners to sales, and a domain check for the email follow-up.",
    "context": "Sygnius Digital",
    "role": "AI Specialist, Sygnius Digital",
    "year": "2025",
    "group": "products",
    "archived": true,
    "tech": [
      "Python",
      "Bland AI",
      "Retell AI",
      "Google Places API",
      "BeautifulSoup",
      "Selenium",
      "requests",
      "dnspython",
      "Hugging Face Transformers",
      "FLAN-T5",
      "DistilGPT2"
    ],
    "repo": "https://github.com/akshayaa-403/outbound-pipeline",
    "created": "2026-11-03",
    "updated": "2026-11-03",
    "tags": [
      ["Places API Text Search", "https://developers.google.com/maps/documentation/places/web-service/text-search"],
      ["Bland AI", "https://docs.bland.ai"],
      ["Retell AI", "https://docs.retellai.com"],
      ["E.164", "https://en.wikipedia.org/wiki/E.164"],
      ["SPF", "https://datatracker.ietf.org/doc/html/rfc7208"],
      ["DKIM", "https://datatracker.ietf.org/doc/html/rfc6376"],
      ["DMARC", "https://datatracker.ietf.org/doc/html/rfc7489"],
      ["FLAN-T5", "https://arxiv.org/abs/2210.11416"]
    ],
    "glance": {
      "problem": "A web-design studio wanted to sell booking websites to vacation-rental agencies, and needed someone to find the agencies and get an interested owner on the phone with a salesperson.",
      "built": "A Python pipeline: Google Places search for any query, a website scrape (BeautifulSoup, with Selenium for JavaScript-only sites) for the contacts listings leave out, Bland AI and Retell AI agents that hang up on voicemail and phone menus and transfer interested owners to sales, and a report of answer and transfer rate per prompt.",
      "result": "600+ leads from the 2025 campaign. The campaign reported a 65% answer rate, and a 12% lift in successful transfers after the agent’s tone was re-tuned; the lead lists and call records aren’t in the repo. Written as Colab notebooks in 2025, rebuilt as a tested package in 2026."
    },
    "nest": [
      ["The campaign", "Outbound calls for a web-design studio selling to vacation-rental agencies around Miami."],
      ["The pipeline", "A Places search, a website scrape, an AI voice agent and a transfer to a salesperson."],
      ["The lead list", "600+ leads in 2025; the rebuild keeps one row per business, deduplicated by Places ID."],
      ["The call", "A Bland AI or Retell AI agent that hangs up on machines and transfers anyone interested."],
      ["One phone number", "Found on the listing or the business’s own site, normalised to E.164 before anyone dials it."]
    ],
    "metric": "Filled a sales team's call list (600+ leads)"
  },
  {
    "id": "ivy-slack-agent",
    "title": "Project IVY",
    "tagline": "A Slack support agent that reads screenshots and files its own tickets.",
    "summary": "An AI IT-support agent living in Slack DMs: AWS Lex V2 for intent, then a local knowledge base and an LLM (Claude on Bedrock by default) for what Lex cannot answer, Textract OCR over pasted screenshots, and a capacity-aware dispatcher that assigns the Jira ticket to whichever human is actually on shift and has room.",
    "context": "InnovyQ",
    "role": "DevOps Engineer, InnovyQ Solutions",
    "year": "2026",
    "archived": true,
    "tech": [
      "Python",
      "AWS Lambda",
      "SQS",
      "DynamoDB",
      "Lex V2",
      "Bedrock (Claude)",
      "Gemini",
      "Textract",
      "PaddleOCR",
      "Docker",
      "EventBridge Scheduler",
      "Jira API"
    ],
    "repo": "https://github.com/akshayaa-403/o3_slack_bot/tree/update",
    "created": "2026-07-16",
    "updated": "2026-08-10",
    "tags": [
      ["AWS Lex V2", "https://docs.aws.amazon.com/lexv2/latest/dg/what-is.html"],
      [
        "Amazon Bedrock",
        "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html"
      ],
      [
        "DynamoDB conditional writes",
        "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithItems.html#WorkingWithItems.ConditionalUpdate"
      ],
      ["Slack Events API", "https://api.slack.com/apis/events-api"]
    ],
    "glance": {
      "problem": "An internal IT helpdesk where many tickets arrive as a Slack message and a screenshot, and a human has to read both before anything happens.",
      "built": "The escalation ladder of a Slack support agent on AWS: Lex V2 first, then a local knowledge base, then an LLM, then a person, each a button the user presses. Also the OCR benchmark for pasted screenshots, and a loop that turns resolved Jira tickets into new Lex intents.",
      "result": "Four OCR engines benchmarked on five synthetic screenshots against hand-typed ground truth: Mistral OCR 100%, Textract 99.9%, PaddleOCR 98.9%, EasyOCR 97.4% character accuracy. PaddleOCR was packaged for Lambda; IVY reads screenshots with Textract."
    },
    "nest": [
      ["The Slack DM", "Where an IT ticket arrives, often as a message and a screenshot."],
      ["The pipeline", "API Gateway to Lambda to SQS to Lex V2, with session state per issue in DynamoDB."],
      ["The fallback", "A local knowledge base, then an LLM (Claude on Bedrock by default), for whatever Lex cannot answer."],
      ["The screenshot", "Read by OCR. Four engines were benchmarked; IVY uses Textract."],
      ["One ticket", "One Jira ticket, assigned to whichever human is on shift and has room."]
    ],
    "metric": "Screenshot readers tested head to head (4 OCR engines)"
  },
  {
    "id": "ask-the-crm",
    "title": "Ask the CRM",
    "tagline": "Plain-English sales questions, answered from a CRM by checked, read-only SQL.",
    "summary": "A public rebuild, on invented data, of the methods behind my Artenos work: a sales team's questions become SQL over a synthetic CRM, five prompt versions are scored on a fixed question set, a Monday summary has every number checked against the data, and the whole thing runs live with telemetry.",
    "context": "Public rebuild of Artenos work",
    "role": "Solo project",
    "year": "2026",
    "group": "products",
    "archived": true,
    "tech": ["Python", "SQLite", "Gemini API", "FastAPI", "Next.js", "TypeScript", "Docker", "Render", "GitHub Actions"],
    "repo": "https://github.com/akshayaa-403/artenos",
    "demo": "https://ask-the-crm.onrender.com",
    "created": "2026-11-13",
    "updated": "2026-11-13",
    "tags": [
      ["Text-to-SQL", "https://en.wikipedia.org/wiki/Natural-language_user_interface"],
      ["McNemar's test", "https://en.wikipedia.org/wiki/McNemar%27s_test"],
      ["Prompt injection", "https://en.wikipedia.org/wiki/Prompt_injection"]
    ],
    "glance": {
      "problem": "Sales questions come in plain English and the answers sit in SQL. A model that writes the SQL can be confidently wrong, and a model that writes the summary can invent numbers.",
      "built": "A seeded synthetic CRM; 155 questions with a test split frozen before the first prompt; five prompt versions, each adding one thing; a read-only SQL guard; a Monday summary whose numbers are checked against the data; and a live app on Render that traces every request.",
      "result": "The number checker raised no false alarms on 36 clean summaries and caught all 84 planted wrong numbers; the 34 real numbers moved under the wrong label got through, which is its known blind spot."
    },
    "nest": [
      ["The app", "Next.js over FastAPI in one Docker container, live on Render."],
      ["The answer", "The query, the rows it returned and one plain sentence, or \"the data can't answer that\"."],
      ["The query", "One read-only SELECT, at most 200 rows, stopped after 2 seconds."],
      ["The prompt", "Five versions, each scored on the same 155 questions."],
      ["One number", "Every number in the summary, looked up in the week's figures before it is shown."]
    ],
    "metric": "Caught all 84 planted wrong numbers, no false alarms"
  },
  {
    "id": "anttodo",
    "title": "Ant Colony Task Scheduler",
    "tagline": "Your to-do list as a routing problem, solved live.",
    "summary": "An interactive visualiser that reframes a day of tasks as a routing problem and lets a colony of virtual ants converge on an order in the browser — with two problem formulations, every parameter on a slider, dependency constraints, and a convergence chart you watch flatten.",
    "context": "Solo project",
    "role": "Solo project",
    "year": "2026",
    "archived": true,
    "tech": [
      "JavaScript",
      "Ant Colony Optimization",
      "HTML Canvas",
      "Node.js (tests)",
      "GitHub Actions"
    ],
    "repo": "https://github.com/akshayaa-403/anttodo",
    "demo": "https://akshayaa-403.github.io/anttodo/",
    "created": "2026-04-12",
    "updated": "2026-08-10",
    "tags": [
      [
        "Ant colony optimization",
        "https://en.wikipedia.org/wiki/Ant_colony_optimization_algorithms"
      ],
      ["Travelling salesman", "https://en.wikipedia.org/wiki/Travelling_salesman_problem"],
      ["Swarm intelligence", "https://en.wikipedia.org/wiki/Swarm_intelligence"],
      ["Max-Min Ant System", "https://doi.org/10.1016/S0167-739X(00)00043-1"],
      ["2-opt", "https://en.wikipedia.org/wiki/2-opt"]
    ],
    "glance": {
      "problem": "A to-do list is drawn as a list, but a day is really a route: the cost of doing something depends on what you did before it.",
      "built": "A browser visualiser that reframes a day as a routing problem — a true travelling-salesman tour for errands, a sequencing problem for a workday — and runs ant colony optimisation over it live, with two formulations, dependency constraints, every parameter exposed, and a convergence chart.",
      "result": "Runs entirely in the tab — no backend, no build step. On the sample day it cuts the cost of the order as entered by about a quarter, and a Node test suite checks that against the shipped file in CI."
    },
    "nest": [
      ["The visualiser", "Runs entirely in the browser tab, with no backend and no build step."],
      ["The day, as a route", "Errands as a travelling-salesman tour, a workday as a sequencing problem."],
      ["The colony", "Virtual ants converging on an order, with every parameter on a slider."],
      ["One ant", "Builds one order, task by task, weighing the pheromone on each step against how good it looks."],
      ["One pheromone value", "One number on the edge between two tasks, laid down by ants and evaporating."]
    ]
  },
  {
    "id": "wikipedia-summarizer",
    "title": "Wikipedia Summarizer",
    "tagline": "Four algorithms, one article, scored against the humans who wrote it.",
    "summary": "A static, dependency-free browser app that summarises any Wikipedia article four ways at once and scores each result with ROUGE against the article's own lead section — the summary Wikipedia's editors wrote — so the algorithms are measured against a human ceiling rather than each other.",
    "context": "NLP",
    "role": "Solo project",
    "year": "2026",
    "archived": true,
    "article": false,
    "tech": ["JavaScript (ES modules)", "MediaWiki API", "ROUGE", "SVG", "Playwright"],
    "repo": "https://github.com/akshayaa-403/Wikipedia-Summarizer",
    "demo": "https://akshayaa-403.github.io/Wikipedia-Summarizer/",
    "created": "2025-01-30",
    "updated": "2026-09-28",
    "tags": [
      ["ROUGE", "https://aclanthology.org/W04-1013/"],
      ["TextRank", "https://aclanthology.org/W04-3252/"],
      ["Extractive summarization", "https://en.wikipedia.org/wiki/Automatic_summarization"],
      ["MediaWiki API", "https://www.mediawiki.org/wiki/API:Main_page"]
    ],
    "glance": {
      "problem": "Summarisation demos show one algorithm's output and leave you to guess whether it is any good.",
      "built": "A static, dependency-free browser app that runs four extractive summarisers over any Wikipedia article at once and scores each with ROUGE against the article's own lead section. The lead cut to the same 150-word budget sets a human ceiling.",
      "result": "MMR reaches ROUGE-1 0.400 on Penguin against a human ceiling of 0.709 — 56% of it. The winner changes with the article, which is the finding. The whole run (four summaries, ROUGE and six charts) takes about 60 ms on a 4,300-word article, entirely in the tab."
    },
    "nest": [
      ["The app", "Static and dependency-free: everything runs in the tab."],
      ["The article", "Any Wikipedia article, fetched through the MediaWiki API."],
      ["The summarisers", "Four extractive algorithms, run side by side on the same 150-word budget."],
      ["The score", "ROUGE against the article's own lead section, the summary its editors wrote."],
      ["One word", "One overlapping word: the unit ROUGE-1 counts."]
    ],
    "metric": "Reaches 56% of the human summary's score (ROUGE-1 0.400 vs 0.709)"
  }
];

if (typeof module !== 'undefined' && module.exports) { module.exports = projects; }
