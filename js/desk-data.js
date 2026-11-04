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
