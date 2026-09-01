/* Project content. Single source of truth for cards (index) and detail pages
   (project.html). Copy is written from what each repo actually contains. */
const projects = [
  {
    "id": "quantamental-screener",
    "recent": true,
    "context": "Solo project",
    "title": "Quantamental Screener",
    "tagline": "Multi-factor equity screening with news sentiment.",
    "year": "2026",
    "role": "Solo project",
    "summary": "A multi-factor stock screener that ranks S&P 500 equities by blending technical signals with ensemble news sentiment, backed by Redis caching, historical backtesting, and an interactive Streamlit dashboard.",
    "tech": [
      "Python",
      "Pandas",
      "ta",
      "Streamlit",
      "yfinance",
      "Redis",
      "Docker",
      "pydantic-settings"
    ],
    "repo": "https://github.com/akshayaa-403/quantamental-screener",
    "demo": "https://quantamental-screener.streamlit.app",
    "overview": "Most screeners look at either price action or headlines, never both. Quantamental combines the two: a quantitative factor model over momentum, volume and volatility, plus a sentiment score derived from recent news for each ticker. The four factors are normalised and combined into a single ranking score, so a name only rises to the top when the technicals and the narrative agree.",
    "highlights": [
      "Four factors — momentum, volume, volatility and sentiment — z-scored across the universe each day, clipped to +/-3, then blended by weight into one composite score.",
      "Factor weights, universe size and backtest parameters are all pydantic-settings config, overridable by environment variable or the dashboard's live sliders.",
      "Ensemble sentiment over VADER and TextBlob by default, with FinBERT available as an opt-in upgrade.",
      "Weekly-rebalancing backtest reporting return, excess return, Sharpe, max drawdown, volatility and hit rate against the S&P 500.",
      "Opt-in Redis caching with per-type TTLs (prices 4h, sentiment 7d, factors 1d) so repeated screens skip the market-data and news APIs.",
      "Multiple data sources — yfinance, Alpha Vantage, Polygon — and NewsAPI with a yfinance-news fallback.",
      "Deterministic offline demo mode, a pytest suite, and CI that deliberately excludes the heavy ML stack so it stays fast."
    ],
    "challenge": "Streamlit Community Cloud allows roughly 1 GB of memory and FinBERT alone does not fit comfortably alongside the data layer, so the sentiment model tier became configuration: lexicon scorers by default to keep the hosted app inside budget, FinBERT one environment variable away for local runs. The other free-tier problem was hibernation — Community Cloud sleeps an idle app, so a cron workflow drives headless Chrome against it every ten hours to keep it awake. Neither is glamorous; both are the difference between a demo that loads and a demo that 404s when someone actually clicks the link.",
    "deepDive": [
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
        "heading": "Measured against a benchmark",
        "body": "A ranking model is only a claim until it is tested against realised returns. The backtest rebalances weekly into the top-ranked names and reports the result next to the S&P 500, with Sharpe, max drawdown, volatility and hit rate alongside — so the ranking is judged on risk-adjusted terms rather than a single return figure."
      },
      {
        "kind": "figure",
        "src": "public/assets/projects/quant-backtest.webp",
        "alt": "Backtest performance panel: 19.70 percent strategy return against 21.99 percent benchmark, Sharpe 1.20, max drawdown -10.07 percent, and a cumulative performance chart",
        "caption": "Backtest output: 19.70% strategy return against the benchmark’s 21.99%, Sharpe 1.20, max drawdown −10.07%. Every figure the model produces is reported in one panel, benchmark included."
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
    ],
    "iconDark": true,
    "hoverShots": 3
  },
  {
    "id": "arteza",
    "recent": false,
    "context": "Client work",
    "title": "Arteza",
    "tagline": "An online gallery and shop for an original-art studio.",
    "year": "2026",
    "role": "Design & build",
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
      }
    ]
  },
  {
    "id": "phase-contrast-denoising",
    "recent": false,
    "context": "Research tool",
    "title": "Phase-Contrast Clean-Up Pipeline",
    "tagline": "Removing halo artifacts from microscopy images.",
    "year": "2026",
    "role": "Solo project",
    "summary": "A hybrid classical-CV and deep-learning pipeline that suppresses the halo artifact in phase-contrast microscopy and lifts cell contrast, shipping a pre-trained fp16 model so inference works with zero setup.",
    "tech": [
      "Python",
      "PyTorch",
      "OpenCV",
      "Gradio",
      "JavaScript",
      "TensorBoard"
    ],
    "repo": "https://github.com/akshayaa-403/phase-contrast-denoising",
    "demo": "https://akshayaa-403.github.io/phase-contrast-denoising/docs/",
    "overview": "Phase-contrast microscopy makes transparent cells visible, but it introduces a bright halo around every object that confuses downstream segmentation. This pipeline offers two modes. A fast classical path uses Difference-of-Gaussians to suppress the halo and CLAHE to restore local contrast, with no model required. A hybrid path runs that same front-end and then applies a residual U-Net that predicts the leftover artifact and subtracts it, so the cleaned image is the input minus the predicted residual.",
    "highlights": [
      "Two selectable modes: classical CV only for speed, or CV plus residual U-Net for quality.",
      "Ships a pre-trained fp16 checkpoint, so hybrid inference runs without any training step.",
      "Synthetic data generator produces paired clean and haloed images for supervised training.",
      "PSNR, SSIM and FLOPs reported per run, with an auto-generated Markdown report and figures.",
      "Gradio app for interactive before-and-after comparison.",
      "YAML-driven configuration and unit plus integration tests; runs on CPU, uses CUDA when present."
    ],
    "challenge": "Learning the cleaned image directly made the network fight to reproduce detail it had already been given. Predicting the residual instead — just the artifact to remove — meant the model only had to learn the error term, which trained faster and preserved cell structure far better. Shipping fp16 weights kept the checkpoint small enough to commit, so the project is runnable the moment it is cloned.",
    "deepDive": [
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
      },
      {
        "kind": "prose",
        "heading": "The classical pipeline, ported to the browser",
        "body": "The interactive demo is not a video. docs/cv.js is a hand port of the Python preprocessor to JavaScript — OpenCV's Gaussian kernel sizing, BORDER_REFLECT_101 edge handling, and the tile-histogram CLAHE from OpenCV's own clahe.cpp. Drag any parameter and the halo suppression recomputes live on the image, in about 100 ms at 256x256."
      },
      {
        "kind": "figure",
        "src": "public/assets/projects/phase-demo-metrics.webp",
        "alt": "Interactive demo showing five panels from input through DoG and CLAHE to hybrid U-Net and ground truth, a measured PSNR/SSIM table, and five parameter sliders",
        "caption": "Five stages side by side, measured. The three left panels compute live as you drag; the U-Net column is precomputed, and the page says so."
      },
      {
        "kind": "prose",
        "heading": "The port is verified, not asserted",
        "body": "A JavaScript reimplementation of an OpenCV pipeline is only worth anything if it actually matches. scripts/verify_web_pipeline.py runs both implementations over the same images and fails on divergence: they agree to roughly 50 dB PSNR, with a maximum per-pixel difference of about 0.016 of full scale from tile-boundary interpolation, and the JavaScript PSNR and SSIM match scikit-image exactly to five decimals."
      },
      {
        "kind": "prose",
        "heading": "What the U-Net cannot do in a browser",
        "body": "At 31M parameters the model is a ~124 MB float32 download and far too slow for WebAssembly, so its output is precomputed and served as an image, labelled as precomputed rather than passed off as live. Uploads get no-reference metrics instead — edge energy from a Sobel gradient for membrane detail, and background variance over the flattest quarter of an 8x8 tiling for empty space. Read together they answer “did the halo go”, which is a weaker claim than fidelity to a target, and the page says that too."
      },
      {
        "kind": "prose",
        "heading": "What PSNR actually measures",
        "body": "PSNR compares absolute intensities, and CLAHE deliberately rewrites the global tone curve — so a visibly cleaner image can sit further from the target in absolute terms. The residual U-Net is trained against that target, so it stays on the intensity scale PSNR rewards. Reading the two stages side by side is a clean demonstration of why one number is a poor proxy for “does this help my segmentation”, which is why the pipeline reports SSIM and no-reference metrics too."
      },
      {
        "kind": "table",
        "caption": "Mean over six samples. The classical and hybrid stages optimise for different things, which is exactly what the two metrics show.",
        "head": [
          "Stage",
          "PSNR (dB)",
          "SSIM"
        ],
        "rows": [
          [
            "Raw noisy input",
            "12.87",
            "0.2062"
          ],
          [
            "Classical (DoG + CLAHE)",
            "7.71",
            "0.1029"
          ],
          [
            "Hybrid (residual U-Net)",
            "20.62",
            "0.3599"
          ]
        ]
      },
      {
        "kind": "formula",
        "tex": "\\text{dog} = G_{\\sigma_1}(x) - G_{\\sigma_2}(x) \\qquad \\text{enhanced} = x - \\alpha \\cdot \\text{dog}, \\quad \\sigma_2 > \\sigma_1",
        "caption": "The halo is a broad low-frequency ring while the cell body carries the high-frequency detail, so blurring at two scales separates them. sigma1 = 1.0 keeps the cell, sigma2 = 8.0 is wide enough to straddle the halo, and subtracting alpha = 0.6 of their difference removes the ring without hollowing the cell out."
      }
    ]
  },
  {
    "id": "anttodo",
    "recent": true,
    "context": "Solo project",
    "title": "Ant Colony Task Scheduler",
    "tagline": "Your to-do list as a routing problem, solved live.",
    "year": "2026",
    "role": "Solo project",
    "summary": "An interactive visualiser that reframes a day of tasks as a routing problem and lets a colony of virtual ants converge on an order in the browser — with two problem formulations, live-tunable parameters, dependency constraints, and a convergence chart you watch flatten.",
    "tech": [
      "JavaScript",
      "Ant Colony Optimization",
      "SVG",
      "HTML Canvas"
    ],
    "repo": "https://github.com/akshayaa-403/anttodo",
    "demo": "https://akshayaa-403.github.io/anttodo/",
    "overview": "Deciding what order to do things in is a routing problem in disguise. Enter a list of tasks and this tool treats each one as a city, then releases a colony of virtual ants that lay pheromone along good routes and evaporate it from bad ones. Over successive iterations the colony converges on an efficient ordering, and you watch the convergence happen rather than just receiving an answer.",
    "highlights": [
      "Two formulations sharing one ACO engine: Errand Mode solves a true travelling-salesman tour, Focus Mode solves task sequencing with due dates and durations.",
      "Every ACO parameter live-tunable — ant count, iterations, pheromone and heuristic weight, evaporation, deposit strength.",
      "Hard dependency constraints: declare that one task must precede another and the colony respects it.",
      "Three views of the same run — individual ants crawling, the aggregate pheromone field as a weighted graph, or both at once.",
      "Convergence chart plotting best cost per iteration, so you see the colony improve and then stall.",
      "Max-Min Ant System pheromone bounds, which is what stops premature lock-in on the first decent route.",
      "Pure HTML, CSS and JavaScript in a single file — no build step, no dependencies."
    ],
    "challenge": "Ant Colony Optimization is usually taught as a wall of notation. The interesting part is not the formula but the emergent behaviour: no single ant is smart, yet the colony reliably finds a good route. Exposing the parameters as controls turns the algorithm into something you can poke at — crank evaporation up and watch the colony forget good routes, drop the ant count and watch convergence get noisy.",
    "deepDive": [
      {
        "kind": "prose",
        "heading": "A to-do list is a routing problem",
        "body": "Given a set of tasks and a cost for moving between any two, finding the best order is the travelling salesman problem — NP-hard, so brute force dies fast: ten tasks already means 181,440 orderings. Ant Colony Optimization does not search exhaustively. It runs many cheap, slightly random agents and lets good routes reinforce themselves through pheromone."
      },
      {
        "kind": "figure",
        "src": "public/assets/projects/anttodo-app.webp",
        "alt": "The anttodo interface: a colony canvas with ten labelled task nodes, a task list with priorities and due times, dependency constraints, and colony parameter sliders",
        "caption": "Ten tasks as nodes, each carrying a priority, duration and due time. Errand Mode treats them as a true TSP; Focus Mode as a sequencing problem where lateness costs penalty points."
      },
      {
        "kind": "formula",
        "tex": "P(i \\to j) \\;=\\; \\frac{[\\tau_{ij}]^{\\alpha} \\cdot [\\eta_{ij}]^{\\beta}}{\\sum_{l \\in \\text{allowed}} [\\tau_{il}]^{\\alpha} \\cdot [\\eta_{il}]^{\\beta}}",
        "caption": "The transition rule. An ant at task i picks j with probability proportional to pheromone tau (what the colony has learned) raised to alpha, times heuristic desirability eta (how good this edge looks alone) raised to beta. alpha and beta set how much the colony trusts memory over instinct."
      },
      {
        "kind": "steps",
        "heading": "One iteration, end to end",
        "items": [
          {
            "t": "Construct",
            "d": "Every ant walks a complete tour, choosing each next task by the probability rule. No ant sees the global picture."
          },
          {
            "t": "Evaluate",
            "d": "Each tour is costed — travel effort in Errand Mode, or lateness and priority penalties in Focus Mode."
          },
          {
            "t": "Evaporate",
            "d": "All pheromone decays by rho. Without this, early mistakes would persist forever."
          },
          {
            "t": "Deposit",
            "d": "The global-best tour lays 1/cost on each of its edges, so better tours leave stronger trails."
          },
          {
            "t": "Clamp",
            "d": "Pheromone is bounded to [tau_min, tau_max] — the Max-Min Ant System rule, and the thing that prevents premature convergence."
          }
        ]
      },
      {
        "kind": "figure",
        "src": "public/assets/projects/anttodo-converged.webp",
        "alt": "The colony after 100 iterations: a numbered route through all ten tasks drawn over a green pheromone field, with best cost 50.1 and a flattened convergence chart",
        "caption": "After 100 iterations: best cost 50.1, the route numbered 1 to 10, and the pheromone field showing which edges the colony committed to. The strong green edges are consensus; the faint ones are roads not taken."
      },
      {
        "kind": "prose",
        "heading": "Why pheromone is bounded",
        "body": "Left unbounded, one early trail compounds and the colony converges on the first decent answer it finds. Max-Min Ant System clamps pheromone to a bounded range with tau_max tied to the current best cost, and lets only the global best deposit — which keeps exploration alive for the full run. The repo verifies it: after 150 iterations pheromone is still finite and still inside its bounds."
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
            "alpha",
            "Pheromone weight",
            "Ants trust colony memory; faster convergence, higher risk of locking in early"
          ],
          [
            "beta",
            "Heuristic weight",
            "Ants trust local desirability; greedier, less exploratory"
          ],
          [
            "rho",
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
        "body": "ACO is usually taught as a wall of notation. The interesting property is emergent: no individual ant is intelligent, yet the colony reliably finds a good route. Making every parameter live-tunable turns the algorithm into something you can poke — crank evaporation and watch the colony forget, drop the ant count and watch convergence get noisy. That teaches more than the equation does."
      }
    ],
    "hoverShots": 2
  },
  {
    "id": "habita",
    "recent": true,
    "context": "Solo project",
    "title": "Habita",
    "tagline": "Eisenhower matrix that writes to your real calendar.",
    "year": "2026",
    "role": "Solo project",
    "summary": "An Android task manager built on the Eisenhower Matrix. Sort tasks into four urgency-importance quadrants, then drag them onto a day timeline that writes real events into the phone’s own calendar — so time you set aside shows up wherever you already look, not only inside the app.",
    "tech": [
      "JavaScript (ES6)",
      "CSS Grid",
      "SVG",
      "Capacitor",
      "Android Calendar API",
      "localStorage"
    ],
    "repo": "https://github.com/akshayaa-403/Habita",
    "demo": "https://akshayaa-403.github.io/Habita/src/",
    "overview": "A flat to-do list treats a tax deadline and a hobby idea as equals. Habita sorts every task into one of the Eisenhower Matrix quadrants — urgent and important, important but not urgent, urgent but not important, neither — so priority is a property of where a task sits rather than something you have to hold in your head. Each quadrant carries an SVG progress ring that fills as you complete work inside it.",
    "highlights": [
      "Four colour-coded quadrants — Focus, Backburner, Fit In, Goals — each with a live SVG progress ring.",
      "Day timeline: a 24-hour grid with 15-minute snapping; drag a waiting task onto an hour to block out time for it.",
      "Calendar sync both ways — every scheduled task becomes a real tinted event, and the day view reads existing events back so you can see what a slot would collide with.",
      "Tap to auto-place: drops a task into the earliest slot that clears both your other blocks and your existing calendar.",
      "Drag to move a block, pull its bottom edge to change how long it takes; the calendar event follows.",
      "Haptics through native Capacitor on Android, falling back to the Web Vibration API in browsers.",
      "State persisted to localStorage with shape validation and migration, so an old save can never crash a newer build."
    ],
    "challenge": "A to-do app that only knows about itself is another place to check. The hard part was making Habita write into the calendar the user already lives in — and read it back, so scheduling a task can account for the meeting already sitting in that slot. That meant a real Android calendar integration through Capacitor rather than a self-contained store, and it changes what the app is: not a list that tracks intentions, but a tool that commits them to time. The browser build degrades honestly, labelling itself “device calendar unavailable” instead of pretending to sync.",
    "deepDive": [
      {
        "kind": "prose",
        "heading": "Priority as position, not as a field",
        "body": "A flat list treats a tax deadline and a hobby idea as equals. Habita places every task into one of the Eisenhower quadrants, so priority is expressed by where a task sits rather than by a property you have to read and interpret. The decision you make when adding a task — is this urgent, is this important — is the same decision the layout then encodes."
      },
      {
        "kind": "table",
        "caption": "The four quadrants, and the name each one gets in the app.",
        "head": [
          "",
          "Urgent",
          "Not urgent"
        ],
        "rows": [
          [
            "Important",
            "Focus — do it now",
            "Goals — schedule it"
          ],
          [
            "Not important",
            "Fit In — squeeze it in",
            "Backburner — let it wait"
          ]
        ]
      },
      {
        "kind": "figure",
        "src": "public/assets/projects/habita-views.webp",
        "alt": "Two phone screens side by side: the four-quadrant matrix with progress rings, and the day timeline with hour rows and a current-time marker",
        "caption": "Two views, one model. The matrix decides what matters; the day view decides when it happens. The red line is now."
      },
      {
        "kind": "prose",
        "heading": "Progress rings without a chart library",
        "body": "Each quadrant carries a ring that fills as its tasks complete. It is a single SVG circle animated through stroke-dasharray — the dash pattern is set to the circumference, and the offset moves from full circumference (empty) to zero (complete). No dependency, no canvas, and it scales cleanly at any size."
      },
      {
        "kind": "formula",
        "tex": "C = 2\\pi r \\qquad \\text{offset} = C \\times \\left(1 - \\frac{\\text{done}}{\\text{total}}\\right)",
        "caption": "Circumference sets the dash length; the offset is driven by completion ratio. Animating stroke-dashoffset gives a smooth fill for free."
      },
      {
        "kind": "prose",
        "heading": "Scheduling against reality",
        "body": "The day view is not a private timeline. It reads the device calendar and draws existing events in their own lane, so dragging a task onto 3pm shows you the meeting already there. Auto-place uses the same data: it finds the earliest slot that clears both your Habita blocks and your real events. That is the difference between a planner that records intentions and one that can actually be trusted."
      },
      {
        "kind": "prose",
        "heading": "Native feel, no build step",
        "body": "The goal was something that feels native on a phone while staying a plain web project. The JavaScript is split into single-responsibility ES6 modules — theming, storage, tasks, UI, progress, calendar — served as-is with no bundler, then wrapped for Android with Capacitor. Capacitor Haptics gives real vibration on device; the Web Vibration API covers browsers."
      },
      {
        "kind": "prose",
        "heading": "Never let old data break a new build",
        "body": "State persists to localStorage, so a user can return weeks later carrying a shape the current code no longer expects. Habita validates the stored object on load and migrates older shapes forward rather than trusting it — a stale save degrades into a correct one instead of a crash."
      }
    ],
    "hoverShots": 2
  },
  {
    "id": "yosemite-cyclegan",
    "recent": false,
    "context": "Deep learning",
    "title": "Yosemite CycleGAN",
    "tagline": "Summer to winter, from unpaired photos.",
    "year": "2026",
    "role": "Solo project",
    "summary": "A modular from-scratch PyTorch CycleGAN that translates Yosemite summer landscapes into winter scenes using only unpaired images, with full cycle-consistency training and benchmarked cost estimates across four GPU platforms.",
    "tech": [
      "Python",
      "PyTorch",
      "CycleGAN",
      "TensorBoard"
    ],
    "repo": "https://github.com/akshayaa-403/yosemite-image-translation-gan",
    "demo": null,
    "overview": "Paired training data — the same scene photographed in both summer and winter from an identical angle — barely exists. CycleGAN sidesteps the requirement entirely by training two generators and two discriminators together and adding a cycle-consistency constraint: translate summer to winter and back again, and you should recover the original image. That round-trip requirement is what keeps the translation faithful without a single paired example.",
    "highlights": [
      "Complete CycleGAN: paired generators and discriminators, cycle-consistency loss and identity loss.",
      "Genuinely modular layout separating models, losses, data handling and utilities.",
      "Checkpointing and periodic sample grids so training progress is inspectable mid-run.",
      "TensorBoard monitoring of generator and discriminator losses.",
      "Drop-in support for custom domain folders beyond the Yosemite dataset.",
      "Benchmark table of time and cost per epoch across Colab T4, Lambda V100, AWS SageMaker and a local RTX 3090."
    ],
    "challenge": "Adversarial training is unstable and slow, and a full run is measured in tens of hours. The practical lesson was operational rather than architectural: without periodic sample grids and loss curves you cannot tell a model that is still converging from one that has collapsed until you have burned a day of GPU time. Benchmarking the real cost across platforms first made it clear which experiments were actually affordable.",
    "deepDive": [
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
    "id": "wikipedia-summarizer",
    "recent": false,
    "context": "NLP",
    "title": "Wikipedia Summarizer",
    "tagline": "Four algorithms, one article, scored against the humans who wrote it.",
    "year": "2026",
    "role": "Solo project",
    "summary": "A static, dependency-free browser app that summarises any Wikipedia article four ways at once and scores each result with ROUGE against the article's own lead section — the summary Wikipedia's editors wrote — so the algorithms are measured against a human ceiling rather than each other.",
    "tech": [
      "JavaScript (ES modules)",
      "MediaWiki API",
      "ROUGE",
      "SVG",
      "Playwright"
    ],
    "repo": "https://github.com/akshayaa-403/Wikipedia-Summarizer",
    "demo": "https://akshayaa-403.github.io/Wikipedia-Summarizer/",
    "overview": "Summarisation demos usually show you one algorithm's output and leave you to guess whether it is any good. This one runs four extractive summarisers over the same article and grades all of them against a reference that already exists: Wikipedia's lead section, trimmed to the same word budget the algorithms get. Nothing is precomputed — type a title and the summaries, ROUGE scores and six charts are all calculated in the browser, around 60 ms for a 4,300-word article. No build step, no bundler, no runtime dependencies.",
    "highlights": [
      "Four algorithms on one input: TextRank (PageRank over a sentence-similarity graph), LSA (truncated SVD over the term-sentence matrix), Luhn (1958 significance windows) and MMR (relevance minus redundancy).",
      "Every summary ROUGE-scored against Wikipedia's own lead, trimmed to the same word budget — a human ceiling rather than an arbitrary target.",
      "One shared TF-IDF preprocessing pass feeds all four, so only the selection strategy differs and comparisons are honest.",
      "Six live charts: ROUGE F-measure, rank stability, coverage vs self-repetition, sentence-overlap heatmap, key terms captured, positional density.",
      "Self-contained-opener rule rejects dangling referents from the first sentence — 11 of 20 test summaries opened that way before it existed.",
      "33-check Playwright suite driving real Chromium against the live MediaWiki API, run in CI.",
      "Zero dependencies and no build: ES modules served as static files, hand-rolled SVG charts, deployed to GitHub Pages."
    ],
    "challenge": "The first version leaned on BART for an abstractive summary, which meant a 1.6 GB checkpoint and a server — and abstractive quality collapsed on exactly the long articles that most need summarising, because they overflow the model's context window. Going extractive-only removed both problems at once: every algorithm now reads the document end to end with no window to overflow and nothing silently discarded, and the whole thing collapses to static files that cost nothing to host. The tradeoff is honest and stated in the repo — no summary here writes a new sentence.",
    "deepDive": [
      {
        "kind": "prose",
        "heading": "Scored against a human, not a rubric",
        "body": "Every Wikipedia article opens with a lead section that editors wrote as a summary of the body. That makes it a free, human-authored reference. The app trims the lead to the same word budget the algorithms get and computes ROUGE against it, so the question stops being “which output looks nicer” and becomes “how close does each algorithm get to the people who wrote the article.”"
      },
      {
        "kind": "figure",
        "src": "public/assets/projects/wiki-hero.webp",
        "alt": "Wikipedia Summarizer homepage: large serif headline reading 'Four algorithms summarize the same article', a search field containing Penguin, and Wikipedia's own summary shown as the scoring reference",
        "caption": "The reference is shown first and labelled as such: 231 words of Wikipedia's own lead, “the reference every score is measured against.”"
      },
      {
        "kind": "formula",
        "tex": "\\text{precision} = \\frac{|\\text{overlap}|}{|\\text{predicted}|} \\qquad \\text{recall} = \\frac{|\\text{overlap}|}{|\\text{reference}|} \\qquad F_1 = \\frac{2PR}{P + R}",
        "caption": "ROUGE-N as implemented, over n-gram overlap with the trimmed lead. ROUGE-L swaps n-grams for the longest common subsequence, computed with a rolling-row DP."
      },
      {
        "kind": "figure",
        "src": "public/assets/projects/wiki-algorithms.webp",
        "alt": "Four summaries side by side for the Penguin article, each with word count, reading ease, ROUGE-1, ROUGE-2, ROUGE-L and a percentage of the human ceiling",
        "caption": "All four outputs on one screen with their scores. TextRank reaches ROUGE-1 0.393 — 55% of the human ceiling; LSA 0.305, or 43%. Each also reports the time it took: 63 ms, 54 ms, 2 ms, 7 ms."
      },
      {
        "kind": "prose",
        "heading": "The four strategies",
        "body": "All four are extractive: they select existing sentences rather than generating new ones. What differs is how each decides what matters — and because they share one TF-IDF pass, a difference in output is a difference in strategy rather than in tokenisation."
      },
      {
        "kind": "table",
        "caption": "How each algorithm decides which sentences survive.",
        "head": [
          "Algorithm",
          "Selection rule",
          "Parameters"
        ],
        "rows": [
          [
            "TextRank",
            "PageRank over a graph of sentence similarities; most central sentences win",
            "damping 0.85, 60 iterations, converge at 1e-7"
          ],
          [
            "LSA",
            "Truncated SVD by power iteration with deflation; sentences covering the strongest latent topics",
            "4 topics"
          ],
          [
            "Luhn",
            "Densest window of high-frequency terms, the 1958 formulation",
            "top 12% of terms, up to 4 insignificant words between significant ones"
          ],
          [
            "MMR",
            "Relevance to the document minus redundancy against what it already picked",
            "lambda 0.5"
          ]
        ]
      },
      {
        "kind": "formula",
        "tex": "\\text{MMR} = \\arg\\max_{s} \\big[\\; \\lambda \\cdot \\text{sim}(s, D) \\;-\\; (1-\\lambda) \\cdot \\max_{s' \\in S} \\text{sim}(s, s') \\;\\big]",
        "caption": "Carbonell & Goldstein (1998). lambda balances relevance against novelty, and 0.5 is a measured choice not a default: at 0.7 and 0.9 MMR returned exactly TextRank's selection on the Roman Empire article (Jaccard 1.00). At 0.5 the overlap drops to 0.33 and MMR becomes its own algorithm again."
      },
      {
        "kind": "prose",
        "heading": "No algorithm wins",
        "body": "That is the finding, and it only shows up because all four run on the same input. MMR takes two of three benchmark articles and TextRank the third — and MMR goes from best on Penguin to worst on Roman Empire. The best algorithm reaches 56–67% of the human ceiling, which is a more useful number than any single ROUGE score."
      },
      {
        "kind": "table",
        "caption": "ROUGE-1 F-measure against the trimmed human lead. Benchmark figures measured in Python; the browser's ROUGE uses a light Porter approximation, so live numbers are indicative.",
        "head": [
          "Article",
          "Human ceiling",
          "TextRank",
          "LSA",
          "Luhn",
          "MMR"
        ],
        "rows": [
          [
            "Penguin",
            "0.709",
            "0.393",
            "0.305",
            "0.263",
            "0.400"
          ],
          [
            "Black hole",
            "0.474",
            "0.314",
            "0.269",
            "0.204",
            "0.317"
          ],
          [
            "Roman Empire",
            "0.380",
            "0.255",
            "0.222",
            "0.181",
            "0.188"
          ]
        ]
      },
      {
        "kind": "prose",
        "heading": "Why it is static",
        "body": "An abstractive model would mean a checkpoint download and a server to run it on. Staying extractive keeps the whole thing to ES modules and hand-rolled SVG served as files — free to host, instant to load, and nothing to keep patched. Even the charts are drawn by hand rather than pulling in a charting library."
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) { module.exports = projects; }
