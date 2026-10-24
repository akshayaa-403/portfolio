/* Desk mode's small data: what the objects on the desk say (js/desk-objects.js).
   A bare global, like the other data files. */
var deskData = {
  /* The drink on the desk, Sunday first (Date#getDay order), so Monday is
     the hazelnut mocha and Sunday the ginger chai. The owner's to edit:
     [id, name, hot, cm]. id is the photograph, public/assets/drinks/<id>.webp
     (the owner's own cut-outs). `hot` drinks steam in the morning and go cold
     at night; the rest gather condensation. cm is how tall the photograph is
     in life, so the drinks keep their real sizes against each other: the
     desk's --w on the drink is the width of the old 9 cm mug, and everything
     is scaled from that (js/desk-objects.js). */
  drinks: [
    ['ginger-chai', 'ginger chai', true, 9.5],
    ['hazelnut-mocha', 'iced hazelnut mocha', false, 14],
    ['ube-matcha-latte', 'ube matcha latte', false, 11],
    ['zen-garden', 'Zen Garden', false, 12],
    ['diet-coke', 'Diet Coke', false, 20],
    ['citron-tea', 'citron tea', true, 15],
    ['lemon-tea', 'lemon tea', true, 7.5]
  ],

  /* The laptop's screen carousel: gallery highlights, in order.
     [gallery id, photo number (one-based, as in hobby.html?id=&i=)]. */
  screen: [
    ['photography', 1],
    ['photography', 2],
    ['artwork', 2],
    ['photography', 10],
    ['photography', 14],
    ['photography', 8]
  ],

  /* The Polaroid stack, top first. */
  polaroids: [
    ['photography', 15],
    ['artwork', 1],
    ['cooking', 3],
    ['photography', 16]
  ],

  /* The business card, shown on the page when taken. Every field is
     already on the page. */
  card: {
    name: 'Akshayaa Kashyap',
    email: 'akshayaakashyap5@gmail.com',
    urls: ['https://github.com/akshayaa-403', 'https://linkedin.com/in/akshayaa-kashyap']
  }
};
