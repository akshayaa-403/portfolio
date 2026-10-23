/* Reading list. A bare global, like js/hobby-data.js, so the Node tools can
   evaluate this file directly.

   Rendered as a shelf (renderReadings in js/script.js): each book stands as a
   spine and turns in place to show its cover. The spine is drawn rather than
   photographed, in `spine`: the cover's own dominant colour, written here by
   tools/spine-colours.py (re-run it after adding a cover). The ink on it is
   chosen at run time from that colour's measured luminance, so a pale spine
   gets dark type. The back of the book is the spine's colour too. A book
   with no `cover` is black, with its title on the front, until one is
   supplied. The cover is the only image.

   Every book is drawn at its real size, on one scale, so the shelf has the
   unevenness a real shelf has. `heightMm` and `widthMm` are the trim of the
   edition whose cover is shown; `pages` drives the thickness of the spine.
   Trims and page counts are from the retail listing the cover was taken
   from where it states them, else Open Library, else the standard trim for
   the edition's format. Set `hardback: true` on a book bound in boards; it
   only thickens the spine.

   Covers live in public/assets/readings/ (Amazon scans, or a seller's
   photographs straightened to the book's outline).

   Shape: { asOf, groups: [{ topic, books: [{ title, author, cover?, spine?,
                              heightMm, widthMm, pages, hardback?,
                              note?, url? }] }] }

   `note` is one line, shown under the shelf.

   Groups are genres, and within each the books stand tallest first, so the
   shelf steps down genre by genre (owner's request, 2026-10-23). */
