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
                              url? }] }] } */
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
          note: 'On spending a career on something that matters, argued from evidence rather than from feeling.'
        },
        {
          title: 'The Art of Creative Thinking',
          author: 'Rod Judkins',
          colour: '#f2c81e',
          cover: 'public/assets/readings/art-of-creative-thinking.webp',
          heightMm: 198,
          widthMm: 129,
          pages: 288,
          note: 'Eighty-nine short chapters, each one a way of getting unstuck. Best read out of order.'
        },
        {
          title: 'Surrounded by Idiots',
          author: 'Thomas Erikson',
          colour: '#d2402f',
          cover: 'public/assets/readings/surrounded-by-idiots.webp',
          heightMm: 210,
          widthMm: 140,
          pages: 304,
          note: 'Four behaviour types, and the uncomfortable business of working out which one you are.'
        }
      ]
    }
  ]
};
