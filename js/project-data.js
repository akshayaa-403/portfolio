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
      'Streamlit Community Cloud caps an app at roughly 1 GB of memory, and loading FinBERT alone blows past a comfortable margin. Rather than drop sentiment analysis, I made the model tier configurable: lightweight lexicon scorers run by default and keep the hosted app inside its budget, while FinBERT stays one environment variable away for local or better-resourced deployments. The tradeoff is documented in the repo so the choice is legible instead of looking like an oversight.'
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
      'Learning the cleaned image directly made the network fight to reproduce detail it had already been given. Predicting the residual instead — just the artifact to remove — meant the model only had to learn the error term, which trained faster and preserved cell structure far better. Shipping fp16 weights kept the checkpoint small enough to commit, so the project is runnable the moment it is cloned.'
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
      'Ant Colony Optimization is usually taught as a wall of notation. The interesting part is not the formula but the emergent behaviour: no single ant is smart, yet the colony reliably finds a good route. Exposing the parameters as controls turns the algorithm into something you can poke at — crank evaporation up and watch the colony forget good routes, drop the ant count and watch convergence get noisy.'
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
      'I wanted the app to feel native on a phone while staying a plain web project with no bundler. Splitting the JavaScript into single-responsibility modules for theming, storage, tasks, UI and progress kept it readable without tooling, and Capacitor added real haptics on Android while the Web Vibration API covers browsers. Validating and migrating stored data on load meant an old saved state could never crash a newer build.'
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
      'Adversarial training is unstable and slow, and a full run is measured in tens of hours. The practical lesson was operational rather than architectural: without periodic sample grids and loss curves you cannot tell a model that is still converging from one that has collapsed until you have burned a day of GPU time. Benchmarking the real cost across platforms first made it clear which experiments were actually affordable.'
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
      'BART accepts about 1024 tokens, which a long Wikipedia article exceeds comfortably, so abstractive output degrades on exactly the documents that most need summarising while the extractive methods scale fine. The repo documents that limit rather than hiding it — the honest conclusion is that method choice depends on document length, not that one approach wins outright.'
  }
];

if (typeof module !== 'undefined' && module.exports) { module.exports = projects; }
