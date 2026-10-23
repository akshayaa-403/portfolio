/* Desk mode's small data: what the objects on the desk say (js/desk-objects.js).
   A bare global, like the other data files.

   MARGIN and STICKY are copied VERBATIM out of the case studies in
   js/articles/<id>.js, which are too big to load on the home page. They must
   stay word for word what the article says: if an article's wording changes,
   change it here too, or delete the line.

     margin  [project id, phrase, note]   from a section's `notes: [[phrase, note]]`
     sticky  [project id, line]           from the article's `closing` block,
                                          the "What I'd do differently" list
   Both are interleaved by project, so neighbouring entries are different
   case studies. Only the four live (non-archived) projects. */
var deskData = {
  margin: [
    ['habita', 'The axes are transposed', 'found this while writing the article. The app still ships it.'],
    ['quantamental-screener', 'Most of the +70% is the universe.', 'the hardest sentence on this page to write'],
    ['phase-contrast-denoising', 'The comment is true, and it is the bug.', 'more precision was exactly the problem'],
    ['arteza', 'the comment is the thing that is wrong', 'comments drift; numbers ship'],
    ['habita', 'a broken save is thrown away', 'not crashing and not losing data are different promises'],
    ['quantamental-screener', 'The tests are the witnesses.', 'thirty-nine of them, and none for the CLI'],
    ['phase-contrast-denoising', 'copied the clip-limit bug too', 'faithful to a fault'],
    ['arteza', 'past the right edge of the screen', 'Nothing is wrong. The fixed point just isn’t on the screen.'],
    ['habita', 'true of the plugin and false of the app', 'my README, my mistake'],
    ['quantamental-screener', 'It is what the method does.', 'a dictionary that likes the word “like”'],
    ['phase-contrast-denoising', 'only 7 of 20 frames', 'the other thirteen got worse, most by a little'],
    ['arteza', 'it lets the order through', 'fails open, on purpose']
  ],

  sticky: [
    ['quantamental-screener', 'Fix the CLI.'],
    ['phase-contrast-denoising', 'Report on the held-out split only.'],
    ['habita', 'Round up, not to the nearest.'],
    ['arteza', 'I’d cap a painting at one in the cart and on the server.'],
    ['quantamental-screener', 'De-duplicate share classes.'],
    ['phase-contrast-denoising', 'Test that every control moves something.'],
    ['habita', 'Fix the axes.'],
    ['arteza', 'I’d use a log or quantile track.']
  ],

  /* The mug, Sunday first (Date#getDay order). The owner's to edit:
     [drink, liquid colour]. The colour is decoration only, never under text. */
  drinks: [
    ['water', '#cfe6f2'],
    ['filter coffee', '#6b4226'],
    ['masala chai', '#b9824f'],
    ['matcha latte', '#9cba6a'],
    ['cold brew', '#3b2417'],
    ['hot chocolate', '#5a3324'],
    ['lemon tea', '#e3b54a']
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

  /* The business card's vCard. Every field is already on the page. */
  card: {
    name: 'Akshayaa Kashyap',
    email: 'akshayaakashyap5@gmail.com',
    urls: ['https://github.com/akshayaa-403', 'https://linkedin.com/in/akshayaa-kashyap']
  }
};
