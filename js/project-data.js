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
     tech                           header chips; first four are the row's Focus
     repo, demo                     repo is the source, or the site when there
                                    is no public repo; demo is the live build
     created, updated               GitHub's created_at / pushed_at, transcribed
                                    (never fetched at run time)
     tags                           [[label, https url]] — the paper or spec
     glance                         { problem, built, result } at the top of
                                    the case study
     metric                         the one measured figure on the home row
     screen                         what the home row's hover screen shows;
                                    .mp4/.webm play, anything else is a still
     thumb                          false: no image, so a text-only share card
     fragments                      the project's own vocabulary, scattered over
                                    the case study's opener */
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
    "updated": "2026-10-11",
    "tags": [
      ["Factor investing", "https://en.wikipedia.org/wiki/Factor_investing"],
      ["Momentum (12-1)", "https://doi.org/10.1111/j.1540-6261.1993.tb04702.x"],
      ["VADER", "https://ojs.aaai.org/index.php/ICWSM/article/view/14550"],
      ["Survivorship bias", "https://en.wikipedia.org/wiki/Survivorship_bias"],
      ["Sharpe ratio", "https://en.wikipedia.org/wiki/Sharpe_ratio"]
    ],
    "glance": {
      "problem": "I wanted one ranking that weighs price signals and the news together, and a backtest honest enough to tell me when that ranking is luck.",
      "built": "A daily cross-sectional model: four factors z-scored per date, clipped to ±3 and summed with weights; a weekly backtest that trades yesterday's signal and only the names that change, at 10 bps; a 2,000-portfolio significance test; a Streamlit dashboard; 39 tests.",
      "result": "Re-run on 2026-10-16 over Oct 2025 to Oct 2026: +70.1% against SPY's +18.7%, but random ten-name portfolios from the same 50 stocks made +43.8% at the median, and p = 0.067. Most of the beat is survivorship in the universe."
    },
    "metric": "Beat SPY, p = 0.07",
    "screen": "public/assets/projects/quant-current.webp",
    "fragments": [
      "12-minus-1 momentum",
      "z-score",
      "clipped to ±3",
      "cross-sectional",
      "composite",
      "weighted sum",
      "VADER",
      "TextBlob",
      "FinBERT",
      "lexicon",
      "compound",
      "sentiment",
      "signed volume",
      "volatility",
      "one-day lag",
      "lookahead",
      "warm-up",
      "10 bps",
      "turnover",
      "rebalance",
      "top 10",
      "SPY",
      "random portfolios",
      "p = 0.067",
      "survivorship",
      "market cap",
      "S&P 500",
      "yfinance",
      "NewsAPI",
      "Streamlit",
      "Redis",
      "pydantic-settings",
      "pytest",
      "headless Chrome"
    ]
  },
  {
    "id": "phase-contrast-denoising",
    "title": "Phase-Contrast Clean-Up Pipeline",
    "tagline": "One held-out microscope frame, followed through a classical filter and a residual U-Net.",
    "summary": "A Python pipeline that cleans synthetic, seeded phase-contrast-style frames. It has an OpenCV front end (difference of Gaussians, then CLAHE) and an optional 31M-parameter residual U-Net, plus a browser port of the classical half that agrees with OpenCV to about 50 dB.",
    "context": "Research tool",
    "role": "Solo project",
    "year": "2026",
    "group": "research",
    "tech": ["Python", "PyTorch", "OpenCV", "Gradio", "JavaScript", "TensorBoard", "scikit-image"],
    "repo": "https://github.com/akshayaa-403/phase-contrast-denoising",
    "demo": "https://akshayaa-403.github.io/phase-contrast-denoising/docs/",
    "created": "2026-07-23",
    "updated": "2026-08-13",
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
      "built": "A seeded generator of 100 paired frames; a classical path (difference of Gaussians, then CLAHE); a hybrid path that adds a residual U-Net, with fp16 weights committed; and a browser port of the classical half.",
      "result": "On the 20 held-out frames, PSNR goes from 11.46 to 20.26 dB and improves on all 20. Otsu Dice moves only from 0.894 to 0.907, but the worst frame rises from 0.556 to 0.808. Writing this up, I found that the CLAHE clip limit had no effect in 16-bit."
    },
    "metric": "PSNR 11.46 → 20.26 dB",
    "screen": "public/assets/projects/phase-demo-metrics.webp",
    "fragments": [
      "seed 42",
      "img_0002",
      "held out",
      "20 cells",
      "phase contrast",
      "halo",
      "illumination ramp",
      "noise σ 0.0116",
      "difference of Gaussians",
      "band-stop",
      "σ1 = 1, σ2 = 8",
      "α = 0.6",
      "CLAHE",
      "clipCount = 1",
      "65,536 bins",
      "uint16",
      "uint8",
      "8×8 tiles",
      "Otsu",
      "Dice",
      "residual",
      "x − residual",
      "U-Net",
      "GroupNorm",
      "31,036,481 parameters",
      "fp16",
      "L1 loss",
      "PSNR",
      "SSIM",
      "cv_only",
      "hybrid",
      "BORDER_REFLECT_101",
      "OpenCV",
      "the mistake, not the picture"
    ]
  },
  {
    "id": "arteza",
    "title": "Arteza",
    "tagline": "An online gallery and shop for an original-art studio.",
    "summary": "A React storefront and portfolio for the artist Upasna: 106 original paintings across five collections, a five-question style quiz, online class booking, and a cart that ends in a WhatsApp conversation instead of a card form.",
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
      "built": "A React and Supabase storefront for 106 originals across five collections, with a five-question style quiz, online class booking, and a cart that records the order and hands the buyer to WhatsApp — where the sales were already happening.",
      "result": "A live site the studio sells from. Commercial figures belong to the client and are not mine to publish."
    },
    "metric": "106 paintings, 5 collections",
    "screen": "public/assets/projects/arteza-home.webp",
    "fragments": [
      "five collections",
      "one of one",
      "style quiz",
      "five questions",
      "a tally, not a weight",
      "constellation",
      "WhatsApp",
      "the checkout is a conversation",
      "UPI",
      "Supabase",
      "Edge Function",
      "React",
      "Vite",
      "TypeScript",
      "Tailwind",
      "shadcn/ui",
      "Vercel",
      "106 originals",
      "medium",
      "dimensions",
      "sold out",
      "class booking",
      "Certificate of Authenticity",
      "Bodoni Moda",
      "gilt frames",
      "made once",
      "the studio already sells this way",
      "no card form",
      "an artist, not a shop"
    ]
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
    "updated": "2026-09-19",
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
    "screen": [
      "public/assets/projects/habita-phone-matrix.webp",
      "public/assets/projects/habita-phone-tilt.webp"
    ],
    "fragments": [
      "Eisenhower",
      "urgent",
      "important",
      "Focus",
      "Backburner",
      "Fit In",
      "Goals",
      "position, not a field",
      "quadrant",
      "day timeline",
      "15-minute snapping",
      "CalendarContract",
      "Capacitor",
      "READ_CALENDAR",
      "Instances table",
      "recurring events",
      "EVENT_COLOR_KEY",
      "event marker",
      "progress ring",
      "SVG",
      "localStorage",
      "shape migration",
      "the calendar you already look at",
      "haptics",
      "auto-place",
      "collision",
      "Android",
      "no third-party sync"
    ]
  },
  {
    "id": "ivy-slack-agent",
    "title": "Project IVY",
    "tagline": "A Slack support agent that reads screenshots and files its own tickets.",
    "summary": "An AI IT-support agent living in Slack DMs: AWS Lex V2 for intent, a Bedrock knowledge base and then Claude for what Lex cannot answer, OCR over pasted screenshots, and a capacity-aware dispatcher that assigns the Jira ticket to whichever human is actually on shift and has room.",
    "context": "InnovyQ",
    "role": "AI Engineer, InnovyQ",
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
      "Rekognition",
      "Textract",
      "PaddleOCR",
      "Docker",
      "EventBridge Scheduler",
      "Jira API"
    ],
    "repo": "https://github.com/akshayaa-403/o3_slack_bot",
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
      "built": "An event-driven agent on AWS — API Gateway to Lambda to SQS to Lex V2 — with DynamoDB session state per issue, a Claude fallback on Bedrock, OCR over pasted screenshots, and automatic Jira ticket creation with capacity-aware assignment.",
      "result": "Four OCR engines benchmarked against hand-written ground truth. Mistral OCR was the most accurate (100%, 823 ms), but PaddleOCR (98.9%, 1,075 ms) was the engine packaged for Lambda. Seven test files cover the locking, on-call and dispatch paths."
    },
    "metric": "4 OCR engines benchmarked",
    "thumb": false,
    "fragments": [
      "Slack",
      "Lex V2",
      "Bedrock",
      "Claude",
      "Lambda",
      "SQS",
      "DynamoDB",
      "Jira",
      "intent",
      "slot",
      "session",
      "fallback",
      "guardrail",
      "OCR",
      "PaddleOCR",
      "Textract",
      "Rekognition",
      "conditional write",
      "idempotent",
      "on-call",
      "capacity",
      "queue",
      "cold start",
      "container image",
      "ap-southeast-2",
      "thread_ts",
      "event_id",
      "dedupe",
      "batchItemFailures",
      "EventBridge",
      "escalation",
      "ground truth"
    ]
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
    "fragments": [
      "ant colony optimisation",
      "pheromone",
      "τ",
      "α",
      "β",
      "ρ",
      "q₀",
      "evaporation",
      "the trail forgets",
      "closed tour",
      "haversine",
      "Errand Mode",
      "Focus Mode",
      "deadline pressure",
      "priority inversion",
      "context switching",
      "cognitive load",
      "2-opt",
      "convergence",
      "Max-Min Ant System",
      "τ_min",
      "τ_max",
      "dependencies",
      "a day as a map",
      "no ant sees the whole",
      "iteration",
      "cost function",
      "you decide what better means",
      "zero dependencies",
      "one file"
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
      "result": "MMR reaches ROUGE-1 0.400 on Penguin against a human ceiling of 0.709 — 56% of it. The winner changes with the article, which is the finding. TextRank, the slowest of the four, takes about 60 ms on a 4,300-word article, entirely in the tab."
    },
    "metric": "ROUGE-1 0.400, 56% of the human ceiling",
    "fragments": [
      "extractive",
      "TextRank",
      "PageRank",
      "LSA",
      "SVD",
      "Luhn 1958",
      "MMR",
      "redundancy penalty",
      "TF-IDF",
      "ROUGE-1",
      "ROUGE-2",
      "ROUGE-L",
      "human ceiling",
      "the lead section",
      "trimmed to budget",
      "0.709",
      "MediaWiki API",
      "origin=*",
      "60 ms",
      "4,300 words",
      "six charts",
      "positional density",
      "lead bias",
      "sentence overlap",
      "Jaccard",
      "no algorithm wins",
      "ES modules",
      "no build",
      "static files",
      "dangling referents"
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) { module.exports = projects; }
