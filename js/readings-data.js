/* Reading list. A bare global, like js/hobby-data.js, so the Node tools can
   evaluate this file directly.

   Rendered as a shelf (renderReadings in js/script.js): each book stands as a
   spine and turns in place to show its cover. The spine is drawn rather than
   photographed, in a shade of the day's Wada combination (js/script.js,
   spineTone), and the ink on it is chosen at run time from that shade's
   measured luminance, so a pale spine gets dark type. The cover is
   the only image.

   Every book is drawn at its real size, on one scale, so the shelf has the
   unevenness a real shelf has. `heightMm` and `widthMm` are the trim of the
   edition whose cover is shown; `pages` drives the thickness of the spine.
   Trims and page counts are from the retail listing the cover was taken
   from where it states them, else Open Library, else the standard trim for
   the edition's format. Set `hardback: true` on a book bound in boards; it
   only thickens the spine.

   Covers live in public/assets/readings/. Front and back come from one
   listing of one edition (Amazon scans, or a seller's photographs
   straightened to the book's outline), so they always match. `back` is the same edition's back cover, put on
   the back face of the box when a book is taken off the shelf and turned.

   Shape: { asOf, groups: [{ topic, books: [{ title, author, cover,
                              back?, heightMm, widthMm, pages, hardback?,
                              note?, url? }] }] }

   `note` is one line, shown under the shelf. */
