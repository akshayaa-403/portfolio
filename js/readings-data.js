/* Reading list. A bare global, like js/hobby-data.js, so the Node tools can
   evaluate this file directly.

   Rendered as a shelf (renderReadings in js/script.js): each book stands as a
   spine and turns in place to show its cover. The spine is drawn rather than
   photographed — `colour` is an accent sampled from the book's own cover, and
   the ink on it is chosen at run time from that colour's measured luminance,
   so a pale spine gets dark type without anyone specifying it. The cover is
   the only image.

   Every book is drawn at its real size, on one scale, so the shelf has the
   unevenness a real shelf has. `heightMm` and `widthMm` are the trim of the
   edition whose cover is shown; `pages` drives the thickness of the spine.
   Page counts are from Open Library. It carries no `physical_dimensions` for
   any of these three, so the trims are the standard ones for each edition's
   format — 6x9in for the 80,000 Hours paperback, B-format for the Hodder
   Sceptre, US trade paperback for the St. Martin's Essentials. Set
   `hardback: true` on a book bound in boards; it only thickens the spine.

   Covers come from the Open Library cover archive and live in
   public/assets/readings/.

   Shape: { asOf, groups: [{ topic, books: [{ title, author, colour, cover,
                              heightMm, widthMm, pages, hardback?, note?,
                              summary?, url? }] }] }

   `note` is one line, shown under the shelf. `summary` is what gets written
   onto the scrap of paper beside the book when one is taken off the shelf,
   condensed from the publisher's own copy on the listing in `url`.

   KEEP A SUMMARY UNDER ABOUT 260 CHARACTERS. It is handwritten onto real
   ruled paper (public/assets/notes/, measured by tools/trace-notes.py), and
   the smallest scrap holds eleven lines at a size anyone can read. Longer
   than that and js/script.js has to fall back to the roomiest note every
   time, which kills the shuffle. */
var readings = {
  asOf: '09/2026',
  groups: [
    {
      topic: 'Work and people',
      books: [
        {
          title: '80,000 Hours',
          author: 'Benjamin Todd',
          colour: '#1fa39e',
          cover: 'public/assets/readings/80000-hours.webp',
          heightMm: 229,
          widthMm: 152,
          pages: 342,
          url: 'https://www.goodreads.com/book/show/33229792-80-000-hours',
          note: 'On spending a career on something that matters, argued from evidence rather than from feeling.',
          summary: 'You get about 80,000 hours of working life. Todd argues that most career advice is unresearched — “follow your passion” worst of all — and replaces it with evidence: build career capital, pick problems by scale and neglect.'
        },
        {
          title: 'The Art of Creative Thinking',
          author: 'Rod Judkins',
          colour: '#f2c81e',
          cover: 'public/assets/readings/art-of-creative-thinking.webp',
          heightMm: 198,
          widthMm: 129,
          pages: 288,
          url: 'https://www.goodreads.com/book/show/24905747-the-art-of-creative-thinking',
          note: 'Eighty-nine short chapters, each one a way of getting unstuck. Best read out of order.',
          summary: 'Judkins teaches creativity at Central Saint Martins. Ninety very short chapters on how creative people actually behave \u2014 Dada, Warhol\u2019s Factory, Nobel economists \u2014 on the argument that the habits are learnable rather than innate.'
        },
        {
          title: 'Surrounded by Idiots',
          author: 'Thomas Erikson',
          colour: '#d2402f',
          cover: 'public/assets/readings/surrounded-by-idiots.webp',
          heightMm: 210,
          widthMm: 140,
          pages: 304,
          url: 'https://www.goodreads.com/book/show/39101777-surrounded-by-idiots',
          note: 'Four behaviour types, and the uncomfortable business of working out which one you are.',
          summary: 'Erikson sorts behaviour into four types: Red is commanding, Yellow social, Green easy-going, Blue precise. Most of what reads as stupidity in other people is a mismatch of type. Treat people as they would like to be treated, not as you would.'
        }
      ]
    }
  ]
};
