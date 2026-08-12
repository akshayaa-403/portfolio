/* Project content. Single source of truth for cards (index) and detail pages (project.html).
   Copy is written from what each repo actually contains — several upstream READMEs
   overstate their stack, so descriptions here stay faithful to the committed code. */
const projects = [
  {
    id: 'quantamental-screener',
    recent: true,
    context: 'Solo project',
    title: 'Quantamental Screener',
    tagline: 'Multi-factor equity screening with news sentiment.',
    year: '2026',
    role: 'Solo project',
    featured: true,
    summary:
      'A multi-factor stock screener that ranks S&P 500 equities by blending technical signals with ensemble news sentiment, backed by Redis caching, historical backtesting, and an interactive Streamlit dashboard.',
    tech: ['Python', 'Pandas', 'scikit-learn', 'Streamlit', 'yfinance', 'Redis', 'Docker'],
    repo: 'https://github.com/akshayaa-403/quantamental-screener',
    demo: 'https://quantamental-screener.streamlit.app',
    overview:
      'Most screeners look at either price action or headlines, never both. Quantamental combines the two: a quantitative factor model over momentum, volume and volatility, plus a sentiment score derived from recent news for each ticker. The four factors are normalised and combined into a single ranking score, so a name only rises to the top when the technicals and the narrative agree.',
    highlights: [
      'Pluggable factor-scoring system — momentum, volume, volatility and sentiment are weighted through env-var config rather than hardcoded.',
      'Ensemble sentiment using VADER and TextBlob by default, with FinBERT available as an opt-in upgrade.',
      'Historical backtesting with periodic rebalancing to sanity-check the ranking against real returns.',
      'Redis caching layer so repeated screens do not re-hit the market data and news APIs.',
      'Deterministic offline demo mode for reproducible runs without live API calls.',
      'pytest suite and GitHub Actions CI on every push.'
    ],
    challenge:
      'Streamlit Community Cloud caps an app at roughly 1 GB of memory, and loading FinBERT alone blows past a comfortable margin. Rather than drop sentiment analysis, I made the model tier configurable: lightweight lexicon scorers run by default and keep the hosted app inside its budget, while FinBERT stays one environment variable away for local or better-resourced deployments. The tradeoff is documented in the repo so the choice is legible instead of looking like an oversight.',
    deepDive: [
        {
            "kind": "prose",
            "heading": "How the ranking works",
            "body": "Every ticker in the universe is scored on four independent factors. Raw values live on wildly different scales — a momentum return is a small decimal, a volume figure is in millions — so each factor is converted to a z-score across the universe before anything is combined. That makes the four directly comparable, and it means a stock is judged relative to its peers on the day rather than against a fixed threshold."
        },
        {
            "kind": "formula",
            "tex": "z_f(i) \\;=\\; \\frac{x_f(i) - \\mu_f}{\\sigma_f}\\qquad\\text{Composite}(i) \\;=\\; \\sum_{f} w_f \\cdot z_f(i)",
            "caption": "Each factor f is z-scored across the universe, then combined as a weighted sum. Default weights: momentum 0.40, sentiment 0.30, volume 0.20, volatility 0.10 — all overridable by environment variable."
        },
        {
            "kind": "figure",
            "src": "public/assets/projects/quant-dashboard.webp",
            "alt": "Screener dashboard showing top stock recommendations ranked by composite score, with momentum, sentiment, volume and volatility columns",
            "caption": "The ranked output. ACN leads on a 0.983 composite — strong momentum (2.440) and positive sentiment (0.883) agreeing with each other, which is exactly the condition the model is built to surface."
        },
        {
            "kind": "prose",
            "heading": "Sentiment as a first-class factor",
            "body": "The sentiment score is an ensemble rather than a single model, because the cheap lexicon scorers disagree in useful ways. VADER handles negation and intensifiers well; TextBlob is steadier on longer, flatter prose. FinBERT is materially better than both on financial text, but it is also the reason the app cannot be deployed naively."
        },
        {
            "kind": "code",
            "lang": "python",
            "caption": "Ensemble configuration — FinBERT carries the most weight when it is available.",
            "code": "sentiment_model = EnsembleSentiment(\n    models=[FinBERTModel, VADERModel, TextBlobModel],\n    weights=[0.5, 0.3, 0.2],\n)"
        },
        {
            "kind": "figure",
            "src": "public/assets/projects/quant-factors.webp",
            "alt": "Three charts: composite score distribution histogram, per-ticker factor contribution bars, and a factor correlation heatmap",
            "caption": "Factor diagnostics. The correlation heatmap is the important one — momentum and volume are inversely related at −0.34, so the two are not measuring the same thing twice. Near-zero correlation elsewhere means the factors carry independent information."
        },
        {
            "kind": "prose",
            "heading": "Backtesting, honestly",
            "body": "A ranking model that is never tested against realised returns is just an opinion. The backtest rebalances weekly into the top-ranked names and reports the result next to a benchmark — including when the result is unflattering."
        },
        {
            "kind": "figure",
            "src": "public/assets/projects/quant-backtest.webp",
            "alt": "Backtest performance panel: 19.70 percent strategy return against 21.99 percent benchmark, Sharpe 1.20, max drawdown -10.07 percent, and a cumulative performance chart",
            "caption": "The honest result: over this window the strategy returned 19.70% against the S&P 500's 21.99% — it underperformed by 2.29%. Sharpe of 1.20 and a −10.07% max drawdown say the risk profile was reasonable; the alpha was not there. Reporting this is the point. A backtest you only publish when it wins is marketing, not evidence."
        },
        {
            "kind": "figure",
            "src": "public/assets/projects/quant-deepdive.webp",
            "alt": "Per-stock analysis view showing composite, momentum and sentiment metrics for ACN with a price history chart and recent news headlines",
            "caption": "Per-ticker drill-down. Score, price history and the headlines that produced the sentiment reading sit on one screen, so a ranking can always be traced back to its inputs."
        },
        {
            "kind": "prose",
            "heading": "The memory ceiling",
            "body": "Streamlit Community Cloud allows roughly 1 GB of memory. FinBERT alone does not fit comfortably alongside the data layer. Rather than drop sentiment or quietly ship a broken deploy, the model tier became configuration: lexicon scorers by default so the hosted app stays inside budget, FinBERT one environment variable away for local runs. The constraint is documented in the repo so the choice reads as a decision rather than an oversight."
        }
    ]
  },
  {
    "id": "arteza",
    "recent": true,
    "context": "Client work",
    "title": "Arteza",
    "tagline": "An online gallery and shop for an original-art studio.",
    "year": "2026",
    "role": "TODO-ROLE",
    "featured": true,
    "summary": "A React storefront and portfolio for the artist Upasna, presenting 90+ original paintings across five curated collections, with a style-matching quiz, class booking, and a WhatsApp-based checkout suited to how the studio actually sells.",
    "tech": [
      "React",
      "Vite",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Supabase",
      "Vercel"
    ],
    "repo": "https://arteza.site",
    "demo": "https://arteza.site",
    "overview": "Arteza sells original physical paintings — one of each, hand-signed, shipped from a studio in Greater Noida. That inventory model shapes everything: there is no restock, so every listing is either available or gone, and buyers want to talk to the artist before committing to a piece they can only see on a screen. The site is built around those two facts rather than around a conventional retail funnel.",
    "highlights": [
      "Catalogue of 90+ individually listed original works, each with medium, dimensions and price.",
      "Five curated collections — Abstract Expressions, Cultural Chronicles, Dreamscapes, Nature's Palette, Portraits and Personalities — presented as an interactive constellation rather than a menu.",
      "Art Style Quiz that recommends pieces from colour, mood, subject, placement and style preferences.",
      "WhatsApp checkout: the cart hands off to a pre-filled conversation instead of a card form.",
      "Class booking with email confirmation, across kids, beginner, intermediate and advanced tiers.",
      "Light and dark themes, with a serif display face over a clean neutral ground."
    ],
    "challenge": "Conventional e-commerce checkout assumes fungible stock and an impersonal transaction. Neither holds here: every painting is unique, and buyers reasonably want to ask about colour accuracy, framing and shipping before spending on an original. Forcing a card form into that flow would have added friction at exactly the wrong moment. Instead the cart composes a pre-filled WhatsApp message and hands the conversation to the artist, where price, shipping and UPI payment get settled directly. It is a deliberately smaller technical surface than a payment integration, and it matches how the studio already sells.",
    "deepDive": [
      {
        "kind": "figure",
        "src": "public/assets/projects/arteza-home.webp",
        "alt": "Arteza homepage: large serif headline reading 'Art That Speaks to' over a soft painting backdrop, with Explore Collection and Get Inspired buttons",
        "caption": "The homepage leads with a rotating typewriter headline over a muted painting. Cormorant Garamond for display, Montserrat for body — serif authority over clean neutral ground."
      },
      {
        "kind": "prose",
        "heading": "Collections as a constellation",
        "body": "The five collections could have been a dropdown. Instead they are arranged as orbiting bubbles around a central label, each showing a representative work, connected by dotted lines. It rewards exploration in a way a menu does not — and for a gallery, browsing is the product."
      },
      {
        "kind": "figure",
        "src": "public/assets/projects/arteza-collections.webp",
        "alt": "Curated Collections page showing five circular collection previews orbiting a central label reading 'Curated Collections — Five worlds, one brushstroke at a time'",
        "caption": "“Five worlds, one brushstroke at a time.” Each bubble previews its collection; dotted connectors imply a map rather than a list."
      },
      {
        "kind": "prose",
        "heading": "Why the checkout is a chat",
        "body": "Each painting is one-of-one. A buyer typically wants to ask something — how the colour reads in daylight, whether it ships framed — before committing. Routing the cart into WhatsApp with the selection pre-filled keeps that conversation where the studio already works, and sidesteps a payment integration that would have served the site's architecture more than its customers. There is an offline fallback: if the server cannot be reached, the message is still composed locally so the lead is not lost."
      },
      {
        "kind": "figure",
        "src": "public/assets/projects/arteza-shop.webp",
        "alt": "Shop grid showing original paintings with title, dimensions, medium and price in rupees, each with an Add button",
        "caption": "Every listing carries medium, dimensions and price. Because stock is one-of-one, sold work leaves the grid rather than greying out."
      },
      {
        "kind": "table",
        "caption": "Stack, and why each piece is there.",
        "head": [
          "Layer",
          "Choice",
          "Reason"
        ],
        "rows": [
          [
            "UI",
            "React + Vite + TypeScript",
            "Fast dev loop; typed props across a large catalogue"
          ],
          [
            "Styling",
            "Tailwind + shadcn/ui",
            "Accessible primitives without designing a component library first"
          ],
          [
            "Data",
            "Supabase",
            "Paintings, blog posts and bookings in Postgres, with image storage attached"
          ],
          [
            "Hosting",
            "Vercel",
            "Static edge delivery, Mumbai region — close to the audience"
          ]
        ]
      },
      {
        "kind": "prose",
        "heading": "A deployment bug worth fixing",
        "body": "One real defect is live at time of writing. The site is a client-routed single-page app, but the host has no SPA rewrite configured, so every route except the homepage returns HTTP 404 on direct load. In-app navigation works fine — clicking through from the homepage is seamless — but a shared link, a refresh, or a search-engine crawl hits a dead page, and the sitemap is currently advertising twelve URLs that all fail. It is a one-line hosting fix and it is the highest-value change the site could make."
      }
    ]
  },
  {
    id: 'phase-contrast-denoising',
    recent: false,
    context: 'Research tool',
    title: 'Phase-Contrast Clean-Up Pipeline',
    tagline: 'Removing halo artifacts from microscopy images.',
    year: '2026',
    role: 'Solo project',
    featured: true,
    summary:
      'A hybrid classical-CV and deep-learning pipeline that suppresses the halo artifact in phase-contrast microscopy and lifts cell contrast, shipping a pre-trained fp16 model so inference works with zero setup.',
    tech: ['Python', 'PyTorch', 'OpenCV', 'Gradio', 'TensorBoard'],
    repo: 'https://github.com/akshayaa-403/phase-contrast-denoising',
    demo: null,
    overview:
      'Phase-contrast microscopy makes transparent cells visible, but it introduces a bright halo around every object that confuses downstream segmentation. This pipeline offers two modes. A fast classical path uses Difference-of-Gaussians to suppress the halo and CLAHE to restore local contrast, with no model required. A hybrid path runs that same front-end and then applies a residual U-Net that predicts the leftover artifact and subtracts it, so the cleaned image is the input minus the predicted residual.',
    highlights: [
      'Two selectable modes: classical CV only for speed, or CV plus residual U-Net for quality.',
      'Ships a pre-trained fp16 checkpoint, so hybrid inference runs without any training step.',
      'Synthetic data generator produces paired clean and haloed images for supervised training.',
      'PSNR, SSIM and FLOPs reported per run, with an auto-generated Markdown report and figures.',
      'Gradio app for interactive before-and-after comparison.',
      'YAML-driven configuration and unit plus integration tests; runs on CPU, uses CUDA when present.'
    ],
    challenge:
      'Learning the cleaned image directly made the network fight to reproduce detail it had already been given. Predicting the residual instead — just the artifact to remove — meant the model only had to learn the error term, which trained faster and preserved cell structure far better. Shipping fp16 weights kept the checkpoint small enough to commit, so the project is runnable the moment it is cloned.',
    deepDive: [
        {
            "kind": "prose",
            "heading": "The halo problem",
            "body": "Phase-contrast microscopy makes transparent cells visible by converting phase shifts into intensity — which is what lets you image living cells without staining them. The optical trick has a cost: every object picks up a bright halo at its boundary. To a human that is a minor annoyance. To a segmentation algorithm the halo is a strong edge in the wrong place, and it corrupts every downstream measurement."
        },
        {
            "kind": "steps",
            "heading": "Two paths through the pipeline",
            "items": [
                {
                    "t": "Classical (fast)",
                    "d": "Difference-of-Gaussians suppresses the halo's spatial frequency band, then CLAHE restores local contrast. No model, no GPU, runs anywhere."
                },
                {
                    "t": "Hybrid (better)",
                    "d": "The same classical front-end, then a residual U-Net predicts what artifact remains and subtracts it."
                }
            ]
        },
        {
            "kind": "formula",
            "tex": "\\hat{y} \\;=\\; x \\;-\\; f_{\\theta}(x)",
            "caption": "The residual formulation. The network predicts the artifact f(x), not the clean image — the output is the input minus that prediction. This is the single decision that made the model work."
        },
        {
            "kind": "prose",
            "heading": "Why predict the residual",
            "body": "The first version learned the cleaned image directly, and it fought to reproduce detail it had already been handed. Predicting only the error term is a much smaller job: the network never has to re-synthesise cell structure it could simply pass through. Training converged faster and preserved fine structure far better, on identical data and an identical architecture."
        },
        {
            "kind": "prose",
            "heading": "Runnable on clone",
            "body": "A pre-trained fp16 checkpoint ships with the repo, so hybrid inference works with no training step. Half precision was what kept the weights small enough to commit. PSNR, SSIM and FLOPs are reported per run into an auto-generated Markdown report, and a Gradio app gives an interactive before-and-after view."
        }
    ]
  },
  {
    id: 'anttodo',
    recent: true,
    context: 'Solo project',
    title: 'Ant Colony Task Scheduler',
    tagline: 'Your to-do list as a travelling salesman problem.',
    year: '2026',
    role: 'Solo project',
    featured: true,
    summary:
      'An interactive visualisation that reframes a daily to-do list as a travelling salesman problem and lets a colony of virtual ants discover the optimal task order in real time.',
    tech: ['Python', 'TypeScript', 'Ant Colony Optimization', 'Docker'],
    repo: 'https://github.com/akshayaa-403/anttodo',
    demo: 'https://akshayaa-403.github.io/anttodo/',
    overview:
      'Deciding what order to do things in is a routing problem in disguise. Enter a list of tasks and this tool treats each one as a city, then releases a colony of virtual ants that lay pheromone along good routes and evaporate it from bad ones. Over successive iterations the colony converges on an efficient ordering, and you watch the convergence happen rather than just receiving an answer.',
    highlights: [
      'Every ACO parameter is live-tunable: ant count, iteration cap, pheromone weight, heuristic weight, evaporation rate and deposit strength.',
      'Flexible task parsing accepts numbered, bulleted or plain-text lists, including priority and duration markers.',
      'Recognises already-completed items across several notations and excludes them from routing.',
      'Named lists save and reload from local storage.',
      'Before-and-after comparison reports route improvement, time saved and urgency gain.'
    ],
    challenge:
      'Ant Colony Optimization is usually taught as a wall of notation. The interesting part is not the formula but the emergent behaviour: no single ant is smart, yet the colony reliably finds a good route. Exposing the parameters as controls turns the algorithm into something you can poke at — crank evaporation up and watch the colony forget good routes, drop the ant count and watch convergence get noisy.',
    deepDive: [
        {
            "kind": "prose",
            "heading": "A to-do list is a routing problem",
            "body": "Given a set of tasks and a cost for moving between any two of them, finding the best order is the travelling salesman problem. It is NP-hard, so brute force dies quickly — ten tasks already means 181,440 distinct orderings. Ant Colony Optimization does not search exhaustively. It runs many cheap, slightly random agents and lets the good routes reinforce themselves."
        },
        {
            "kind": "formula",
            "tex": "P(i \\to j) \\;=\\; \\frac{[\\tau_{ij}]^{\\alpha} \\cdot [\\eta_{ij}]^{\\beta}}{\\sum_{l \\in \\text{allowed}} [\\tau_{il}]^{\\alpha} \\cdot [\\eta_{il}]^{\\beta}}",
            "caption": "The transition rule. An ant at task i picks the next task j with probability proportional to pheromone τ (what the colony has learned) raised to α, times heuristic desirability η (how good this edge looks on its own) raised to β. α and β set how much the colony trusts memory versus instinct."
        },
        {
            "kind": "steps",
            "heading": "One iteration, end to end",
            "items": [
                {
                    "t": "Construct",
                    "d": "Every ant walks a complete tour, choosing each next task by the probability rule above. No ant sees the global picture."
                },
                {
                    "t": "Evaluate",
                    "d": "Each finished tour is costed. Cost blends transition effort with task urgency and duration."
                },
                {
                    "t": "Evaporate",
                    "d": "All pheromone decays by a factor ρ. Without this, early mistakes would persist forever."
                },
                {
                    "t": "Deposit",
                    "d": "The global-best tour lays 1/cost on each of its edges — better tours leave stronger trails."
                },
                {
                    "t": "Clamp",
                    "d": "Pheromone is bounded to [τmin, τmax]. This is the Max-Min Ant System rule and it is what prevents premature convergence."
                }
            ]
        },
        {
            "kind": "prose",
            "heading": "The failure mode worth knowing",
            "body": "Naive ACO has a characteristic way of going wrong: one early trail gets reinforced, compounds without limit, and the colony locks onto the first decent answer it stumbles across. Clamping pheromone to a bounded range — with τmax tied to the current best cost — is what stops that. The repo verifies it: after 150 iterations, pheromone is still finite and still inside its bounds."
        },
        {
            "kind": "table",
            "caption": "The tunable parameters, and what happens when you push them.",
            "head": [
                "Parameter",
                "Controls",
                "Push it up"
            ],
            "rows": [
                [
                    "α",
                    "Pheromone weight",
                    "Ants trust colony memory; faster convergence, higher risk of locking in early"
                ],
                [
                    "β",
                    "Heuristic weight",
                    "Ants trust local desirability; greedier, less exploratory"
                ],
                [
                    "ρ",
                    "Evaporation rate",
                    "Trails fade faster; the colony forgets good routes and keeps exploring"
                ],
                [
                    "Ants",
                    "Colony size",
                    "Smoother convergence, more computation per iteration"
                ]
            ]
        },
        {
            "kind": "prose",
            "heading": "Why expose the knobs",
            "body": "ACO is usually taught as a wall of notation. The interesting property is emergent: no individual ant is intelligent, yet the colony reliably finds a good route. Making every parameter live-tunable turns the algorithm into something you can poke — crank evaporation and watch the colony forget, drop the ant count and watch convergence get noisy. That is a far better explanation than the equation alone."
        }
    ]
  },
  {
    id: 'habita',
    recent: true,
    context: 'Solo project',
    title: 'Habita',
    tagline: 'Eisenhower-matrix task management.',
    year: '2026',
    role: 'Solo project',
    featured: true,
    summary:
      'Habita turns scattered to-do lists into an Eisenhower Matrix of four urgency-importance quadrants, with live SVG progress rings, drag-and-drop reordering and native haptics — built buildless and shipped to Android via Capacitor.',
    tech: ['JavaScript (ES6)', 'CSS Grid', 'SVG', 'localStorage', 'Capacitor'],
    repo: 'https://github.com/akshayaa-403/Habita',
    demo: 'https://akshayaa-403.github.io/Habita/',
    overview:
      'A flat to-do list treats a tax deadline and a hobby idea as equals. Habita sorts every task into one of the Eisenhower Matrix quadrants — urgent and important, important but not urgent, urgent but not important, neither — so priority is a property of where a task sits rather than something you have to hold in your head. Each quadrant carries an SVG progress ring that fills as you complete work inside it.',
    highlights: [
      'Four-quadrant matrix with per-quadrant live SVG progress rings.',
      'Drag-and-drop reordering with dedicated drag handles, and double-click inline editing.',
      'Haptic feedback through native Capacitor Haptics on Android, falling back to the Web Vibration API.',
      'Keyboard-focusable quadrants, ARIA labelling, visible focus rings and reduced-motion gating.',
      'State persisted to localStorage with shape validation and migration for older saved data.',
      'No build step — modular ES6 files served as-is, then wrapped for Android with Capacitor.'
    ],
    challenge:
      'I wanted the app to feel native on a phone while staying a plain web project with no bundler. Splitting the JavaScript into single-responsibility modules for theming, storage, tasks, UI and progress kept it readable without tooling, and Capacitor added real haptics on Android while the Web Vibration API covers browsers. Validating and migrating stored data on load meant an old saved state could never crash a newer build.',
    deepDive: [
        {
            "kind": "prose",
            "heading": "Priority as position, not as a field",
            "body": "A flat list treats a tax deadline and a hobby idea as equals. Habita places every task into one of the Eisenhower Matrix's four quadrants, so priority is expressed by where a task sits rather than by a property you have to read and interpret. The decision you make when adding a task — is this urgent, is this important — is the same decision the layout then encodes."
        },
        {
            "kind": "table",
            "caption": "The four quadrants and the action each implies.",
            "head": [
                "",
                "Urgent",
                "Not urgent"
            ],
            "rows": [
                [
                    "Important",
                    "Do it now",
                    "Schedule it"
                ],
                [
                    "Not important",
                    "Delegate it",
                    "Drop it"
                ]
            ]
        },
        {
            "kind": "prose",
            "heading": "Progress rings without a chart library",
            "body": "Each quadrant carries a ring that fills as its tasks complete. It is a single SVG circle animated through stroke-dasharray — the dash pattern is set to the circumference, and the offset is moved from full circumference (empty) to zero (complete). No dependency, no canvas, and it scales cleanly at any size."
        },
        {
            "kind": "formula",
            "tex": "C = 2\\pi r \\qquad \\text{offset} = C \\times \\left(1 - \\frac{\\text{done}}{\\text{total}}\\right)",
            "caption": "Circumference sets the dash length; the offset is driven by completion ratio. Animating stroke-dashoffset gives a smooth fill for free."
        },
        {
            "kind": "prose",
            "heading": "Native feel, no build step",
            "body": "The goal was something that feels native on a phone while staying a plain web project. The JavaScript is split into single-responsibility ES6 modules — theming, storage, tasks, UI, progress — served as-is with no bundler, then wrapped for Android with Capacitor. Capacitor Haptics provides real vibration on device, with the Web Vibration API as the browser fallback."
        },
        {
            "kind": "prose",
            "heading": "Never let old data break a new build",
            "body": "State persists to localStorage, which means a user can return weeks later carrying a shape the current code no longer expects. Habita validates the stored object on load and migrates older shapes forward rather than trusting it — so a stale save degrades into a correct one instead of a crash."
        }
    ]
  },
  {
    id: 'yosemite-cyclegan',
    recent: false,
    context: 'Deep learning',
    title: 'Yosemite CycleGAN',
    tagline: 'Summer to winter, from unpaired photos.',
    year: '2026',
    role: 'Solo project',
    featured: false,
    summary:
      'A modular from-scratch PyTorch CycleGAN that translates Yosemite summer landscapes into winter scenes using only unpaired images, with full cycle-consistency training and benchmarked cost estimates across four GPU platforms.',
    tech: ['Python', 'PyTorch', 'CycleGAN', 'TensorBoard'],
    repo: 'https://github.com/akshayaa-403/yosemite-image-translation-gan',
    demo: null,
    overview:
      'Paired training data — the same scene photographed in both summer and winter from an identical angle — barely exists. CycleGAN sidesteps the requirement entirely by training two generators and two discriminators together and adding a cycle-consistency constraint: translate summer to winter and back again, and you should recover the original image. That round-trip requirement is what keeps the translation faithful without a single paired example.',
    highlights: [
      'Complete CycleGAN: paired generators and discriminators, cycle-consistency loss and identity loss.',
      'Genuinely modular layout separating models, losses, data handling and utilities.',
      'Checkpointing and periodic sample grids so training progress is inspectable mid-run.',
      'TensorBoard monitoring of generator and discriminator losses.',
      'Drop-in support for custom domain folders beyond the Yosemite dataset.',
      'Benchmark table of time and cost per epoch across Colab T4, Lambda V100, AWS SageMaker and a local RTX 3090.'
    ],
    challenge:
      'Adversarial training is unstable and slow, and a full run is measured in tens of hours. The practical lesson was operational rather than architectural: without periodic sample grids and loss curves you cannot tell a model that is still converging from one that has collapsed until you have burned a day of GPU time. Benchmarking the real cost across platforms first made it clear which experiments were actually affordable.',
    deepDive: [
        {
            "kind": "prose",
            "heading": "Translation without pairs",
            "body": "Supervised image translation needs the same scene captured in both domains — the identical Yosemite valley, identical angle, once in July and once in January. That dataset essentially does not exist. CycleGAN removes the requirement by training two generators in opposite directions and constraining them with a round trip."
        },
        {
            "kind": "formula",
            "tex": "\\mathcal{L}_{\\text{cyc}}(G,F) = \\mathbb{E}\\big[\\lVert F(G(x)) - x \\rVert_1\\big] + \\mathbb{E}\\big[\\lVert G(F(y)) - y \\rVert_1\\big]",
            "caption": "Cycle-consistency loss. Translate summer to winter and back, and you should recover the original photograph. This round-trip constraint is what keeps the mapping faithful without a single paired example."
        },
        {
            "kind": "prose",
            "heading": "What adversarial training actually costs",
            "body": "The practical lesson was operational rather than architectural. A full run is measured in tens of hours, and without periodic sample grids and loss curves you cannot distinguish a model that is still converging from one that has already collapsed — until you have burned a day of GPU time finding out. Checkpointing and TensorBoard monitoring are not conveniences here; they are what makes the experiment affordable."
        },
        {
            "kind": "table",
            "caption": "Benchmarked before committing to a platform — cost per epoch decides which experiments are worth running.",
            "head": [
                "Platform",
                "Notes"
            ],
            "rows": [
                [
                    "Colab T4",
                    "Cheapest per hour, slowest per epoch"
                ],
                [
                    "Lambda V100",
                    "Best balance of the four"
                ],
                [
                    "AWS SageMaker",
                    "Most operational overhead"
                ],
                [
                    "Local RTX 3090",
                    "No marginal cost, fixed capital cost"
                ]
            ]
        }
    ]
  },
  {
    id: 'wikipedia-summarizer',
    recent: false,
    context: 'NLP',
    title: 'Wikipedia Summarizer',
    tagline: 'Three summarisation strategies, side by side.',
    year: '2025',
    role: 'Solo project',
    featured: false,
    summary:
      'A comparative text-summarisation tool that condenses any Wikipedia article three ways at once — LexRank, LSA and BART — putting extractive and abstractive approaches side by side on the same input.',
    tech: ['Python', 'Transformers', 'NLTK', 'sumy'],
    repo: 'https://github.com/akshayaa-403/Wikipedia-Summarizer',
    demo: null,
    overview:
      'Summarisation splits into two families, and the difference is easiest to feel by comparison. Extractive methods select the most representative existing sentences: LexRank ranks them with a graph-based algorithm over sentence similarity, while LSA uses singular value decomposition to find latent topics and pick sentences covering them. Abstractive methods generate new text — BART, a pre-trained transformer, writes a summary in its own words. This tool fetches an article and runs all three, so the tradeoffs are visible on one input.',
    highlights: [
      'Fetches article content directly by page name.',
      'LexRank extractive summarisation via graph-based sentence ranking.',
      'LSA extractive summarisation using SVD-based topic modelling.',
      'BART abstractive summarisation producing newly generated text.',
      'All three summaries printed together for direct comparison.'
    ],
    challenge:
      'BART accepts about 1024 tokens, which a long Wikipedia article exceeds comfortably, so abstractive output degrades on exactly the documents that most need summarising while the extractive methods scale fine. The repo documents that limit rather than hiding it — the honest conclusion is that method choice depends on document length, not that one approach wins outright.',
    deepDive: [
        {
            "kind": "prose",
            "heading": "Two families, one input",
            "body": "Summarisation splits cleanly in two, and the difference is easiest to feel by direct comparison rather than description. Extractive methods select existing sentences. Abstractive methods generate new ones. This tool fetches an article and runs three summarisers over it at once, so the tradeoff is visible on the same text."
        },
        {
            "kind": "table",
            "caption": "The three approaches and how each decides what matters.",
            "head": [
                "Method",
                "Family",
                "How it selects"
            ],
            "rows": [
                [
                    "LexRank",
                    "Extractive",
                    "Graph centrality over a sentence-similarity matrix — the most 'connected' sentences win"
                ],
                [
                    "LSA",
                    "Extractive",
                    "SVD over the term-sentence matrix; picks sentences covering the strongest latent topics"
                ],
                [
                    "BART",
                    "Abstractive",
                    "Pre-trained transformer generates new text conditioned on the article"
                ]
            ]
        },
        {
            "kind": "prose",
            "heading": "The limit worth documenting",
            "body": "BART accepts roughly 1024 tokens. A substantial Wikipedia article exceeds that comfortably, so abstractive quality degrades on exactly the documents that most need summarising, while the extractive methods scale without complaint. The honest conclusion is not that one method wins — it is that method choice depends on document length, and the repo says so rather than hiding it."
        }
    ]
  },
  {
    "id": "agent-project",
    "recent": false,
    "context": "LLM systems",
    "title": "Autonomous Document Agent",
    "tagline": "Plan, execute, reflect — a local-LLM agent loop.",
    "year": "2026",
    "role": "Solo project",
    "featured": false,
    "summary": "A self-directing agent that decomposes a plain-English request into a task list, executes each step, critiques its own work, and synthesises the results into a formatted Word document — running entirely against a local Llama model with no external API.",
    "tech": [
      "Python",
      "FastAPI",
      "Ollama",
      "Llama 3.2",
      "python-docx",
      "Pydantic"
    ],
    "repo": "https://github.com/akshayaa-403/agent_project",
    "demo": null,
    "overview": "Most agent demos are a single prompt wearing a costume. This one implements the actual loop: a planner turns a request into discrete tasks, an executor dispatches each to a tool, a reflection pass asks whether the plan was sufficient and can append work, and a synthesis pass writes the final document. It runs on Ollama against a local Llama 3.2, so there is no API key, no per-token cost, and nothing leaves the machine.",
    "highlights": [
      "Four-stage loop — plan, execute, reflect, synthesise — rather than a single generation.",
      "Self-critique step that can add a task the original plan missed, then execute it.",
      "Tool dispatch by task intent, routing research and drafting steps differently.",
      "Word-document generation via python-docx, with markdown stripped to clean prose.",
      "FastAPI service with typed Pydantic request and response models, plus a download endpoint.",
      "Fully local: Ollama and Llama 3.2, no external API and no key management."
    ],
    "challenge": "An LLM asked for a Python list will often return prose, a numbered list, or a list wrapped in commentary — and any of those breaks a naive parse. The planner tries a structured parse first, then falls back to line-by-line extraction that strips numbering and bullet markers before accepting each line as a task. It is unglamorous defensive code, and it is the difference between an agent that works on a demo prompt and one that survives arbitrary input.",
    "deepDive": [
      {
        "kind": "prose",
        "heading": "The loop",
        "body": "The agent is a state machine over four stages, and each stage feeds the next. What makes it an agent rather than a pipeline is the reflection step: after execution, the model is shown its own plan and its own results and asked whether anything is missing. If it names a gap, that becomes a new task and gets executed before synthesis."
      },
      {
        "kind": "steps",
        "heading": "Four stages",
        "items": [
          {
            "t": "Plan",
            "d": "The request goes to the planner prompt, which returns a list of self-contained, actionable tasks."
          },
          {
            "t": "Execute",
            "d": "Each task is dispatched by intent — research, drafting, or generic execution — and its result recorded."
          },
          {
            "t": "Reflect",
            "d": "The model reviews plan and results together and either replies COMPLETE or names one more task, which is then executed."
          },
          {
            "t": "Synthesise",
            "d": "All raw results go to a report-writer prompt, and the output is written to a .docx with headings and structure."
          }
        ]
      },
      {
        "kind": "code",
        "lang": "python",
        "caption": "The whole loop, from agent.py — deliberately small enough to read in one sitting.",
        "code": "def run(self, request: str) -> Dict[str, Any]:\n    plan = self.plan_tasks(request)\n    for task in plan:\n        self.execute_task(task)\n    reflection_msg = self.reflect_and_improve()\n    doc_path = self.generate_final_document(request)\n    return {\n        \"plan\": plan,\n        \"results\": self.results,\n        \"reflection\": reflection_msg,\n        \"document_path\": doc_path,\n    }"
      },
      {
        "kind": "prose",
        "heading": "Parsing a model that will not follow instructions",
        "body": "The planner prompt says “output ONLY the list.” Models comply inconsistently. The parser therefore attempts a structured read, and on failure degrades to reading line by line, stripping leading numbering and bullet glyphs before treating what remains as a task. Handling that gracefully is most of what separates a working agent from a fragile one."
      },
      {
        "kind": "code",
        "lang": "python",
        "caption": "Structured parse first, line-wise recovery second.",
        "code": "try:\n    plan = eval(plan_text) if plan_text.strip().startswith('[') else []\nexcept Exception:\n    plan = []\n    for line in plan_text.strip().split('\\n'):\n        line = re.sub(r'^\\d+\\.\\s*', '', line)   # \"1. \"\n        line = re.sub(r'^-\\s*', '', line)        # \"- \"\n        if line.strip():\n            plan.append(line.strip())"
      },
      {
        "kind": "prose",
        "heading": "Why local",
        "body": "Running against Ollama rather than a hosted API means no key to manage, no per-token cost while iterating on prompts, and no document content leaving the machine — which matters for the kind of business writing this is aimed at. The tradeoff is that output quality is bounded by what a local Llama 3.2 can do, and the research tool is currently a stub rather than a real retrieval step."
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) { module.exports = projects; }