var readings = {
  asOf: '10/2026',
  groups: [
    {
      topic: 'Work and people',
      books: [
        {
          title: '80,000 Hours',
          author: 'Benjamin Todd',
          cover: 'public/assets/readings/80000-hours.webp',
          back: 'public/assets/readings/80000-hours-back.webp',
          heightMm: 243,
          widthMm: 153,
          pages: 384,
          hardback: true,
          url: 'https://www.goodreads.com/book/show/33229792-80-000-hours',
          note: 'On spending a career on something that matters, argued from evidence rather than from feeling.'
        },
        {
          title: 'The Art of Creative Thinking',
          author: 'Rod Judkins',
          cover: 'public/assets/readings/art-of-creative-thinking.webp',
          back: 'public/assets/readings/art-of-creative-thinking-back.webp',
          heightMm: 185,
          widthMm: 115,
          pages: 288,
          url: 'https://www.goodreads.com/book/show/24905747-the-art-of-creative-thinking',
          note: 'Eighty-nine short chapters, each one a way of getting unstuck. Best read out of order.'
        },
        {
          title: 'Surrounded by Idiots',
          author: 'Thomas Erikson',
          cover: 'public/assets/readings/surrounded-by-idiots.webp',
          back: 'public/assets/readings/surrounded-by-idiots-back.webp',
          heightMm: 241,
          widthMm: 159,
          pages: 304,
          hardback: true,
          url: 'https://www.goodreads.com/book/show/39101777-surrounded-by-idiots',
          note: 'Four behaviour types, and the uncomfortable business of working out which one you are.'
        },
        {
          title: 'The Courage to Be Disliked',
          author: 'Ichiro Kishimi & Fumitake Koga',
          cover: 'public/assets/readings/courage-to-be-disliked.webp',
          back: 'public/assets/readings/courage-to-be-disliked-back.webp',
          heightMm: 213,
          widthMm: 139,
          pages: 288,
          url: 'https://www.goodreads.com/book/show/43306206-the-courage-to-be-disliked',
          note: 'Adler’s psychology as a five-night argument between a philosopher and a young man who refuses to be convinced.'
        },
        {
          title: 'Learned Excellence',
          author: 'Eric Potterat & Alan Eagle',
          cover: 'public/assets/readings/learned-excellence.webp',
          heightMm: 240,
          widthMm: 158,
          pages: 256,
          hardback: true,
          note: 'A Navy SEAL psychologist’s mental drills, written down for people who will never go near a SEAL team.'
        },
        {
          title: 'Never Split the Difference',
          author: 'Chris Voss & Tahl Raz',
          cover: 'public/assets/readings/never-split-the-difference.webp',
          back: 'public/assets/readings/never-split-the-difference-back.webp',
          heightMm: 203,
          widthMm: 125,
          pages: 288,
          note: 'An FBI hostage negotiator on why splitting the difference is how both sides lose.'
        },
        {
          title: 'Working Identity',
          author: 'Herminia Ibarra',
          cover: 'public/assets/readings/working-identity.webp',
          heightMm: 241,
          widthMm: 162,
          pages: 240,
          hardback: true,
          note: 'You change careers by trying things out, not by working out who you are first.'
        }
      ]
    },
    {
      topic: 'Money and power',
      books: [
        {
          title: 'Liar’s Poker',
          author: 'Michael Lewis',
          cover: 'public/assets/readings/liars-poker.webp',
          back: 'public/assets/readings/liars-poker-back.webp',
          heightMm: 198,
          widthMm: 128,
          pages: 249,
          note: 'Salomon Brothers in the 1980s, from the trading floor, by someone who quit while he was winning.'
        },
        {
          title: 'Soros on Soros',
          author: 'George Soros',
          cover: 'public/assets/readings/soros-on-soros.webp',
          back: 'public/assets/readings/soros-on-soros-back.webp',
          heightMm: 238,
          widthMm: 169,
          pages: 336,
          hardback: true,
          note: 'Soros explaining reflexivity: markets act on what people believe about them, so the beliefs move the prices.'
        },
        {
          title: 'When Genius Failed',
          author: 'Roger Lowenstein',
          cover: 'public/assets/readings/when-genius-failed.webp',
          heightMm: 241,
          widthMm: 163,
          pages: 288,
          hardback: true,
          note: 'Long-Term Capital Management: two Nobel laureates, enormous leverage, and the 1998 rescue.'
        },
        {
          title: 'The Five Great Myths About China and the World',
          author: 'Jonathan Anderson & Fred Hu',
          cover: 'public/assets/readings/five-great-myths-china.webp',
          heightMm: 229,
          widthMm: 162,
          pages: 172,
          note: 'Two Goldman Sachs economists on the common misreadings of China’s economy.'
        },
        {
          title: 'Edible Economics',
          author: 'Ha-Joon Chang',
          cover: 'public/assets/readings/edible-economics.webp',
          heightMm: 243,
          widthMm: 157,
          pages: 224,
          hardback: true,
          note: 'Economics through seventeen dishes, each one a way into an argument the textbooks would rather skip.'
        },
        {
          title: 'Guns, Germs, and Steel',
          author: 'Jared Diamond',
          cover: 'public/assets/readings/guns-germs-steel.webp',
          back: 'public/assets/readings/guns-germs-steel-back.webp',
          heightMm: 198,
          widthMm: 129,
          pages: 528,
          note: 'Why some societies conquered others: geography, crops and animals, rather than anything about the people.'
        },
        {
          title: 'Geopolitics in Health',
          author: 'Eduardo J. Gómez',
          cover: 'public/assets/readings/geopolitics-in-health.webp',
          heightMm: 229,
          widthMm: 151,
          pages: 320,
          note: 'How the BRICS governments handled obesity, AIDS and tuberculosis, and what their politics did to the answers.'
        }
      ]
    },
    {
      topic: 'Ideas and identity',
      books: [
        {
          title: 'Messy Cities',
          author: 'Dylan Reid & Zahra Ebrahim (eds.)',
          cover: 'public/assets/readings/messy-cities.webp',
          heightMm: 203,
          widthMm: 131,
          pages: 300,
          note: 'Essays on the parts of cities that work precisely because nobody planned them.'
        },
        {
          title: 'Shrink the City',
          author: 'Natalie Whittle',
          cover: 'public/assets/readings/shrink-the-city.webp',
          heightMm: 216,
          widthMm: 138,
          pages: 192,
          note: 'The fifteen-minute city: what it takes for everything you need to be a short walk away.'
        },
        {
          title: 'Aryans, Jews, Brahmins',
          author: 'Dorothy M. Figueira',
          cover: 'public/assets/readings/aryans-jews-brahmins.webp',
          heightMm: 229,
          widthMm: 152,
          pages: 231,
          note: 'How European and Indian writers used the myth of the Aryan to claim authority.'
        },
        {
          title: 'Why I Write',
          author: 'George Orwell',
          cover: 'public/assets/readings/why-i-write.webp',
          back: 'public/assets/readings/why-i-write-back.webp',
          heightMm: 181,
          widthMm: 111,
          pages: 128,
          note: 'Four essays, including the one that says good prose should be like a windowpane.'
        }
      ]
    },
    {
      topic: 'Body and mind',
      books: [
        {
          title: 'The How Not to Diet Cookbook',
          author: 'Michael Greger',
          cover: 'public/assets/readings/how-not-to-diet-cookbook.webp',
          heightMm: 254,
          widthMm: 171,
          pages: 272,
          hardback: true,
          note: 'Recipes built on the evidence from How Not to Diet.'
        },
        {
          title: 'The Little Book of Chinese Therapies',
          author: 'Angela Mogridge',
          cover: 'public/assets/readings/chinese-therapies.webp',
          heightMm: 165,
          widthMm: 135,
          pages: 192,
          hardback: true
        }
      ]
    },
    {
      topic: 'Fiction',
      books: [
        {
          title: 'The Vegetarian',
          author: 'Han Kang',
          cover: 'public/assets/readings/the-vegetarian.webp',
          back: 'public/assets/readings/the-vegetarian-back.webp',
          heightMm: 198,
          widthMm: 131,
          pages: 188,
          note: 'A woman stops eating meat, and everyone around her takes it as an attack.'
        },
        {
          title: 'The Employees',
          author: 'Olga Ravn',
          cover: 'public/assets/readings/the-employees.webp',
          back: 'public/assets/readings/the-employees-back.webp',
          heightMm: 198,
          widthMm: 129,
          pages: 136,
          note: 'Statements from the crew of a spaceship, human and humanoid, filed as a workplace inquiry.'
        },
        {
          title: 'The Hunger Games',
          author: 'Suzanne Collins',
          cover: 'public/assets/readings/hunger-games.webp',
          back: 'public/assets/readings/hunger-games-back.webp',
          heightMm: 203,
          widthMm: 142,
          pages: 374,
          note: 'A televised fight to the death, and a girl who volunteers so her sister will not have to.'
        },
        {
          title: 'Catching Fire',
          author: 'Suzanne Collins',
          cover: 'public/assets/readings/catching-fire.webp',
          heightMm: 203,
          widthMm: 142,
          pages: 391,
          note: 'Winning turns out to be the start of a rebellion, and the Capitol sends her back into the arena.'
        },
        {
          title: 'Mockingjay',
          author: 'Suzanne Collins',
          cover: 'public/assets/readings/mockingjay.webp',
          heightMm: 203,
          widthMm: 142,
          pages: 390,
          note: 'The war itself, with Katniss made into its poster.'
        },
        {
          title: 'Blue Sisters',
          author: 'Coco Mellors',
          cover: 'public/assets/readings/blue-sisters.webp',
          heightMm: 198,
          widthMm: 129,
          pages: 368,
          note: 'Three sisters, a year after losing the fourth.'
        },
        {
          title: 'Angels & Demons',
          author: 'Dan Brown',
          cover: 'public/assets/readings/angels-and-demons.webp',
          back: 'public/assets/readings/angels-and-demons-back.webp',
          heightMm: 198,
          widthMm: 126,
          pages: 624,
          note: 'Robert Langdon’s first outing: a stolen antimatter canister, the Vatican, and one night to find it.'
        },
        {
          title: 'Inferno',
          author: 'Dan Brown',
          cover: 'public/assets/readings/inferno.webp',
          heightMm: 203,
          widthMm: 135,
          pages: 611,
          note: 'Langdon wakes in Florence with no memory, and Dante’s Inferno is the map to a plague.'
        }
      ]
    }
  ]
};
