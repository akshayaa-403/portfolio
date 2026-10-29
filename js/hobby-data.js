/* Every hobby gallery: label, note, blurb, photo count and per-image captions.

   Read by js/hobbies.js (the cards on the homepage), js/hobby-page.js
   (the gallery itself) and tools/build-share-pages.js (the crawler pages and
   the sitemap). A bare global, like js/project-data.js, so the Node tools can
   evaluate this file directly instead of scraping an object out of an IIFE.

   Images are numbered <id>-1.webp upward, so adding photos means bumping n
   and appending a caption. Key order is the gallery order the prev/next
   links walk. Cut to the strongest frames on 2026-10-30 (every image scored
   under 5/10 in that day's review went, and the cooking gallery with them),
   so the images were renumbered; the owner then brought back four of the
   cut photographs. Old photography 1, 2, 4, 7, 9, 11, 15, 17, 18 are now
   1 to 9, and old artwork 4, 5, 6 are now 2, 3, 4. */
var hobbies = {
  "photography": {
    "label": "Photography",
    "note": "light, and whatever it lands on",
    "n": 9,
    "blurb": "Mostly what the light was doing. Lantern markets, empty platforms, ridgelines at the wrong hour, the shot is usually the reason I stopped walking.",
    "captions": [
      "Lone tree above the valley, Mahabaleshwar",
      "Hanging Pillar, Lepakshi",
      "Landscape, Mahabaleshwar",
      "N. Safronov Art Exhibition, New Delhi",
      "Delhi metro platform",
      "Sabarmati riverfront, Ahmedabad",
      "Turkish lamps, New Delhi",
      "Dream Vision Art Exhibition, New Delhi",
      "Alleyway, Chandni Chowk, New Delhi"
    ]
  },
  "artwork": {
    "label": "Artwork",
    "note": "graphite, ink, and color",
    "n": 4,
    "blurb": "Drawing is the one thing I do that has no undo. Doodles from the margins of notebooks, and sketches made to understand a subject.",
    "captions": [
      "Unravelling Blue Lotus",
      "Connecting with Nature",
      "Dissolution of Self",
      "Eye study, graphite"
    ]
  }
};
