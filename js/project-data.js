/* Project content. Single source of truth for cards (index) and detail pages
   (project.html). Copy is written from what each repo actually contains. */
const projects = [
  {
    "id": "quantamental-screener",
    /* What the home page's screen shows while this row is hovered, in place
       of the other column. One path or several; .mp4/.webm play as video,
       anything else is a still. These sit on the page's own paper with no
       panel behind them, so anything here wants a transparent or full-bleed
       background of its own. Not to be confused with "demo", which is the
       live deployment. */
    "screen": "public/assets/projects/quant-dashboard.webp",
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
    "created": "2025-09-22",
    "updated": "2026-08-22",
    "tags": [
      [
        "Factor investing",
        "https://en.wikipedia.org/wiki/Factor_investing"
      ],
      [
        "Sharpe ratio",
        "https://en.wikipedia.org/wiki/Sharpe_ratio"
      ],
      [
        "FinBERT",
        "https://arxiv.org/abs/1908.10063"
      ],
      [
        "VADER",
        "https://ojs.aaai.org/index.php/ICWSM/article/view/14550"
      ]
    ],
    "notes": {
      "overview": [
        [
          "never both",
          "the whole reason this exists"
        ],
        [
          "only rises to the top when the technicals and the narrative agree",
          "agreement is the signal. one without the other is noise"
        ]
      ],
      "challenge": [
        [
          "roughly 1 GB of memory",
          "the real constraint. everything after this follows from one number"
        ],
        [
          "Neither is glamorous",
          "true. but the link works when you click it, which is the point"
        ]
      ]
    },
    "deepDive": [
      {
        "kind": "prose",
        "heading": "Why I made it ask four questions instead of one",
        "body": "Most screeners I tried did one thing well and the other thing not at all. The technical ones would hand me a stock that was ripping upwards for a reason I'd have hated if I'd known it. The news-driven ones would hand me a story.\n\nSo this one asks four separate questions of every name in the universe on the same day. How hard has it been moving? How much of it has been changing hands? How violently? And what is being written about it?\n\nA name only reaches the top when the answers agree. That's the whole idea, and everything else in the project is plumbing for it."
      },
      {
        "kind": "diagram",
        "shape": "flow",
        "heading": "One day, end to end",
        "body": "Nothing in the pipeline looks at a stock on its own. Every step is cross-sectional — a name is judged against the rest of the universe on the same day, which is what makes the four factors comparable at the end.",
        "steps": [
          {
            "t": "Universe",
            "d": "S&P 500 constituents for the day"
          },
          {
            "t": "Four raw factors",
            "d": "momentum (21-day ROC), volume, volatility, sentiment"
          },
          {
            "t": "Z-score",
            "d": "per factor, across the universe, clipped to ±3"
          },
          {
            "t": "Weighted sum",
            "d": "0.40 / 0.30 / 0.20 / 0.10 by default"
          },
          {
            "t": "Rank",
            "d": "one composite, sorted"
          }
        ],
        "caption": "The order is the point: raw values live on incompatible scales, so the z-score has to happen before the weights mean anything."
      },
      {
        "kind": "formula",
        "tex": "z_f(i) \\;=\\; \\frac{x_f(i) - \\mu_f}{\\sigma_f}\\qquad\\text{Composite}(i) \\;=\\; \\sum_{f} w_f \\cdot z_f(i)",
        "caption": "Each factor f is z-scored across the universe, then combined as a weighted sum. Default weights: momentum 0.40, sentiment 0.30, volume 0.20, volatility 0.10 — all overridable by environment variable."
      },
      {
        "kind": "interactive",
        "widget": "weights",
        "heading": "Move a weight, watch the list disagree with you",
        "body": "The composite is a weighted sum of four z-scores, and the weights are a judgement, not a discovery. Drag one and the ranking re-sorts underneath you. Push sentiment to zero and the screener becomes a momentum model; push volatility up and the calm names climb.",
        "rowLabel": "Ticker",
        "scoreLabel": "Composite",
        "sliders": [
          {
            "key": "momentum",
            "label": "Momentum",
            "short": "Mom",
            "value": 0.4,
            "min": 0,
            "max": 1,
            "step": 0.05
          },
          {
            "key": "sentiment",
            "label": "Sentiment",
            "short": "Sent",
            "value": 0.3,
            "min": 0,
            "max": 1,
            "step": 0.05
          },
          {
            "key": "volume",
            "label": "Volume",
            "short": "Vol",
            "value": 0.2,
            "min": 0,
            "max": 1,
            "step": 0.05
          },
          {
            "key": "volatility",
            "label": "Volatility",
            "short": "Vty",
            "value": 0.1,
            "min": 0,
            "max": 1,
            "step": 0.05
          }
        ],
        "rows": [
          {
            "name": "ACN",
            "values": {
              "momentum": 2.44,
              "sentiment": 0.88,
              "volume": 0.31,
              "volatility": -0.22
            }
          },
          {
            "name": "NVDA",
            "values": {
              "momentum": 1.92,
              "sentiment": 1.41,
              "volume": 2.05,
              "volatility": -1.64
            }
          },
          {
            "name": "KO",
            "values": {
              "momentum": -0.31,
              "sentiment": 0.22,
              "volume": -0.74,
              "volatility": 1.58
            }
          },
          {
            "name": "TSLA",
            "values": {
              "momentum": 1.15,
              "sentiment": -1.02,
              "volume": 1.86,
              "volatility": -2.1
            }
          },
          {
            "name": "JNJ",
            "values": {
              "momentum": 0.08,
              "sentiment": -0.34,
              "volume": -0.51,
              "volatility": 1.22
            }
          }
        ],
        "caption": "A worked five-name cross-section. ACN's row is the run in the screenshot above — composite 0.983 on momentum 2.440 and sentiment 0.883; the other four are illustrative, so the arithmetic is the real arithmetic even though the day is not. Default weights are the repository's: momentum 0.40, sentiment 0.30, volume 0.20, volatility 0.10."
      },
      {
        "kind": "figure",
        "src": "public/assets/projects/quant-dashboard.webp",
        "alt": "Screener dashboard showing top stock recommendations ranked by composite score, with momentum, sentiment, volume and volatility columns",
        "caption": "The ranked output. ACN leads on a 0.983 composite — strong momentum (2.440) and positive sentiment (0.883) agreeing with each other, which is exactly the condition the model is built to surface."
      },
      {
        "kind": "prose",
        "heading": "The sentiment score is three models, not one",
        "body": "I didn't expect to need an ensemble here. I expected to pick the best scorer and move on.\n\nWhat changed my mind was watching them disagree in useful ways. VADER understands negation and intensifiers — it knows “not great” is not great. TextBlob is steadier on long, flat prose, where VADER keeps finding drama that isn't there. FinBERT is better than either on financial text, because that's what it was trained on.\n\nFinBERT is also the reason I couldn't just deploy this and forget about it, which is the next section."
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
        "heading": "I wanted to know if the list would actually have made money",
        "body": "Any model can produce a list. The interesting question is whether following it would have worked, and what it would have cost you in sleep.\n\nSo there's a backtest: weekly rebalance into the top-ranked names, reported next to the S&P 500. Not just the return — Sharpe, maximum drawdown, volatility and hit rate, all on one panel with the benchmark sitting right there.\n\nThe run in the screenshot below returns 19.70% against the benchmark's 21.99%. That is a loss. I left it on the page because a portfolio piece that only shows the runs that won isn't a portfolio piece, it's an advert."
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
        "heading": "The constraint that shaped everything: 1 GB",
        "body": "Streamlit Community Cloud gives you roughly a gigabyte of memory. FinBERT does not fit comfortably inside that alongside the data layer.\n\nI had three options. Drop sentiment. Ship something that dies under load. Or make the model tier a setting.\n\nIt became a setting. Lexicon scorers by default so the hosted app stays inside budget, FinBERT one environment variable away for anyone running it locally. The second free-tier problem was that Community Cloud puts an idle app to sleep, so a scheduled workflow drives headless Chrome at it every ten hours to keep it awake.\n\nNeither decision is clever. Both are the difference between a link that opens and a link that embarrasses you six months later."
      },
      {
        "kind": "prose",
        "heading": "What I'd do differently",
        "body": "The honest headline on this project is that the backtest lost: 19.70% against the benchmark's 21.99%. It is worth being precise about what that does and does not mean.\n\nIt is not evidence that the factors are worthless. Sharpe 1.20 with a −10.07% maximum drawdown is a smoother ride than the index had over the same window, which is what you would expect from a screen that down-weights volatility. What it underperformed on was raw return, in a period when the index was carried by a handful of very large names that a cross-sectional momentum screen keeps trimming back to average weight.\n\nSo the next thing I would test is not a different factor, it is a different weighting scheme. The 0.40 / 0.30 / 0.20 / 0.10 weights are a judgement I made once and never revisited, and the obvious experiment is to fit them on a rolling window instead of fixing them — then check whether the fitted weights are stable, because if they move every quarter the model is reading noise.\n\nThe second thing is the sentiment factor. It is the weakest-evidenced of the four: lexicon scorers over headline text, which is what fits inside the hosted app's memory budget. I would run the whole backtest again with FinBERT scoring locally and see whether the 0.30 weight survives contact with a better signal.\n\nAnd I would report the backtest over more than one window. One run over one period is an anecdote, however carefully it is measured."
      }
    ],
    "fragments": [
      "momentum",
      "21-day ROC",
      "z-score",
      "clipped to ±3",
      "cross-sectional",
      "composite",
      "sentiment",
      "VADER",
      "TextBlob",
      "FinBERT",
      "ensemble",
      "Sharpe 1.20",
      "max drawdown",
      "weekly rebalance",
      "S&P 500",
      "universe",
      "yfinance",
      "NewsAPI",
      "Redis",
      "TTL 4h",
      "pydantic-settings",
      "Streamlit",
      "one gigabyte",
      "hibernation",
      "headless Chrome",
      "factor weights",
      "the narrative agrees",
      "volatility",
      "volume",
      "backtest",
      "benchmark",
      "ranked",
      "a claim until tested"
    ],
    "metric": "Sharpe 1.20",
    "demo": "https://quantamental-screener.streamlit.app",
    "glance": {
      "problem": "Stock screeners look at price action or at headlines, never at both on the same day.",
      "built": "A cross-sectional four-factor model — momentum, volume, volatility and ensemble news sentiment — z-scored daily and blended into one rank, with a weekly-rebalance backtest and a Streamlit dashboard.",
      "result": "The backtest returns 19.70% against the S&P 500’s 21.99%, at Sharpe 1.20 and −10.07% maximum drawdown. The strategy lost to its benchmark, and the panel that says so is on the page."
    },
    "group": "research",
    "figures": [
      {
        "kind": "balance",
        "side": "l",
        "at": 0,
        "title": "Technicals against narrative",
        "note": "The beam is level only when the two factors agree, and agreement is the one condition this screener exists to find. The five names are the worked cross-section from the table below."
      },
      {
        "kind": "rank",
        "side": "r",
        "at": 3,
        "title": "Move the weight, lose the ranking",
        "note": "One weight, sliding between momentum and sentiment, and the ladder re-sorts under it. The arithmetic is the real composite."
      },
      {
        "kind": "race",
        "side": "l",
        "at": 8,
        "title": "The run that actually happened",
        "note": "Both curves were read back out of the backtest screenshot pixel by pixel with OpenCV and calibrated against the chart’s own gridlines — so this is the real run, not a redrawing of it. The strategy leads for seven months and still finishes behind."
      }
    ]
  },
  {
    "id": "phase-contrast-denoising",
    /* What the home page's screen shows while this row is hovered, in place
       of the other column. One path or several; .mp4/.webm play as video,
       anything else is a still. These sit on the page's own paper with no
       panel behind them, so anything here wants a transparent or full-bleed
       background of its own. Not to be confused with "demo", which is the
       live deployment. */
    "screen": "public/assets/projects/phase-demo-metrics.webp",
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
    "created": "2026-07-23",
    "updated": "2026-08-13",
    "tags": [
      [
        "Phase-contrast microscopy",
        "https://en.wikipedia.org/wiki/Phase-contrast_microscopy"
      ],
      [
        "U-Net",
        "https://arxiv.org/abs/1505.04597"
      ],
      [
        "Residual learning",
        "https://arxiv.org/abs/1512.03385"
      ],
      [
        "CLAHE",
        "https://en.wikipedia.org/wiki/Adaptive_histogram_equalization"
      ],
      [
        "Difference of Gaussians",
        "https://en.wikipedia.org/wiki/Difference_of_Gaussians"
      ]
    ],
    "notes": {
      "overview": [
        [
          "bright halo around every object",
          "invisible to you. fatal to the segmentation downstream"
        ],
        [
          "the input minus the predicted residual",
          "one subtraction. that is the whole trick"
        ]
      ],
      "challenge": [
        [
          "Predicting the residual instead",
          "the single decision that made this work"
        ],
        [
          "Shipping fp16 weights",
          "clone it and run it. no download step, no setup"
        ]
      ]
    },
    "deepDive": [
      {
        "kind": "prose",
        "heading": "The microscope adds something that isn't there",
        "body": "Phase-contrast microscopy makes transparent cells visible by turning differences in optical path into differences in brightness. It's a beautiful trick and it has a price: a bright ring around every edge.\n\nThat ring is called the halo, and it is not just cosmetic. It sits exactly where a segmentation algorithm goes looking for a boundary, so the software reads it as cell. Every count and every area you measure afterwards is wrong by however much of the collar got included.\n\nThe part that bothered me is that it's invisible to the person at the eyepiece and fatal to everything downstream."
      },
      {
        "kind": "interactive",
        "widget": "wipe",
        "heading": "Drag the line across a cell",
        "body": "Left of the divider is what the microscope produced. Right of it is what came out of hybrid mode. Look at the edges rather than the middle: the halo is the bright collar, and the thing to check is whether the collar went away without taking the boundary with it.",
        "a": {
          "src": "public/assets/projects/phase-wipe-noisy.webp",
          "alt": "Phase-contrast frame before processing, with bright halos around every cell",
          "label": "As captured"
        },
        "b": {
          "src": "public/assets/projects/phase-wipe-clean.webp",
          "alt": "The same frame after hybrid processing, halos suppressed and cell edges intact",
          "label": "Hybrid mode"
        },
        "controlLabel": "Wipe",
        "caption": "Sample img_0002 from the repository, before and after hybrid mode (classical front-end plus the residual U-Net). Both frames are the project's own output, not a re-render for this page."
      },
      {
        "kind": "steps",
        "heading": "Two modes, because not everyone has a GPU",
        "items": [
          {
            "t": "Classical (fast)",
            "d": "Difference-of-Gaussians suppresses the halo's spatial frequency band, then CLAHE restores local contrast. No model, no GPU, runs anywhere."
          },
          {
            "t": "Hybrid (better)",
            "d": "The same classical front-end, then a residual U-Net predicts what artifact remains and subtracts it."
          }
        ],
        "body": "The pipeline runs in either of two modes and they share a front end.\n\n`cv_only` is OpenCV alone: a difference-of-Gaussians estimate of the halo as a background field, subtracted, then CLAHE to lift what's left. Fast, no model, runs anywhere.\n\n`hybrid` adds a residual U-Net on top of that. It's better, and it needs weights — which ship in the repository at fp16, so hybrid mode works on a fresh clone with no download step."
      },
      {
        "kind": "diagram",
        "shape": "flow",
        "heading": "What happens to a frame",
        "body": "Hybrid mode is two passes, not one model. The classical front-end removes what can be described in closed form, and the network is only asked for what is left.",
        "steps": [
          {
            "t": "As captured",
            "d": "phase-contrast frame, halo at every edge"
          },
          {
            "t": "Difference of Gaussians",
            "d": "estimates the halo as a background field"
          },
          {
            "t": "CLAHE",
            "d": "lifts local cell contrast"
          },
          {
            "t": "U-Net",
            "d": "predicts the residual that is still wrong"
          },
          {
            "t": "Subtract",
            "d": "cleaned = input − residual"
          }
        ],
        "caption": "Modes share the first three steps; cv_only stops after CLAHE. The fp16 weights ship in the repository, so hybrid runs on a clone."
      },
      {
        "kind": "formula",
        "tex": "\\hat{y} \\;=\\; x \\;-\\; f_{\\theta}(x)",
        "caption": "The residual formulation. The network predicts the artifact f(x), not the clean image — the output is the input minus that prediction. This is the single decision that made the model work."
      },
      {
        "kind": "prose",
        "heading": "The network never draws a cell",
        "body": "This is the design decision I'm most pleased with, and it took me a while to get to.\n\nThe obvious approach is to train a model that takes a haloed image and outputs a clean one. I tried that. The problem is that you're asking the network to reproduce the entire image, most of which the input already contains, and it spends its capacity relearning things it was handed.\n\nSo the network is never asked for a cell. It's asked for the residual — what's left over after the classical front end has done what it can — and the cleaned image is the input minus that prediction.\n\nThe residual is small, sparse and structured. A cell is large and varied. That's a much easier problem, and it fails in a much better way: it leaves some halo behind rather than inventing a cell that was never there."
      },
      {
        "kind": "prose",
        "heading": "If it doesn't run on clone, it doesn't exist",
        "body": "I've lost hours to research code that needs a checkpoint from a dead Dropbox link.\n\nSo the weights are in the repo, at fp16 to keep them small. There's a synthetic dataset generator so you don't need real microscopy to see it work. `python main.py --mode hybrid` produces cleaned images and a report, on CPU, on a laptop."
      },
      {
        "kind": "prose",
        "heading": "Porting the classical half to the browser",
        "body": "The classical front end is all arithmetic — Gaussians, a subtraction, a histogram equalisation. None of it needs Python.\n\nSo `docs/` is a static page that runs exactly those steps in JavaScript on an image you drop in. No server, no upload, nothing leaves your machine. It's the demo I'd want to try before cloning someone's repo."
      },
      {
        "kind": "figure",
        "src": "public/assets/projects/phase-demo-metrics.webp",
        "alt": "Interactive demo showing five panels from input through DoG and CLAHE to hybrid U-Net and ground truth, a measured PSNR/SSIM table, and five parameter sliders",
        "caption": "Five stages side by side, measured. The three left panels compute live as you drag; the U-Net column is precomputed, and the page says so."
      },
      {
        "kind": "prose",
        "heading": "How I know the port didn't drift",
        "body": "Two implementations of the same maths will diverge quietly, and you won't notice until someone's numbers don't reproduce.\n\nSo the browser version isn't asserted to match, it's measured against the Python one on the same inputs. That check is the only reason I'm willing to claim they're the same pipeline."
      },
      {
        "kind": "prose",
        "heading": "What the browser version can't do",
        "body": "It can't run the U-Net. That's not a limitation I'm working around, it's the honest boundary: the browser demo is the classical half, and it says so on the page rather than quietly producing worse results and letting you assume you saw the real thing."
      },
      {
        "kind": "prose",
        "heading": "PSNR is a worse metric than it looks",
        "body": "PSNR is a log of mean squared error, so it rewards being close everywhere and says nothing about being right where it matters.\n\nHere's the trap: a pipeline that just blurs the image slightly will often score well, because blur is small error spread thin. That is the exact opposite of what this is for.\n\nSo the report carries SSIM next to it, and the images are shown rather than summarised. The wipe above is the real evidence. The numbers are corroboration."
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
      },
      {
        "kind": "prose",
        "heading": "What I'd do differently",
        "body": "Six samples is not an evaluation, it is a sanity check. The PSNR and SSIM numbers in the table above are the mean over six images, and I would not draw a conclusion about a denoiser from six images if someone else showed them to me. A proper version measures over a held-out set in the tens or hundreds, and reports the spread rather than only the mean.\n\nI would also stop leaning on PSNR at all. I say in the case study that it is a worse metric than it looks, and then report it anyway because it is what the literature reports. The thing anyone actually wants to know is whether segmentation gets better downstream — so the right measurement is to run a standard segmentation on the raw and the cleaned frames and compare the masks against hand-drawn ones. That is a harder experiment and it is the one that means something.\n\nAnd I would train on real paired data rather than a synthetic halo model. The network learns the halo I simulated, which is a defensible approximation of the optics, and exactly as good as that approximation is."
      }
    ],
    "fragments": [
      "the halo",
      "phase contrast",
      "optical path",
      "bright collar",
      "difference of Gaussians",
      "CLAHE",
      "residual",
      "U-Net",
      "fp16",
      "cleaned = input − residual",
      "segmentation",
      "boundary",
      "PSNR",
      "SSIM",
      "mean squared error",
      "blur scores well",
      "cv_only",
      "hybrid",
      "Gradio",
      "runs on a clone",
      "synthetic ground truth",
      "microscopy",
      "artifact",
      "invisible to the eye",
      "fatal downstream",
      "OpenCV",
      "PyTorch",
      "the mistake, not the picture",
      "parity",
      "ported to the browser"
    ],
    "metric": "PSNR 12.87 → 20.62 dB",
    "glance": {
      "problem": "Phase-contrast microscopy puts a bright halo around every cell — an artifact of the optics, not a feature of the sample — and it defeats the thresholding that segmentation depends on.",
      "built": "A hybrid pipeline: classical difference-of-Gaussians and CLAHE, plus a residual U-Net that predicts the halo rather than the cell, shipped with fp16 weights so inference needs no setup, and a browser port of the classical half.",
      "result": "Mean PSNR over six samples rises from 12.87 dB raw to 20.62 dB hybrid, SSIM from 0.206 to 0.360. The classical-only stage scores worse on PSNR than the raw input, which is the metric behaving correctly rather than the stage failing."
    },
    "group": "research",
    "figures": [
      {
        "kind": "halo",
        "side": "l",
        "at": 0,
        "title": "Her own cells, losing the collar",
        "note": "Not drawn cells: these are the real boundaries traced out of the noisy frame with OpenCV. Drag to take the halo off and put it back."
      },
      {
        "kind": "residual",
        "side": "r",
        "at": 5,
        "title": "One scan line, three profiles",
        "note": "What the microscope recorded, what the network predicts, and the difference between them. The network is asked for the artifact, never for the cell."
      }
    ]
  },
  {
    "id": "arteza",
    /* What the home page's screen shows while this row is hovered, in place
       of the other column. One path or several; .mp4/.webm play as video,
       anything else is a still. These sit on the page's own paper with no
       panel behind them, so anything here wants a transparent or full-bleed
       background of its own. Not to be confused with "demo", which is the
       live deployment. */
    "screen": "public/assets/projects/arteza-home.webp",
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
    "tags": [
      [
        "Conversational commerce",
        "https://en.wikipedia.org/wiki/Conversational_commerce"
      ],
      [
        "Supabase",
        "https://supabase.com/docs"
      ],
      [
        "shadcn/ui",
        "https://ui.shadcn.com"
      ]
    ],
    "notes": {
      "overview": [
        [
          "one of each, hand-signed",
          "no restock, ever. the whole model is this line"
        ],
        [
          "rather than around a conventional retail funnel",
          "a funnel would have thrown away the conversation"
        ]
      ],
      "challenge": [
        [
          "pre-filled WhatsApp message",
          "this is how the studio already sold. we matched it instead of fighting it"
        ],
        [
          "deliberately smaller technical surface",
          "the hardest call on this project was building less"
        ]
      ]
    },
    "deepDive": [
      {
        "kind": "figure",
        "src": "public/assets/projects/arteza-home.webp",
        "alt": "Arteza homepage: large serif headline reading 'Art That Speaks to' over a soft painting backdrop, with Explore Collection and Get Inspired buttons",
        "caption": "The homepage leads with a rotating typewriter headline over a muted painting. Cormorant Garamond for display, Montserrat for body — serif authority over clean neutral ground."
      },
      {
        "kind": "prose",
        "heading": "Five collections instead of one long grid",
        "body": "The default move for an art site is a grid of everything, sorted by date. It's also the worst way to look at paintings: they flatten into thumbnails and you stop seeing any of them.\n\nSo the work is split into five collections, presented as a constellation rather than a list — each one previewing itself, connected by dotted lines. You pick a world, then look inside it.\n\nThe style quiz exists for people who don't know which world is theirs. It's three preferences, scored against the five collections, and it drops you into the closest one."
      },
      {
        "kind": "figure",
        "src": "public/assets/projects/arteza-collections.webp",
        "alt": "Curated Collections page showing five circular collection previews orbiting a central label reading 'Curated Collections — Five worlds, one brushstroke at a time'",
        "caption": "“Five worlds, one brushstroke at a time.” Each bubble previews its collection; dotted connectors imply a map rather than a list."
      },
      {
        "kind": "interactive",
        "widget": "weights",
        "heading": "The quiz, as arithmetic",
        "body": "The style quiz is not a personality test. It is three preferences turned into weights over five collections, and the collection with the highest score is the one you are shown first. Move a slider and the answer changes in front of you, which is the honest version of what the quiz does behind a sequence of screens.",
        "rowLabel": "Collection",
        "scoreLabel": "Match",
        "sliders": [
          {
            "key": "colour",
            "label": "Colour over line",
            "short": "Colour",
            "value": 0.5,
            "min": 0,
            "max": 1,
            "step": 0.05
          },
          {
            "key": "figure",
            "label": "Figures over forms",
            "short": "Figure",
            "value": 0.5,
            "min": 0,
            "max": 1,
            "step": 0.05
          },
          {
            "key": "scale",
            "label": "Large over intimate",
            "short": "Scale",
            "value": 0.5,
            "min": 0,
            "max": 1,
            "step": 0.05
          }
        ],
        "rows": [
          {
            "name": "Collection I",
            "values": {
              "colour": 1.8,
              "figure": 1.2,
              "scale": 0.6
            }
          },
          {
            "name": "Collection II",
            "values": {
              "colour": 0.4,
              "figure": 1.9,
              "scale": 1.4
            }
          },
          {
            "name": "Collection III",
            "values": {
              "colour": 1.5,
              "figure": 0.3,
              "scale": 1.8
            }
          },
          {
            "name": "Collection IV",
            "values": {
              "colour": 0.9,
              "figure": 1.6,
              "scale": 0.4
            }
          },
          {
            "name": "Collection V",
            "values": {
              "colour": 1.2,
              "figure": 0.7,
              "scale": 1.1
            }
          }
        ],
        "caption": "A worked version of the matching step. The five collections are real; the weights shown here are illustrative, because the studio's own scoring is not public."
      },
      {
        "kind": "prose",
        "heading": "Why there's no cart",
        "body": "There's no cart and no card form on this site, and that was the right call.\n\nEvery work is one of one. The studio already sells by talking to people — that's how the questions get answered, how the commissions start, how someone asks whether it'll suit their wall. A checkout flow would have replaced that conversation with a form.\n\nSo each listing carries medium, dimensions and price, and the last step hands you to WhatsApp. Sold work leaves the shop rather than sitting there greyed out.\n\nIf you'd asked me at the start I'd have built the cart. The artist was right and I was wrong."
      },
      {
        "kind": "diagram",
        "shape": "flow",
        "heading": "How a painting is actually bought",
        "body": "There is no cart and no card form. Every work is one of one, and the studio already sells the way the last step describes — so the site hands the buyer over rather than pretending to be a shop.",
        "steps": [
          {
            "t": "Five collections",
            "d": "browse, or take the style quiz"
          },
          {
            "t": "A matched world",
            "d": "the quiz scores three preferences"
          },
          {
            "t": "One work",
            "d": "medium, dimensions, price; sold work leaves"
          },
          {
            "t": "WhatsApp",
            "d": "the conversation the studio already has"
          }
        ],
        "caption": "The checkout is the hand-off. A funnel would have thrown away the conversation the artist relies on."
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
        "heading": "What I'd do differently",
        "body": "I would have instrumented it. The site went live without analytics, which means I can tell you what I built and not whether it worked — how many people finished the quiz, whether the collection pages or the shop grid sent more enquiries to WhatsApp, which paintings people opened and did not ask about. All of that is cheap to collect and I did not collect it, so the case study above is a description rather than a result.\n\nI would also revisit the WhatsApp checkout. It was the right call — it matched how the studio already sold, and a cart would have been a worse fit — but it puts the handoff at exactly the point where I stop being able to see anything. At minimum the outgoing message should carry a reference the studio can match back to a painting and a session.\n\nAnd I would push harder on image weight. A gallery is almost entirely photographs of paintings, and the original files were bigger than they needed to be."
      }
    ],
    "fragments": [
      "five collections",
      "one of one",
      "style quiz",
      "constellation",
      "WhatsApp",
      "the checkout is a conversation",
      "Supabase",
      "React",
      "Vite",
      "TypeScript",
      "Tailwind",
      "shadcn/ui",
      "Vercel",
      "90+ works",
      "medium",
      "dimensions",
      "sold work leaves",
      "class booking",
      "Cormorant Garamond",
      "rotating headline",
      "a muted painting",
      "the studio already sells this way",
      "no cart",
      "no card form",
      "an artist, not a shop"
    ],
    "metric": "90+ paintings, 5 collections",
    "glance": {
      "problem": "A working painter with a catalogue spread across Instagram posts and WhatsApp threads, and no single place a buyer could see the work.",
      "built": "A React and Supabase storefront for 90+ originals across five curated collections, with a style-matching quiz, class booking, and checkout that hands off to WhatsApp — where the sales were already happening.",
      "result": "A live site the studio sells from. Commercial figures belong to the client and are not mine to publish."
    },
    "group": "products",
    "figures": [
      {
        "kind": "orbit",
        "side": "l",
        "at": 1,
        "title": "Five collections, three preferences",
        "note": "The quiz is this: three answers weighing five collections until one is pulled in. Drag to pull one yourself."
      },
      {
        "kind": "handoff",
        "side": "r",
        "at": 4,
        "title": "It does not end in a cart",
        "note": "Ninety paintings narrow to one, and then the buyer leaves for WhatsApp and talks to a person. The last step being off the site is the decision, not an omission."
      }
    ]
  },
  {
    "id": "habita",
    /* What the home page's screen shows while this row is hovered, in place
       of the other column. One path or several; .mp4/.webm play as video,
       anything else is a still. These sit on the page's own paper with no
       panel behind them, so anything here wants a transparent or full-bleed
       background of its own. Not to be confused with "demo", which is the
       live deployment. */
    "screen": [
      "public/assets/projects/habita-phone-matrix.webp",
      "public/assets/projects/habita-phone-tilt.webp"
    ],
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
    "created": "2026-04-19",
    "updated": "2026-08-25",
    "tags": [
      [
        "Eisenhower Matrix",
        "https://en.wikipedia.org/wiki/Time_management"
      ],
      [
        "Capacitor",
        "https://capacitorjs.com/docs"
      ],
      [
        "Calendar Provider",
        "https://developer.android.com/guide/topics/providers/calendar-provider"
      ]
    ],
    "notes": {
      "overview": [
        [
          "one of the Eisenhower Matrix quadrants",
          "the matrix does the deciding so you don't redo it every morning"
        ],
        [
          "an SVG progress ring",
          "no library. it's one stroke-dasharray"
        ]
      ],
      "challenge": [
        [
          "making Habita write into the calendar the user already lives in",
          "the whole reason this isn't another to-do app"
        ],
        [
          "degrades honestly",
          "it says what it can't do rather than faking a sync"
        ]
      ]
    },
    "deepDive": [
      {
        "kind": "prose",
        "heading": "Priority as a place, not a number",
        "body": "Every task app I've used stores priority as a field: a number, a flag, a colour from a dropdown. And every one of them ends up with everything marked high.\n\nHabita stores priority as a position. A task lives in one of four quadrants, and the only way to change what it means is to physically move it.\n\nThe consequence is that you can't mark everything important, because the grid has two axes and a thing that's urgent but not important has somewhere specific to go. You make the decision once, when you place it, and the layout is what remembers."
      },
      {
        "kind": "diagram",
        "shape": "quadrant",
        "heading": "The grid a task lands in",
        "body": "Priority is a position here, not a field. A task lives in one of four quadrants and the only way to change what it means is to move it — which is why you cannot mark everything important.",
        "x": "Urgency →",
        "y": "Importance →",
        "cells": [
          {
            "t": "Goals",
            "d": "Important, not urgent. Decides what next year looks like; loses every argument with Focus."
          },
          {
            "t": "Focus",
            "d": "Urgent and important. Two items is a day; six is a planning failure that already happened."
          },
          {
            "t": "Backburner",
            "d": "Neither. Naming it turns guilt into a decision."
          },
          {
            "t": "Fit In",
            "d": "Urgent, not important. Real deadlines on work that moves nothing. Batch it or do it badly on purpose."
          }
        ],
        "caption": "The four boards in the app, in the positions they occupy. Each carries an SVG progress ring that counts down as its tasks are checked off."
      },
      {
        "kind": "interactive",
        "widget": "steps",
        "heading": "Put a Tuesday through the grid",
        "body": "Here is an unsorted day. Step through the four quadrants and watch which tasks each one claims. The point is not that the sorting is clever — it is that once a task is in a quadrant there is nowhere left to hide it.",
        "playLabel": "Play all four",
        "stopLabel": "Stop",
        "items": [
          "Renew the passport, appointment closes Friday",
          "Draft the quarterly plan",
          "Someone else's status meeting",
          "Learn enough Rust to read the codebase",
          "Fix the failing test blocking the release",
          "Answer the group chat",
          "Book a dentist appointment, eventually",
          "Scroll the news"
        ],
        "frames": [
          {
            "label": "Focus",
            "picks": [
              0,
              4
            ],
            "note": "Urgent and important. Two things, and they are the only two things. A day with six items in this quadrant is not a busy day, it is a planning failure that already happened."
          },
          {
            "label": "Goals",
            "picks": [
              1,
              3,
              6
            ],
            "note": "Important, not urgent. This is the quadrant that decides what next year looks like, and the one that quietly loses every argument with the one above it."
          },
          {
            "label": "Fit In",
            "picks": [
              2,
              5
            ],
            "note": "Urgent, not important. Real deadlines attached to work that does not move anything. These are the tasks worth batching, delegating or doing badly on purpose."
          },
          {
            "label": "Backburner",
            "picks": [
              7
            ],
            "note": "Neither. Naming it is the useful part: it stops being something you feel bad about not doing and becomes something you decided not to do."
          }
        ],
        "caption": "An illustrative Tuesday. In the app the quadrant is set by dragging, and each one carries an SVG progress ring that counts down as tasks are checked off."
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
        "body": "Each quadrant shows a ring that fills as its tasks get done. It's one SVG circle with `stroke-dasharray` set to the circumference and `stroke-dashoffset` driven by the completion ratio.\n\nThat's the whole implementation. No dependency, no canvas, and it scales cleanly because it's a vector. I mention it because “add a chart library” would have been the default move and it would have cost more than it returned."
      },
      {
        "kind": "formula",
        "tex": "C = 2\\pi r \\qquad \\text{offset} = C \\times \\left(1 - \\frac{\\text{done}}{\\text{total}}\\right)",
        "caption": "Circumference sets the dash length; the offset is driven by completion ratio. Animating stroke-dashoffset gives a smooth fill for free."
      },
      {
        "kind": "prose",
        "heading": "The feature that made it worth building",
        "body": "A planner that only knows about itself is a second place to check. A second place to check is a place you stop checking.\n\nSo dragging a task onto the day timeline writes a real event into the phone's own calendar, through a local Capacitor plugin over Android's CalendarContract. No third-party service, no sync account. Move the block and the event moves.\n\nThe details that took the longest are the ones nobody sees. Colours go through the account's own palette because several providers ignore a raw colour value. Events Habita created carry a marker in their description so the timeline can tell its own blocks from yours. Updates are partial, so a description you edited elsewhere survives. And if you delete the event in your calendar app, the block notices it's gone and recreates it rather than failing silently.\n\nThe day view also reads what's already in your calendar and draws it in its own lane, so you can see what a slot would collide with before you take it."
      },
      {
        "kind": "prose",
        "heading": "Making a web app stop feeling like one",
        "body": "It's ES6 modules, CSS Grid and SVG, wrapped with Capacitor. No build step, no bundler, no framework.\n\nWhat makes it feel native isn't the wrapper, it's the small things: haptics on completion, 15-minute snapping so drags land somewhere sensible, keyboard nudging on a focused block, and a web Vibration fallback for when the Capacitor plugin isn't there."
      },
      {
        "kind": "prose",
        "heading": "Never let old data break a new build",
        "body": "Everything lives in localStorage, which means every install has data from whatever version the user last ran.\n\nSo stored objects get validated and migrated on load. A stale or partial object degrades into a correct one rather than throwing. It is unglamorous and it's the difference between shipping an update and shipping an update that wipes someone's week."
      },
      {
        "kind": "prose",
        "heading": "What I'd do differently",
        "body": "I would ship an APK. There is a working Android app here and no way for anyone to run it without cloning the repository and building it themselves, which means the only people who will ever see it are people who already believe me. A signed release build attached to a GitHub release costs almost nothing and is the difference between a claim and a demonstration.\n\nI would also make the calendar write two-way. Right now Habita writes events out and never reads them back, so a block you move in Google Calendar and the block Habita thinks exists drift apart silently. Reading the calendar back is more work than writing to it, and it is the difference between a feature and a sync.\n\nAnd the quadrant model needs a way out. The Eisenhower matrix is a good forcing function and a bad description of a real week — most tasks are not clearly urgent or clearly not — so the app should let a task sit on a boundary instead of pretending the decision was clean."
      }
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
      "partial update",
      "progress ring",
      "SVG",
      "localStorage",
      "schema migration",
      "the calendar you already look at",
      "haptics",
      "auto-place",
      "collision",
      "Android",
      "no third-party sync"
    ],
    "glance": {
      "problem": "Every task app invents its own idea of priority, and the time you set aside inside one is invisible everywhere you actually look.",
      "built": "An Android task manager on the Eisenhower matrix — four urgency/importance quadrants — with a drag-to-schedule day timeline that writes real events into the phone's own calendar.",
      "result": "Working app, no published build. What it demonstrates is the calendar write: time blocked in Habita shows up in the calendar the rest of the phone already reads."
    },
    "group": "products",
    "figures": [
      {
        "kind": "grid",
        "side": "l",
        "at": 0,
        "title": "Priority as a place",
        "note": "A day of tasks against two axes. Drag the crosshair: everything re-sorts against wherever you just put the line, which is what deciding actually is."
      },
      {
        "kind": "calendar",
        "side": "r",
        "at": 7,
        "title": "Written through to the phone",
        "note": "Time blocked in Habita becomes a real event in the calendar every other app already reads. Drag the block and watch the second one follow."
      }
    ]
  },
  {
    "id": "ivy-slack-agent",
    "context": "InnovyQ",
    "title": "Project IVY",
    "tagline": "A Slack support agent that reads screenshots and files its own tickets.",
    "year": "2026",
    "role": "AI Engineer, InnovyQ",
    "summary": "An AI IT-support agent living in Slack DMs: AWS Lex V2 for intent, Claude on Bedrock for everything Lex cannot answer, OCR over pasted screenshots, and a capacity-aware dispatcher that assigns the Jira ticket to whichever human is actually on shift and has room.",
    "tech": [
      "Python",
      "AWS Lambda",
      "SQS",
      "DynamoDB",
      "Lex V2",
      "Bedrock (Claude)",
      "Rekognition",
      "PaddleOCR",
      "Docker",
      "Jira API"
    ],
    "repo": "https://github.com/akshayaa-403/o3_slack_bot",
    "metric": "100% char OCR · 823 ms/image",
    "glance": {
      "problem": "An internal IT helpdesk where most tickets arrive as a Slack message and a screenshot, and a human has to read both before anything happens.",
      "built": "An event-driven agent on AWS — API Gateway to Lambda to SQS to Lex V2 — with DynamoDB session state per issue, a Claude fallback on Bedrock, OCR over pasted screenshots, and automatic Jira ticket creation with capacity-aware assignment.",
      "result": "Four OCR engines benchmarked against hand-written ground truth; the chosen one reads a support screenshot at 100% character accuracy in 823 ms. Eight test suites cover the locking and dispatch paths."
    },
    "overview": "IVY is an IT-support agent that lives where the support requests already are: a Slack DM. A message goes through API Gateway to a handler Lambda, which deduplicates it in DynamoDB and drops it on SQS; a worker pulls it, asks AWS Lex V2 what the person wants, and keeps the whole conversation as one session keyed to the Slack thread. When Lex has no useful answer — a fallback intent, an empty reply, a question nobody wrote an intent for — the worker calls Claude on Bedrock instead, behind a guardrail, with a system prompt that forbids it from claiming a ticket was created. If the request needs a human, IVY files the Jira ticket itself and hands it to whichever agent is on shift with capacity to spare.",
    "highlights": [
      "Nine Lambdas behind one Slack app: event handler, SQS worker, intent router, Jira ticket creator, Claude fallback, image recognition, log summariser, live-agent dispatcher and a timeout handler driven by EventBridge Scheduler.",
      "Session state per issue rather than per user — the Slack root message timestamp is part of the session key, so two problems reported the same afternoon do not blur into one conversation.",
      "Claude Haiku on Bedrock as the fallback, at temperature 0.2 behind a Bedrock guardrail, with a system prompt that bans it from asserting anything about ticket state.",
      "Screenshots resolved in order: Rekognition text and labels first, then Lex on the extracted text, then a Bedrock knowledge base, then a Gemini fallback.",
      "A PaddleOCR Lambda shipped as a container image, because paddlepaddle and opencv are several times the 250 MB zip limit, with the model weights baked in at build time — Lambda gives you a read-only filesystem and an empty /tmp on every cold start.",
      "Duplicate work is prevented with DynamoDB conditional writes, not with hope: a retried SQS record or a twice-clicked button cannot open two Jira tickets or hand the same issue to two people.",
      "The live-agent dispatcher reads shifts from DynamoDB or, optionally, from Jira Service Management on-call schedules; if nobody has room the ticket queues, and a terminal Jira status releases the slot and promotes the oldest queued ticket exactly once."
    ],
    "challenge": "The hard part was not the model, it was making a distributed system tell the truth about itself. SQS redelivers. Slack retries. A person clicks \"raise a ticket\" twice because the first click did not visibly do anything. Every one of those produces a second, identical request, and the naive version of this agent files two Jira tickets and pages two engineers. The fix is that nothing which touches the outside world is allowed to happen on optimism: the ticket write, the live-agent handoff and the capacity reservation each go through a DynamoDB conditional update that fails loudly if the work was already claimed. The second problem was the screenshots. Most of the incoming tickets are a picture of an error dialog, and picking an OCR engine by reputation is how you end up with a 12-second cold start in a Lambda. So I benchmarked four of them — EasyOCR, PaddleOCR, Textract and Mistral OCR — against transcriptions I wrote by hand, and reported latency and model-load cost next to accuracy, because on Lambda the load time is the thing that hurts.",
    "created": "2026-07-16",
    "updated": "2026-08-10",
    "tags": [
      [
        "AWS Lex V2",
        "https://docs.aws.amazon.com/lexv2/latest/dg/what-is.html"
      ],
      [
        "Amazon Bedrock",
        "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html"
      ],
      [
        "DynamoDB conditional writes",
        "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithItems.html#WorkingWithItems.ConditionalUpdate"
      ],
      [
        "Slack Events API",
        "https://api.slack.com/apis/events-api"
      ]
    ],
    "notes": {
      "overview": [
        [
          "lives where the support requests already are",
          "no new tool for anyone to remember to open"
        ],
        [
          "forbids it from claiming a ticket was created",
          "the one thing a support bot must never get wrong"
        ]
      ],
      "challenge": [
        [
          "because the first click did not visibly do anything",
          "always. every time. design for it"
        ],
        [
          "the load time is the thing that hurts",
          "a cold Lambda pays it on every scale-out, not once"
        ]
      ]
    },
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
    ],
    "deepDive": [
      {
        "kind": "prose",
        "heading": "Why an intent model and a language model, instead of one or the other",
        "body": "A pure LLM support bot is easy to demo and hard to trust. It will happily tell someone their VPN ticket has been raised when nothing has been written anywhere.\n\nA pure intent model is the opposite: every route is explicit and auditable, and it falls over the moment somebody phrases a request in a way nobody anticipated.\n\nSo IVY runs both. Lex V2 owns the twenty-odd intents that map to a real action — request AWS access, get into Opsgenie, raise a ticket — and those paths are deterministic. Claude picks up everything else, with a system prompt that lets it ask one clarifying question and explicitly forbids it from claiming a ticket exists. The model is allowed to be helpful; it is not allowed to be authoritative about state."
      },
      {
        "kind": "diagram",
        "shape": "flow",
        "heading": "One Slack message, end to end",
        "body": "Nothing here is synchronous with the person typing. Slack wants an acknowledgement in three seconds, and Lex, Bedrock and Jira between them take longer than that, so the handler does the minimum and hands off.",
        "steps": [
          {
            "t": "Slack DM",
            "d": "Events API, through API Gateway"
          },
          {
            "t": "Handler",
            "d": "verify, dedupe by event_id in DynamoDB, enqueue"
          },
          {
            "t": "SQS",
            "d": "the buffer that makes the rest allowed to be slow"
          },
          {
            "t": "Worker",
            "d": "Lex V2 for intent; Claude on Bedrock when Lex has nothing"
          },
          {
            "t": "Action",
            "d": "reply, or Jira ticket, or handoff to a human"
          }
        ],
        "caption": "The dedupe step is not optional: Slack retries a delivery it thinks failed, and without event_id in DynamoDB a slow reply becomes two tickets."
      },
      {
        "kind": "diagram",
        "shape": "bars",
        "heading": "Four OCR engines, one hand-written ground truth",
        "body": "Most support tickets arrive as a screenshot of an error. Reading them automatically means choosing an engine, and reputation is not a measurement — so all four ran over the same five support screenshots and were scored against transcriptions I typed out myself.",
        "rows": [
          {
            "k": "Mistral OCR",
            "v": 100,
            "label": "100.0%",
            "best": true
          },
          {
            "k": "Textract",
            "v": 99.9,
            "label": "99.9%"
          },
          {
            "k": "PaddleOCR",
            "v": 98.9,
            "label": "98.9%"
          },
          {
            "k": "EasyOCR",
            "v": 97.4,
            "label": "97.4%"
          }
        ],
        "max": 100,
        "caption": "Character accuracy, mean over five screenshots, from ocr/results/benchmark_results.md in the repository. Accuracy was not the deciding number: per-image latency ran 823 ms (Mistral), 1,551 ms (Textract), 1,075 ms (PaddleOCR) and 2,184 ms (EasyOCR), and the two local engines also pay a 10–12 second model load on every cold start."
      },
      {
        "kind": "prose",
        "heading": "The expensive lesson was packaging, not accuracy",
        "body": "PaddleOCR scores well and costs nothing per call, which made it the obvious choice until I tried to deploy it. `paddlepaddle` and `opencv` together are several times Lambda's 250 MB zip limit, so it had to ship as a container image instead.\n\nThat solved the size problem and exposed the next one. Lambda's filesystem is read-only apart from `/tmp`, and `/tmp` is empty on every cold start — so an engine that downloads its own model weights on first use downloads them again, and again, and again. The weights get baked into the image at build time by running the constructor once during `docker build`.\n\nThe cloud engines have none of this problem and a per-call bill instead. That is the actual trade, and it is not visible in an accuracy table."
      },
      {
        "kind": "code",
        "lang": "python",
        "code": "CLAUDE_SYSTEM_PROMPT = os.environ.get(\n    \"CLAUDE_SYSTEM_PROMPT\",\n    (\n        \"You are IVY, a concise IT and support assistant. \"\n        \"Use only the current user request and session context. \"\n        \"If the request is ambiguous, ask one clear clarifying question. \"\n        \"Do not claim that a ticket was created.\"\n    )\n)",
        "caption": "The fallback's system prompt, from lambda_o3_claude_fallback.py. The last line is the whole safety argument: the model may answer, but only the deterministic path is allowed to say anything happened."
      },
      {
        "kind": "prose",
        "heading": "Assigning a ticket is a concurrency problem",
        "body": "When IVY decides a human is needed, something has to choose which human. The naive version reads the agent table, picks whoever has the fewest open issues, and writes the assignment. Two requests arriving at the same moment both read the same \"fewest\", and both assign to the same person.\n\nSo the reservation is a conditional update: increment `active_count` only if it is still below `max_capacity` and the row still looks the way it did when we read it. If the condition fails, the dispatcher re-reads and tries the next agent. If nobody has room, the ticket stays unassigned with `assignment_status=QUEUED` rather than being forced onto someone.\n\nReleasing is the same problem backwards. A Jira status change fires a callback, and that callback can arrive more than once — so the release is also conditional, and it promotes exactly one queued ticket."
      },
      {
        "kind": "prose",
        "heading": "What I'd do differently",
        "body": "I would put an evaluation harness on the conversation itself, not only on the OCR. I measured the piece that was easy to measure — character accuracy against a transcription I wrote — and left the part that actually decides whether IVY is useful, which is whether Lex routed a request to the right intent, to spot checks in Slack. A fixed set of a hundred real requests with the intent each one should produce would have caught routing regressions that I only found by noticing them.\n\nI would also separate the sessions table from the locks. Right now the session record carries conversation state and the conditional-write flags that prevent duplicate tickets, which means every contended write contends with a write that had no reason to be contended.\n\nAnd I would stop treating the Gemini and Claude fallbacks as interchangeable last resorts. They were added at different times for different failures and the ordering between them is historical rather than reasoned."
      }
    ],
    "thumb": false,
    "archived": true
  },
  {
    "id": "anttodo",
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
    "created": "2026-04-12",
    "updated": "2026-08-10",
    "tags": [
      [
        "Ant colony optimization",
        "https://en.wikipedia.org/wiki/Ant_colony_optimization_algorithms"
      ],
      [
        "Travelling salesman",
        "https://en.wikipedia.org/wiki/Travelling_salesman_problem"
      ],
      [
        "Swarm intelligence",
        "https://en.wikipedia.org/wiki/Swarm_intelligence"
      ]
    ],
    "notes": {
      "overview": [
        [
          "a routing problem in disguise",
          "once you see it you can't unsee it"
        ],
        [
          "you watch the convergence happen",
          "watching is the point. the answer is almost secondary"
        ]
      ],
      "challenge": [
        [
          "a wall of notation",
          "it was for me too, the first time"
        ],
        [
          "crank evaporation up and watch the colony forget good routes",
          "try this one. it forgets everything in about twenty iterations"
        ]
      ]
    },
    "deepDive": [
      {
        "kind": "prose",
        "heading": "A to-do list is secretly a routing problem",
        "body": "We treat a to-do list as a set of independent things with checkboxes. It isn't.\n\nDoing the shopping after the bank is a different walk than doing it before. Answering email between two blocks of deep work costs more than answering it at the end. Once the cost of a task depends on what came before it, you no longer have a list — you have a routing problem, and routing problems have decades of literature behind them.\n\nThis one uses ant colony optimisation, in two forms that are honest about what they're claiming. Errand Mode treats tasks as real places with real coordinates, so distance is genuine haversine kilometres on a closed tour and a shorter route really is shorter. Focus Mode orders a workday against a cost function built from things that actually hurt."
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
        "heading": "What a single ant actually does",
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
        ],
        "body": "One ant starts somewhere and repeatedly picks its next task, weighing two things: how much pheromone is on that step, and how good the step looks on its own. Alpha and beta are exactly those two weights.\n\nIt finishes a complete order. The order gets costed. Every step it took receives pheromone in proportion to how good the whole tour was.\n\nNothing is planned. No ant sees the global picture. The route that keeps appearing in good tours simply accumulates more signal than the ones that don't, until the colony agrees."
      },
      {
        "kind": "diagram",
        "shape": "cycle",
        "heading": "The loop the colony runs",
        "body": "No ant plans anything. Each one builds a whole order, that order is costed, and every step it took is reinforced in proportion to how good the finished tour was. Evaporation is what lets the colony change its mind.",
        "steps": [
          {
            "t": "Construct",
            "d": "each ant picks the next task"
          },
          {
            "t": "Evaluate",
            "d": "cost the finished order"
          },
          {
            "t": "Deposit",
            "d": "reinforce every step it took"
          },
          {
            "t": "Evaporate",
            "d": "ρ decays every trail"
          }
        ],
        "caption": "α weights the pheromone on a step, β weights how good that step looks on its own, and ρ is the fraction that decays each iteration. All three are sliders in the live demo."
      },
      {
        "kind": "figure",
        "src": "public/assets/projects/anttodo-converged.webp",
        "alt": "The colony after 100 iterations: a numbered route through all ten tasks drawn over a green pheromone field, with best cost 50.1 and a flattened convergence chart",
        "caption": "After 100 iterations: best cost 50.1, the route numbered 1 to 10, and the pheromone field showing which edges the colony committed to. The strong green edges are consensus; the faint ones are roads not taken."
      },
      {
        "kind": "prose",
        "heading": "Why the trails have to fade",
        "body": "Without evaporation, the first decent route the colony finds becomes the only route it will ever find. Every ant reinforces it, which makes it more attractive, which sends more ants down it.\n\nRho is the fraction of pheromone that decays each iteration, and it's the only reason the colony can change its mind. Bounding the trail above and below does the rest: a ceiling stops one edge becoming irresistible, a floor stops an edge becoming invisible.\n\nDrag the instrument in the margin to the right and watch this fail on purpose."
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
        "heading": "I exposed every knob, deliberately",
        "body": "Alpha, beta, rho, q₀, ants per iteration, 2-opt on or off, and the four objective weights are all on sliders instead of tuned and hidden.\n\nPartly that's honesty. These parameters change the answer, and a demo that hides them is claiming an objectivity it doesn't have.\n\nBut mostly it's the actual point of the project. Set context-switching to zero and watch your schedule fragment into a dozen pieces. You've just learned something about your own day that no recommended ordering would have told you."
      },
      {
        "kind": "interactive",
        "widget": "weights",
        "heading": "Decide what a bad day costs",
        "body": "Focus Mode does not have an objectively correct answer, because “better day” is not a measurable quantity. What it has is four penalties with sliders. Set one to zero and it stops mattering. The ordering below is the colony's, re-sorted against whatever you decide to care about.",
        "rowLabel": "Task",
        "scoreLabel": "Cost",
        "sliders": [
          {
            "key": "deadline",
            "label": "Deadline pressure",
            "short": "Deadline",
            "value": 0.4,
            "min": 0,
            "max": 1,
            "step": 0.05
          },
          {
            "key": "inversion",
            "label": "Priority inversion",
            "short": "Inversion",
            "value": 0.3,
            "min": 0,
            "max": 1,
            "step": 0.05
          },
          {
            "key": "switching",
            "label": "Context switching",
            "short": "Switching",
            "value": 0.2,
            "min": 0,
            "max": 1,
            "step": 0.05
          },
          {
            "key": "load",
            "label": "Cognitive load",
            "short": "Load",
            "value": 0.1,
            "min": 0,
            "max": 1,
            "step": 0.05
          }
        ],
        "rows": [
          {
            "name": "File the tax return (due today)",
            "values": {
              "deadline": 2.6,
              "inversion": 1.8,
              "switching": 0.2,
              "load": 1.4
            }
          },
          {
            "name": "Write the design doc",
            "values": {
              "deadline": 0.4,
              "inversion": 0.6,
              "switching": 0.3,
              "load": 2.2
            }
          },
          {
            "name": "Reply to three emails",
            "values": {
              "deadline": 0.3,
              "inversion": 0.1,
              "switching": 1.9,
              "load": 0.3
            }
          },
          {
            "name": "Grocery run",
            "values": {
              "deadline": 0.2,
              "inversion": 0.05,
              "switching": 1.4,
              "load": 0.2
            }
          },
          {
            "name": "Review a pull request",
            "values": {
              "deadline": 0.9,
              "inversion": 0.8,
              "switching": 0.6,
              "load": 1.1
            }
          }
        ],
        "caption": "The four terms are the repository's own objective; the day is an illustrative one. Higher is more expensive to leave late, so the top row is what the colony would schedule first."
      },
      {
        "kind": "prose",
        "heading": "What I'd do differently",
        "body": "I would give it something to be measured against. The visualiser shows a colony converging, and converging is not the same as being right — ACO is a heuristic, and on seven stops the optimal route can be found exactly by brute force in microseconds. Drawing the exact optimum on the same chart would turn \"the line flattens\" into \"the line flattens 4% above the best possible answer\", which is a far more interesting thing to watch.\n\nI would also be more careful about what the demo claims. It is a genuinely nice piece of teaching about ant colony optimisation, and it is a fairly poor task scheduler, because the cost matrix between two tasks is invented. Either I make the costs real — actual context-switch cost, actual travel between locations — or I stop framing it as a to-do app and present it as what it is, which is an interactive explanation of a metaheuristic.\n\nAnd the parameter panel exposes every knob without saying which ones matter. Alpha and rho change the answer; colony size mostly changes how long you wait."
      }
    ],
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
    ],
    "glance": {
      "problem": "A to-do list is drawn as a list, but a day is really a route: the cost of doing something depends on what you did before it.",
      "built": "A browser visualiser that reframes a day as a travelling-salesman problem and runs ant colony optimisation over it live, with two formulations, dependency constraints, every parameter exposed, and a convergence chart.",
      "result": "Runs entirely in the tab — no backend, no build step. The honest finding is the one the parameters show: push evaporation down and the colony stops improving."
    },
    "archived": true,
    "figures": [
      {
        "kind": "colony",
        "side": "r",
        "at": 4,
        "title": "Pheromone, and forgetting",
        "note": "Drag right to cut evaporation: the trails stop forgetting, the first decent answer locks in, and the colony stops improving."
      }
    ]
  },
  {
    "id": "wikipedia-summarizer",
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
    "created": "2025-01-30",
    "updated": "2026-08-12",
    "tags": [
      [
        "ROUGE",
        "https://aclanthology.org/W04-1013/"
      ],
      [
        "TextRank",
        "https://aclanthology.org/W04-3252/"
      ],
      [
        "Extractive summarization",
        "https://en.wikipedia.org/wiki/Automatic_summarization"
      ],
      [
        "MediaWiki API",
        "https://www.mediawiki.org/wiki/API:Main_page"
      ]
    ],
    "notes": {
      "overview": [
        [
          "a reference that already exists",
          "the editors' own lead section. a human ceiling, not another algorithm"
        ],
        [
          "around 60 ms for a 4,300-word article",
          "in the browser. there is no server anywhere in this"
        ]
      ],
      "challenge": [
        [
          "a 1.6 GB checkpoint and a server",
          "and it got worse on long articles. exactly the wrong way to fail"
        ],
        [
          "no summary here writes a new sentence",
          "stated in the repo too. worth being blunt about"
        ]
      ]
    },
    "deepDive": [
      {
        "kind": "prose",
        "heading": "Scoring against humans, not against each other",
        "body": "You can score one extractive summariser against another, but all that tells you is which of two guesses is closer to a third guess.\n\nThis one is scored against the article's own lead section — the summary Wikipedia's editors wrote and then argued about for years. It's the closest thing to a ground truth that exists for this task, and it's sitting right there in the document.\n\nThere's one catch, and it's the interesting part. Scoring against the full lead would hand a perfect 1.000 to anything that copied it. So the lead gets trimmed to the same word budget the algorithms get.\n\nWhat comes out is a human ceiling. The best algorithm reaches 56 to 67% of it."
      },
      {
        "kind": "diagram",
        "shape": "bars",
        "heading": "Measured against the people who wrote it",
        "body": "ROUGE-1 F-measure on the Penguin article, against the lead section trimmed to the same word budget the algorithms get. The dashed rule is what a human achieved writing to that brief.",
        "rows": [
          {
            "k": "MMR",
            "v": 0.4,
            "label": "0.400",
            "best": true
          },
          {
            "k": "TextRank",
            "v": 0.393,
            "label": "0.393"
          },
          {
            "k": "LSA",
            "v": 0.305,
            "label": "0.305"
          },
          {
            "k": "Luhn",
            "v": 0.263,
            "label": "0.263"
          }
        ],
        "rule": 0.709,
        "ruleLabel": "Human ceiling 0.709",
        "max": 0.75,
        "caption": "Measured figures from the repository's benchmark. The winner changes with the article — on Roman Empire, MMR falls to 0.188 and TextRank takes it. The best method reaches 56–67% of the human ceiling."
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
        "heading": "I picked four algorithms that fail differently",
        "body": "TextRank runs PageRank over a graph of sentence similarities, so it favours the sentences the article keeps circling back to. LSA finds latent topics by SVD and takes one sentence per topic, which sends it further down the document than the others. Luhn, from 1958, finds the densest window of frequent terms, which in practice means the opening.\n\nMMR is the odd one out, and it shows. It's the only one that looks backward: at every step it subtracts a redundancy penalty against what it has already chosen. The other three score each sentence independently, which means all three can cheerfully return four sentences that say the same thing."
      },
      {
        "kind": "interactive",
        "widget": "steps",
        "heading": "Four algorithms, one article, four different answers",
        "body": "Below is an eight-sentence article. Each algorithm gets the same preprocessing and the same budget, and picks four sentences. Step through them, or play all four, and watch how little they agree.",
        "playLabel": "Play all four",
        "stopLabel": "Stop",
        "items": [
          "The kakapo is a large, flightless, nocturnal parrot endemic to New Zealand.",
          "Adults can weigh up to four kilograms, making it the heaviest parrot alive.",
          "It is the only parrot with a lek breeding system, in which males compete by calling.",
          "Males inflate a thoracic air sac and produce a low boom audible for kilometres.",
          "Breeding is tied to the mast fruiting of the rimu tree, which happens irregularly.",
          "Predation by introduced stoats and cats reduced the population to fifty-one birds.",
          "Every surviving kakapo has been moved to predator-free offshore islands.",
          "The species is managed bird by bird, with each individual named and tracked."
        ],
        "frames": [
          {
            "label": "TextRank",
            "picks": [
              0,
              2,
              5,
              6
            ],
            "note": "Graph-based. Runs PageRank over a graph of sentence similarities, so a sentence scores well when it resembles many others — which favours the sentences the article keeps circling back to."
          },
          {
            "label": "LSA",
            "picks": [
              0,
              3,
              4,
              7
            ],
            "note": "Topic modelling. Finds latent topics by SVD and takes one sentence per topic, which is why it reaches further down the article than the others and picks up the rimu detail nothing else wanted."
          },
          {
            "label": "Luhn",
            "picks": [
              0,
              1,
              2,
              3
            ],
            "note": "Frequency-based, and from 1958. It finds the densest window of frequent terms, which in practice means the opening — lead bias is not a bug here, it is what the method is."
          },
          {
            "label": "MMR",
            "picks": [
              0,
              2,
              5,
              7
            ],
            "note": "Diversity-aware, and the only one that looks backward. At every step it subtracts a redundancy penalty against what it has already chosen, so it will refuse a strong sentence for saying something it has said."
          }
        ],
        "caption": "An illustrative eight-sentence article, with each method's real selection behaviour. On the live demo the same four run over any article you type, scored against that article's own lead."
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
        "heading": "No algorithm wins, and that's the finding",
        "body": "Across three articles, MMR takes two and TextRank takes one. MMR goes from best on Penguin (0.400) to worst on Roman Empire (0.188).\n\nI spent a while trying to work out which one was “really” best before accepting that the instability *is* the result. An extractive summariser is a bet on what kind of document it's reading, and a single headline number hides which bet got made.\n\nThat's why there are six charts instead of one score. Positional density shows where a method looked. Sentence overlap shows when two methods are agreeing. The coverage-against-self-repetition quadrant is the chart that justifies MMR existing at all."
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
        "heading": "Everything runs in your tab",
        "body": "Type Kakapo and the article is fetched from the MediaWiki API, split, tokenised once, run through four selectors and six charts — in about 60 ms for a 4,300-word article.\n\nThere's no backend to keep alive, no key to leak, and no cost per visitor. That's the only reason a link like this still works two years after everyone stops paying attention to it.\n\nES modules served as static files, hand-rolled SVG charts, zero dependencies."
      },
      {
        "kind": "prose",
        "heading": "What I'd do differently",
        "body": "Three articles is too few to say anything about which algorithm wins, and the case study is careful to say the winner changes with the article — but with a sample of three, \"changes with the article\" and \"is noise\" are indistinguishable. The benchmark should run over a few hundred articles sampled across lengths and subject areas, and report the distribution rather than a table of three.\n\nI would also add an abstractive baseline. Everything here is extractive, which caps the score at whatever the best available sentences happen to be, and part of the reason the human ceiling sits so far above all four methods is that a person writing a lead does not have to use sentences from the body. Running one small abstractive model over the same articles would say how much of the remaining gap is a limitation of extraction rather than of these four algorithms.\n\nAnd the browser's ROUGE is a Porter approximation of the Python one, which I flag in the caption. Approximately-right scoring in the place people actually see the numbers is the wrong way round; the in-browser scorer should match the benchmark, even if that costs a few milliseconds."
      }
    ],
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
    ],
    "metric": "ROUGE-1 0.400 · 60 ms",
    "glance": {
      "problem": "Summarisation demos show one algorithm's output and leave you to guess whether it is any good.",
      "built": "A static, dependency-free browser app that runs four extractive summarisers over any Wikipedia article at once and scores each with ROUGE against the article's own lead section, trimmed to the same word budget.",
      "result": "MMR reaches ROUGE-1 0.400 on Penguin against a human ceiling of 0.709 — 56% of it. The winner changes with the article, which is the finding. Around 60 ms for a 4,300-word article, entirely in the tab."
    },
    "archived": true,
    "figures": [
      {
        "kind": "pick",
        "side": "r",
        "at": 5,
        "title": "Four selectors, one article",
        "note": "Watch how little they agree — and that only one of them ever looks back at what it already took."
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) { module.exports = projects; }
