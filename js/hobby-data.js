/* Every hobby gallery: label, note, blurb, photo count and per-image captions.

   Read by js/hobbies.js (the three cards on the homepage), js/hobby-page.js
   (the gallery itself) and tools/build-share-pages.js (the crawler pages and
   the sitemap). A bare global, like js/project-data.js, so the Node tools can
   evaluate this file directly instead of scraping an object out of an IIFE.

   Images are numbered <id>-1.webp upward, so adding photos means bumping n
   and appending a caption. Key order is the gallery order the prev/next
   links walk. */
var hobbies = {
  "photography": {
    "label": "Photography",
    "note": "light, and whatever it lands on",
    "n": 18,
    "blurb": "Mostly what the light was doing. Lantern markets, empty platforms, ridgelines at the wrong hour, the shot is usually the reason I stopped walking.",
    "captions": [
      "Lone tree above the valley, Mahabaleshwar",
      "Hanging Pillar, Lepakshi",
      "Elephant's head point, Mahabaleshwar",
      "Landscape, Mahabaleshwar",
      "Sunset-1, Pune",
      "Sunset-3 and Sunset-4, Pune",
      "N. Safronov Art Exhibition, New Delhi",
      "Dream Vision Art Exhibition, New Delhi",
      "Delhi metro platform",
      "Sunset-5, Pune",
      "Sabarmati riverfront, Ahmedabad",
      "Sunrise at resort-1, Bengaluru",
      "Sunrise at resort-2, Bengaluru",
      "Sunrise from terrace, Bengaluru",
      "Turkish lamps-2, New Delhi",
      "Campus block after dark, Pune",
      "Dream Vision Art Exhibition, New Delhi",
      "Alleyway, Chandni Chowk, New Delhi"
    ]
  },
  "artwork": {
    "label": "Artwork",
    "note": "graphite, ink, and color",
    "n": 6,
    "blurb": "Drawing is the one thing I do that has no undo. Doodles from the margins of notebooks, and sketches made to understand a subject.",
    "captions": [
      "Unravelling Blue Lotus",
      "Vessel of Dualities",
      "Mirroring Sovereign Identity",
      "Connecting with Nature",
      "Dissolution of Self",
      "Eye study, graphite"
    ]
  },
  "cooking": {
    "label": "Cooking",
    "note": "mostly dinner, occasionally dessert",
    "n": 6,
    "blurb": "Cooking is the fastest feedback loop I have outside a terminal: you find out whether it worked in about twenty minutes.",
    "captions": [
      "Plated grilled chicken sandwich",
      "Grilled sandwich with devilled eggs",
      "Glazed strawberry toast and coffee",
      "Fried rice with chicken and soy-marinated egg",
      "Egg on top, always",
      "Grilled and marinated oyster mushrooms"
    ]
  }
};
