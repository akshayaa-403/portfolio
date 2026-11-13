/* Ask the CRM — case study. A public rebuild, on invented data, of the methods
   behind the owner's Artenos work. Every figure here comes from the artenos
   repo (github.com/akshayaa-403/artenos); nothing is Artenos's data or results. */
(function () {
  'use strict';

  Article.register('ask-the-crm', {
    form: 'pipeline',
    dek: 'A sales team’s plain-English questions, answered from a CRM by checked, read-only SQL, and a Monday summary whose every number is looked up before it is shown. The number checker caught **all 84** planted wrong numbers with **no false alarms** on 36 clean summaries; the 34 real numbers moved under the wrong label got through, and it says so.',

    chapters: [
      {
        id: 'problem', title: 'The problem',
        blocks: [
          { p: 'At Artenos Network I built dashboards for a sales team and ran LLM benchmarking and prompt testing. That work used the company’s data, so none of it can be shown. This is the method rebuilt in public, on a CRM where every company, person and deal is invented.' },
          { p: 'Two things go wrong when a language model sits between a salesperson and the data. The model that writes the SQL can be confidently wrong, and the answer looks just as sure either way. The model that writes the weekly summary can put a number in a sentence that was never in the data. I wanted both to be measured, not trusted.' }
        ]
      },
      {
        id: 'built', title: 'What I built',
        blocks: [
          { h: 'A CRM that is the same on every machine' },
          { p: 'A seeded generator writes the database: 48 accounts, 7 products, 15 agents under 3 managers, 2,400 deals and 706 deal notes, with “today” fixed at 28 June 2026. Same seed, same rows, so every score can be re-run.' },
          { h: 'A question set, split before the first prompt' },
          { p: '155 questions. 133 have a gold SQL query, and 22 ask for things the data doesn’t hold, like satisfaction scores, quotas or next quarter’s revenue, where the right move is to decline. A seeded, stratified shuffle puts a third of them in a **test** split before any prompt ran. Prompts are only changed while looking at **dev**.' },
          { p: 'An answer counts as right if the model’s query returns the same rows as the gold query: row order ignored, numbers compared at two decimals, extra columns allowed, missing ones not. Those rules were written before the first prompt.' },
          { table: {
              head: ['Version', 'Adds'],
              rows: [
                ['v1', 'The schema and the question (the baseline)'],
                ['v2', 'Plain notes on what the columns mean'],
                ['v3', 'Six worked examples, none from the question set'],
                ['v4', 'Rules for common text-to-SQL mistakes'],
                ['v5', 'Permission to say “the data can’t answer that”']
              ] },
            caption: 'Each version adds one thing, so the difference between two versions is what that one thing was worth. core/ask.py.' },
          { h: 'A guard between the model and the database' },
          { p: 'Every query the model writes goes through four checks, each enough on its own for the common cases: one statement only, and it must be a SELECT; the file is opened read-only; an SQLite authorizer refuses anything but reads; and at most 200 rows come back, with the query stopped after 2 seconds.' },
          { h: 'A summary that is checked, not trusted' },
          { p: 'The Monday summary’s figures come from SQL. The model only writes the sentences. Then a checker finds every number in the text, including words like “doubled”, “half of” and “twelve”, and looks it up in the week’s figures, allowing for the rounding the text itself shows: “$48.3k” stands for anything from $48,250 to $48,350. The live version asks for one rewrite when anything is missing.' },
          { h: 'Running it' },
          { p: 'One Docker container on Render: Next.js pages exported to static files and served by FastAPI next to the API. Every model call is traced with its latency, tokens, cost and outcome, and a visitor can mark an answer helpful or not. Questions marked unhelpful are exported to be labelled and added to the dev split. The demo spends my own key, so it is capped per visitor and per day.' }
        ]
      },
      {
        id: 'hard', title: 'The hard part',
        blocks: [
          { p: 'Deciding what counts as the same answer took longer than writing the prompts. “Which agent won the most?” can come back as a name, or a name and a count. A win rate can come back as 0.53 or 53. I allowed the extra column and refused the fraction, because the data notes the model is given say a win rate is a percentage.' },
          { p: 'The checker needed the same care. Its first run flagged every one of 36 clean summaries, all for the same word: “60”, as in “engaging for more than 60 days”. Sixty is a definition, not a result, and it sits in the label of a fact. Numbers in a fact’s own label now count as supported. False alarms went to zero.' },
          { p: 'Then the free tier ran out. Gemini allows 500 requests a day per model on a free key, and the prompt-version run needs 775. Halfway through, every call came back refused, and the eval was about to score each refusal as a wrong answer. It now refuses to save any result if a single call failed, and resumes from its cache the next day.' }
        ]
      },
      {
        id: 'results', title: 'Results',
        blocks: [
          { table: {
              head: ['Planted error', 'Caught'],
              rows: [
                ['A real number nudged by 10–30%', '36 of 36'],
                ['A count written as the wrong word', '12 of 12'],
                ['“Doubled” or “halved” when it wasn’t', '36 of 36'],
                ['A real number moved under the wrong label', '0 of 34']
              ] },
            caption: 'evals/checker_eval.py: 36 clean summaries written from the real facts, no false alarms on any of them, then one error planted per copy.' },
          { p: 'The last row is the blind spot. The checker checks values, not which label a value belongs to, so “we won 34 deals” passes when 34 is real but belongs to something else. I measured it rather than leave it out.' },
          { p: 'The guard refuses all seven write and trick queries in its tests, including a DELETE hidden behind a WITH, and stops a runaway recursive query at the 2-second limit.' },
          { p: 'The prompt-version scores, v1 to v5 on the frozen test split, are being measured; the run stopped at the free tier’s daily limit and resumes from its cache. They will be in RESULTS.md in the repo.' }
        ]
      }
    ],

    closing: {
      blocks: [
        { p: '**Budget the quota before the run.** I sized the eval in questions, not in requests per day, and found the limit by hitting it.' },
        { p: '**Let the gate stop the deploy, not just the build.** CI re-scores the live prompt, but Render deploys on every push whether CI passes or not. The gate should sit in front of the deploy.' },
        { p: '**Close the checker’s blind spot.** A sentence knows which number goes with which label; the checker should check the pair, not only the value.' },
        { p: '**Keep telemetry somewhere that survives a restart.** On Render’s free plan the log resets whenever the service sleeps.' }
      ]
    },

    sources: [
      ['Repo', 'github.com/akshayaa-403/artenos: core/, evals/, api/, app/; live at ask-the-crm.onrender.com.'],
      ['Question set', 'evals/questions.json: 155 questions, 133 answerable, 22 not; dev 104, test 51 (seed 20260628).'],
      ['Checker', 'evals/results/checker.json, from evals/checker_eval.py; no model calls.'],
      ['Guard', 'core/guard.py; tests/test_core.py (9 tests, all passing).'],
      ['Model and quota', 'gemini-3.5-flash-lite, $0.30 / $2.50 per million tokens; free tier 500 requests a day per model (Google, read 2026-11-13).']
    ]
  });
})();
