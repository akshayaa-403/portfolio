/* Arteza — "The Shop That Wouldn't Take Money", a gallery walk in rooms.
   Every number here is in `sources`. Paintings are never drawn: each widget
   uses coloured placeholder rectangles in the page's own colours. */
(function () {
  'use strict';

  /* ---------- data (live catalogue, read 2026-10-16) ---------- */

  // [stated W, stated H, 1 if frameMetrics would transpose it against the
  // repo's own photograph]. Photo aspects measured 2026-10-18 from
  // public/img/paintings in the arteza repo; 3 rows had no local file (0).
  var SHELF = [[24,36,0],[24,36,1],[24,36,0],[18,24,0],[24,36,0],[12,12,0],[12,12,0],[36,36,0],[12,12,0],[12,12,0],[12,12,0],[12,12,0],[24,36,0],[12,12,0],[24,36,0],[24,36,1],[24,36,0],[24,18,0],[24,36,0],[18,24,0],[36,24,1],[18,24,0],[18,24,0],[12,12,0],[4,4,0],[4,4,0],[24,36,0],[12,12,0],[4,4,0],[4,4,0],[4,4,0],[12,8,1],[16,20,0],[4,4,0],[4,4,0],[4,4,0],[4,4,0],[8,12,0],[8,6,0],[8,6,0],[12,8,0],[8,12,0],[12,8,0],[8,12,0],[12,8,0],[8,12,0],[8,12,0],[8,6,0],[8,12,1],[12,8,1],[4,4,0],[12,10,1],[8,6,0],[10,12,0],[4,4,0],[4,4,0],[4,4,0],[8,12,0],[12,8,1],[8,6,0],[6,6,0],[8,8,0],[10,12,0],[8,12,0],[8,12,0],[12,16,0],[10,14,0],[8,12,0],[12,8,1],[8,12,1],[10,12,0],[8,12,0],[8,12,0],[8,12,0],[8,12,0],[8,12,0],[8,12,0],[12,17,0],[16,6,0],[12,17,0],[14,14,0],[36,24,1],[16,6,0],[8,8,0],[16,12,0],[8,8,0],[8,6,0],[12,16,0],[12,12,0],[12,12,0],[16,20,0],[12,12,0],[12,18,0],[6,6,0],[14,18,0],[12,12,0],[24,24,0],[24,24,0],[36,36,0],[12,18,0],[16,11,0],[12,12,0],[12,18,0],[18,18,0],[12,16,0],[24,22,0]];

  var PRICES = [500,500,500,500,500,500,500,500,500,500,500,500,500,500,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1200,1200,1200,1500,2000,2000,2000,2000,2000,2000,2000,2000,2000,2000,2500,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3200,3500,4000,4500,4500,4500,4800,5000,5800,5800,6500,7000,7500,8000,8000,8500,8500,8500,9500,9500,11000,11000,11500,12000,12000,13000,14000,15000,16500,18000,18000,18000,18000,20000,22000,23500,25000,25000,28000,28000,30000,32000,35000,125000];

  // Six real rows for the counter (titles and prices, no images).
  var SAMPLE = [
    { title: 'Sapphire Irises: Marbled Dreams', price: 3000, ok: true },
    { title: 'Teal Window: Red Roses Ascending', price: 3000, ok: true },
    { title: 'Crimson Dreams', price: 18000, ok: true },
    { title: 'Ganesha: Madhubani Vision of Divine Joy', price: 35000, ok: true },
    { title: 'Gaja Lakshmi: Goddess of Abundance', price: 125000, ok: true },
    { title: 'Violet Bouquet: Garden Symphony', price: 1000, ok: false }
  ];

  var inr = function (n) { return '₹' + Number(n).toLocaleString('en-IN'); };
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------- the drum's maths, ported line for line from src/lib/arc-ring.ts ---------- */
  var DEG = Math.PI / 180, MAX_STEP = 36, EDGE_FADE = 0.18;
  function wrapIndex(offset, count) {
    if (count === 0) return 0;
    var a = ((offset % count) + count) % count;
    return a > count / 2 ? a - count : a;
  }
  function arcStep(curve) { return Math.max(-1, Math.min(1, curve)) * MAX_STEP; }
  function arcPlacement(index, count, offset, chord, curve) {
    var pos = wrapIndex(index - offset, count);
    var step = arcStep(curve);
    var a = pos * step, rad = a * DEG, x, z;
    if (Math.abs(step) < 0.1) { x = pos * chord; z = 0; }
    else {
      var radius = chord / 2 / Math.sin((step / 2) * DEG);
      x = radius * Math.sin(rad);
      z = radius * Math.cos(rad) - radius;
    }
    var facing = Math.abs(a);
    var reach = count > 1 ? Math.abs(pos) / (count / 2) : 0;
    var edge = Math.min(1, Math.max(0, (reach - (1 - EDGE_FADE)) / EDGE_FADE));
    var opacity = facing < 90 ? (1 - (facing / 90) * 0.55) * (1 - edge) : 0;
    return {
      transform: 'translateX(' + x.toFixed(1) + 'px) translateZ(' + z.toFixed(1) + 'px) rotateY(' + a.toFixed(2) + 'deg)',
      opacity: opacity, zIndex: Math.round(2000 + z), visible: opacity > 0.01, x: x, z: z, a: a
    };
  }

  /* ---------- the shelf's maths, from src/lib/artwork-aspect.ts ---------- */
  function scaleOf(h, exp, floor) { return Math.min(1, Math.max(floor, Math.pow(h / 36, exp))); }

  /* ---------- create-order, ported from supabase/functions/create-order ---------- */
  function createOrder(raw, log) {
    var body;
    try { body = JSON.parse(raw); } catch (e) { return [500, { error: 'Could not create order' }, []]; }
    var said = [];
    try {
      var name = body && typeof body.customer_name === 'string' ? body.customer_name.trim().slice(0, 100) : '';
      var phone = body && typeof body.customer_phone === 'string' ? body.customer_phone.trim().slice(0, 20) : '';
      var rawItems = body && Array.isArray(body.items) ? body.items : [];
      if (!name || rawItems.length === 0 || rawItems.length > 50) return [400, { error: 'Missing or invalid fields' }, said];
      var items = rawItems.map(function (i) {
        Object.keys(i).forEach(function (k) {
          if (['id', 'painting_id', 'title', 'painting_title', 'quantity'].indexOf(k) === -1) said.push('"' + k + '" ignored: the server never reads it');
        });
        var q = Math.max(1, Math.min(99, Number(i.quantity) || 1));
        if (String(q) !== String(i.quantity)) said.push('quantity ' + JSON.stringify(i.quantity) + ' became ' + q);
        return {
          painting_title: typeof i.painting_title === 'string' ? i.painting_title : (typeof i.title === 'string' ? i.title : null),
          painting_id: typeof i.painting_id === 'string' ? i.painting_id : (typeof i.id === 'string' ? i.id : null),
          quantity: q
        };
      });
      var hour = Date.now() - 3600e3;
      var recent = log.filter(function (o) { return o.at > hour; });
      if (recent.length >= 20 || (phone && recent.filter(function (o) { return o.phone === phone; }).length >= 5)) {
        return [429, { error: 'Too many orders right now. Please try again later or message us on WhatsApp.' }, said];
      }
      var resolved = [];
      for (var k = 0; k < items.length; k++) {
        var it = items[k];
        var match = null;
        SAMPLE.forEach(function (p) { if (p.ok && p.title === it.painting_title) match = p; });
        if (!match) return [400, { error: 'Item not found or unavailable: ' + (it.painting_title != null ? it.painting_title : it.painting_id) }, said];
        resolved.push({ title: match.title, price: match.price, quantity: it.quantity });
      }
      var total = resolved.reduce(function (s, r) { return s + r.price * r.quantity; }, 0);
      log.push({ at: Date.now(), phone: phone });
      var list = resolved.map(function (r) { return r.title + ' x' + r.quantity + ' - ' + inr(r.price * r.quantity); }).join('\n');
      var msg = '*New Inquiry from ' + name + '*\n\n*Items:*\n' + list + '\n\n*Total:* ' + inr(total) +
        (phone ? '\n\n*Customer Phone:* ' + phone : '') + '\n\nPlease reply to this chat to confirm payment and shipping.';
      return [200, { success: true, orderId: '(assigned by the database)', whatsappLink: 'https://wa.me/<studio>?text=…', total_amount: total }, said, msg];
    } catch (e) {
      return [500, { error: 'Could not create order' }, said];
    }
  }

  /* ---------- the hero's numbers, from EditorialHero.tsx + index.css ---------- */
  // [left %, top %, width %, aspect, inset top/right/bottom/left %]
  var FRAMES = [
    [4.63, 6.91, 16, 0.891, [21.81, 25.17, 22.43, 24.83]],
    [68.65, 3.21, 30, 1.349, [23.12, 16.39, 16.58, 17.13]],
    [9.07, 47.18, 18.5, 0.993, [13.03, 12.41, 13.03, 12.77]],
    [72.41, 52.15, 21, 1.119, [12.76, 11.41, 13.35, 11.14]]
  ];
  var VIEWS = {
    desk: { W: 1600, H: 1000, cx: 50, cy: 66, cw: 9, s: 3, tx: 50, ty: 42, tmin: 20, tmax: 60, frames: true },
    phone: { W: 560, H: 1000, cx: 74.5, cy: 44, cw: 41, s: 1.854, tx: 50, ty: 38, tmin: 24, tmax: 56, frames: false }
  };

  function S(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    return n;
  }

  /* ---------- timeline events (UTC) ---------- */
  function U(mo, d, h, mi, s) { return Date.UTC(2026, mo - 1, d, h || 0, mi || 0, s || 0); }
  var T0 = U(1, 25), T1 = U(10, 15, 17, 59, 47);
  var EVENTS = [
    { t: U(2, 14, 10, 20, 50), label: 'Checkout pages', sha: '1d8cd9f' },
    { t: U(2, 16, 12, 55, 26), label: 'Checkout Edge Function', sha: 'fedef4b' },
    { t: U(3, 8, 19, 51, 1), label: 'Order confirmation + WhatsApp share', sha: '89b556d' },
    { t: U(3, 8, 20, 20, 6), label: 'Fix order price manipulation', sha: '8c6fc90' },
    { t: U(3, 10, 19, 43, 30), label: 'Redirect to WhatsApp after checkout', sha: '955a9f5' },
    { t: U(6, 5, 19, 11, 45), label: 'WhatsApp checkout modal', sha: '478ce13' },
    { t: U(6, 19, 7, 18, 23), label: 'Server resolves real prices', sha: '49cac99' },
    { t: U(10, 3, 17, 33, 12), label: 'Sold paintings stay visible', sha: '88bcb47' }
  ];
  var SPANS = [
    { key: 'qr', a: U(3, 8, 19, 7, 14), b: U(3, 8, 19, 30, 39), label: 'UPI QR page', mins: 23 },
    { key: 'utr', a: U(10, 3, 16, 27, 31), b: U(10, 3, 16, 47, 9), label: 'UTR claim', mins: 20 }
  ];
  var CUTS = [
    { key: 'qr', t: U(3, 8, 19, 30, 39), n: 406, sha: '26cd69f' },
    { key: 'cut', t: U(6, 5, 19, 9, 5), n: 3804, sha: 'd61860b' },
    { key: 'utr', t: U(10, 3, 16, 47, 9), n: 626, sha: '172db42' }
  ];
  var STATES = [
    [T0, 'No checkout yet', 'A gallery with nothing to buy.'],
    [U(2, 14, 10, 20, 50), 'A checkout page', 'Cart, checkout page, then (from 20 Feb) an order confirmation.'],
    [U(3, 8, 19, 7, 14), 'Pay: scan a UPI QR', 'A payment page generating a UPI QR for the order.'],
    [U(3, 8, 19, 30, 39), 'A checkout page', 'The payment page is gone again.'],
    [U(3, 8, 19, 51, 1), 'Order placed, share on WhatsApp', 'Confirmation with a WhatsApp share button.'],
    [U(3, 10, 19, 43, 30), 'Order placed, off to WhatsApp', 'Checkout redirects straight to WhatsApp.'],
    [U(6, 5, 19, 11, 45), 'Name, phone (optional), WhatsApp', 'No accounts, no checkout page: a modal and a chat.'],
    [U(10, 3, 16, 27, 31), 'Enter your 12-digit UTR', 'Pay by UPI, then claim it with the transaction reference.'],
    [U(10, 3, 16, 47, 9), 'Name, phone (optional), WhatsApp', 'Back to the inquiry. Still the flow today.']
  ];
  var WINDOWS = {
    year: [T0, T1, 'Jan – Oct 2026'],
    mar: [U(3, 8, 19), U(3, 8, 20, 30), '8 March, 19:00–20:30 UTC'],
    oct: [U(10, 3, 16, 15), U(10, 3, 17, 45), '3 October, 16:15–17:45 UTC']
  };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtT(t, short) {
    var d = new Date(t);
    var day = d.getUTCDate() + ' ' + MON[d.getUTCMonth()];
    if (short) return day;
    return day + ', ' + ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2) + ' UTC';
  }

  Article.register('arteza', {
    form: 'rooms',
    scramble: '॥।०१२३४५◇◆▪',
    dek: 'Twice this shop got a payment page. The first lasted twenty-three minutes; the second, twenty. This is a walk through the rooms of arteza.site, the gallery and shop of a painter whose every work is one of one, and through the parts of it I wrote by hand: a wall that zooms, a drum that turns, a shelf that knows inches, and a counter that won’t take your money.',

    opener: function (c) {
      return '<g fill="none" stroke="' + c.l + '" stroke-width="1" stroke-dasharray="2 3">' +
        '<line x1="64" y1="104" x2="8" y2="8"/><line x1="64" y1="104" x2="120" y2="6"/>' +
        '<line x1="64" y1="104" x2="10" y2="70"/><line x1="64" y1="104" x2="122" y2="72"/></g>' +
        '<g fill="none" stroke="' + c.i + '" stroke-width="2">' +
        '<rect x="8" y="10" width="22" height="26"/><rect x="84" y="6" width="36" height="28"/>' +
        '<rect x="12" y="58" width="24" height="24"/><rect x="92" y="62" width="28" height="24"/></g>' +
        '<rect x="56" y="50" width="16" height="20" fill="none" stroke="' + c.a + '" stroke-width="2"/>' +
        '<rect x="59" y="53" width="10" height="11" fill="' + c.a + '"/>' +
        '<circle cx="64" cy="104" r="3" fill="' + c.a + '"/>';
    },

    chapters: [
      {
        id: 'wall', label: 'Room 1', title: 'The Wall',
        art: function (c) {
          return '<g stroke="' + c.l + '" stroke-dasharray="3 4">' +
            '<line x1="80" y1="104" x2="10" y2="10"/><line x1="80" y1="104" x2="150" y2="10"/></g>' +
            '<rect x="14" y="16" width="34" height="38" fill="' + c.p + '" stroke="' + c.i + '" stroke-width="2"/>' +
            '<rect x="108" y="14" width="40" height="32" fill="' + c.p + '" stroke="' + c.i + '" stroke-width="2"/>' +
            '<rect x="70" y="56" width="20" height="25" fill="' + c.m + '" stroke="' + c.a + '" stroke-width="2"/>' +
            '<circle cx="80" cy="104" r="4" fill="' + c.a + '"/>';
        },
        blocks: [
          { quote: 'Scaling holds exactly one point still. The whole trick is choosing which.' },
          { p: 'The home page opens on a wall: four gilt frames, a headline, and a small blank polaroid that says “Scroll to reveal”. Scroll, and the whole wall grows until the polaroid, now holding a painting, sits in the middle of the screen. It is one CSS transform, `scale(1 + z × 2)`, driven by one number `z` that a scroll listener moves from 0 to 1 over a section two screens tall.^[src/components/home/EditorialHero.tsx:132-160 and src/index.css:703-719: --z from 0 to 1 over a 200svh section, --zs 2 on desktop.]' },
          { p: 'A scale keeps one point fixed: the transform-origin. Scale about the centre and the polaroid, which rests low at 66% of the stage, slides off the bottom of the screen. So I solved for the origin instead. A point C scaled by s about O lands at O + s(C − O). Set that equal to where the card should land, T, and the origin falls out.',
            notes: [['solved for the origin instead', 'the one line of algebra on the whole home page']] },
          { tex: 'O = \\frac{T - s \\cdot C}{1 - s}', caption: 'The origin that makes C land on T at scale s.' },
          { p: 'On desktop the scale ends at 3, [[the polaroid|card]] starts at 66% and should land at 42%, so [[the origin|origin]] sits at (42 − 3 × 66) / (1 − 3) = 78%, below the card. Drag the [[landing point|target]] in the figure and the origin re-solves: right now it is at {{origin|78%}}.' },
          { widget: 'wall', size: 'wide', caption: 'The hero’s real geometry: the four frames at their measured positions and openings, the polaroid at 50%, 66%, 9% wide. Coloured blocks stand in for the paintings. Dashed rays run from the origin O through each corner: every point travels along its ray, which is why O is the only thing that does not move. Drag T or use the sliders; switch to Phone to see the origin leave the screen.' },
          { p: 'Phones broke my picture of it. There the card rests at the right, 74.5% across and 44% down, 41% wide, and lands centred at 50%, 38%. That is a scale of 1.854, and the horizontal origin comes out at 103.2%: past the right edge of the screen. On the shortest phones it is 114.6%.^[src/index.css:945-994; the SE-class rule uses s = 1.61, O = (114.6%, 57.1%).]',
            notes: [['past the right edge of the screen', 'Nothing is wrong. The fixed point just isn’t on the screen.']] },
          { p: 'Everything else rides the same `z`. The headline’s opacity is 1 − 3.6z, so it is gone by z ≈ 0.28. The painting fades in from z = 0.18, the plate caption from z = 0.62, and past 0.3 the headline stops taking taps, because faded is not gone and an invisible caption was swallowing the buttons under it.^[src/index.css:851, 856, 861; EditorialHero.tsx:145-146.]' },
          { p: 'The wall also has no `will-change` on purpose. With it, the browser rasterised the wall once at 1× and stretched that bitmap to 3×, and the painting arrived pixelated. Without it the wall is re-rastered as it grows. The painting itself is drawn at random from the catalogue once per load, after mount: drawing it on every render had downloaded the largest image four times per load, 1.1 MB of it.^[src/index.css:719-725; EditorialHero.tsx:104-130, comment on the LCP image.]' },
          { figure: 'public/assets/projects/arteza-home.webp', alt: 'The live home page: four gilt frames around the headline “Made by hand. Made once. Made Yours”, with a blank polaroid reading Scroll to reveal.', caption: 'The wall at z = 0 on arteza.site.', size: 'wide' }
        ]
      },
      {
        id: 'drum', label: 'Room 2', title: 'The Drum',
        art: function (c) {
          return '<ellipse cx="80" cy="64" rx="66" ry="20" fill="none" stroke="' + c.l + '" stroke-width="1.5"/>' +
            '<rect x="66" y="58" width="28" height="36" fill="' + c.a + '"/>' +
            '<rect x="30" y="52" width="22" height="32" fill="' + c.m + '" transform="skewY(-8)"/>' +
            '<rect x="108" y="40" width="22" height="32" fill="' + c.m + '" transform="skewY(8)"/>';
        },
        blocks: [
          { quote: 'Six paintings or a hundred and six: the drum is the same drum.' },
          { p: 'Below the wall, the paintings turn on a drum. There are 106 of them, and at most five are ever drawn.^[Live catalogue, 106 rows, read 2026-10-16. Five cards: at full bend the third card out is at 108°, past the side.] Every card is placed by one function I wrote, `arcPlacement`, from one signed angle. Neighbouring cards are bent apart by `step = curve × 36°`; ten cards at 36° close a ring.' },
          { code: 'const pos = wrapIndex(index - offset, count);\nconst step = arcStep(curve);          // clamp(curve, -1, 1) * 36\nconst a = pos * step;\nconst rad = a * DEG;\nconst radius = chord / 2 / Math.sin((step / 2) * DEG);\nx = radius * Math.sin(rad);\nz = radius * Math.cos(rad) - radius;  // front card stays at z = 0',
            lang: 'ts', caption: 'From `src/lib/arc-ring.ts`. The radius is the circle on which neighbours sit one chord apart.' },
          { p: 'The sign carries the shape. [[A positive bend|ring]] wraps the cards round the outside of a drum. [[Zero|row]] lays them in a flat row. [[A negative bend|bowl]] gives a negative radius, which turns the drum inside out into a bowl, with the same formulas and no second case. At the shop’s real spacing of 408px the radius is now {{radius|660 px}}.',
            notes: [['no second case', 'one formula, two shapes']] },
          { widget: 'drum', size: 'wide', caption: 'Real CSS 3D, placed by the shipped `arcPlacement` maths under the shipped perspective (1800px), all lengths scaled to fit. Cards are numbered placeholders. The small plan underneath is the same track seen from above, with the viewer at the bottom. Drag the cards, or use the buttons.' },
          { p: 'The bend is per card and is not divided by the count. Step the number of paintings from 6 to 106 and the barrel does not change; only the loop gets longer. At the idle speed of 0.3 cards a second, one lap now takes {{lap|353 s}}. Cards past 90° are not drawn, the last 18% of the half-lap fades out so a card wraps round while invisible, and a card takes clicks only while its opacity is above 0.01.^[src/lib/arc-ring.ts:29-52, 86-94; lap = count ÷ 0.3.]' },
          { p: 'The motion is one velocity, in cards per second, that a spring of 2.5 per second pulls toward a target: 0.3 idle, 1.2 while an arrow is held, 3 for a click, 0 under the pointer. A drag only counts after 5px, so a tap still opens the painting. Eleven tests pin the geometry down, including the inside-out case.^[src/components/artwork/FeaturedKiosk.tsx:17-27, 79-153; src/lib/arc-ring.test.ts, 11 cases.]' }
        ]
      },
      {
        id: 'shelf', label: 'Room 3', title: 'The Shelf',
        art: function (c) {
          return '<line x1="8" y1="96" x2="152" y2="96" stroke="' + c.i + '" stroke-width="3"/>' +
            '<rect x="16" y="24" width="48" height="72" fill="' + c.p + '" stroke="' + c.a + '" stroke-width="2"/>' +
            '<rect x="76" y="50" width="36" height="46" fill="' + c.p + '" stroke="' + c.a + '" stroke-width="2"/>' +
            '<rect x="124" y="74" width="22" height="22" fill="' + c.m + '" stroke="' + c.a + '" stroke-width="2"/>';
        },
        blocks: [
          { p: 'The shop puts every painting in a frame on a shelf. The smallest are 4″ square studies; the largest are 36″ canvases. Draw them all the same size and the shelf lies. Draw them truthfully and the small ones disappear. `frameMetrics` sits between the two.' },
          { scrolly: 'shelf', caption: 'All 106 works at their stated inches, sorted by drawn height. Placeholders, not paintings. A triangle under a frame means it hit the floor.',
            steps: [
              { p: 'Start with the truth. Scale each frame by its height against a 36″ reference, linearly. The 4″ studies come out a ninth the height of the largest canvas: specks at the end of the shelf.', state: { exp: 1, floor: 0, repair: true } },
              { p: 'The comment in the code says square root. At an exponent of 0.5 a 4″ study rises to a third of the 36″ canvas. Better, but the long tail of small works is still hard to read.', state: { exp: 0.5, floor: 0, repair: true } },
              { p: 'What ships is 0.45, with a floor at 0.45. A 24″ work draws at 0.83, a 12″ at 0.61, and anything 6″ or under stops at the floor: **23 of 106**. Largest to smallest is now 2.2×, not 9×. The order is still visible; the extremes are still usable.', state: { exp: 0.45, floor: 0.45, repair: true } },
              { p: 'Then the data. Some rows were typed height-first. “The Crimson Muse” is listed as 36″ × 24″, a landscape, but its photograph is portrait, 0.64 wide for its height. Taken literally, the photo sits in a wide frame with fat bands either side.', state: { exp: 0.45, floor: 0.45, repair: false, focus: true } },
              { p: '`frameMetrics` turns the measurements round when the stated shape and the photograph disagree and both are more than 4% from square. The photo decides orientation only; the inches still decide size. Against the repo’s own photographs, **11 of 106** rows get turned.', state: { exp: 0.45, floor: 0.45, repair: true, focus: true } }
            ] },
          { p: 'Height is the fixed dimension and width follows from the ratio, so every frame stands on the same plank line: the frame’s CSS height is `min(100%, 100cqw / ar) × scale`. Fourteen tests cover the parser and the repair, including the exact Crimson Muse case of a 0.64 photo inside “36 x 24 in”.^[src/lib/artwork-aspect.ts:56-109; src/components/artwork/ShelfArtwork.tsx:51-75; src/lib/artwork-aspect.test.ts, 14 cases. The 11 turned rows: frameMetrics run over the 2026-10-16 dimensions against the aspect of each photograph in public/img/paintings, measured 2026-10-18; 3 rows had no local file and count as unturned.]' },
          { p: 'The comment above that code still says “square-root curve”. The exponent is 0.45. Since 0.45 is what ships and what the shelf is tuned to, the comment is the thing that is wrong.',
            notes: [['the comment is the thing that is wrong', 'comments drift; numbers ship']] },
          { figure: 'public/assets/projects/arteza-shop.webp', alt: 'The live shop: frames of different sizes on shelves, a small 4 by 4 inch study among larger canvases, one marked Sold out.', caption: 'The real shelf on arteza.site: a 4″ × 4″ study drawn small, but not a speck.', size: 'wide' }
        ]
      },
      {
        id: 'counter', label: 'Room 4', title: 'The Counter',
        art: function (c) {
          return '<line x1="8" y1="70" x2="152" y2="70" stroke="' + c.l + '" stroke-width="2"/>' +
            '<line x1="54" y1="40" x2="54" y2="100" stroke="' + c.a + '" stroke-width="1"/>' +
            '<line x1="128" y1="40" x2="128" y2="100" stroke="' + c.a + '" stroke-width="1"/>' +
            '<rect x="82" y="70" width="10" height="34" fill="' + c.m + '"/>' +
            '<circle cx="54" cy="36" r="4" fill="' + c.a + '"/><circle cx="128" cy="36" r="4" fill="' + c.a + '"/>';
        },
        blocks: [
          { quote: 'The cart never takes money, and the server takes nothing the browser says on trust.' },
          { p: 'Here is the checkout’s history from git, drawn to scale. Look for the payment pages. [[The first|qr]] went in on 8 March at 19:07 UTC and came out at 19:30. Twenty-one minutes later the checkout ended in an order confirmation with a WhatsApp share button instead.^[git show 1f5c220, 26cd69f (−406 lines), 89b556d. Times are commit times in UTC.]' },
          { widget: 'timeline', size: 'wide', caption: 'Commit times, to scale, 25 January to 15 October 2026. The two payment pages are hairlines a pixel wide at this scale; switch the view to the evening each one lived. Below the axis, checkout code removed. The card on the right says what the repo’s checkout ended in at the scrubbed moment (not what was deployed, which git does not record).' },
          { p: 'On [[5 June|cut]] the accounts, the admin dashboard, the checkout page, the order confirmation and the order tracking were deleted in one commit: 18 files, 3,804 lines. The auth tables went in the same release, and two minutes later the checkout became what it still is: a name, an optional phone, and “Continue to WhatsApp”.^[git show --shortstat d61860b; migration 20260605190832; WhatsAppCheckoutModal.tsx first committed in 478ce13, 19:11 UTC.]' },
          { p: '[[The second payment page|utr]] was mine. On 3 October at 21:57 IST I added a UTR claim: pay by UPI, then type the 12-digit transaction reference, checked by `^[0-9]{12}$` with a unique index so one payment can’t be claimed twice. At 22:17 I took it out again, +74 / −626, and the next migration reads “Checkout went back to the WhatsApp inquiry flow.”^[b7c3e7f, 172db42; supabase/migrations/20261003120000_*.sql:16-29, 20261003170000_drop_upi_payment_columns.sql.]',
            notes: [['At 22:17 I took it out again', 'twenty minutes, by the commit clock']] },
          { p: 'Every time, what came back was the conversation. The cart today says it plainly: “We’ll confirm the final price and shipping on WhatsApp, then share a UPI QR code for payment.” A person settles the money. What the code has to do is make sure the order that reaches that person is true.^[src/pages/CartPage.tsx:136-156.]' },
          { h: 'What the counter does instead' },
          { p: 'The browser sends a name, an optional phone, and for each item a title and a quantity. No price. The `create-order` function trims the name to 100 characters and the phone to 20, allows 1 to 50 items, clamps each quantity to 1–99, then reads the real price and `is_available` from the paintings table with the service role. Sold work is refused by name. The total is computed on the server, and the buyer is handed a `wa.me` link with the order already written out.^[supabase/functions/create-order/index.ts:18-120.]' },
          { code: "quantity: Math.max(1, Math.min(99, Number(i.quantity) || 1)),\n\nif ((await tooMany(supabaseClient, 'orders', 20, 60)) ||\n    (customer_phone && (await tooMany(supabaseClient, 'orders', 5, 60, ['customer_phone', customer_phone])))) {\n  return json(req, { error: 'Too many orders right now…' }, 429);\n}",
            lang: 'ts', caption: 'From `create-order/index.ts`: the clamp, and the rate limit I added on 3 October.' },
          { p: 'In October I closed the other doors. The function now rate-limits: 20 orders an hour overall and 5 an hour per phone. And direct inserts on orders, order items and bookings were revoked from the browser’s roles, so the function is the only way an order can be written.^[supabase/functions/_shared/common.ts:43-66; 20261003120000_lock_down_writes_and_upi_payments.sql:1-9.] Try to cheat it.' },
          { widget: 'cheat', size: 'wide', caption: 'A port of `create-order` running in this page against six real rows of the catalogue (titles and prices only; ids are not in the sample, so match by title). Nothing is sent anywhere. Edit the request, or use the buttons: name your own price, order 500, add the sold painting, or send six from one phone.' },
          { p: 'The limiter is deliberately plain. It counts rows created in the last hour, and if the count itself fails it lets the order through, because losing a real customer’s order is worse than letting a spammer past for an hour.^[common.ts:43-66, comment: “row counting, not a token bucket; enough for a one-artist shop”.] The same day, sold paintings stopped disappearing: the read policy changed from `is_available = true` to `true`, because a sold painting’s page used to 404 and drop out of the shop.^[20261003175000_show_sold_paintings.sql, commit 88bcb47.]',
            notes: [['it lets the order through', 'fails open, on purpose']] },
          { figure: 'public/assets/projects/arteza-cart.webp', alt: 'The live cart: an order summary reading Shipping: Discussed on WhatsApp, and an Inquire on WhatsApp button.', caption: 'The counter today: no card form, no payment page, a button to a conversation.', size: 'wide' }
        ]
      },
      {
        id: 'store', label: 'Room 5', title: 'The Store Room',
        blocks: [
          { p: 'Behind the rooms are the photographs. They started in Supabase Storage, where the free tier allows 5 GB of egress a month, and a gallery is mostly egress. So I wrote `sync-images.mjs`: it copies each photo into the site as WebP at 400, 800, 1,200 and 1,600 pixels wide, never wider than the original, at quality 78. `rotate()` applies the camera’s EXIF orientation first, and the WebP output drops EXIF, GPS included.^[scripts/sync-images.mjs:1-16, 66-80; src/lib/image-url.ts:1-12.]',
            notes: [['GPS included', 'phone photos can carry a location. these don’t']] },
          { p: 'Because nothing is ever scaled up, the widths a painting gets depend on the photograph it came from:' },
          { table: { head: ['Widest copy', 'Paintings'], rows: [['1,600 px (all four widths)', '39'], ['1,200 px', '52'], ['800 px', '13'], ['400 px', '2']] },
            caption: 'Counted from `src/data/image-manifest.ts`: 106 paintings, 340 files, a 45 MB `public/img` folder.' },
          { p: 'One honest gap: the `srcset` is opt-in. A component gets the smaller copies only if it passes `sizes`, so some surfaces still fetch a single width.^[src/components/ImageWithSkeleton.tsx:9-19, 52-60.]' }
        ]
      },
      {
        id: 'border', label: 'Room 6', title: 'The Border',
        art: function (c) {
          return '<path d="M8 60 C 40 20, 60 100, 80 60 S 120 20, 152 60" fill="none" stroke="' + c.i + '" stroke-width="10" stroke-linecap="round"/>' +
            '<path d="M8 60 C 40 20, 60 100, 80 60 S 120 20, 152 60" fill="none" stroke="' + c.p + '" stroke-width="4.5" stroke-linecap="round"/>';
        },
        blocks: [
          { p: 'The site’s section borders are Madhubani line work, and the convention that defines Mithila painting is the double outline: every figure drawn twice, with a strip of bare ground between the two lines. My `DoubleLine` component does it by stroking the same path twice: once wide in ink, then again at 0.45 of that width in the colour of the ground.^[src/components/ornament/Madhubani.tsx:17-52; default width 4.6.]' },
          { widget: 'border', caption: 'One path, stroked twice. The second stroke is the ground showing through, so it has to be the ground’s colour. Diagrammatic: the curve is drawn for this page, not taken from the site.' },
          { p: 'Its comment says the 1 : 0.45 ratio leaves a gap “roughly as wide as each of the two lines”. At 0.45 the gap is 0.45 of the width and each line is 0.275, so the gap is 1.6 times a line. They are equal at a third. It is the same kind of slip as the shelf’s square root: the number in the code is right, and the sentence above it describes a different number.',
            notes: [['the gap is 1.6 times a line', 'still looks right. still not what it says']] }
        ]
      }
    ],

    closing: {
      blocks: [
        { p: 'The shop’s price filter is a two-thumb slider, linear from the cheapest painting to the dearest, in 100 steps. On this catalogue each step is ₹1,245. The median price is ₹3,000, so 62 of 106 paintings sit in the first 2% of the track, and the narrowest window a buyer can make from the left, ₹500 to ₹1,745, already holds 41. One painting, a 36″ Tanjore in 22K gold foil at ₹1,25,000, sets the scale for the other 105; the next dearest is ₹35,000.^[src/pages/ShopPage.tsx:34, 62-66, 176-182; live prices, read 2026-10-16.] I’d use a log or quantile track.' },
        { widget: 'price', size: 'wide', caption: 'All 106 prices as dots on the slider’s track. Linear is what ships. The step and window figures are computed from the shop’s own step rule, max(1, round((max − min) / 100)).' },
        { p: 'The cart lets you raise the quantity of a one-of-one painting with a +/− stepper, and only the server’s clamp to 99 stops it. Every painting page says “Only one exists”. I’d cap a painting at one in the cart and on the server.^[src/contexts/CartContext.tsx:68-76; src/pages/CartPage.tsx:84-106.]' },
        { p: 'The home page’s “How it works” still says “Checkout by UPI — Pay securely by UPI” over a drawn Pay button. That is a third payment page, and the only one that is live. It should describe the WhatsApp hand-off the shop actually has.^[src/components/home/HowItWorks.tsx:316-317, present in the live bundle on 2026-10-16.]' },
        { p: 'Prerendering is configured and not live. The build prerenders every painting page and writes a per-page CSP and a sitemap, and locally `dist/shop` holds 106 pages. But on 2026-10-16 every route, including `/sitemap.xml`, returned the same 2,497-byte empty shell. Until the deployment serves the build, crawlers and link previews see nothing of the gallery.^[package.json, vite.config.ts, scripts/postbuild.ts:112-135; curl of /, /shop and /sitemap.xml, 2026-10-16.]' },
        { p: 'And I’d fix two comments, the square root and the gap, so the next person reads what the code does.' }
      ]
    },

    sources: [
      ['Catalogue (106 paintings, 105 available, 5 collections: 37/24/18/17/10)', 'the public paintings endpoint arteza.site calls, read once on 2026-10-16; cross-checked against 106 rows in the 20261003180000 migration.'],
      ['Hero geometry (frames, 66%, 9%, 0.82, s = 3, 78%, phone 74.5/44/41%, 1.854, 103.2%, 51%, SE 1.61, 114.6%, 57.1%)', '`src/components/home/EditorialHero.tsx:28-66`, `src/index.css:703-719, 787-795, 945-994`.'],
      ['Hero opacity ramps (3.6, 0.18 × 3.4, 0.62 × 3.2, taps off at 0.3); 1.1 MB, four times', '`src/index.css:851-861`; `EditorialHero.tsx:104-146`.'],
      ['Drum (36°, 0.1° flat, 18% fade, opacity > 0.01, 1800px, 408px chord, R ≈ 660px, 0.3/1.2/3 cards/s, spring 2.5/s, 5px, 11 tests)', '`src/lib/arc-ring.ts`, `src/lib/arc-ring.test.ts`, `src/components/artwork/FeaturedKiosk.tsx:17-153`. R = 204 / sin 18°; lap = count ÷ 0.3.'],
      ['Shelf (36″ reference, exponent 0.45, floor 0.45, 4% square band, 14 tests, 23 at the floor, 2.2× vs 9×)', '`src/lib/artwork-aspect.ts`, `.test.ts`; frameMetrics applied to the 2026-10-16 dimensions.'],
      ['11 transposed rows', 'frameMetrics’ orientation rule run on 2026-10-18 against the pixel aspect of each painting’s photo in the arteza repo’s `public/img/paintings` (3 of 106 had no local file).'],
      ['Checkout history (19:07, 19:30, 19:51, 20:20 on 8 March; 10 March; 18 files and 3,804 lines on 5 June; 19 June; 21:57 and 22:17 IST, +74/−626 on 3 October; −406 on 8 March)', '`git log` and `git show --shortstat` on 1d8cd9f, fedef4b, 1f5c220, 26cd69f, 89b556d, 8c6fc90, 955a9f5, d61860b, 478ce13, 49cac99, b7c3e7f, 172db42, 88bcb47.'],
      ['create-order rules (100 / 20 chars, 1–50 items, 1–99, 20/h and 5/h, message text)', '`supabase/functions/create-order/index.ts`, `supabase/functions/_shared/common.ts:43-111`.'],
      ['Image pipeline (400/800/1,200/1,600, quality 78, 39/52/13/2, 340 files, 45 MB, 5 GB egress)', '`scripts/sync-images.mjs`, `src/data/image-manifest.ts` (counted), `du -sh public/img`, `src/lib/image-url.ts:1-12`.'],
      ['Double line (4.6, 0.45; 0.275 per line, 1.6×)', '`src/components/ornament/Madhubani.tsx:17-52`; the ratios are arithmetic on 0.45.'],
      ['Price slider (₹500–₹1,25,000, step ₹1,245 or ₹345 without the Tanjore, 62 in 2.01%, 41 in ₹500–₹1,745, median ₹3,000, next ₹35,000)', '`src/pages/ShopPage.tsx:34, 62-66, 176-182` and the live prices of 2026-10-16.'],
      ['Live shell (2,497 bytes)', '`curl -w size` on arteza.site `/`, `/shop`, `/sitemap.xml`, 2026-10-16.']
    ],

    widgets: {
      /* ---------------- Room 1: the vanishing point ---------------- */
      wall: function (host, kit) {
        var view = 'desk', z = 0, ty = VIEWS.desk.ty;
        var root = kit.el('div', { class: 'az-wall' });
        var svg = S('svg', { class: 'az-wall__svg', 'aria-hidden': 'true' });
        root.appendChild(svg);
        var eq = kit.el('p', { class: 'az-eq' });
        var bars = kit.el('div', { class: 'az-ramps' });
        var ramps = ['Headline', 'Painting', 'Caption'].map(function (n) {
          var fill = kit.el('span', { class: 'az-ramp__fill' });
          var v = kit.el('span', { class: 'az-ramp__v' });
          bars.appendChild(kit.el('div', { class: 'az-ramp' }, kit.el('span', { class: 'az-ramp__k', text: n }),
            kit.el('span', { class: 'az-ramp__bar' }, fill), v));
          return { fill: fill, v: v };
        });
        var zS = kit.slider({ label: 'Scroll z', min: 0, max: 1, step: 0.01, value: 0, format: function (v) { return v.toFixed(2); }, onInput: function (v) { z = v; draw(); } });
        var tS = kit.slider({ label: 'Land at T', min: 20, max: 60, step: 1, value: ty, format: function (v) { return v + '%'; }, onInput: function (v) { ty = v; draw(); } });
        var mode = kit.choice({ label: 'Screen', value: 'desk', options: [{ value: 'desk', label: 'Desktop' }, { value: 'phone', label: 'Phone' }],
          onChange: function (v) {
            view = v; var V = VIEWS[v];
            tS.input.min = V.tmin; tS.input.max = V.tmax; ty = V.ty; tS.set(ty, true); draw();
          } });
        var anim = kit.loop(function (dt) { z = Math.min(1, z + dt / 2.4); zS.set(z, true); draw(); if (z >= 1) return false; });
        var play = kit.button('Scroll it', function () {
          if (kit.reduced) { z = 1; zS.set(1, true); draw(); return; }
          z = 0; anim.start();
        }, 'k-btn--primary');
        host.appendChild(kit.el('div', { class: 'k-row' }, mode.el, play));
        host.appendChild(kit.el('div', { class: 'k-row' }, zS.el, tS.el));
        host.appendChild(root);
        host.appendChild(eq);
        host.appendChild(bars);

        var hl = null, dragging = false;
        kit.onKey(function (k) { hl = k; svg.setAttribute('data-hl', k || ''); });

        function draw() {
          var V = VIEWS[view], W = V.W, H = V.H;
          var s = 1 + z * (V.s - 1);
          var Ox = (V.tx - V.s * V.cx) / (1 - V.s), Oy = (ty - V.s * V.cy) / (1 - V.s);
          var px = 0.22 * W, py = 0.06 * H;
          svg.setAttribute('viewBox', (-px) + ' ' + (-py) + ' ' + (W + 2 * px) + ' ' + (H + 2 * py));
          while (svg.firstChild) svg.removeChild(svg.firstChild);
          var col = kit.colors();
          var cid = kit.id('clip');
          var defs = S('defs', {}); var cp = S('clipPath', { id: cid }); cp.appendChild(S('rect', { x: 0, y: 0, width: W, height: H })); defs.appendChild(cp); svg.appendChild(defs);
          svg.appendChild(S('rect', { class: 'az-stage', x: 0, y: 0, width: W, height: H }));
          var ox = Ox / 100 * W, oy = Oy / 100 * H;
          function tr(x, y, k) { return [ox + k * (x - ox), oy + k * (y - oy)]; }

          // rays: from O through each corner, out to where the corner ends at full scale
          var rays = S('g', { class: 'az-rays' });
          var pts = [];
          if (V.frames) FRAMES.forEach(function (f) {
            var fx = f[0] / 100 * W, fy = f[1] / 100 * H, fw = f[2] / 100 * W, fh = fw / f[3];
            pts.push([fx, fy], [fx + fw, fy + fh]);
          });
          var cw = V.cw / 100 * W, ch = cw / 0.82, ccx = V.cx / 100 * W, ccy = V.cy / 100 * H;
          pts.push([ccx - cw / 2, ccy - ch / 2], [ccx + cw / 2, ccy + ch / 2]);
          pts.forEach(function (p) { var e = tr(p[0], p[1], V.s * 1.4); rays.appendChild(S('line', { x1: ox, y1: oy, x2: e[0], y2: e[1] })); });
          svg.appendChild(rays);

          var g = S('g', { 'clip-path': 'url(#' + cid + ')' });
          var wall = S('g', { class: 'az-wallg', transform: 'translate(' + ox + ' ' + oy + ') scale(' + s + ') translate(' + (-ox) + ' ' + (-oy) + ')' });
          if (V.frames) FRAMES.forEach(function (f, i) {
            var fx = f[0] / 100 * W, fy = f[1] / 100 * H, fw = f[2] / 100 * W, fh = fw / f[3], ins = f[4];
            wall.appendChild(S('rect', { x: fx + fw * ins[3] / 100, y: fy + fh * ins[0] / 100,
              width: fw * (1 - (ins[1] + ins[3]) / 100), height: fh * (1 - (ins[0] + ins[2]) / 100), fill: col.series[i % 6], 'fill-opacity': 0.75 }));
            wall.appendChild(S('rect', { class: 'az-frame', x: fx, y: fy, width: fw, height: fh, 'stroke-width': fw * 0.05 / s + 2 }));
          });
          var pol = S('g', { class: 'az-pol' });
          pol.appendChild(S('rect', { class: 'az-pol__card', x: ccx - cw / 2, y: ccy - ch / 2, width: cw, height: ch, 'stroke-width': 3 / s }));
          var paint = Math.max(0, Math.min(1, (z - 0.18) * 3.4));
          pol.appendChild(S('rect', { x: ccx - cw * 0.42, y: ccy - ch * 0.42, width: cw * 0.84, height: ch * 0.66, fill: col.accent, 'fill-opacity': paint }));
          wall.appendChild(pol);
          g.appendChild(wall);
          // headline copy is not on the wall: it fades instead of growing
          var copy = Math.max(0, 1 - 3.6 * z);
          var hx = view === 'desk' ? W * 0.32 : W * 0.06, hw = view === 'desk' ? W * 0.36 : W * 0.38;
          var hy = view === 'desk' ? H * 0.3 : H * 0.34;
          for (var k = 0; k < 3; k++) g.appendChild(S('rect', { class: 'az-copy', x: hx + (view === 'desk' ? hw * 0.08 * (k % 2) : 0), y: hy + k * H * 0.07, width: hw * (k === 1 ? 0.84 : 1), height: H * 0.035, rx: 4, opacity: copy }));
          var capO = Math.max(0, Math.min(1, (z - 0.62) * 3.2));
          var land = tr(ccx, ccy + ch / 2, V.s);
          g.appendChild(S('rect', { class: 'az-copy', x: land[0] - cw * 0.9, y: land[1] + H * 0.03, width: cw * 1.8, height: H * 0.02, rx: 3, opacity: capO }));
          svg.appendChild(g);

          // the card's path, C to T
          var tx = V.tx / 100 * W, tyy = ty / 100 * H;
          svg.appendChild(S('line', { class: 'az-path', x1: ccx, y1: ccy, x2: tx, y2: tyy }));
          var T = S('g', { class: 'az-t' });
          var r = W * 0.018 + 10;
          T.appendChild(S('circle', { cx: tx, cy: tyy, r: r }));
          T.appendChild(S('line', { x1: tx - r * 1.6, y1: tyy, x2: tx + r * 1.6, y2: tyy }));
          var tl = S('text', { x: tx + r * 1.9, y: tyy + r * 0.5, 'font-size': r * 1.4 }); tl.textContent = 'T'; T.appendChild(tl);
          var hit = S('circle', { class: 'az-t__hit', cx: tx, cy: tyy, r: r * 2.4 });
          T.appendChild(hit);
          svg.appendChild(T);
          var O = S('g', { class: 'az-o' });
          O.appendChild(S('circle', { cx: ox, cy: oy, r: r * 0.7 }));
          O.appendChild(S('line', { x1: ox - r * 1.4, y1: oy, x2: ox + r * 1.4, y2: oy }));
          O.appendChild(S('line', { x1: ox, y1: oy - r * 1.4, x2: ox, y2: oy + r * 1.4 }));
          var off = Ox > 100 || Ox < 0 || Oy > 100 || Oy < 0;
          var ol = S('text', { x: ox + (Ox > 100 ? -r * 1.2 : r * 1.6), y: oy - r * 1.6, 'font-size': r * 1.4, 'text-anchor': Ox > 100 ? 'end' : 'start' });
          ol.textContent = off ? 'O · off screen' : 'O'; O.appendChild(ol);
          svg.appendChild(O);
          wireDrag(hit, V);

          var f1 = function (n) { return (Math.round(n * 10) / 10).toString(); };
          eq.textContent = view === 'desk'
            ? 'O = (T − s·C) / (1 − s) = (' + ty + ' − 3 × 66) / (1 − 3) = ' + f1(Oy) + '%  ·  scale now ' + s.toFixed(2)
            : 'Ox = (50 − 1.854 × 74.5) / (1 − 1.854) = ' + f1(Ox) + '%  ·  Oy = (' + ty + ' − 1.854 × 44) / (1 − 1.854) = ' + f1(Oy) + '%';
          [copy, paint, capO].forEach(function (v, i) { ramps[i].fill.style.width = (v * 100) + '%'; ramps[i].v.textContent = v.toFixed(2); });
          kit.live('origin', view === 'desk' ? f1(Oy) + '%' : f1(Ox) + '% across, off the right edge');
          kit.announce('Origin at ' + f1(Ox) + '% across, ' + f1(Oy) + '% down');
        }
        function wireDrag(hit, V) {
          hit.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            hit.setPointerCapture(e.pointerId);
            dragging = true;
            function mv(ev) {
              var m = svg.getScreenCTM(); if (!m) return;
              var y = (ev.clientY - m.f) / m.d;
              var v = Math.round(kit.clamp(y / V.H * 100, V.tmin, V.tmax));
              if (v !== ty) { ty = v; tS.set(v, true); draw(); }
            }
            function up() { dragging = false; window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); }
            window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
          });
        }
        kit.onTheme(draw);
        draw();
        return {};
      },

      /* ---------------- Room 2: the drum ---------------- */
      drum: function (host, kit) {
        var COUNTS = [6, 10, 24, 40, 106];
        var ci = 4, curve = 1, offset = 0, v = 0, vt = 0, goal = null;
        var scene = kit.el('div', { class: 'az-drum__scene', 'aria-hidden': 'true' });
        var track = kit.el('div', { class: 'az-drum__track' });
        scene.appendChild(track);
        var plan = kit.el('div', { class: 'az-drum__plan' });
        var cards = [];
        var rR = kit.readout('Radius at 408px', '660 px', 'k-readout--accent');
        var rShape = kit.readout('Shape', 'ring');
        var rN = kit.readout('Paintings in the loop', '106');
        var rLap = kit.readout('One idle lap', '353 s');
        var bend = kit.slider({ label: 'Bend', min: -1, max: 1, step: 0.01, value: 1, format: function (x) { return x.toFixed(2); }, onInput: function (x) { curve = x; layout(); } });
        var minus = kit.button('− fewer', function () { ci = Math.max(0, ci - 1); build(); });
        var plus = kit.button('more +', function () { ci = Math.min(COUNTS.length - 1, ci + 1); build(); });
        minus.setAttribute('aria-label', 'Fewer paintings'); plus.setAttribute('aria-label', 'More paintings');
        var spin = kit.button('Spin', function () {
          goal = null;
          vt = vt ? 0 : 0.3; spin.textContent = vt ? 'Stop' : 'Spin';
          if (kit.reduced) { if (vt) { offset += 1; vt = 0; spin.textContent = 'Spin'; layout(); } return; }
          loop.start();
        }, 'k-btn--primary');
        function nudge(d) {
          vt = 0; v = 0; spin.textContent = 'Spin';
          goal = Math.round(offset) + d;
          if (kit.reduced) { offset = goal; goal = null; layout(); return; }
          loop.start();
        }
        host.appendChild(kit.el('div', { class: 'k-row' }, bend.el));
        host.appendChild(kit.el('div', { class: 'k-row' },
          kit.button('◀ card', function () { nudge(-1); }), spin, kit.button('card ▶', function () { nudge(1); }),
          kit.el('span', { class: 'az-sep' }), minus, plus));
        host.appendChild(scene);
        var cv = kit.canvas(plan, { height: 96, draw: drawPlan });
        host.appendChild(plan);
        host.appendChild(kit.el('div', { class: 'k-row az-readouts' }, rR.el, rShape.el, rN.el, rLap.el));

        var loop = kit.loop(function (dt) {
          if (goal != null) {
            offset += (goal - offset) * Math.min(1, 8 * dt);
            if (Math.abs(goal - offset) < 0.002) { offset = goal; goal = null; layout(); return false; }
          } else {
            v += (vt - v) * Math.min(1, 2.5 * dt);
            offset += v * dt;
            if (!vt && Math.abs(v) < 0.002) { v = 0; layout(); return false; }
          }
          layout();
        });

        function k() { return kit.clamp(scene.clientWidth / 2000, 0.2, 0.42); }
        function build() {
          var n = COUNTS[ci];
          track.textContent = '';
          cards = [];
          var col = kit.colors();
          for (var i = 0; i < n; i++) {
            var c = kit.el('div', { class: 'az-card' }, kit.el('span', { text: '№ ' + (i + 1) }));
            c.style.background = col.series[i % 6];
            track.appendChild(c); cards.push(c);
          }
          offset = 0;
          rN.set(String(n));
          rLap.set(kit.fmt(n / 0.3) + ' s');
          kit.live('lap', kit.fmt(n / 0.3) + ' s');
          kit.announce(n + ' paintings; one lap ' + kit.fmt(n / 0.3) + ' seconds');
          layout();
        }
        var last = [];
        function layout() {
          var K = k(), cardW = 380 * K, chord = (380 + 28) * K;
          scene.style.perspective = (1800 * K) + 'px';
          scene.style.height = (cardW / 0.8 * 1.35) + 'px';
          last = [];
          for (var i = 0; i < cards.length; i++) {
            var p = arcPlacement(i, cards.length, offset, chord, curve);
            var c = cards[i];
            c.style.width = cardW + 'px'; c.style.height = (cardW / 0.8) + 'px';
            c.style.marginLeft = (-cardW / 2) + 'px'; c.style.marginTop = (-cardW / 1.6) + 'px';
            c.style.transform = p.transform; c.style.opacity = p.opacity.toFixed(3);
            c.style.zIndex = p.zIndex; c.style.visibility = p.visible ? 'visible' : 'hidden';
            if (p.visible) last.push(p);
          }
          var step = arcStep(curve);
          var R = Math.abs(step) < 0.1 ? null : 204 / Math.sin(step / 2 * DEG);
          var rt = R == null ? '∞ (flat row)' : kit.fmt(R) + ' px';
          var shape = R == null ? 'row' : R > 0 ? 'ring' : 'bowl';
          rR.set(rt); rShape.set(shape);
          kit.live('radius', rt);
          cv.draw();
        }
        function drawPlan(ctx, w, h) {
          var col = kit.colors(), K = k(), chord = 408 * K, sc = w / (chord * 7);
          ctx.strokeStyle = col.line; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(0, h - 30); ctx.lineTo(w, h - 30); ctx.stroke();
          ctx.fillStyle = col.inkMuted; ctx.font = '11px ' + getComputedStyle(host).fontFamily;
          ctx.fillText('seen from above', 4, 12);
          ctx.fillStyle = col.ink;
          ctx.beginPath(); ctx.moveTo(w / 2, h - 4); ctx.lineTo(w / 2 - 6, h - 14); ctx.lineTo(w / 2 + 6, h - 14); ctx.fill();
          ctx.fillText('you', w / 2 + 10, h - 4);
          last.forEach(function (p) {
            var cx = w / 2 + p.x * sc, cy = h - 30 + p.z * sc * 0.5, half = 380 * K / 2 * sc, a = p.a * DEG;
            ctx.strokeStyle = col.accent; ctx.globalAlpha = p.opacity; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(cx - Math.cos(a) * half, cy - Math.sin(a) * half * 0.5);
            ctx.lineTo(cx + Math.cos(a) * half, cy + Math.sin(a) * half * 0.5); ctx.stroke();
          });
          ctx.globalAlpha = 1;
        }
        var sx = 0, so = 0;
        kit.drag(scene, { axis: 'x',
          start: function (p) { sx = p.x; so = offset; goal = null; vt = 0; v = 0; spin.textContent = 'Spin'; },
          move: function (p) { offset = so - (p.x - sx) / (408 * k()); layout(); },
          end: function () { nudge(0); } });
        kit.onKey(function (key) {
          var val = { ring: 1, row: 0, bowl: -1 }[key];
          if (val != null) { bend.set(val); }
        });
        kit.onTheme(function () { var col = kit.colors(); cards.forEach(function (c, i) { c.style.background = col.series[i % 6]; }); cv.draw(); });
        if (window.ResizeObserver) new ResizeObserver(function () { layout(); }).observe(scene);
        build();
        return {};
      },

      /* ---------------- Room 3: the shelf (scrolly) ---------------- */
      shelf: function (host, kit) {
        var st = { exp: 0.45, floor: 0.45, repair: true, focus: false };
        var narrow = window.matchMedia('(max-width: 959.98px)');
        var exp = kit.slider({ label: 'Exponent', min: 0.2, max: 1, step: 0.01, value: 0.45, format: function (v) { return v.toFixed(2); }, onInput: function (v) { st.exp = v; cv.draw(); } });
        var dl = kit.el('datalist', { id: kit.id('ticks') }, kit.el('option', { value: '0.45', label: 'ships' }), kit.el('option', { value: '0.5', label: 'comment' }));
        exp.input.setAttribute('list', dl.id); exp.el.appendChild(dl);
        var fl = kit.slider({ label: 'Floor', min: 0, max: 0.6, step: 0.01, value: 0.45, format: function (v) { return v.toFixed(2); }, onInput: function (v) { st.floor = v; cv.draw(); } });
        var rep = kit.choice({ label: 'Dimensions', value: 'rep', options: [{ value: 'stated', label: 'Stated' }, { value: 'rep', label: 'Repaired' }], onChange: function (v) { st.repair = v === 'rep'; cv.draw(); } });
        var info = kit.el('p', { class: 'az-shelf__info' });
        host.appendChild(kit.el('div', { class: 'k-row' }, exp.el, fl.el));
        host.appendChild(kit.el('div', { class: 'k-row' }, rep.el, kit.el('span', { class: 'az-shelf__mark', text: '0.45 ships · 0.5 is what the comment says' })));
        var boxes = [];
        var cv = kit.canvas(host, { draw: draw });
        host.appendChild(info);
        function size() { cv.el.style.height = (narrow.matches ? Math.round(Math.min(200, window.innerHeight * 0.24)) : 330) + 'px'; }
        size(); narrow.addEventListener('change', function () { size(); cv.draw(); });

        function frames() {
          return SHELF.map(function (r, i) {
            var w = r[0], h = r[1], t = st.repair && r[2];
            if (t) { var x = w; w = h; h = x; }
            return { i: i, w: w, h: h, sw: r[0], sh: r[1], t: !!t, ar: w / h, s: scaleOf(h, st.exp, st.floor), atFloor: Math.pow(h / 36, st.exp) <= st.floor };
          }).sort(function (a, b) { return b.s - a.s || a.i - b.i; });
        }
        function layoutRows(F, W, H, gap) {
          var rows = 1, x = 0;
          F.forEach(function (f) { var fw = H * f.s * f.ar; if (x + fw > W && x > 0) { rows++; x = 0; } x += fw + gap; });
          return rows;
        }
        function draw(ctx, w, h) {
          var col = kit.colors(), F = frames();
          var font = getComputedStyle(host).fontFamily;
          boxes = [];
          if (st.focus) { drawFocus(ctx, w, h, col, font); }
          else {
            var gap = 3, H = 120;
            var worst = SHELF.map(function (r) { return { s: scaleOf(r[1], 0.2, 0.6), ar: r[0] / r[1] }; });
            while (H > 8 && layoutRows(worst, w, H, gap) * (H + 10) > h - 4) H -= 1;
            var x = 0, y = H + 2;
            F.forEach(function (f) {
              var fh = H * f.s, fw = fh * f.ar;
              if (x + fw > w && x > 0) {
                ctx.strokeStyle = col.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, y + 1); ctx.lineTo(w, y + 1); ctx.stroke();
                x = 0; y += H + 10;
              }
              ctx.fillStyle = f.atFloor ? col.accentMid : col.series[3];
              ctx.fillRect(x, y - fh, fw, fh);
              ctx.strokeStyle = col.accentDeep; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y - fh + 0.5, fw - 1, fh - 1);
              if (f.atFloor) { ctx.fillStyle = col.ink; ctx.beginPath(); ctx.moveTo(x + fw / 2, y + 2); ctx.lineTo(x + fw / 2 - 3, y + 7); ctx.lineTo(x + fw / 2 + 3, y + 7); ctx.fill(); }
              boxes.push([x, y - fh, fw, fh, f]);
              x += fw + gap;
            });
            ctx.strokeStyle = col.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, y + 1); ctx.lineTo(w, y + 1); ctx.stroke();
          }
          var nFloor = F.filter(function (f) { return f.atFloor; }).length;
          var nT = F.filter(function (f) { return f.t; }).length;
          var mx = Math.max.apply(null, F.map(function (f) { return f.s; })), mn = Math.min.apply(null, F.map(function (f) { return f.s; }));
          info.textContent = 'At the floor (▲): ' + nFloor + ' of 106  ·  largest ÷ smallest: ' + (mx / mn).toFixed(1) + '×  ·  turned: ' + nT;
        }
        function drawFocus(ctx, w, h, col, font) {
          // "The Crimson Muse": stated 36 × 24, photograph 0.64 (portrait)
          var stated = !st.repair, fw, fh, pad = 16;
          var avail = h - 40;
          if (stated) { fh = avail * 0.6; fw = fh * 1.5; } else { fh = avail; fw = fh * (24 / 36); }
          if (fw > w - 2 * pad) { var k = (w - 2 * pad) / fw; fw *= k; fh *= k; }
          var x = (w - fw) / 2, y = 10 + (avail - fh);
          ctx.fillStyle = col.bgSunken; ctx.fillRect(x, y, fw, fh);
          ctx.strokeStyle = col.ink; ctx.lineWidth = 6; ctx.strokeRect(x, y, fw, fh);
          var ph = fh - 12, pw = ph * 0.64;
          if (pw > fw - 12) { pw = fw - 12; ph = pw / 0.64; }
          ctx.fillStyle = col.accent; ctx.fillRect(x + (fw - pw) / 2, y + (fh - ph) / 2, pw, ph);
          ctx.fillStyle = col.ink; ctx.font = '12px ' + font; ctx.textAlign = 'center';
          ctx.fillText(stated ? 'Stated 36″ × 24″: a landscape frame, a portrait photo' : 'Repaired: 24″ × 36″, the photo fits', w / 2, h - 10);
          ctx.textAlign = 'left';
        }
        cv.el.addEventListener('pointermove', function (e) {
          var r = cv.el.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
          var hit = null;
          boxes.forEach(function (b) { if (mx >= b[0] && mx <= b[0] + b[2] && my >= b[1] && my <= b[1] + b[3]) hit = b[4]; });
          if (hit) cv.el.title = hit.sw + '″ × ' + hit.sh + '″ stated' + (hit.t ? ', turned' : '') + ' · drawn at ' + hit.s.toFixed(2);
        });
        return {
          set: function (s) {
            st.exp = s.exp; st.floor = s.floor; st.repair = s.repair; st.focus = !!s.focus;
            exp.set(s.exp, true); fl.set(s.floor, true); rep.set(s.repair ? 'rep' : 'stated', true);
            cv.draw();
          }
        };
      },

      /* ---------------- Room 4: the checkout's history ---------------- */
      timeline: function (host, kit) {
        var win = 'year', t = T0, hl = null;
        var choice = kit.choice({ label: 'View', value: 'year', options: [{ value: 'year', label: 'Whole year' }, { value: 'mar', label: '8 March' }, { value: 'oct', label: '3 October' }],
          onChange: function (v) { win = v; var W = WINDOWS[v]; t = W[0]; scrub.input.min = 0; scrub.set(0, true); draw(); } });
        var scrub = kit.slider({ label: 'Scrub', min: 0, max: 1000, step: 1, value: 0, format: function () { return fmtT(t, win === 'year'); },
          onInput: function (v) { var W = WINDOWS[win]; t = W[0] + (W[1] - W[0]) * v / 1000; draw(); } });
        scrub.el.classList.add('az-scrub');
        var box = kit.el('div', { class: 'az-tl' });
        var svg = S('svg', { class: 'az-tl__svg', 'aria-hidden': 'true' });
        var card = kit.el('div', { class: 'az-phone', 'aria-live': 'off' });
        var cTitle = kit.el('p', { class: 'az-phone__t' }), cBody = kit.el('p', { class: 'az-phone__b' }), cAt = kit.el('p', { class: 'az-phone__k' });
        card.appendChild(kit.el('p', { class: 'az-phone__k', text: 'The checkout ended in' })); card.appendChild(cTitle); card.appendChild(cBody); card.appendChild(cAt);
        var removed = kit.readout('Checkout code removed so far', '0 lines', 'k-readout--accent');
        host.appendChild(kit.el('div', { class: 'k-row' }, choice.el));
        host.appendChild(kit.el('div', { class: 'k-row' }, scrub.el));
        box.appendChild(svg); box.appendChild(card);
        host.appendChild(box);
        host.appendChild(kit.el('div', { class: 'k-row' }, removed.el));
        kit.onKey(function (k) {
          hl = k;
          if (k === 'qr' && win !== 'mar') choice.set('mar');
          else if (k === 'utr' && win !== 'oct') choice.set('oct');
          else if (k === 'cut' && win !== 'year') choice.set('year');
          else draw();
        });
        function draw() {
          var W = WINDOWS[win], w = Math.max(280, svg.clientWidth || box.clientWidth - 200), h = 170;
          svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
          svg.setAttribute('data-hl', hl || '');
          while (svg.firstChild) svg.removeChild(svg.firstChild);
          var L = 8, R = w - 8, ax = 78;
          function X(tt) { return L + (R - L) * (tt - W[0]) / (W[1] - W[0]); }
          function inW(tt) { return tt >= W[0] && tt <= W[1]; }
          svg.appendChild(S('line', { class: 'az-axis', x1: L, y1: ax, x2: R, y2: ax }));
          // month or time ticks
          if (win === 'year') {
            for (var m = 1; m <= 10; m++) { var mt = U(m, 1); if (!inW(mt)) continue; svg.appendChild(S('line', { class: 'az-tick', x1: X(mt), y1: ax - 4, x2: X(mt), y2: ax + 4 })); var tx = S('text', { class: 'az-lbl', x: X(mt) + 2, y: ax + 16 }); tx.textContent = MON[m - 1]; svg.appendChild(tx); }
          } else {
            for (var q = Math.ceil(W[0] / 9e5) * 9e5; q <= W[1]; q += 9e5) { svg.appendChild(S('line', { class: 'az-tick', x1: X(q), y1: ax - 4, x2: X(q), y2: ax + 4 })); var tq = S('text', { class: 'az-lbl', x: X(q) + 2, y: ax + 16 }); tq.textContent = fmtT(q).split(', ')[1].replace(' UTC', ''); svg.appendChild(tq); }
          }
          EVENTS.forEach(function (e) {
            if (!inW(e.t)) return;
            svg.appendChild(S('circle', { class: 'az-ev', cx: X(e.t), cy: ax, r: 3 }));
            if (win !== 'year') { var lt = S('text', { class: 'az-lbl az-lbl--ev', x: X(e.t) + 4, y: ax - 10 - (e.t % 3) * 11, }); lt.textContent = e.label; svg.appendChild(lt); }
          });
          SPANS.forEach(function (s, i) {
            if (s.b < W[0] || s.a > W[1]) return;
            var x1 = X(Math.max(s.a, W[0])), x2 = X(Math.min(s.b, W[1]));
            var g = S('g', { class: 'az-span', 'data-key': s.key });
            g.appendChild(S('rect', { x: x1, y: ax - 30, width: Math.max(1, x2 - x1), height: 30 }));
            var lx = win === 'year' ? x1 : (x1 + x2) / 2;
            g.appendChild(S('line', { x1: lx, y1: ax - 30, x2: lx, y2: 14 + i * 2 }));
            var tl = S('text', { class: 'az-lbl az-lbl--span', x: lx + (win === 'year' && i === 1 ? -4 : 4), y: 12 + i * 2, 'text-anchor': win === 'year' && i === 1 ? 'end' : 'start' });
            tl.textContent = s.label + ', ' + s.mins + ' min';
            g.appendChild(tl);
            svg.appendChild(g);
          });
          var gone = 0, maxN = 3804;
          CUTS.forEach(function (c) {
            if (c.t <= t) gone += c.n;
            if (!inW(c.t)) return;
            var hgt = 8 + 52 * Math.sqrt(c.n / maxN);
            var g = S('g', { class: 'az-cut' + (c.t <= t ? ' is-past' : ''), 'data-key': c.key });
            g.appendChild(S('rect', { x: X(c.t) - 2, y: ax + 22, width: 5, height: hgt }));
            var tt = S('text', { class: 'az-lbl', x: X(c.t) + (X(c.t) > w - 70 ? -6 : 7), y: ax + 34, 'text-anchor': X(c.t) > w - 70 ? 'end' : 'start' });
            tt.textContent = '−' + kit.fmt(c.n);
            g.appendChild(tt);
            svg.appendChild(g);
          });
          svg.appendChild(S('line', { class: 'az-now', x1: X(t), y1: 4, x2: X(t), y2: h - 4 }));
          var stt = STATES[0];
          STATES.forEach(function (s) { if (s[0] <= t) stt = s; });
          cTitle.textContent = stt[1]; cBody.textContent = stt[2]; cAt.textContent = fmtT(t);
          removed.set(gone ? '−' + kit.fmt(gone) + ' lines' : 'none yet');
          scrub.input.setAttribute('aria-valuetext', fmtT(t) + ': ' + stt[1]);
          scrub.el.querySelector('output').textContent = fmtT(t, win === 'year');
        }
        if (window.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(box);
        draw();
        return {};
      },

      /* ---------------- Room 4: try to cheat the counter ---------------- */
      cheat: function (host, kit) {
        var DEFAULT = { customer_name: 'Asha', customer_phone: '+91 98100 00000', items: [
          { painting_title: SAMPLE[0].title, quantity: 1 }, { painting_title: SAMPLE[2].title, quantity: 1 }] };
        var log = [];
        var id = kit.id('req');
        var ta = kit.el('textarea', { id: id, class: 'az-req', rows: 11, spellcheck: 'false', autocomplete: 'off' });
        ta.value = JSON.stringify(DEFAULT, null, 2);
        var status = kit.el('p', { class: 'az-status', role: 'status' });
        var said = kit.el('ul', { class: 'az-said' });
        var resp = kit.el('pre', { class: 'az-resp' });
        var bubble = kit.el('div', { class: 'az-bubble', hidden: true });
        var counts = kit.el('p', { class: 'az-counts' });
        function edit(fn) {
          var o; try { o = JSON.parse(ta.value); } catch (e) { o = JSON.parse(JSON.stringify(DEFAULT)); }
          if (!o || !Array.isArray(o.items)) o = JSON.parse(JSON.stringify(DEFAULT));
          fn(o); ta.value = JSON.stringify(o, null, 2);
        }
        function send() {
          var r = createOrder(ta.value, log);
          status.textContent = 'HTTP ' + r[0] + (r[0] === 200 ? ' · order recorded' : r[0] === 429 ? ' · rate-limited' : r[0] === 400 ? ' · refused' : ' · error');
          status.setAttribute('data-ok', r[0] === 200 ? '1' : '0');
          said.textContent = '';
          (r[2] || []).forEach(function (s) { said.appendChild(kit.el('li', { text: s })); });
          resp.textContent = JSON.stringify(r[1], null, 2);
          bubble.hidden = !r[3]; bubble.textContent = r[3] || '';
          var ph = '';
          try { var b = JSON.parse(ta.value); ph = typeof b.customer_phone === 'string' ? b.customer_phone.trim().slice(0, 20) : ''; } catch (e) {}
          var hr = Date.now() - 3600e3;
          var rec = log.filter(function (o) { return o.at > hr; });
          counts.textContent = 'Orders in the last hour: ' + rec.length + ' of 20  ·  from this phone: ' + rec.filter(function (o) { return ph && o.phone === ph; }).length + ' of 5';
          kit.announce(status.textContent);
        }
        host.appendChild(kit.el('label', { 'for': id, class: 'az-label', text: 'The request the cart sends (edit it)' }));
        host.appendChild(ta);
        host.appendChild(kit.el('div', { class: 'k-row az-presets' },
          kit.button('Send', send, 'k-btn--primary'),
          kit.button('Name my own price', function () { edit(function (o) { o.items[0] = o.items[0] || {}; o.items[0].price = 1; }); }),
          kit.button('Order 500', function () { edit(function (o) { o.items[0] = o.items[0] || {}; o.items[0].quantity = 500; }); }),
          kit.button('Add the sold one', function () { edit(function (o) { o.items.push({ painting_title: SAMPLE[5].title, quantity: 1 }); }); }),
          kit.button('Send six times', function () { for (var i = 0; i < 6; i++) send(); }),
          kit.button('Reset', function () { ta.value = JSON.stringify(DEFAULT, null, 2); log.length = 0; send(); })));
        host.appendChild(kit.el('div', { class: 'az-out' },
          kit.el('div', {}, status, said, resp, counts),
          kit.el('div', {}, kit.el('p', { class: 'az-label', text: 'What WhatsApp opens with' }), bubble)));
        status.textContent = 'Nothing sent yet.';
        return {};
      },

      /* ---------------- Room 6: the double line ---------------- */
      border: function (host, kit) {
        var r = 0.45;
        var svg = S('svg', { viewBox: '0 0 600 150', class: 'az-border', 'aria-hidden': 'true' });
        var d = 'M30 110 C 90 20, 150 20, 200 80 S 300 140, 350 70 S 470 10, 570 90';
        var leaf = 'M120 120 Q 160 92 200 120 Q 160 148 120 120 Z';
        var outer = S('g', { class: 'az-border__ink' }), inner = S('g', { class: 'az-border__gap' });
        [d, leaf].forEach(function (p) { outer.appendChild(S('path', { d: p })); inner.appendChild(S('path', { d: p })); });
        svg.appendChild(outer); svg.appendChild(inner);
        var out = kit.readout('Gap ÷ each line', '1.64');
        var sl = kit.slider({ label: 'Inner stroke', min: 0.2, max: 0.8, step: 0.01, value: r, format: function (v) { return '× ' + v.toFixed(2); },
          onInput: function (v) { r = v; draw(); } });
        var dl = kit.el('datalist', { id: kit.id('bt') }, kit.el('option', { value: '0.45' }), kit.el('option', { value: '0.33' }));
        sl.input.setAttribute('list', dl.id); sl.el.appendChild(dl);
        host.appendChild(kit.el('div', { class: 'k-row' }, sl.el, out.el));
        host.appendChild(svg);
        host.appendChild(kit.el('p', { class: 'az-shelf__mark', text: '0.45 ships · 0.33 is where the gap equals a line' }));
        function draw() {
          var W = 18;
          outer.setAttribute('stroke-width', W); inner.setAttribute('stroke-width', W * r);
          var ratio = r / ((1 - r) / 2);
          out.set(ratio.toFixed(2) + '×');
        }
        draw();
        return {};
      },

      /* ---------------- Closing: the price slider ---------------- */
      price: function (host, kit) {
        var scale = 'linear', noTanjore = false, lo = 0, hi = 100;
        var box = kit.el('div', { class: 'az-price' });
        var svg = S('svg', { class: 'az-price__svg', 'aria-hidden': 'true' });
        box.appendChild(svg);
        var sc = kit.choice({ label: 'Track', value: 'linear', options: [{ value: 'linear', label: 'Linear (ships)' }, { value: 'log', label: 'Log' }, { value: 'quantile', label: 'Quantile' }],
          onChange: function (v) { scale = v; draw(); } });
        var cid = kit.id('tj');
        var cb = kit.el('input', { type: 'checkbox', id: cid, on: { change: function () { noTanjore = cb.checked; draw(); } } });
        var cbl = kit.el('label', { 'for': cid, class: 'az-check' }, cb, ' Remove the ₹1,25,000 Tanjore');
        var a = kit.slider({ label: 'From', min: 0, max: 100, step: 1, value: 0, format: function () { return inr(at(lo)); }, onInput: function (v) { lo = Math.min(v, hi - 1); if (lo !== v) a.set(lo, true); draw(); } });
        var b = kit.slider({ label: 'To', min: 0, max: 100, step: 1, value: 100, format: function () { return inr(at(hi)); }, onInput: function (v) { hi = Math.max(v, lo + 1); if (hi !== v) b.set(hi, true); draw(); } });
        var rIn = kit.readout('In range', '106', 'k-readout--accent'), rStep = kit.readout('One step', '₹1,245'), rFirst = kit.readout('First 2% of the track', '62'), rWin = kit.readout('Narrowest window from the left', '41');
        host.appendChild(kit.el('div', { class: 'k-row' }, sc.el, cbl));
        host.appendChild(box);
        host.appendChild(kit.el('div', { class: 'k-row' }, a.el, b.el));
        host.appendChild(kit.el('div', { class: 'k-row az-readouts' }, rIn.el, rStep.el, rFirst.el, rWin.el));
        function P() { return noTanjore ? PRICES.slice(0, -1) : PRICES; }
        function pos(p) {
          var ps = P(), mn = ps[0], mx = ps[ps.length - 1];
          if (scale === 'linear') return (p - mn) / (mx - mn);
          if (scale === 'log') return Math.log(p / mn) / Math.log(mx / mn);
          var f = ps.indexOf(p), l = ps.lastIndexOf(p);
          return ((f + l) / 2) / (ps.length - 1);
        }
        function at(t100) {
          var ps = P(), mn = ps[0], mx = ps[ps.length - 1], t = t100 / 100;
          if (scale === 'linear') { var st = Math.max(1, Math.round((mx - mn) / 100)); return Math.min(mx, mn + Math.round(t * 100) * st); }
          if (scale === 'log') return Math.round(mn * Math.pow(mx / mn, t));
          return ps[Math.round(t * (ps.length - 1))];
        }
        var dots = [];
        function draw() {
          var ps = P(), w = Math.max(280, box.clientWidth), h = 150, L = 12, R = w - 12, base = h - 34;
          svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
          if (dots.length !== ps.length) {
            while (svg.firstChild) svg.removeChild(svg.firstChild);
            svg.appendChild(S('rect', { class: 'az-band', y: 4, height: base - 2 }));
            svg.appendChild(S('line', { class: 'az-axis', x1: L, y1: base + 6, x2: R, y2: base + 6 }));
            dots = ps.map(function (p) { var c = S('circle', { class: 'az-dot' + (p === 125000 ? ' is-tj' : ''), r: 3.2, cx: 0, cy: 0 }); svg.appendChild(c); return c; });
            svg.appendChild(S('text', { class: 'az-lbl az-lbl--lump', y: h - 8 }));
            svg.appendChild(S('text', { class: 'az-lbl az-lbl--tj', y: h - 8, 'text-anchor': 'end' }));
          }
          var band = svg.querySelector('.az-band');
          var bins = {}, lov = at(lo), hiv = at(hi), inN = 0;
          ps.forEach(function (p, i) {
            var x = L + (R - L) * pos(p), k = Math.round(x / 7);
            bins[k] = (bins[k] || 0) + 1;
            var y = base - (bins[k] - 1) * 6.4;
            if (y < 8) y = 8;
            dots[i].style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
            var inside = p >= lov && p <= hiv; if (inside) inN++;
            dots[i].classList.toggle('is-out', !inside);
          });
          var x1 = L + (R - L) * lo / 100, x2 = L + (R - L) * hi / 100;
          band.setAttribute('x', x1); band.setAttribute('width', Math.max(1, x2 - x1));
          var mn = ps[0], mx = ps[ps.length - 1];
          var first = ps.filter(function (p) { return pos(p) <= 0.0201; }).length;
          var win1 = ps.filter(function (p) { return p <= at(1); }).length;
          var lump = svg.querySelector('.az-lbl--lump'); lump.setAttribute('x', L); lump.textContent = scale === 'linear' ? '↑ ' + first + ' paintings in the first 2% of the track' : '';
          var tj = svg.querySelector('.az-lbl--tj'); tj.setAttribute('x', R); tj.textContent = noTanjore ? 'top: ' + inr(mx) : '◯ the Tanjore, ' + inr(125000);
          rIn.set(String(inN));
          rStep.set(scale === 'linear' ? inr(Math.max(1, Math.round((mx - mn) / 100))) : scale === 'log' ? '× ' + Math.pow(mx / mn, 0.01).toFixed(3) : '≈ 1 painting');
          rFirst.set(String(first));
          rWin.set(inr(mn) + '–' + inr(at(1)) + ': ' + win1);
          a.set(lo, true); b.set(hi, true);
          kit.announce(inN + ' paintings in range');
        }
        if (window.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(box);
        draw();
        return {};
      }
    }
  });
})();
