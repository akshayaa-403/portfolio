/* Ant Colony City Networks — case study. The id stays `anttodo` so old links
   keep working; the repo is now github.com/akshayaa-403/ant-map.

   Every figure here comes from that repo at 9f05dc7: its README, engine.js,
   test/engine.test.js, and engine.js run in Node 24 on the committed OSM
   snapshots (data/<city>.min.json, OSM as of 2026-11-25) with the page's
   defaults: 40 localities, κ = 2, φ = 1, λ = 4, μ = 0, 200 iterations,
   seeds 1–3. Re-run 2026-11-27. A live refresh from Overpass changes them. */
(function () {
  'use strict';

  Article.register('anttodo', {
    form: 'map',
    dek: 'Mumbai, Bengaluru and Delhi on one map: the rail each city runs today, the rail OpenStreetMap says is coming, and a network an ant colony designs in the browser, all scored the way Tero et al. scored a slime mould against Tokyo. On the page’s defaults the colony joins all 40 localities at **1.42 to 1.54 times** the length of the minimum spanning tree. By the same test, today’s rail joins **4% to 33%** of locality pairs.',

    chapters: [
      {
        id: 'problem', title: 'The problem',
        blocks: [
          { p: 'In 2010 Tero and colleagues placed oat flakes like the cities around Tokyo and let the slime mould *Physarum polycephalum* connect them, using light to keep it off mountains, sea and lakes. Then they scored its network and the real rail system the same way: total length against the minimum spanning tree (MST) for cost, mean distance between cities for efficiency, and how many single-link failures the network survives. Tokyo’s rail came out at about 1.8 times the MST’s length, and the slime mould’s networks were close to it.' },
          { p: 'I wanted that scorecard for three Indian cities, and I wanted three networks on it, not one: the rail that runs today, the rail that is planned, and a network designed from scratch. All three had to be scored on the same set of places, or the numbers can’t be compared. I could not find a Physarum or ant-colony network-design study of any of the three cities.' },
          { p: 'The repo started out as an ant-colony to-do scheduler. In November 2026 I replaced it with this, kept the ants, and borrowed the rest from the slime-mould paper.' }
        ]
      },
      {
        id: 'built', title: 'What I built',
        blocks: [
          { p: 'One static page, a Leaflet map with no build step, and one engine file, `engine.js`, that the page and the Node tests both load. Pick a city and three layers draw on top of each other.' },
          { table: {
              head: ['Layer', 'What it shows', 'Where it comes from'],
              rows: [
                ['Current', 'Rail, metro and monorail in service, plus motorway, trunk and primary roads', 'An OpenStreetMap snapshot'],
                ['Projected future', 'Rail and major roads tagged `construction` (solid) or `proposed` (dashed)', 'The same snapshot'],
                ['ACO-optimised', 'A network between localities designed by a MAX-MIN Ant System', 'Computed in the browser']
              ] },
            caption: 'Housing (residential land) and live TomTom traffic, with the visitor’s own key, are optional extra layers.' },
          { figure: 'public/assets/projects/antmap-mumbai.webp', size: 'wide',
            alt: 'The live page on Mumbai. A control panel on the left lists the layers and the colony’s sliders. The map shows current rail in blue, planned rail and roads in orange, and the colony’s network in green: about 40 circles, sized by housing, joined by straight links from Mira-Bhayander down to the southern tip and across the harbour to Navi Mumbai and Panvel.',
            caption: 'Mumbai on the page’s defaults: 40 localities, 127 candidate links, 57 of them over water, OpenStreetMap as of 2026-11-25.' },
          { p: 'Each city loads a pre-classified snapshot under 1 MB. Overpass, the free OpenStreetMap query service, is called only when someone clicks *Refresh from OpenStreetMap* or a city has no snapshot, because it is shared and often overloaded.' },
          { h: 'Localities' },
          { p: 'OpenStreetMap’s suburb, neighbourhood and quarter points are clustered with k-means into 40 localities (a slider allows 20 to 60). Each locality is weighted by the residential land nearest to it, and by the commercial, retail and industrial land nearest to it. Each is linked to its 5 nearest neighbours, and the MST is added so the candidate graph is always connected.' },
          { h: 'The colony' },
          { p: 'Each iteration, about a third as many ants as there are localities walk between pairs of localities drawn from a gravity model, so nearby places with a lot of housing trade the most trips. At each step an ant weighs a link by its pheromone and by the link’s cost plus the straight-line distance still left to its destination.' },
          { tex: 'T_{od} = \\frac{(1-\\mu) \\, h_o h_d + \\mu \\, (h_o j_d + h_d j_o)/2}{d_{od}^{1.5}}', caption: 'Trip demand between localities o and d. h is housing share, j is job share, μ the share of home-to-work trips (default 0).' },
          { p: 'The links the ants used, topped up to reach every locality, are that iteration’s network. It is scored on cost, on demand-weighted trip length, and on fault tolerance.' },
          { tex: 'J = \\frac{TL}{TL_{MST}} + \\kappa \\, \\frac{MD_w}{MD_{w,MST}} - \\varphi \\, FT', caption: 'Lower is better. κ plays the part of Tero’s flow strength: raise it and the colony buys loops and shorter trips at extra cost.' },
          { p: 'The pheromone follows the MAX-MIN Ant System of Stützle and Hoos: the bounds follow the best score so far, every tenth iteration the best-so-far network deposits instead of the current one, and the whole field resets after more than 50 iterations without improvement. From the paper I borrowed one more thing, its flow reinforcement: a link’s deposit grows with how many ants used it, along a sigmoid.' },
          { code: 'const jp = (J) => J + o.phi + 0.01; // keep the deposit denominator positive\nconst tmax = 1 / (o.rho * jp(this.bestJ)), tmin = tmax / (2 * this.n);\nif (this.iter === 1) this.tau.fill(tmax);\nfor (let i = 0; i < this.tau.length; i++) this.tau[i] *= 1 - o.rho;\nconst useBest = this.iter % 10 === 0;\nconst DS = useBest ? this.best : S, U = useBest ? this.bestUsed : used;\nconst dep = 1 / jp(useBest ? this.bestJ : sc.J);\nfor (const e of DS) {\n  const u = ((U.get(e) || 0) / m) ** o.gamma;\n  this.tau[e] += dep * (0.5 + 0.5 * u / (1 + u));\n}\nfor (let i = 0; i < this.tau.length; i++) this.tau[i] = Math.min(tmax, Math.max(tmin, this.tau[i]));\nif (this.stall > 50) { this.tau.fill(tmax); this.stall = 0; }',
            lang: 'javascript', caption: 'The pheromone update in `NetworkACO.step()`. `u / (1 + u)` is the paper’s Q^γ / (1 + Q^γ), with γ = 1.8.' },
          { h: 'Water, in place of Tero’s light' },
          { p: 'A link costs its length plus λ km for every km over a lake or the sea, plus 0.3·λ km for each river it crosses. A crossing within 0.5 km of an existing road or rail bridge is free. Sea is found from OpenStreetMap coastlines, which are drawn with the land on their left. In Mumbai 57 of the 127 candidate links cross water.' },
          { h: 'Scoring the rail on the same localities' },
          { p: 'For the current and future rows, a link between two localities counts as served when rail runs within 0.75 km of it along at least 80% of its length and both localities have a station within 2 km. Where OpenStreetMap has no station data the row falls back to the line test alone and says so.' },
          { p: 'The six numbers on every row are TL/MST (cost), MD/MST (mean network distance against the MST’s, lower is better), FT (the share of single-link failures that leave the network connected), α = FT ÷ TL/MST, and two that are not in the paper: RF, the demand-weighted route factor, and FTn, the share of single-locality outages the rest survives. 43 test assertions, run in CI, check the metrics on graphs with known answers, the water cost, the served-link test and the colony.' }
        ]
      },
      {
        id: 'hard', title: 'The hard part',
        blocks: [
          { p: 'Getting the trade-off to show up at all. With κ = φ = 0 the score asks for nothing but a short network, so the colony should settle on the MST. With as many ants as localities it didn’t: the union of forty ants’ paths is already a large network, whatever the pheromone says.' },
          { table: {
              head: ['Ants per iteration', 'Mumbai', 'Bengaluru', 'Delhi'],
              rows: [
                ['40 (one per locality)', '1.78', '2.01', '2.10'],
                ['13 (the default, n/3)', '1.06', '1.08', '1.05']
              ] },
            caption: 'TL/MST of the colony’s best network with κ = φ = 0, mean of seeds 1–3, 200 iterations. Re-run from engine.js on the committed snapshots.' },
          { p: 'At one ant per locality, the cheapest network the colony could find was about twice the MST, so raising κ had nothing left to buy. I tuned the ant count down to a third of the localities, and α up to 2, on a grid-shaped test city, and checked the result on the real ones. Now κ = φ = 0 lands within 8% of the MST, and the defaults (κ = 2, φ = 1) spend about half an MST more for loops and shorter trips. The tests hold the colony to both ends: near the MST at κ = φ = 0, and no less fault-tolerant as κ rises.' },
          { p: 'The second hard part was comparing the rail fairly. A real line curves; a link between two locality centres is straight. And rail doesn’t join every pair, so its mean distance can only be taken over the pairs it does join. I kept those pairs and added a Reach column, the share of pairs connected at all, so a low MD/MST on a network that reaches 4% of pairs can’t pass for efficiency.' }
        ]
      },
      {
        id: 'results', title: 'Results',
        blocks: [
          { table: {
              head: ['Network', 'Links', 'TL/MST', 'MD/MST', 'FT', 'Reach'],
              rows: [
                ['Mumbai · current rail', '43', '1.26', '0.44', '0.91', '22%'],
                ['Mumbai · future rail', '63', '1.91', '0.43', '0.94', '32%'],
                ['Mumbai · colony', '49.0 ± 0.8', '1.47 ± 0.08', '0.75 ± 0.04', '0.76 ± 0.04', '100%'],
                ['Bengaluru · current rail', '13', '0.40', '0.30', '0.23', '4%'],
                ['Bengaluru · future rail', '15', '0.45', '0.30', '0.33', '4%'],
                ['Bengaluru · colony', '49.3 ± 1.7', '1.42 ± 0.06', '0.79 ± 0.03', '0.94 ± 0.04', '100%'],
                ['Delhi · current rail', '37', '1.09', '0.49', '0.73', '33%'],
                ['Delhi · future rail', '52', '1.51', '0.43', '0.88', '37%'],
                ['Delhi · colony', '51.7 ± 1.9', '1.54 ± 0.10', '0.68 ± 0.01', '0.96 ± 0.03', '100%'],
                ['Minimum spanning tree', '39', '1.00', '1.00', '0.00', '100%']
              ] },
            size: 'wide',
            caption: 'The page’s score table on its defaults: 40 localities, κ = 2, φ = 1, λ = 4, μ = 0, 200 iterations; colony rows are mean ± sd over seeds 1–3. OpenStreetMap as of 2026-11-25. Rail MD/MST covers only the pairs rail connects (Reach).' },
          { p: 'In all three cities the colony joins every locality for 1.42 to 1.54 times the MST’s length, and its mean distance is 0.68 to 0.79 of the MST’s. Tokyo’s rail, in the paper, was about 1.8 and 0.85. That is a comparison of shape, not a verdict: Tokyo was 36 cities across a region, and these are 40 localities inside one city.' },
          { p: 'The rail rows say less than they seem to. Their low MD/MST is taken over 22% to 37% of the pairs in Mumbai and Delhi, and over 4% in Bengaluru. Bengaluru’s snapshot has 381 ways of planned or under-construction rail, and by this test they add 2 served links to 13. I have not yet worked out whether that is the city or the test.' },
          { p: 'Two things the repo measured did not help. Mixing in home-to-work trips at μ = 0.6 did not shorten the colony’s trips (RF) in any of the three cities, so the default is μ = 0. The water penalty does what it should: in Mumbai, λ = 4 cuts the water crossings in the colony’s best network from 16 to 18 links to 11 to 14.' }
        ]
      }
    ],

    closing: {
      blocks: [
        { p: '**Test the served-link rule against a line I can trace by hand.** Bengaluru’s planned rail barely registers. Scoring rail along its real path between stations, instead of asking it to shadow a straight link, would tell me whether the city or the rule is responsible.' },
        { p: '**Find real demand.** OpenStreetMap localities carry no population or jobs, so demand is weighted by land area. Both are proxies, and the commute-share experiment may have failed because of them.' },
        { p: '**Fetch lakes mapped as multipolygons.** Only simple ways are fetched, so some large lakes cost nothing to cross.' },
        { p: '**Show the colony’s progress, and run it longer.** One Bengaluru seed found its best network at iteration 179 of 200. The page should draw the best score over time so it is clear whether 200 iterations was enough.' }
      ]
    },

    sources: [
      ['Repo', '[github.com/akshayaa-403/ant-map](https://github.com/akshayaa-403/ant-map) at 9f05dc7: engine.js, index.html, README; live at [akshayaa-403.github.io/ant-map](https://akshayaa-403.github.io/ant-map/).'],
      ['Scores', 'engine.js run in Node 24 on data/*.min.json (OpenStreetMap as of 2026-11-25), page defaults, seeds 1–3, re-run 2026-11-27.'],
      ['Tests', 'test/engine.test.js: 43 assertions, all passing (`node test/run.js`).'],
      ['Tero et al. 2010', 'Rules for biologically inspired adaptive network design. *Science* 327:439. [doi:10.1126/science.1177894](https://doi.org/10.1126/science.1177894)'],
      ['Stützle & Hoos 2000', 'MAX–MIN Ant System. *Future Generation Computer Systems* 16:889. [doi:10.1016/S0167-739X(00)00043-1](https://doi.org/10.1016/S0167-739X(00)00043-1)']
    ]
  });
})();
