/* Project content. Single source of truth for cards (index) and detail pages
   (project.html). Copy is written from what each repo actually contains. */
const projects = [
  {
    "id": "quantamental-screener",
    "layers": [
      {
        "name": "Dashboard",
        "hue": 340,
        "parts": [
          "Streamlit",
          "live weight sliders"
        ]
      },
      {
        "name": "Ranking",
        "hue": 28,
        "parts": [
          "z-scores",
          "weighted composite",
          "backtest"
        ]
      },
      {
        "name": "Factors",
        "hue": 100,
        "parts": [
          "momentum",
          "volume",
          "volatility",
          "sentiment"
        ]
      },
      {
        "name": "Data",
        "hue": 190,
        "parts": [
          "yfinance",
          "NewsAPI",
          "Redis cache"
        ]
      },
      {
        "name": "Constraint",
        "hue": 265,
        "parts": [
          "1 GB of memory",
          "an app that hibernates"
        ]
      }
    ],
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
        "heading": "Four numbers that refuse to agree",
        "layer": "Ranking",
        "body": "A screener that only reads price will buy a stock that is rising for a reason you would not like if you knew it. A screener that only reads headlines will buy a story. This one asks four separate questions of every name in the universe on the same day — how hard has it been moving, how much of it has been changing hands, how violently, and what is being written about it — and only lets a name to the top when the answers point the same way. Momentum is the 21-day rate of change. The other three are computed the same way: one number per ticker per day, nothing smoothed, nothing borrowed from tomorrow."
      },
      {
        "kind": "diagram",
        "shape": "flow",
        "layer": "Ranking",
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
        "layer": "Ranking",
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
        "heading": "Reading the room as well as the tape",
        "layer": "Factors",
        "body": "Sentiment is an ensemble rather than one model, because the cheap scorers disagree in ways that are useful. VADER handles negation and intensifiers — it knows that “not great” is not great. TextBlob is steadier across long, flat prose, where VADER finds drama that is not there. FinBERT is materially better than either on financial text, because it was trained on it; it is also the single reason this application cannot simply be deployed and forgotten."
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
        "heading": "A ranking is a claim until it is tested",
        "layer": "Ranking",
        "body": "Any model can produce a list. The question is whether the list would have made money, and at what cost in sleep. The backtest rebalances weekly into the top-ranked names and reports the result beside the S&P 500 — not just the return, but Sharpe, maximum drawdown, volatility and hit rate, on one panel, benchmark included. The run in the screenshot below returns 19.70% against the benchmark's 21.99%. That is a loss, and it is reported as one."
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
        "heading": "One gigabyte, and everything that follows from it",
        "layer": "Constraint",
        "body": "Streamlit Community Cloud allows roughly 1 GB of memory. FinBERT does not fit comfortably inside it alongside the data layer, and the honest options were to drop sentiment, ship something that dies under load, or make the model tier a setting. It became a setting: lexicon scorers by default so the hosted app stays inside budget, FinBERT one environment variable away for anyone running it locally. The second free-tier problem was sleep — Community Cloud hibernates an idle app — so a scheduled workflow drives headless Chrome at it every ten hours. Neither decision is interesting. Both are the difference between a link that opens and a link that embarrasses you."
      }
    ]
  },
  {
    "id": "arteza",
    "layers": [
      {
        "name": "Storefront",
        "hue": 340,
        "parts": [
          "React",
          "Vite",
          "shadcn/ui"
        ]
      },
      {
        "name": "Discovery",
        "hue": 28,
        "parts": [
          "five collections",
          "style-matching quiz"
        ]
      },
      {
        "name": "Checkout",
        "hue": 100,
        "parts": [
          "WhatsApp hand-off",
          "class booking"
        ]
      },
      {
        "name": "Catalogue",
        "hue": 190,
        "parts": [
          "Supabase",
          "90+ original works"
        ]
      },
      {
        "name": "Constraint",
        "hue": 265,
        "parts": [
          "one artist",
          "no payment stack"
        ]
      }
    ],
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
        "heading": "Five worlds, not one long grid",
        "layer": "Discovery",
        "body": "The five collections could have been a dropdown. Instead they are arranged as orbiting bubbles around a central label, each showing a representative work, connected by dotted lines. It rewards exploration in a way a menu does not — and for a gallery, browsing is the product."
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
        "layer": "Discovery",
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
        "heading": "The checkout is a conversation",
        "layer": "Checkout",
        "body": "Each painting is one-of-one. A buyer typically wants to ask something — how the colour reads in daylight, whether it ships framed — before committing. Routing the cart into WhatsApp with the selection pre-filled keeps that conversation where the studio already works, and sidesteps a payment integration that would have served the site's architecture more than its customers. There is an offline fallback: if the server cannot be reached, the message is still composed locally so the lead is not lost."
      },
      {
        "kind": "diagram",
        "shape": "flow",
        "layer": "Checkout",
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
      }
    ]
  },
  {
    "id": "phase-contrast-denoising",
    "layers": [
      {
        "name": "Interface",
        "hue": 340,
        "parts": [
          "Gradio app",
          "browser port"
        ]
      },
      {
        "name": "Model",
        "hue": 28,
        "parts": [
          "U-Net",
          "residual prediction",
          "fp16 weights"
        ]
      },
      {
        "name": "Classical path",
        "hue": 100,
        "parts": [
          "background estimate",
          "halo subtraction",
          "CLAHE"
        ]
      },
      {
        "name": "Images",
        "hue": 190,
        "parts": [
          "phase-contrast microscopy",
          "halo artifact"
        ]
      },
      {
        "name": "Measure",
        "hue": 265,
        "parts": [
          "PSNR",
          "SSIM",
          "parity against Python"
        ]
      }
    ],
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
        "heading": "The bright lie around every cell",
        "layer": "Images",
        "body": "Phase-contrast microscopy makes transparent cells visible by turning differences in optical path into differences in brightness. The price is a bright ring that traces every edge — the halo — and the halo is not decoration. It sits exactly where a segmentation algorithm is looking for a boundary, so it is read as cell, and every count and area measured afterwards is wrong by however much of the ring got included. The artifact is invisible to the person looking down the eyepiece and fatal to the software downstream."
      },
      {
        "kind": "interactive",
        "widget": "wipe",
        "layer": "Classical path",
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
        "heading": "Two routes, one exit",
        "layer": "Classical path",
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
        "kind": "diagram",
        "shape": "flow",
        "layer": "Classical path",
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
        "heading": "Learn the mistake, not the picture",
        "layer": "Model",
        "body": "The network is never asked to draw a cell. It is asked for the residual — what is left over after the classical front-end has done what it can — and the cleaned image is the input minus that prediction. This matters because the residual is small, sparse and structured, while a cell is large and varied. A model that has to reproduce the whole image spends its capacity relearning things the input already contains; a model that only has to describe the error starts from a much easier problem, and its failure mode is leaving some halo behind rather than inventing a cell that was never there."
      },
      {
        "kind": "prose",
        "heading": "It has to run on the first try",
        "layer": "Interface",
        "body": "A pre-trained fp16 checkpoint ships with the repo, so hybrid inference works with no training step. Half precision was what kept the weights small enough to commit. PSNR, SSIM and FLOPs are reported per run into an auto-generated Markdown report, and a Gradio app gives an interactive before-and-after view."
      },
      {
        "kind": "prose",
        "heading": "The same arithmetic, moved into a tab",
        "layer": "Interface",
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
        "heading": "The port is checked, not promised",
        "layer": "Measure",
        "body": "A JavaScript reimplementation of an OpenCV pipeline is only worth anything if it actually matches. scripts/verify_web_pipeline.py runs both implementations over the same images and fails on divergence: they agree to roughly 50 dB PSNR, with a maximum per-pixel difference of about 0.016 of full scale from tile-boundary interpolation, and the JavaScript PSNR and SSIM match scikit-image exactly to five decimals."
      },
      {
        "kind": "prose",
        "heading": "What the browser cannot be asked to do",
        "layer": "Model",
        "body": "At 31M parameters the model is a ~124 MB float32 download and far too slow for WebAssembly, so its output is precomputed and served as an image, labelled as precomputed rather than passed off as live. Uploads get no-reference metrics instead — edge energy from a Sobel gradient for membrane detail, and background variance over the flattest quarter of an 8x8 tiling for empty space. Read together they answer “did the halo go”, which is a weaker claim than fidelity to a target, and the page says that too."
      },
      {
        "kind": "prose",
        "heading": "What a good number does not prove",
        "layer": "Measure",
        "body": "PSNR is a log of mean squared error, so it rewards being close everywhere and says nothing about being right where it matters. A pipeline that blurs an image slightly will often score well, because blur is small error spread thin. That is the opposite of what this is for. So the report carries SSIM beside it, and the images are shown rather than summarised: the wipe above is the real evidence, and the numbers are the corroboration."
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
    "layers": [
      {
        "name": "Canvas",
        "hue": 340,
        "parts": [
          "SVG",
          "live redraw"
        ]
      },
      {
        "name": "Colony",
        "hue": 28,
        "parts": [
          "ants",
          "pheromone",
          "evaporation"
        ]
      },
      {
        "name": "Formulation",
        "hue": 100,
        "parts": [
          "routing problem",
          "dependency constraints"
        ]
      },
      {
        "name": "Tasks",
        "hue": 190,
        "parts": [
          "durations",
          "an ordinary day"
        ]
      },
      {
        "name": "Knobs",
        "hue": 265,
        "parts": [
          "alpha",
          "beta",
          "rho",
          "iterations"
        ]
      }
    ],
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
        "heading": "The day, drawn as a map",
        "layer": "Formulation",
        "body": "A to-do list is usually treated as a set of independent things, each with a checkbox. It is not. Doing the shopping after the bank means a different walk than doing it before; answering email between two blocks of deep work costs more than answering it at the end. Once the cost of a task depends on what came before it, an ordering problem has become a routing problem, and routing problems have a literature. This one uses ant colony optimisation, and it does so in two honest forms: Errand Mode, where tasks are real places and distance is genuine haversine kilometres on a closed tour, and Focus Mode, where the colony orders a workday against a cost function made of things that actually hurt."
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
        "heading": "What one ant does",
        "layer": "Colony",
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
        "body": "One ant starts somewhere and repeatedly chooses the next task, weighing how much pheromone has been laid on that step against how attractive the step looks on its own — alpha and beta are exactly those two weights. It finishes a full order, the order is costed, and every step it took receives pheromone in proportion to how good the whole tour was. Nothing is planned. The route that keeps turning up in good tours simply accumulates more signal than the ones that do not, until the colony agrees."
      },
      {
        "kind": "diagram",
        "shape": "cycle",
        "layer": "Colony",
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
        "heading": "The trail has to forget",
        "layer": "Colony",
        "body": "Without evaporation the first decent route found becomes the only route ever found: every ant reinforces it, which makes it more attractive, which makes more ants take it. Rho is the fraction of pheromone that decays each iteration, and it is the whole reason the colony can change its mind. Bounding the trail from above and below does the rest — a ceiling stops one edge from becoming irresistible, a floor stops an edge from becoming invisible and unreachable."
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
        "heading": "You decide what better means",
        "layer": "Knobs",
        "body": "Alpha, beta, rho, q0, ants per iteration, 2-opt on or off, and the four objective weights are all exposed rather than tuned and hidden. This is partly honesty — these parameters change the answer, and a demo that hides them is claiming an objectivity it does not have — and partly the point: set context-switching to zero and watch the schedule fragment, and you have learned more about your own day than any recommended ordering would have told you."
      },
      {
        "kind": "interactive",
        "widget": "weights",
        "layer": "Knobs",
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
      }
    ]
  },
  {
    "id": "habita",
    "layers": [
      {
        "name": "Screen",
        "hue": 340,
        "parts": [
          "CSS Grid",
          "SVG progress rings"
        ]
      },
      {
        "name": "Matrix",
        "hue": 28,
        "parts": [
          "urgent / important",
          "four quadrants"
        ]
      },
      {
        "name": "Timeline",
        "hue": 100,
        "parts": [
          "drag onto a day",
          "real durations"
        ]
      },
      {
        "name": "Calendar",
        "hue": 190,
        "parts": [
          "Android Calendar API",
          "Capacitor"
        ]
      },
      {
        "name": "Storage",
        "hue": 265,
        "parts": [
          "localStorage",
          "schema migrations"
        ]
      }
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
        "heading": "Where a task sits is what it is",
        "layer": "Matrix",
        "body": "Most task apps store priority as a field: a number, a flag, a colour you pick from a menu. Habita stores it as a position. A task lives in one of four quadrants — Focus, Backburner, Fit In, Goals — and moving it is the only way to change what it means. The consequence is that you cannot mark everything important, because the grid has two axes and a thing that is urgent and not important has somewhere specific to go. The decision is made once, when the task is placed, and the layout is what remembers it."
      },
      {
        "kind": "diagram",
        "shape": "quadrant",
        "layer": "Matrix",
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
        "layer": "Matrix",
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
        "heading": "A ring drawn from one number",
        "layer": "Screen",
        "body": "Each quadrant carries a ring that fills as its tasks complete. It is a single SVG circle animated through stroke-dasharray — the dash pattern is set to the circumference, and the offset moves from full circumference (empty) to zero (complete). No dependency, no canvas, and it scales cleanly at any size."
      },
      {
        "kind": "formula",
        "tex": "C = 2\\pi r \\qquad \\text{offset} = C \\times \\left(1 - \\frac{\\text{done}}{\\text{total}}\\right)",
        "caption": "Circumference sets the dash length; the offset is driven by completion ratio. Animating stroke-dashoffset gives a smooth fill for free."
      },
      {
        "kind": "prose",
        "heading": "The calendar you already look at",
        "layer": "Timeline",
        "body": "A planner that only knows about itself is a second place to check, and a second place to check is a place you stop checking. Dragging a task onto the day timeline writes a real event into the phone's own calendar through a local Capacitor plugin over Android's CalendarContract — no third-party service, no sync account. Move the block and the event moves. Delete the event in your calendar app and the block notices it has gone and recreates it rather than failing quietly. The day view also reads what is already in the calendar and draws it in its own lane, so you can see what a slot would collide with before you take it."
      },
      {
        "kind": "prose",
        "heading": "A web app that stops feeling like one",
        "layer": "Calendar",
        "body": "The goal was something that feels native on a phone while staying a plain web project. The JavaScript is split into single-responsibility ES6 modules — theming, storage, tasks, UI, progress, calendar — served as-is with no bundler, then wrapped for Android with Capacitor. Capacitor Haptics gives real vibration on device; the Web Vibration API covers browsers."
      },
      {
        "kind": "prose",
        "heading": "Yesterday's data, today's app",
        "layer": "Storage",
        "body": "State persists to localStorage, so a user can return weeks later carrying a shape the current code no longer expects. Habita validates the stored object on load and migrates older shapes forward rather than trusting it — a stale save degrades into a correct one instead of a crash."
      }
    ]
  },
  {
    "id": "wikipedia-summarizer",
    "layers": [
      {
        "name": "Page",
        "hue": 340,
        "parts": [
          "static",
          "no build, no server"
        ]
      },
      {
        "name": "Strategies",
        "hue": 28,
        "parts": [
          "frequency",
          "TextRank",
          "position",
          "hybrid"
        ]
      },
      {
        "name": "Scoring",
        "hue": 100,
        "parts": [
          "ROUGE-1",
          "ROUGE-2",
          "ROUGE-L"
        ]
      },
      {
        "name": "Reference",
        "hue": 190,
        "parts": [
          "the lead section editors wrote"
        ]
      },
      {
        "name": "Source",
        "hue": 265,
        "parts": [
          "MediaWiki API"
        ]
      }
    ],
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
        "heading": "Marked against the people who wrote it",
        "layer": "Scoring",
        "body": "Every extractive summariser can be scored against another summariser, which tells you which of two guesses is closer to a third guess. This one is scored against the article's own lead section — the summary Wikipedia's editors wrote and then argued about for years. There is one catch, and it is the interesting part: scoring against the full lead would hand a perfect 1.000 to anything that copied it, so the lead is trimmed to the same word budget the algorithms get. What comes out is a human ceiling. The best algorithm reaches 56 to 67% of it."
      },
      {
        "kind": "diagram",
        "shape": "bars",
        "layer": "Scoring",
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
        "heading": "Four ways of being wrong",
        "layer": "Strategies",
        "body": "All four are extractive: they select existing sentences rather than generating new ones. What differs is how each decides what matters — and because they share one TF-IDF pass, a difference in output is a difference in strategy rather than in tokenisation."
      },
      {
        "kind": "interactive",
        "widget": "steps",
        "layer": "Strategies",
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
        "heading": "The winner changes with the article",
        "layer": "Scoring",
        "body": "Across three articles, MMR takes two and TextRank takes one — and MMR goes from best on Penguin (0.400) to worst on Roman Empire (0.188). That instability is not noise to be averaged away; it is the finding. An extractive summariser is a bet on what kind of document it is reading, and a single headline number hides which bet was made. Six charts are recomputed on every search for the same reason: positional density shows where a method looked, sentence overlap shows when two methods are agreeing, and the coverage-against-self-repetition quadrant is the chart that justifies MMR existing at all."
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
        "heading": "Sixty milliseconds, and no server at all",
        "layer": "Page",
        "body": "Everything happens in the tab. Type Kakapo and the article is fetched from the MediaWiki API, split, tokenised once, run through four selectors and six charts in about 60 ms for a 4,300-word article. There is no backend to keep alive, no key to leak and no cost per visitor, which is the only reason a link like this still works two years after anyone stopped paying attention to it. ES modules served as static files, hand-rolled SVG charts, zero dependencies."
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) { module.exports = projects; }
