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
     ingredients are names; pressing the drink floats them out of the cup,
     each with its picture, public/assets/drinks/ingredients/<name with
     dashes>.webp (cut out from the owner's photos). The owner's list,
     2026-11-26. */
  drinks: [
    ['ginger-chai', 'ginger chai', true, 9.5, ['black tea', 'ginger', 'sugar']],
    ['hazelnut-mocha', 'iced hazelnut mocha', false, 14, ['coffee', 'hazelnut syrup', 'cocoa', 'ice']],
    ['ube-matcha-latte', 'ube matcha latte', false, 11, ['ube', 'matcha', 'ice']],
    ['zen-garden', 'Zen Garden', false, 12, ['lemon', 'basil', 'ice']],
    ['diet-coke', 'Diet Coke', false, 20, ['ice', 'lemon', 'diet coke']],
    ['citron-tea', 'citron tea', true, 15, ['lemon marmalade', 'honey', 'hot water']],
    ['lemon-tea', 'lemon tea', true, 7.5, ['black tea', 'lemon', 'honey']]
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
  },

  /* The LinkedIn QR's modules (1 = dark), read once from
     public/assets/linkedin-qr.svg. The card's tree grows its leaves on the
     dark ones, so change this with that file. */
  qr: [
    '11111110101010111110001111111', '10000010001011101101001000001', '10111010010110001100001011101',
    '10111010100101110001001011101', '10111010110000011110001011101', '10000010101001101101001000001',
    '11111110101010101010101111111', '00000000110100111111100000000', '10001011100100000100111111001',
    '00011101111111111010101111111', '10011110100010010100101010001', '10001100101010101110101111011',
    '00111011111010010100110000010', '00111100011111011110001111111', '11011011101010010000101111101',
    '10100001111010010111111010011', '10100110111011110100110000010', '11111001000001110000001111011',
    '00001110100100010000110000101', '00100101110100011111001110011', '11011011110011100101111111001',
    '00000000100010111111100010001', '11111110111111110101101011101', '10000010011111011101100010011',
    '10111010101001000101111111001', '10111010010000111011010000001', '10111010001011110101110001111',
    '10000010001011111110100101011', '11111110110100011101101101010'
  ]
};
