/* Desk mode's small data: what the objects on the desk say (js/desk-objects.js).
   A bare global, like the other data files. */
var deskData = {
  /* The drink on the desk, Sunday first (Date#getDay order), so Monday is
     the hazelnut mocha and Sunday the ginger chai. The owner's to edit:
     [id, name, hot, cm, ingredients]. id is the photograph,
     public/assets/drinks/<id>.webp (the owner's own cut-outs). `hot` drinks
     steam in the morning and go cold at night; the rest gather
     condensation. cm is how tall the photograph is in life, so the drinks
     keep their real sizes against each other: the desk's --w on the drink
     is the width of the old 9 cm mug, and everything is scaled from that.
     ingredients are [name, colour of its mark]; pressing the drink floats
     them out of the cup. Zen Garden's are only what its photograph shows
     (lemon, basil, a rock-sugar stirrer, ice): the owner to confirm. */
  drinks: [
    ['ginger-chai', 'ginger chai', true, 9.5,
      [['black tea', '#7a3f1c'], ['ginger', '#d9b679'], ['milk', '#f3ece0'], ['cardamom', '#8fa05a'], ['sugar', '#f4f1ea']]],
    ['hazelnut-mocha', 'iced hazelnut mocha', false, 14,
      [['espresso', '#3b2416'], ['hazelnut syrup', '#a8692f'], ['cocoa', '#5a3420'], ['milk', '#f3ece0'], ['ice', '#d9eef7']]],
    ['ube-matcha-latte', 'ube matcha latte', false, 11,
      [['ube', '#7b4fa8'], ['matcha', '#7fa94e'], ['milk', '#f3ece0'], ['ice', '#d9eef7']]],
    ['zen-garden', 'Zen Garden', false, 12,
      [['lemon', '#f2d03b'], ['basil', '#4f8a3c'], ['rock sugar', '#efe6d2'], ['ice', '#d9eef7']]],
    ['diet-coke', 'Diet Coke', false, 20,
      [['carbonated water', '#cfe3ea'], ['caramel colour', '#6b3a1c'], ['aspartame', '#f4f1ea'], ['caffeine', '#b9a68a']]],
    ['citron-tea', 'citron tea', true, 15,
      [['citron (yuja) marmalade', '#e9952f'], ['honey', '#d9a23a'], ['hot water', '#cfe3ea']]],
    ['lemon-tea', 'lemon tea', true, 7.5,
      [['black tea', '#7a3f1c'], ['lemon', '#f2d03b'], ['honey', '#d9a23a']]]
  ],

  /* Desk shortcuts: the glyph inside each case study's icon, a 48-unit
     SVG drawn with stroke currentColor (js/desk-objects.js wraps it). */
  icons: {
    'quantamental-screener': '<path d="M9 38h30"/><path d="M14 34V24M22 34V16M30 34V21M38 34V10"/><path d="M12 19l8-5 8 3 9-7"/>',
    'phase-contrast-denoising': '<circle cx="24" cy="24" r="13"/><circle cx="24" cy="24" r="5"/><path d="M24 6v5M24 37v5M6 24h5M37 24h5"/>',
    'arteza': '<rect x="9" y="9" width="30" height="30" rx="2"/><path d="M9 32l9-9 7 7 5-5 9 9"/><circle cx="31" cy="18" r="3"/>',
    'habita': '<rect x="9" y="9" width="13" height="13" rx="2"/><rect x="26" y="9" width="13" height="13" rx="2"/><rect x="9" y="26" width="13" height="13" rx="2"/><path d="M32 29v10M27 34h10"/>',
    fallback: '<rect x="8" y="11" width="32" height="24" rx="3"/><path d="M18 41h12"/>'
  },

  /* The business card, shown on the page when taken. Every field is
     already on the page. */
  card: {
    name: 'Akshayaa Kashyap',
    role: 'AI engineer',
    email: 'akshayaakashyap5@gmail.com',
    urls: ['https://github.com/akshayaa-403', 'https://linkedin.com/in/akshayaa-kashyap'],
    resume: 'public/assets/resume.pdf'
  }
};