var readings = {
  asOf: '10/2026',
  groups: [
    {
      topic: 'Self-help and psychology',
      books: [
        {
          title: '80,000 Hours',
          author: 'Benjamin Todd',
          cover: 'public/assets/readings/80000-hours.webp',
          spine: '#54c3d4',
          heightMm: 243,
          widthMm: 153,
          pages: 384,
          hardback: true,
          url: 'https://www.goodreads.com/book/show/33229792-80-000-hours',
          note: 'On spending a career on something that matters, argued from evidence rather than from feeling.'
        },
        {
          title: 'Surrounded by Idiots',
          author: 'Thomas Erikson',
          cover: 'public/assets/readings/surrounded-by-idiots.webp',
          spine: '#f2d10a',
          heightMm: 241,
          widthMm: 159,
          pages: 304,
          hardback: true,
          url: 'https://www.goodreads.com/book/show/39101777-surrounded-by-idiots',
          note: 'Four behaviour types, and the uncomfortable business of working out which one you are.'
        },
        {
          title: 'Learned Excellence',
          author: 'Eric Potterat & Alan Eagle',
          cover: 'public/assets/readings/learned-excellence.webp',
          spine: '#c69231',
          heightMm: 240,
          widthMm: 158,
          pages: 256,
          hardback: true,
          note: 'A Navy SEAL psychologist’s mental drills, written down for people who will never go near a SEAL team.'
        },
        {
          title: 'The Courage to Be Disliked',
          author: 'Ichiro Kishimi & Fumitake Koga',
          cover: 'public/assets/readings/courage-to-be-disliked.webp',
          spine: '#b71f19',
          heightMm: 213,
          widthMm: 139,
          pages: 288,
          url: 'https://www.goodreads.com/book/show/43306206-the-courage-to-be-disliked',
          note: 'Adler’s psychology as a five-night argument between a philosopher and a young man who refuses to be convinced.'
        },
        {
          title: 'Never Split the Difference',
          author: 'Chris Voss & Tahl Raz',
          cover: 'public/assets/readings/never-split-the-difference.webp',
          spine: '#e4313a',
          heightMm: 203,
          widthMm: 125,
          pages: 288,
          note: 'An FBI hostage negotiator on why splitting the difference is how both sides lose.'
        },
        {
          title: 'The Art of Creative Thinking',
          author: 'Rod Judkins',
          cover: 'public/assets/readings/art-of-creative-thinking.webp',
          spine: '#fde72b',
          heightMm: 185,
          widthMm: 115,
          pages: 288,
          url: 'https://www.goodreads.com/book/show/24905747-the-art-of-creative-thinking',
          note: 'Eighty-nine short chapters, each one a way of getting unstuck. Best read out of order.'
        }
      ]
    },
    {
      topic: 'Finance and economics',
      books: [
        {
          title: 'Edible Economics',
          author: 'Ha-Joon Chang',
          cover: 'public/assets/readings/edible-economics.webp',
          spine: '#af3b23',
          heightMm: 243,
          widthMm: 157,
          pages: 224,
          hardback: true,
          note: 'Economics through seventeen dishes, each one a way into an argument the textbooks would rather skip.'
        },
        {
          title: 'When Genius Failed',
          author: 'Roger Lowenstein',
          cover: 'public/assets/readings/when-genius-failed.webp',
          spine: '#2e65b8',
          heightMm: 241,
          widthMm: 163,
          pages: 288,
          hardback: true,
          note: 'Long-Term Capital Management: two Nobel laureates, enormous leverage, and the 1998 rescue.'
        },
        {
          title: 'Soros on Soros',
          author: 'George Soros',
          cover: 'public/assets/readings/soros-on-soros.webp',
          spine: '#f0d038',
          heightMm: 238,
          widthMm: 169,
          pages: 336,
          hardback: true,
          note: 'Soros explaining reflexivity: markets act on what people believe about them, so the beliefs move the prices.'
        },
        {
          title: 'Liar’s Poker',
          author: 'Michael Lewis',
          cover: 'public/assets/readings/liars-poker.webp',
          spine: '#d4af54',
          heightMm: 198,
          widthMm: 128,
          pages: 249,
          note: 'Salomon Brothers in the 1980s, from the trading floor, by someone who quit while he was winning.'
        }
      ]
    },
    {
      topic: 'History, politics and essays',
      books: [
        {
          title: 'Geopolitics in Health',
          author: 'Eduardo J. Gómez',
          cover: 'public/assets/readings/geopolitics-in-health.webp',
          spine: '#b32429',
          heightMm: 229,
          widthMm: 151,
          pages: 320,
          note: 'How the BRICS governments handled obesity, AIDS and tuberculosis, and what their politics did to the answers.'
        },
        {
          title: 'Messy Cities',
          author: 'Dylan Reid & Zahra Ebrahim (eds.)',
          cover: 'public/assets/readings/messy-cities.webp',
          spine: '#ce963d',
          heightMm: 203,
          widthMm: 131,
          pages: 300,
          note: 'Essays on the parts of cities that work precisely because nobody planned them.'
        },
        {
          title: 'Guns, Germs, and Steel',
          author: 'Jared Diamond',
          cover: 'public/assets/readings/guns-germs-steel.webp',
          spine: '#0daab5',
          heightMm: 198,
          widthMm: 129,
          pages: 528,
          note: 'Why some societies conquered others: geography, crops and animals, rather than anything about the people.'
        },
        {
          title: 'Why I Write',
          author: 'George Orwell',
          cover: 'public/assets/readings/why-i-write.webp',
          spine: '#cc321e',
          heightMm: 181,
          widthMm: 111,
          pages: 128,
          note: 'Four essays, including the one that says good prose should be like a windowpane.'
        }
      ]
    },
    {
      topic: 'Fiction',
      books: [
        {
          title: 'Angels & Demons',
          author: 'Dan Brown',
          cover: 'public/assets/readings/angels-and-demons.webp',
          spine: '#be8930',
          heightMm: 198,
          widthMm: 126,
          pages: 624,
          note: 'Robert Langdon’s first outing: a stolen antimatter canister, the Vatican, and one night to find it.'
        },
        {
          title: 'Blue Sisters',
          author: 'Coco Mellors',
          cover: 'public/assets/readings/blue-sisters.webp',
          spine: '#4c8bdb',
          heightMm: 198,
          widthMm: 129,
          pages: 368,
          note: 'Three sisters, a year after losing the fourth.'
        },
        {
          title: 'The Employees',
          author: 'Olga Ravn',
          cover: 'public/assets/readings/the-employees.webp',
          spine: '#a52930',
          heightMm: 198,
          widthMm: 129,
          pages: 136,
          note: 'Statements from the crew of a spaceship, human and humanoid, filed as a workplace inquiry.'
        },
        {
          title: 'The Vegetarian',
          author: 'Han Kang',
          cover: 'public/assets/readings/the-vegetarian.webp',
          spine: '#c93832',
          heightMm: 198,
          widthMm: 131,
          pages: 188,
          note: 'A woman stops eating meat, and everyone around her takes it as an attack.'
        }
      ]
    }
  ]
};
