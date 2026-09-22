/* Work experience. A bare global, like js/project-data.js and
   js/hobby-data.js, so the Node tools can evaluate this file directly.

   Rendered by renderExperience() in js/script.js into #experience, which sits
   ABOVE Projects: the first question anyone reading this page has is whether
   the work has been done inside a team, on a deadline, for someone who paid.
   The project list answers "can she build"; this answers "has she shipped".

   Newest first. `dates` is the string that renders; `start`/`end` are the
   machine-readable months behind it (YYYY-MM, or null for a current role) and
   go into the <time> attributes. `project` is the id of a case study on this
   site that came out of the role, so the two are one click apart.

   Every bullet has to be something the role actually produced. Where the work
   is not public, say what it was generically rather than dressing it up. */
var experience = [
  {
    company: 'InnovyQ',
    role: 'AI Engineer',
    dates: 'June 2026 – August 2026',
    start: '2026-06',
    end: '2026-08',
    place: 'Remote',
    blurb: 'Three months building Project IVY, an AI support agent that lives in Slack and files its own Jira tickets.',
    bullets: [
      'Built the agent end to end on AWS — API Gateway to Lambda to SQS to Lex V2, with DynamoDB holding per-issue session state and an Anthropic Claude fallback for anything Lex could not answer.',
      'Benchmarked four OCR engines against hand-written ground truth so screenshotted tickets could be read automatically: Mistral OCR came out at 100% character accuracy and 823 ms per image, against Textract at 99.9% and 1,551 ms.',
      'Wrote the live-agent dispatcher: least-loaded on-shift agent picked from DynamoDB or Jira Service Management on-call, with a conditional update reserving the slot so a double-click cannot double-assign a ticket.'
    ],
    stack: ['Python', 'AWS Lambda', 'SQS', 'DynamoDB', 'Lex V2', 'Bedrock', 'Rekognition', 'Docker', 'Jira API']
    // No `project` link: the Project IVY case study is archived, so the role
    // stands on its bullets. Add it back if IVY returns to the list.
  },
  {
    company: 'Artenos Network Pvt Ltd',
    role: 'Software Engineer',
    dates: 'July 2025 – May 2026',
    start: '2025-07',
    end: '2026-05',
    place: 'India',
    blurb: 'Internal tooling for a sales team: the dashboards they read every morning, and the LLM work behind them.',
    bullets: [
      'Built and maintained the dashboards the team ran on, from CRM exports, in Python and Matplotlib — the reporting that cut their decision time by about a quarter.',
      'Ran the LLM benchmarking and prompt testing, raising measured response accuracy by roughly 15%.',
      'Shipped internal full-stack tools in React Native, Next.js and TypeScript over Python REST APIs, deployed on Vercel.'
    ],
    stack: ['Python', 'Matplotlib', 'TypeScript', 'Next.js', 'React Native', 'REST', 'Vercel']
  },
  {
    company: 'Sygnius Digital',
    role: 'AI Specialist',
    dates: 'January 2025 – June 2025',
    start: '2025-01',
    end: '2025-06',
    place: 'Noida, India',
    blurb: 'Lead generation and the analysis that changed how the sales team worked it.',
    bullets: [
      'Wrote the Google Maps lead scraper that fed the AI calling system, cutting manual lead-generation work by about 40%.',
      'Added an AI voice agent to the CRM to handle follow-up calls, taking roughly 40% off the team’s call time.',
      'Analysed the sales data in Python and SQL and found that calls placed within an hour of lead capture converted three times better; the workflow changed and overall conversion rose about 15%.'
    ],
    stack: ['Python', 'SQL', 'BeautifulSoup', 'Selenium', 'Pandas']
  }
];
