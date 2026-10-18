/* Habita — "One task, followed."
   The case study is the plot of the app's own test file: one task, "Write the
   incident report", through every layer. Chapter labels are real check names
   from tests/timeline.test.mjs. The rail is the task's model; every widget
   writes to it through TASK below. Constants and algorithms are copied from
   the Habita repo (file:line beside each). */
(function () {
  'use strict';

  /* ---------- the app's constants, verbatim ---------- */
  var PX_PER_HOUR = 64;          // timeline.js:11
  var SNAP_MINUTES = 15;         // tasks.js:16
  var DEFAULT_DURATION = 30;     // storage.js:10
  var DRAG_THRESHOLD = 6;        // timeline.js:15
  var PLUS_THRESHOLD = 8;        // ui.js:326
  var MS_PER_MINUTE = 60000;
  var M = MS_PER_MINUTE, H = 60 * M;

  // tasks.js:130-133
  function snapTime(millis) {
    var step = SNAP_MINUTES * 60000;
    return Math.round(millis / step) * step;
  }
  // Not in the app: the alternative the closing argues for.
  function ceilTime(millis) {
    var step = SNAP_MINUTES * 60000;
    return Math.ceil(millis / step) * step;
  }
  function pixelsToMinutes(p) { return (p / PX_PER_HOUR) * 60; }   // timeline.js:44
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hhmm(ms) {
    var m = Math.round(ms / M);
    return pad(Math.floor(m / 60)) + ':' + pad(((m % 60) + 60) % 60);
  }

  /* The app's quadrant colours (calendar.js:17-22), shown only as swatches
     beside a glyph and a name, never as a ground for text. */
  var Q = {
    1: { name: 'Focus', hex: '#EE544F', g: '●', sub: 'urgent · important' },
    2: { name: 'Goals', hex: '#00B9D5', g: '▲', sub: 'important · not urgent' },
    3: { name: 'Fit In', hex: '#FBB028', g: '◆', sub: 'urgent · not important' },
    4: { name: 'Backburner', hex: '#01C0A6', g: '■', sub: 'neither' }
  };

  /* ---------- the task, shared by every widget and the rail ---------- */
  var TASK = { title: 'Write the incident report', quadrant: null, start: null,
    duration: DEFAULT_DURATION, eventId: null, synced: 'browser: no calendar', check: '' };
  var subs = [];
  var touched = {};
  function setTask(patch, ch) {
    if (ch) touched[ch] = true;
    Object.keys(patch).forEach(function (k) { TASK[k] = patch[k]; });
    subs.forEach(function (f) { try { f(); } catch (e) {} });
  }
  function onTask(fn) { subs.push(fn); }

  /* Where the test has left the task by each chapter. Applied when a chapter
     is reached, unless the reader has already used that chapter's figure. */
  var SNAP = {
    before: { quadrant: null, start: null, duration: 30, eventId: null, synced: 'browser: no calendar', check: '✓ starts with an empty model' },
    place: { quadrant: 1, start: null, duration: 30, eventId: null, synced: 'browser: no calendar', check: '✓ unscheduled tasks appear in the tray' },
    drop: { quadrant: 1, start: 10 * H, duration: 30, eventId: null, synced: 'browser: no calendar', check: '✓ dragging a chip onto the grid schedules it at that hour' },
    tap: { quadrant: 1, start: 12 * H, duration: 90, check: '✓ tapping a chip places it without a drag' },
    overlap: { quadrant: 1, start: 12 * H, duration: 90, check: '✓ overlapping blocks are laid out side by side' },
    land: { quadrant: 1, check: '✓ browser build reports no native calendar' },
    unproven: { check: '? no check covers this' },
    reload: { start: null, eventId: null, synced: 'unscheduled', check: '✓ state survives a reload' },
    differently: { check: 'What I’d do differently' }
  };

  function tile(host, kit) { host.classList.add('hb-w'); return host; }

  Article.register('habita', {
    form: 'one-task',
    scramble: '0123456789:—▢▣',
    rail: 'card',
    dek: 'This is the life of one task, **Write the incident report**, as Habita’s own test file lives it: filed under Focus, dropped at ten, moved to noon, stretched to ninety minutes. Each chapter is one check from a run that passed 18 of 18. The last stretch is the part no check covers: the block becoming a real event in the phone’s calendar.',

    opener: function (c) {
      return '<rect x="10" y="22" width="22" height="22" fill="' + c.a + '"/>' +
        '<rect x="35" y="22" width="22" height="22" fill="none" stroke="' + c.l + '" stroke-width="1.4"/>' +
        '<rect x="10" y="47" width="22" height="22" fill="none" stroke="' + c.l + '" stroke-width="1.4"/>' +
        '<rect x="35" y="47" width="22" height="22" fill="none" stroke="' + c.l + '" stroke-width="1.4"/>' +
        '<path d="M70 14V114" stroke="' + c.i + '" stroke-width="1"/>' +
        [30, 46, 62, 78, 94].map(function (y) { return '<path d="M66 ' + y + 'H74" stroke="' + c.l + '" stroke-width="1"/>'; }).join('') +
        '<rect x="76" y="46" width="14" height="40" fill="' + c.a + '"/>' +
        '<path d="M32 33C52 33 56 60 74 60" fill="none" stroke="' + c.a + '" stroke-width="1.2" stroke-dasharray="3 3"/>' +
        '<path d="M92 66H104" stroke="' + c.i + '" stroke-width="1.2"/><path d="M100 62l4 4-4 4" fill="none" stroke="' + c.i + '" stroke-width="1.2"/>' +
        '<rect x="106" y="50" width="16" height="32" fill="none" stroke="' + c.i + '" stroke-width="1.2"/>' +
        '<path d="M109 58H119M109 64H119M109 70H116" stroke="' + c.l + '" stroke-width="1"/>';
    },

    chapters: [
      { id: 'before', label: '✓ starts with an empty model', title: 'Before it was a timeline',
        art: function (c) {
          return '<rect x="20" y="20" width="44" height="80" rx="8" fill="none" stroke="' + c.l + '" stroke-width="1.5" stroke-dasharray="4 4"/>' +
            '<text x="42" y="64" text-anchor="middle" font-size="10" fill="' + c.i + '" font-family="monospace">Swift</text>' +
            '<path d="M70 60H90" stroke="' + c.a + '" stroke-width="1.5"/><path d="M86 56l4 4-4 4" fill="none" stroke="' + c.a + '" stroke-width="1.5"/>' +
            '<rect x="98" y="30" width="44" height="60" fill="none" stroke="' + c.i + '" stroke-width="1.5"/>' +
            '<rect x="104" y="48" width="32" height="14" fill="' + c.a + '"/>';
        },
        blocks: [
          { p: 'Habita did not start as this app. The first commit, on 19 April 2026, was a SwiftUI app for iPhone with habits, CloudKit sync and a button called “AI Rate” that scored a task’s complexity and urgency.^[git show 3105c56: HabitaApp.swift, CloudKitService, AIRatingService and a product spec in README.md.] The next day I deleted all the Swift and started again for the web.^[git show --stat a3ca719, 20 April 2026.]' },
          { p: 'Most of that first spec is gone. One line survived, step 8 of the capture flow: *Once placed, task is time-blocked on the calendar for its duration.* It took four months to ship. The matrix came back in May, the redesign with quadrant names in June, and the day timeline, the calendar plugin and the test file all landed in one commit on 12 August.^[918d772 (27 May), 2c50f1b (15 June), b1724c3 (12 August), which added 516 lines of CalendarPlugin.java and 641 of timeline.js.]',
            notes: [['One line survived', 'the only idea that made it from April to now']] },
          { quote: 'A second place to check is a place you stop checking.' },
          { p: 'That line is the reason the app exists. A to-do list with its own private calendar is one more thing to open. If the time I block out lands in the calendar the phone already shows me, I don’t have to remember to look.' },
          { p: 'So rather than tour the features, I’m going to follow one task through the code. The test file, `tests/timeline.test.mjs`, already does this. It loads `src/index.html` in jsdom, presses the real interface and checks the saved model. Its first task is *Write the incident report*, filed under Focus. Each chapter below is headed with one of its checks. When I re-ran it on 18 October 2026, all 18 passed.^[`node tests/timeline.test.mjs` in the Habita repo at 4bc5591, run 18 October 2026: “18/18 checks passed”.]' },
          { p: 'The card beside this text (above it, on a phone) is that task’s model: the fields the test reads. It changes as you read, and as you use the figures.' },
          { p: 'There is no build step any more. Capacitor serves `src/` directly, and the script that used to copy it into a `www/` folder was deleted on 14 October.^[capacitor.config.json: `"webDir": "src"`; commit 4bc5591 deleted scripts/build.js.]' }
        ] },

      { id: 'place', label: '✓ unscheduled tasks appear in the tray, coloured by quadrant', title: 'Place it',
        blocks: [
          { p: 'The matrix is the oldest idea here and the least original. It’s the Eisenhower grid: sort tasks by urgent and by important and you get four boxes. Habita names them **Focus** (urgent and important, top left), **Goals** (important, not urgent, top right), **Fit In** (urgent, not important, bottom left) and **Backburner** (neither, bottom right).^[src/index.html:59-85; colours in src/core/calendar.js:17-22.]' },
          { p: 'To add a task you drag the **+** in the middle onto a box. Pressing it opens a 34-pixel gap between the boxes, shrinks the grid to 94%, and shows the axis labels in the gaps.^[styles.css:303-306.] Once the pointer has moved more than 8 pixels, every box except the one under it goes pale.^[ui.js:326 and :341-348; pale tints in styles.css:401-405.] Where you let go is decided by `quadrantAtPoint`, which cuts the grid at its centre.^[ui.js:397-406.]' },
          { widget: 'axes', caption: 'Press and hold the **+**, or drag it onto a box. With a keyboard, press the **+** to open the seams, then choose a box. The swatches are the app’s own colours. The switch swaps the seam labels between what ships and what the box names say.' },
          { p: 'Now look at the labels as shipped. The CSS puts *Urgent* on the top arm of the vertical seam and *Important* on the left arm of the horizontal one. Read that way, the top-right box is urgent and not important. The app calls it Goals: important and not urgent. The axes are transposed, and Fit In is wrong the same way.^[styles.css:335-362 against the aria-labels in index.html:66-78.]',
            notes: [['The axes are transposed', 'found this while writing the article. The app still ships it.']] },
          { p: 'The labels only show while you hold the button, which is probably why I never noticed. The names, the colours and the saved data are right; only the pressed state is wrong. It’s first on the list at the end.' },
          { p: 'For our task nothing unusual happens. The test calls `addTask(1, \'Write the incident report\')`, and the task shows up in the Day view’s tray as a Focus chip with `start: null` and the default length of 30 minutes.^[tests/timeline.test.mjs:106; DEFAULT_DURATION in storage.js:10.]' }
        ] },

      { id: 'drop', label: '✓ dragging a chip onto the grid schedules it at that hour', title: 'Drop it at ten',
        blocks: [
          { p: 'The Day view is 24 rows of 64 pixels. That one constant, `PX_PER_HOUR = 64`, is the whole conversion between where your finger is and what time it means: minutes are y divided by 64, times 60.^[timeline.js:11, :40-46.] An hour is 64 pixels, so a quarter-hour is [[sixteen pixels|quarter]] and the whole day is 1,536 pixels tall.' },
          { p: 'Blocks snap to 15 minutes. `snapTime` rounds to the nearest quarter, not down, so the jump to the next quarter happens at [[the midpoint|mid]], 8 pixels past each line.^[tasks.js:16, :130-133.] And a press only counts as a drag after [[six pixels|threshold]] of movement on either axis. Less than that and it’s a tap, which does something else (next chapter).^[timeline.js:15, :356.]',
            notes: [['on either axis', 'so the dead zone is a 12-pixel square, not a circle']] },
          { widget: 'ruler', size: 'wide', caption: 'True scale: 64 px is an hour, so the strip shows 08:00 to 12:00. Drag the chip onto it, or move the slider and press **Drop it there**. Once placed, drag the block or its bottom edge, or focus it and use ↑ ↓ and + −. The constants and the rounding are the app’s; the strip is clamped to the four hours it shows.' },
          { p: 'The test does the same with a synthetic pointer: press on the chip, move to y = 640, let go. 640 ÷ 64 is 10, so the task starts at exactly 10:00, and the check reads the hour and minute back from the model.^[tests/timeline.test.mjs:124-137.] In the figure your pointer is at y = {{rawy|640}} px, which snaps to {{snapat|10:00}}.' },
          { h: '✓ dragging the handle changes the duration, not the start' },
          { p: 'Next the test drags the block down two hours, to 12:00, and pulls its bottom edge down 64 pixels. Resizing rounds the length the same way: `max(15, round((30 + 60) / 15) × 15)`, which is 90 minutes. The 15 in front means no block can be shorter than a quarter-hour, or 16 pixels.^[timeline.js:380-383; tests/timeline.test.mjs:148-177.]' },
          { p: 'So our task now reads 12:00, 90 minutes. Two checks later the test leans on that.' }
        ] },

      { id: 'tap', label: '✓ tapping a chip places it without a drag', title: 'Or just tap',
        blocks: [
          { p: 'Dragging one-handed down a long day is fiddly, so a tap on a chip runs a sweep instead. It starts at the current time if you’re looking at today, or at 08:00 on any other day. It sorts everything already in that day, Habita’s blocks and the phone’s own events, and walks through them in order.^[timeline.js:435-458.]' },
          { code: 'for (const span of busy) {\n  if (candidate + length <= span.start) break;\n  if (candidate < span.end) candidate = app.snapTime(span.end);\n}\n// If the day is genuinely full, land at the end rather than refusing.\nif (candidate + length > end) candidate = end - length;', lang: 'javascript', caption: 'The sweep, verbatim from src/features/timeline/timeline.js:450-455.' },
          { p: 'In the test the second task, *Plan next quarter*, is tapped while ours sits at 12:00 for 90 minutes, and the next check confirms they don’t overlap.^[tests/timeline.test.mjs:179-197.] The figure below runs the same loop on an invented morning with two meetings from the phone’s calendar.' },
          { scrolly: 'sweep', caption: 'The two meetings are invented; the loop and `snapTime` are the app’s. Change where the review ends and how the sweep rounds, or press Play.', steps: [
            { p: 'The day as the sweep sees it: a stand-up and a design review from the phone’s calendar (hatched), and our incident report at 12:00 (solid). *Plan next quarter* needs 30 minutes.', state: { upto: 0, mode: 'round' } },
            { p: 'It isn’t today, so the candidate starts at 08:00. The first span is the stand-up, 08:00 to 08:30. The candidate doesn’t finish before it starts and sits inside it, so it jumps to `snapTime(08:30)`.', state: { upto: 1, mode: 'round' } },
            { p: 'The design review runs 08:45 to 10:50. 08:30 plus 30 minutes is 09:00, past 08:45, so it jumps again, to `snapTime(10:50)`. The nearest quarter is **10:45**.', state: { upto: 2, mode: 'round' } },
            { p: 'The next span is our task at 12:00. 10:45 plus 30 is 11:15, which ends before 12:00, so the loop breaks and the task lands at 10:45: five minutes inside the design review.', state: { upto: 3, mode: 'round' } },
            { p: 'With `Math.ceil` instead of `Math.round`, the jump goes to 11:00 and nothing overlaps. That one word is on the list at the end.', state: { upto: 3, mode: 'ceil' } }
          ] },
          { p: 'Move the review’s end in the figure. With it at {{revend|10:50}}, the task lands at {{landed|10:45}}, {{overlap|5 minutes inside the meeting}}. The test’s check still passes, and fairly: the test has no phone events, and its own block ends on a quarter. Rounding only bites when someone else’s meeting ends off the grid.' },
          { p: 'The same rounding has two more edges. On today, “now” can round back as much as 7½ minutes into the past. And if the day is full, the task lands at the very end, on top of whatever is there, instead of being refused. That one I chose on purpose: a tap that silently does nothing felt worse.',
            notes: [['I chose on purpose', 'a tap should always do something you can see']] }
        ] },

      { id: 'overlap', label: '✓ overlapping blocks are laid out side by side', title: 'Double-book it',
        blocks: [
          { p: 'Habita doesn’t stop you double-booking. It makes sure you can see it. The test schedules *Reply to the vendor* a quarter-hour into our task, for an hour, and checks that both blocks are now exactly 50% wide.^[tests/timeline.test.mjs:199-212.]' },
          { p: '`assignColumns` does it in one pass. Blocks are sorted by start. A block that starts at or after the latest end seen so far closes the current [[cluster|cluster]]. Inside a cluster, each block takes the first column whose last block has already finished, or opens a new one. When a cluster closes, every block in it gets the same width: 100% divided by its number of columns.^[timeline.js:182-218; left = column/of × 100% and width = 100/of % at :147-148.]' },
          { widget: 'pack', caption: 'Drag a block up or down, or focus it and use ↑ ↓ (move 15 minutes) and + − (resize). The layout is re-run with the app’s `assignColumns` on every change. Half scale: 32 px per hour.' },
          { p: 'Two things fall out of that rule. Blocks that only touch, one ending at 13:30 as the next begins, are not in the same cluster, so each keeps the full width. And try *The long meeting*: one long block beside two short ones in a row makes three blocks in two columns, because the second short one reuses the column the first one freed. The live [[columnEnds|cols]] under the lane show the reuse.' },
          { p: 'It’s the same arrangement a calendar app’s day view uses, which is the point. A block should look in Habita roughly the way it will look over there.' }
        ] },

      { id: 'land', label: '✓ browser build reports no native calendar', title: 'Watch it land somewhere else',
        art: function (c) {
          return '<rect x="14" y="24" width="56" height="72" fill="none" stroke="' + c.l + '" stroke-width="1.5"/>' +
            '<rect x="22" y="44" width="40" height="22" fill="' + c.a + '"/>' +
            '<path d="M76 55H90" stroke="' + c.i + '" stroke-width="1.4" stroke-dasharray="3 3"/>' +
            '<rect x="96" y="24" width="52" height="72" fill="none" stroke="' + c.i + '" stroke-width="1.5"/>' +
            '<path d="M102 38H142M102 50H142M102 62H130" stroke="' + c.l + '" stroke-width="1.2"/>' +
            '<rect x="102" y="72" width="24" height="10" fill="' + c.m + '"/>';
        },
        blocks: [
          { p: 'This is the check I find funniest. The only test that touches the calendar asserts that there isn’t one. The file says so in its header: *The native calendar is not exercised here -- there is no CalendarContract in a browser*.^[tests/timeline.test.mjs:10-12 and :100-103.] So everything in this chapter is code I can read and explain, not something a test watched happen.' },
          { p: 'Here is what the code does. Every change to a block is saved locally first, then `syncToCalendar` is called without waiting for it. Dragging stays instant; the calendar catches up when it can.^[tasks.js:143-172.] `saveTaskEvent` quietly gives up unless sync is on, the app is native, permission is granted, a calendar is chosen and the task has a start.^[calendar.js:137-139.] If the task already has an `eventId`, it calls `updateEvent`. If that comes back `updated: false`, the row is gone, so it calls `createEvent` and keeps the new id.^[calendar.js:151-159.]',
            notes: [['without waiting for it', 'a failed write leaves eventId null, and the next save retries']] },
          { p: 'On the Java side, a hand-written Capacitor plugin writes [[the row|row]] through Android’s `CalendarContract`: title, start, end, time zone, no alarm, and a description ending in [[the marker|marker]] `[habita:<taskId>]`.^[CalendarPlugin.java:291-345; HAS_ALARM = 0 at :315; the marker at :50 and :539-557.] When the day view reads the calendar back, any event carrying that marker is dropped, so a block is never drawn twice.^[listEvents marks isHabita (CalendarPlugin.java); calendar.js:124 filters it out.]' },
          { widget: 'land', size: 'wide', caption: 'A simulation of the native path, built from calendar.js, tasks.js and CalendarPlugin.java. Left: our block in Habita. Right: the event row the plugin would write, and the log of bridge calls. The _ID and task-id values are made up by this figure, and the colour key depends on the account’s palette, so no value is shown for it.' },
          { p: 'The buttons on the right act from the other side. **Delete it in Google Calendar**, then move the block: the update finds no row, so a new event is created with a new id. That’s the recovery the code comment promises, and it works as written.^[calendar.js:154-157.] Watch [[the log|log]] while you do it.' },
          { p: 'Now **Rename it in Google Calendar** and move the block. The rename is gone. The plugin can do partial updates, but the JavaScript always sends the whole payload: title, description, colour. So my README’s line that a description you edited survives is true of the plugin and false of the app.^[calendar.js:141-153; CalendarPlugin.java:369-382.]',
            notes: [['true of the plugin and false of the app', 'my README, my mistake']] },
          { p: '**Pause sync**, move the block, then resume. The row stays stale: resuming flips a setting and sends nothing, and the full re-send only runs once, right after permission is granted.^[timeline.js:557-571; tasks.js:206-210.] Pausing doesn’t stop deletes either. Unschedule while paused and the event is removed anyway, because `removeTaskEvent` checks permission but not sync.^[calendar.js:166-175.] And **Tick it off** leaves the event where it is: a finished task still holds its slot.^[tasks.js:94-100.]' },
          { p: '**Deny permission** shows the worst case. Unschedule now and the delete is skipped, but the task still forgets its `eventId`, so the event is orphaned in the calendar for good.^[tasks.js:175-184 with calendar.js:169.]' },
          { p: 'The colour has a catch too. The event is tinted to the nearest colour the calendar allows, not to the quadrant’s colour. Accounts publish a small palette of event colours, and the plugin picks the slot with the smallest squared RGB distance, which its own comment calls “crude, but enough”.^[CalendarPlugin.java:429-514; the comment at :508.] Two quadrants can land on the same slot. I haven’t read a real account’s palette off a phone, so I won’t guess which.' },
          { p: 'The browser demo has none of this. Its Day view says so in its own status line: *Browser preview — device calendar unavailable*.^[timeline.js:252-254.]' },
          { live: true }
        ] },

      { id: 'unproven', label: '? no check covers this', title: 'The fix I can’t prove',
        blocks: [
          { p: 'On 25 August I changed how the event is inserted. Before, it went in as an ordinary app write. After, it goes through a sync-adapter URI that names the calendar’s account.^[commit c215520, 25 August 2026.] I did it because I believed the rows were never leaving the phone.' },
          { code: '// Attribute the event to the calendar\'s own account so the sync adapter\n// (Google, Exchange, …) uploads it instead of leaving an unsynced local\n// row. Account name/type are provider-only columns: the ONLY legal way to\n// set them is as query params on a sync-adapter URI. We do NOT set a\n// _SYNC_ID, so the row is still born DIRTY and Google uploads it normally.\nUri insertUri = CalendarContract.Events.CONTENT_URI;\nString[] account = accountForCalendar(calendarId);\nif (account != null) {\n    insertUri = CalendarContract.Events.CONTENT_URI.buildUpon()\n        .appendQueryParameter(CalendarContract.CALLER_IS_SYNCADAPTER, "true")\n        .appendQueryParameter(CalendarContract.Events.ACCOUNT_NAME, account[0])\n        .appendQueryParameter(CalendarContract.Events.ACCOUNT_TYPE, account[1])\n        .build();\n}', lang: 'java', caption: 'android/app/src/main/java/com/habita/app/CalendarPlugin.java:319-332, inside createEvent.' },
          { p: 'Read the last sentence of that comment: the row is still born DIRTY and Google uploads it normally. DIRTY is the flag that tells a sync adapter a row has local changes to upload. But Android’s open-source calendar provider only sets it when the caller is *not* a sync adapter.^[AOSP CalendarProvider2.java, insertInTransaction, case EVENTS: DIRTY = 1 is set only `if (!callerIsSyncAdapter)`.] With `CALLER_IS_SYNCADAPTER=true`, the provider assumes it is talking to the sync adapter itself, and leaves the flag alone.',
            notes: [['the row is still born DIRTY', 'I wrote this comment. I now think it’s wrong.']] },
          { callout: 'Either the comment is wrong and these inserts never upload, or something else marks them, or the provider on a real phone behaves differently from AOSP’s. I have no device capture either way: no screenshot of a Habita event in Google Calendar, and no released APK anyone could test with.\n\nThe test is small. Insert from a phone, read the row’s `DIRTY` and `_SYNC_ID` back, and look for the event on the web. Until then this is a question with line numbers, not a fix.', label: 'Open question' }
        ] },

      { id: 'reload', label: '✓ state survives a reload', title: 'Where the test lets go',
        blocks: [
          { p: 'After the overlap check the test presses the unschedule button on our block. `start` goes back to null, the chip returns to the tray, and our task leaves the story.^[tests/timeline.test.mjs:215-221.] The checks after that tick off a different block, nudge another with the arrow keys, and reload the saved model.' },
          { p: 'The last real check is about old saves. Tasks saved before the timeline existed had no `start`, `duration` or `eventId`. On load every task is coerced into the current shape, and numeric ids become strings.^[storage.js:26-41; tests/timeline.test.mjs:250-261.]' },
          { code: 'start: Number.isFinite(start) && start > 0 ? start : null,\nduration: Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_DURATION,\neventId: typeof raw.eventId === \'string\' ? raw.eventId : null,', lang: 'javascript', caption: 'Three of the fields normalizeTask fills in, src/core/storage.js:35-39.' },
          { p: 'That covers a save with missing fields. It doesn’t cover a save that won’t parse. Then the app logs a warning, starts with an empty model, and the next save writes over the old data.^[storage.js:56-64.] There’s no schema version either. I used to say an old save can never crash a newer build. That’s true, but partly because a broken save is thrown away.',
            notes: [['a broken save is thrown away', 'not crashing and not losing data are different promises']] }
        ] }
    ],

    closing: { blocks: [
      { p: 'In order of how much each one bothers me:' },
      { list: [
        '**Fix the axes.** The pressed state labels the top row urgent, but the top-right box is Goals, important and not urgent. It’s a swap of two pairs of words in styles.css:335-362, and it’s wrong on every press.',
        '**Prove the insert, then ship an APK.** There are no releases on GitHub.^[GitHub releases API for akshayaa-403/Habita returned an empty list.] The first one should come with a capture of an event arriving in Google Calendar, and the DIRTY question answered.',
        '**Round up, not to the nearest.** `Math.ceil` on the way out of a busy span turns a 10:50 meeting into an 11:00 start, and “now” would never round into the past.',
        '**Send only what changed.** The plugin already accepts partial updates. A move should send start and end, not overwrite a title someone edited in another app.',
        '**Re-sync on resume, and don’t orphan events.** Resuming should re-send blocks moved while paused, and an unschedule without permission should keep the `eventId` until the delete has really happened.',
        '**Decide what done means in the calendar.** Ticking a task off leaves its event in place. That might be right, a record of time spent, but it should be a decision, not a side effect.',
        '**Read my own events back.** The day view hides Habita’s events entirely, so a block moved in Google Calendar never moves in Habita. The marker is already there to match them up.',
        '**Version the save.** A save that won’t parse should be set aside, not overwritten.'
      ] }
    ] },

    sources: [
      ['Test run', '`node tests/timeline.test.mjs` in the Habita repo at 4bc5591, re-run 18 October 2026: 18/18 checks passed. Check names and the three sample tasks are from tests/timeline.test.mjs:95-273.'],
      ['64 px per hour, 1,536 px day, 16 px quarter', 'PX_PER_HOUR in src/features/timeline/timeline.js:11; grid height :74.'],
      ['15-minute snap, nearest not up', 'SNAP_MINUTES and snapTime in src/features/tasks/tasks.js:16, :130-133.'],
      ['30-minute default', 'DEFAULT_DURATION in src/core/storage.js:10.'],
      ['6 px drag threshold', 'DRAG_THRESHOLD in timeline.js:15, tested per axis at :356.'],
      ['8 px threshold, 34 px gap, 0.94 scale', 'src/features/shared/ui.js:326; src/styles/styles.css:303-306.'],
      ['Resize rule, minimum 15 minutes', 'timeline.js:380-383; tasks.js:167.'],
      ['10:50 → 10:45, 5-minute overlap, 7½ minutes into the past', 'Computed from snapTime (Math.round to 900,000 ms) and the sweep at timeline.js:435-458.'],
      ['50% widths', 'assignColumns, timeline.js:182-218; test at tests/timeline.test.mjs:199-212.'],
      ['Dates', 'git log in the Habita repo: 3105c56 (19 Apr 2026), a3ca719 (20 Apr), 918d772 (27 May), 2c50f1b (15 Jun), b1724c3 (12 Aug: +516 lines CalendarPlugin.java, +641 timeline.js), c215520 (25 Aug), 4bc5591 (14 Oct).'],
      ['Sync behaviour', 'src/core/calendar.js:120-175; tasks.js:94-210; timeline.js:557-571; CalendarPlugin.java:291-425, :429-514, :539-566.'],
      ['DIRTY rule', '[AOSP CalendarProvider2.java](https://android.googlesource.com/platform/packages/providers/CalendarProvider/+/refs/heads/main/src/com/android/providers/calendar/CalendarProvider2.java), insertInTransaction, case EVENTS.'],
      ['No releases', 'https://api.github.com/repos/akshayaa-403/Habita/releases returned [] (checked October 2026).']
    ],

    widgets: {
      /* ---------- the rail: the task card ---------- */
      card: function (host, kit) {
        host.classList.add('hb-card');
        var check = kit.el('p', { class: 'hb-card__check' });
        var dl = kit.el('dl', { class: 'hb-card__dl' });
        var rows = {};
        ['title', 'quadrant', 'start', 'duration', 'eventId', 'synced'].forEach(function (k) {
          var dd = kit.el('dd');
          dl.appendChild(kit.el('div', null, kit.el('dt', { text: k }), dd));
          rows[k] = dd;
        });
        host.appendChild(kit.el('p', { class: 'hb-card__k', text: 'The task, as the model holds it' }));
        host.appendChild(check);
        host.appendChild(dl);
        var last = {};
        function set(k, v) {
          if (last[k] !== v && last[k] != null && !kit.reduced) {
            rows[k].classList.remove('is-new'); void rows[k].offsetWidth; rows[k].classList.add('is-new');
          }
          last[k] = v; rows[k].textContent = v;
        }
        function paint() {
          check.textContent = TASK.check;
          set('title', '"' + TASK.title + '"');
          var q = Q[TASK.quadrant];
          set('quadrant', q ? q.g + ' ' + TASK.quadrant + ' · ' + q.name : '—');
          set('start', TASK.start == null ? 'null' : hhmm(TASK.start));
          set('duration', TASK.duration + ' min');
          set('eventId', TASK.eventId == null ? 'null' : '"' + TASK.eventId + '"');
          set('synced', TASK.synced);
        }
        onTask(paint);
        paint();
        kit.onChapter(function (ch) {
          var s = SNAP[ch];
          if (!s) return;
          if (touched[ch]) { setTask({ check: s.check }); return; }
          setTask(s);
        });
      },

      /* ---------- the matrix and its seams ---------- */
      axes: function (host, kit) {
        tile(host, kit);
        var LABELS = {
          shipped: ['Urgent', 'Not urgent', 'Important', 'Not important'],
          named: ['Important', 'Not important', 'Urgent', 'Not urgent']
        };
        var grid = kit.el('div', { class: 'hb-mx' });
        var tiles = {};
        [1, 2, 3, 4].forEach(function (n) {
          var q = Q[n];
          var b = kit.el('button', { type: 'button', class: 'hb-mx__q', 'data-q': n, 'aria-pressed': 'false',
            'aria-label': q.name + ' — ' + q.sub, on: { click: function () { choose(n); } } },
            kit.el('span', { class: 'hb-mx__sw', style: { background: q.hex }, 'aria-hidden': 'true' }),
            kit.el('span', { class: 'hb-mx__name', text: q.g + ' ' + q.name }),
            kit.el('span', { class: 'hb-mx__sub', text: q.sub }));
          tiles[n] = b; grid.appendChild(b);
        });
        var ax = ['top', 'bottom', 'left', 'right'].map(function (p) {
          var s = kit.el('span', { class: 'hb-mx__ax hb-mx__ax--' + p, 'aria-hidden': 'true' });
          grid.appendChild(s); return s;
        });
        var plus = kit.el('button', { type: 'button', class: 'hb-mx__plus', 'aria-pressed': 'false',
          'aria-label': 'Press to show the axis labels', text: '+' });
        grid.appendChild(plus);
        var out = kit.readout('quadrantAtPoint', '—', 'k-readout--accent');
        var mode = 'shipped';
        var sw = kit.choice({ label: 'Labels', value: 'shipped', options: [
          { value: 'shipped', label: 'as shipped' }, { value: 'named', label: 'as named' }],
          onChange: function (v) { mode = v; labels(); } });
        host.appendChild(kit.el('div', { class: 'k-row' }, sw.el, out.el));
        host.appendChild(grid);
        var seamText = kit.el('p', { class: 'hb-note' });
        host.appendChild(seamText);
        function labels() {
          LABELS[mode].forEach(function (t, i) { ax[i].textContent = t; });
          seamText.textContent = 'Seams: top “' + LABELS[mode][0] + '”, left “' + LABELS[mode][2] + '”. ' +
            (mode === 'shipped' ? 'That makes Goals (top right) read as urgent, not important.' : 'Now every box sits under its own name.');
        }
        labels();
        function pressing(on) { grid.classList.toggle('is-pressing', on); plus.setAttribute('aria-pressed', String(on)); }
        function choose(n) {
          Object.keys(tiles).forEach(function (k) { tiles[k].setAttribute('aria-pressed', String(Number(k) === n)); });
          out.set(n + ' · ' + Q[n].name);
          setTask({ quadrant: n }, 'place');
          kit.announce('Filed under ' + Q[n].name);
        }
        // ui.js:397-406, verbatim apart from the grid reference.
        function quadrantAtPoint(x, y) {
          var rect = grid.getBoundingClientRect();
          if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null;
          var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
          if (x < cx && y < cy) return 1;
          if (x >= cx && y < cy) return 2;
          if (x < cx && y >= cy) return 3;
          return 4;
        }
        var down = false, moved = false, sx = 0, sy = 0;
        plus.style.touchAction = 'none';
        plus.addEventListener('pointerdown', function (e) {
          if (e.button) return;
          e.preventDefault();
          down = true; moved = false; sx = e.clientX; sy = e.clientY;
          plus.setPointerCapture(e.pointerId);
          pressing(true);
        });
        plus.addEventListener('pointermove', function (e) {
          if (!down) return;
          var dx = e.clientX - sx, dy = e.clientY - sy;
          if (Math.abs(dx) > PLUS_THRESHOLD || Math.abs(dy) > PLUS_THRESHOLD) moved = true;
          plus.style.translate = dx + 'px ' + dy + 'px';
          if (moved) {
            grid.classList.add('is-dragging');
            var q = quadrantAtPoint(e.clientX, e.clientY);
            Object.keys(tiles).forEach(function (k) { tiles[k].classList.toggle('is-target', Number(k) === q); });
            out.set(q ? q + ' · ' + Q[q].name : 'null');
          }
        });
        function end(e, cancel) {
          if (!down) return;
          down = false;
          plus.style.translate = '';
          grid.classList.remove('is-dragging');
          Object.keys(tiles).forEach(function (k) { tiles[k].classList.remove('is-target'); });
          pressing(false);
          if (!cancel && moved) { var q = quadrantAtPoint(e.clientX, e.clientY); if (q) choose(q); }
          plus._skip = true;
        }
        plus.addEventListener('pointerup', function (e) { end(e); });
        plus.addEventListener('pointercancel', function (e) { end(e, true); });
        plus.addEventListener('click', function () {
          if (plus._skip) { plus._skip = false; return; }   // pointer already handled it
          pressing(plus.getAttribute('aria-pressed') !== 'true');
        });
      },

      /* ---------- the ruler: true scale ---------- */
      ruler: function (host, kit) {
        tile(host, kit);
        var TOP_H = 8, VIEW_H = 4, Y0 = TOP_H * PX_PER_HOUR;          // grid y of 08:00 = 512
        var strip = kit.el('div', { class: 'hb-ru__strip', style: { height: VIEW_H * PX_PER_HOUR + 'px' } });
        for (var y = 0; y <= VIEW_H * PX_PER_HOUR; y += 16) {
          var hour = y % PX_PER_HOUR === 0;
          strip.appendChild(kit.el('div', { class: 'hb-ru__line' + (hour ? ' is-hour' : ''), style: { top: y + 'px' } },
            hour ? kit.el('span', { text: pad(TOP_H + y / PX_PER_HOUR) + ':00' }) : null));
          if (y < VIEW_H * PX_PER_HOUR) strip.appendChild(kit.el('div', { class: 'hb-ru__mid', style: { top: (y + 8) + 'px' } }));
        }
        var ghost = kit.el('div', { class: 'hb-ru__ghost', 'aria-hidden': 'true' });
        var ptr = kit.el('div', { class: 'hb-ru__ptr', 'aria-hidden': 'true' });
        var block = kit.el('div', { class: 'hb-ru__block', tabindex: '0', role: 'button', hidden: true },
          kit.el('span', { class: 'hb-ru__bt' }), kit.el('div', { class: 'hb-ru__handle', 'aria-hidden': 'true' }));
        strip.appendChild(ghost); strip.appendChild(ptr); strip.appendChild(block);

        var chip = kit.el('button', { type: 'button', class: 'hb-chip', text: '● Write the incident report' });
        var dead = kit.el('div', { class: 'hb-ru__dead', 'aria-hidden': 'true', hidden: true });
        var rY = kit.readout('y in the grid', '640 px'), rM = kit.readout('minutes = y/64·60', '600'),
          rS = kit.readout('snapTime', '10:00', 'k-readout--accent'), rD = kit.readout('moved', '—');
        var slider = kit.slider({ label: 'Pointer y', min: Y0, max: Y0 + VIEW_H * PX_PER_HOUR, step: 1, value: 640,
          format: function (v) { return v + ' px'; }, onInput: function (v) { show(v); } });
        var dropBtn = kit.button('Drop it there', function () { place(snapTime(pixelsToMinutes(slider.value()) * M)); }, 'k-btn--primary');
        var info = kit.el('p', { class: 'hb-note', 'aria-live': 'polite' });
        host.appendChild(kit.el('div', { class: 'k-row' }, chip, info));
        host.appendChild(kit.el('div', { class: 'hb-ru' }, strip,
          kit.el('div', { class: 'hb-ru__side' }, rY.el, rM.el, rS.el, rD.el)));
        host.appendChild(kit.el('div', { class: 'k-row' }, slider.el, dropBtn));
        host.appendChild(dead);

        var dur = 30, start = null;
        function yOf(ms) { return ms / M / 60 * PX_PER_HOUR - Y0; }
        function show(gridY) {
          var mins = pixelsToMinutes(gridY), snapped = snapTime(mins * M);
          rY.set(Math.round(gridY) + ' px'); rM.set(kit.fmt(mins, 1)); rS.set(hhmm(snapped));
          ptr.style.top = (gridY - Y0) + 'px';
          ghost.style.top = yOf(snapped) + 'px';
          ghost.style.height = dur / 60 * PX_PER_HOUR + 'px';
          kit.live('rawy', String(Math.round(gridY))); kit.live('snapat', hhmm(snapped));
          return snapped;
        }
        function clampStart(ms) { return Math.min(Math.max(ms, TOP_H * H), (TOP_H + VIEW_H) * H - dur * M); }
        function paintBlock() {
          block.hidden = start == null;
          if (start == null) return;
          block.style.top = yOf(start) + 'px';
          block.style.height = Math.max(16, dur / 60 * PX_PER_HOUR) + 'px';
          var t = hhmm(start) + '–' + hhmm(start + dur * M) + ' · ' + dur + ' min';
          block.firstChild.textContent = t;
          block.setAttribute('aria-label', 'Write the incident report, ' + t + '. Arrow keys move, plus and minus resize.');
        }
        function place(ms, d) {
          if (d != null) dur = Math.max(SNAP_MINUTES, Math.round(d / SNAP_MINUTES) * SNAP_MINUTES);
          dur = Math.min(dur, VIEW_H * 60);
          start = clampStart(snapTime(ms));
          paintBlock();
          setTask({ quadrant: TASK.quadrant || 1, start: start, duration: dur }, 'drop');
          info.textContent = 'Scheduled at ' + hhmm(start) + ', ' + dur + ' min.';
        }
        show(640);

        // the chip: a press, then either a tap or a drag (timeline.js:350-411)
        chip.style.touchAction = 'none';
        var d = null;
        chip.addEventListener('pointerdown', function (e) {
          if (e.button) return;
          e.preventDefault();
          chip.setPointerCapture(e.pointerId);
          var hr = host.getBoundingClientRect();
          d = { sx: e.clientX, sy: e.clientY, moved: false };
          dead.hidden = false; dead.classList.remove('is-crossed');
          dead.style.left = (e.clientX - hr.left - DRAG_THRESHOLD) + 'px';
          dead.style.top = (e.clientY - hr.top - DRAG_THRESHOLD) + 'px';
          rD.set('0, 0 px');
        });
        chip.addEventListener('pointermove', function (e) {
          if (!d) return;
          var dx = e.clientX - d.sx, dy = e.clientY - d.sy;
          rD.set(Math.round(Math.abs(dx)) + ', ' + Math.round(Math.abs(dy)) + ' px');
          if (!d.moved && Math.abs(dy) < DRAG_THRESHOLD && Math.abs(dx) < DRAG_THRESHOLD) return;
          d.moved = true; dead.classList.add('is-crossed'); chip.classList.add('is-dragging');
          var r = strip.getBoundingClientRect();
          if (e.clientY >= r.top && e.clientY <= r.bottom) show(Y0 + e.clientY - r.top);
        });
        function chipUp(e, cancel) {
          if (!d) return;
          var r = strip.getBoundingClientRect(), dd = d; d = null;
          chip.classList.remove('is-dragging');
          setTimeout(function () { dead.hidden = true; }, kit.reduced ? 0 : 700);
          if (cancel) return;
          if (!dd.moved) { info.textContent = 'Under 6 px on both axes: a tap. In the app that runs the sweep (next chapter).'; return; }
          if (e.clientY >= r.top && e.clientY <= r.bottom) {
            place(show(Y0 + e.clientY - r.top));
            slider.set(Math.round(Y0 + e.clientY - r.top), true);
          } else info.textContent = 'Dropped outside the grid: nothing scheduled.';
        }
        chip.addEventListener('pointerup', function (e) { chipUp(e); });
        chip.addEventListener('pointercancel', function (e) { chipUp(e, true); });
        chip.addEventListener('click', function (e) { if (e.detail === 0) info.textContent = 'With a keyboard, use the slider and Drop it there.'; });

        // the block: move or resize (timeline.js:372-387)
        var b = null;
        block.style.touchAction = 'none';
        block.addEventListener('pointerdown', function (e) {
          if (e.button || start == null) return;
          block.setPointerCapture(e.pointerId);
          b = { sy: e.clientY, sx: e.clientX, kind: e.target.classList.contains('hb-ru__handle') ? 'resize' : 'move',
            os: start, od: dur, moved: false };
        });
        block.addEventListener('pointermove', function (e) {
          if (!b) return;
          var dy = e.clientY - b.sy, dx = e.clientX - b.sx;
          if (!b.moved && Math.abs(dy) < DRAG_THRESHOLD && Math.abs(dx) < DRAG_THRESHOLD) return;
          b.moved = true;
          var deltaMinutes = pixelsToMinutes(dy);
          if (b.kind === 'move') {
            start = clampStart(snapTime(b.os + deltaMinutes * MS_PER_MINUTE));
          } else {
            dur = Math.min(Math.max(SNAP_MINUTES, Math.round((b.od + deltaMinutes) / SNAP_MINUTES) * SNAP_MINUTES),
              (TOP_H + VIEW_H) * 60 - start / M);
            rD.set(dur + ' min');
          }
          paintBlock();
        });
        function blockUp() { if (b && b.moved) place(start, dur); b = null; }
        block.addEventListener('pointerup', blockUp);
        block.addEventListener('pointercancel', blockUp);
        block.addEventListener('keydown', function (e) {
          if (start == null) return;
          var step = SNAP_MINUTES * M;
          if (e.key === 'ArrowUp') place(start - step);
          else if (e.key === 'ArrowDown') place(start + step);
          else if (e.key === '+' || e.key === '=') place(start, dur + SNAP_MINUTES);
          else if (e.key === '-') place(start, dur - SNAP_MINUTES);
          else return;
          e.preventDefault();
        });
        kit.onKey(function (k) { host.setAttribute('data-hl', k || ''); if (k === 'threshold') { dead.hidden = !k; } else if (!d) dead.hidden = true; });
      },

      /* ---------- the sweep (scrolly) ---------- */
      sweep: function (host, kit) {
        tile(host, kit);
        var A = 8, B = 15, LEN = 30 * M, DAY_END = 24 * H;
        var revEnd = 10 * H + 50 * M, mode = 'round', upto = 0, playT = 0;
        function spans() {
          return [
            { label: 'Stand-up', kind: 'phone', start: 8 * H, end: 8 * H + 30 * M },
            { label: 'Design review', kind: 'phone', start: 8 * H + 45 * M, end: revEnd },
            { label: 'Write the incident report', kind: 'habita', start: 12 * H, end: 13 * H + 30 * M }
          ];
        }
        // timeline.js:439-455 with the start fixed at 08:00 (another day) and the trace recorded
        function sweep(snap) {
          var candidate = snap(8 * 60 * MS_PER_MINUTE), length = LEN, trace = [];
          var busy = spans().sort(function (a, b) { return a.start - b.start; });
          for (var i = 0; i < busy.length; i++) {
            var span = busy[i];
            if (candidate + length <= span.start) { trace.push({ span: span, at: candidate, v: 'fits' }); break; }
            if (candidate < span.end) { var to = snap(span.end); trace.push({ span: span, at: candidate, to: to, v: 'jump' }); candidate = to; }
            else trace.push({ span: span, at: candidate, v: 'past' });
          }
          if (candidate + length > DAY_END) candidate = DAY_END - length;
          return { candidate: candidate, trace: trace };
        }
        var lane = kit.el('div', { class: 'hb-sw__lane' });
        var ticks = kit.el('div', { class: 'hb-sw__ticks', 'aria-hidden': 'true' });
        function pct(ms) { return ((ms / H - A) / (B - A) * 100) + '%'; }
        for (var h = A; h <= B; h++) ticks.appendChild(kit.el('span', { style: { left: pct(h * H) }, text: pad(h) }));
        var spanEls = spans().map(function (s) {
          var e = kit.el('div', { class: 'hb-sw__span hb-sw__span--' + s.kind }, kit.el('span', { text: s.kind === 'phone' ? s.label : '● ' + s.label }));
          lane.appendChild(e); return e;
        });
        var cand = kit.el('div', { class: 'hb-sw__cand' }, kit.el('span', { text: 'Plan next quarter' }));
        var over = kit.el('div', { class: 'hb-sw__over', hidden: true });
        lane.appendChild(over); lane.appendChild(cand);
        var log = kit.el('ol', { class: 'hb-log hb-sw__log' });
        var play = kit.button('Play the sweep', function () { run(); }, 'k-btn--primary');
        var ch = kit.choice({ label: 'Snap', value: 'round', options: [{ value: 'round', label: 'round (ships)' }, { value: 'ceil', label: 'ceil' }],
          onChange: function (v) { mode = v; draw(); } });
        var sl = kit.slider({ label: 'Review ends', min: 600, max: 705, step: 5, value: 650,
          format: function (v) { return hhmm(v * M); }, onInput: function (v) { revEnd = v * M; draw(); } });
        host.appendChild(kit.el('div', { class: 'k-row' }, play, ch.el));
        host.appendChild(kit.el('div', { class: 'k-row' }, sl.el));
        host.appendChild(kit.el('div', { class: 'hb-sw' }, lane, ticks));
        host.appendChild(log);

        function draw() {
          var ss = spans();
          ss.forEach(function (s, i) {
            spanEls[i].style.left = pct(s.start);
            spanEls[i].style.width = 'calc(' + pct(s.end) + ' - ' + pct(s.start) + ')';
          });
          var res = sweep(mode === 'ceil' ? ceilTime : snapTime);
          var n = Math.min(upto, res.trace.length);
          var at = n === 0 ? res.trace[0] ? res.trace[0].at : res.candidate : (res.trace[n - 1].v === 'jump' ? res.trace[n - 1].to : res.trace[n - 1].at);
          var done = n >= res.trace.length;
          if (done) at = res.candidate;
          cand.style.left = pct(at);
          cand.style.width = 'calc(' + pct(at + LEN) + ' - ' + pct(at) + ')';
          cand.classList.toggle('is-landed', done);
          ss.forEach(function (s, i) { spanEls[i].classList.toggle('is-on', n > 0 && res.trace[n - 1] && res.trace[n - 1].span.label === s.label); });
          var rev = ss[1], ov = done ? Math.max(0, Math.min(at + LEN, rev.end) - Math.max(at, rev.start)) : 0;
          over.hidden = !ov;
          if (ov) { over.style.left = pct(Math.max(at, rev.start)); over.style.width = 'calc(' + pct(Math.max(at, rev.start) + ov) + ' - ' + pct(Math.max(at, rev.start)) + ')'; }
          log.textContent = '';
          log.appendChild(kit.el('li', { text: 'candidate = snap(08:00) = 08:00 · length 30 min' }));
          res.trace.slice(0, n).forEach(function (t) {
            var line = hhmm(t.at) + ' + 30 ≤ ' + hhmm(t.span.start) + ' (' + t.span.label + ')? ';
            if (t.v === 'fits') line += 'yes → break';
            else if (t.v === 'jump') line += 'no; ' + hhmm(t.at) + ' < ' + hhmm(t.span.end) + ' → ' + mode + '(' + hhmm(t.span.end) + ') = ' + hhmm(t.to);
            else line += 'no; already past it';
            log.appendChild(kit.el('li', { text: line }));
          });
          if (done) log.appendChild(kit.el('li', { class: 'is-end', text: 'lands at ' + hhmm(res.candidate) + (ov ? ' — ' + Math.round(ov / M) + ' min inside the review' : ' — no overlap') }));
          var full = sweep(mode === 'ceil' ? ceilTime : snapTime), fo = Math.max(0, Math.min(full.candidate + LEN, revEnd) - Math.max(full.candidate, ss[1].start));
          kit.live('revend', hhmm(revEnd)); kit.live('landed', hhmm(full.candidate));
          kit.live('overlap', fo ? Math.round(fo / M) + ' minutes inside the meeting' : 'clear of the meeting');
        }
        function run() {
          clearTimeout(playT);
          var total = sweep(mode === 'ceil' ? ceilTime : snapTime).trace.length;
          if (kit.reduced) { upto = total; draw(); return; }
          upto = 0; draw();
          (function next() { if (upto >= total) return; playT = setTimeout(function () { upto++; draw(); next(); }, 700); })();
        }
        draw();
        return { set: function (st) {
          clearTimeout(playT);
          if (st.mode && st.mode !== mode) { mode = st.mode; ch.set(mode, true); }
          upto = st.upto || 0; draw();
        } };
      },

      /* ---------- column packing ---------- */
      pack: function (host, kit) {
        tile(host, kit);
        var A = 11, B = 16, PX = 32;
        var PRESETS = {
          test: [
            { id: 'a', q: 1, text: 'Write the incident report', start: 12 * H, duration: 90 },
            { id: 'b', q: 3, text: 'Reply to the vendor', start: 12 * H + 15 * M, duration: 60 },
            { id: 'c', q: 2, text: 'Plan next quarter', start: 13 * H + 30 * M, duration: 30 }
          ],
          long: [
            { id: 'a', q: 1, text: 'Write the incident report', start: 12 * H, duration: 120 },
            { id: 'b', q: 2, text: 'Plan next quarter', start: 12 * H, duration: 45 },
            { id: 'c', q: 3, text: 'Reply to the vendor', start: 13 * H, duration: 45 }
          ]
        };
        var tasks;
        // timeline.js:182-218, verbatim; the `clusters` record is the figure's addition.
        function assignColumns(scheduled, clusters) {
          var sorted = scheduled.slice().sort(function (a, b) { return a.start - b.start; });
          var assignments = new Map();
          var cluster = [], clusterEnd = -Infinity, columnEnds = [];
          var flush = function () {
            if (cluster.length) clusters.push({ ids: cluster.slice(), of: columnEnds.length || 1, ends: columnEnds.slice(), end: clusterEnd });
            cluster.forEach(function (id) { assignments.get(id).of = columnEnds.length || 1; });
            cluster = []; columnEnds.length = 0; clusterEnd = -Infinity;
          };
          sorted.forEach(function (task) {
            var end = task.start + task.duration * MS_PER_MINUTE;
            if (task.start >= clusterEnd) flush();
            var column = columnEnds.findIndex(function (columnEnd) { return columnEnd <= task.start; });
            if (column === -1) { column = columnEnds.length; columnEnds.push(end); } else { columnEnds[column] = end; }
            assignments.set(task.id, { column: column, of: 1 });
            cluster.push(task.id);
            clusterEnd = Math.max(clusterEnd, end);
          });
          flush();
          return assignments;
        }
        var lane = kit.el('div', { class: 'hb-pk__lane', style: { height: (B - A) * PX + 'px' } });
        for (var h = A; h <= B; h++) lane.appendChild(kit.el('div', { class: 'hb-pk__hr', style: { top: (h - A) * PX + 'px' } }, kit.el('span', { text: pad(h) + ':00' })));
        var inner = kit.el('div', { class: 'hb-pk__inner' });
        var brk = kit.el('div', { class: 'hb-pk__brk', 'aria-hidden': 'true' });
        lane.appendChild(inner); lane.appendChild(brk);
        var table = kit.el('ol', { class: 'hb-log hb-pk__tab', 'aria-live': 'polite' });
        var pre = kit.choice({ label: 'Preset', value: 'test', options: [{ value: 'test', label: 'The test' }, { value: 'long', label: 'The long meeting' }],
          onChange: function (v) { load(v); } });
        host.appendChild(kit.el('div', { class: 'k-row' }, pre.el));
        host.appendChild(lane);
        host.appendChild(table);
        var els = {};
        function load(name) {
          tasks = PRESETS[name].map(function (t) { return Object.assign({}, t); });
          inner.textContent = ''; els = {};
          tasks.forEach(function (t) {
            var e = kit.el('div', { class: 'hb-pk__b', tabindex: '0', role: 'button', 'data-q': t.q },
              kit.el('i', { style: { background: Q[t.q].hex }, 'aria-hidden': 'true' }),
              kit.el('span', { class: 'hb-pk__t' }));
            inner.appendChild(e); els[t.id] = e; wire(e, t);
          });
          layout();
        }
        function clampT(t) { t.start = Math.min(Math.max(t.start, A * H), B * H - t.duration * M); }
        function wire(e, t) {
          var os = 0, sy = 0, moved = false;
          kit.drag(e, { axis: 'y',
            start: function (p, ev) { os = t.start; sy = ev.clientY; moved = false; },
            move: function (p, ev) {
              var dy = ev.clientY - sy;
              if (!moved && Math.abs(dy) < DRAG_THRESHOLD) return;
              moved = true;
              t.start = snapTime(os + dy / PX * H); clampT(t); layout();
            } });
          e.addEventListener('keydown', function (ev) {
            if (ev.key === 'ArrowUp') t.start -= 15 * M;
            else if (ev.key === 'ArrowDown') t.start += 15 * M;
            else if (ev.key === '+' || ev.key === '=') t.duration += 15;
            else if (ev.key === '-') t.duration = Math.max(15, t.duration - 15);
            else return;
            ev.preventDefault(); t.duration = Math.min(t.duration, (B - A) * 60); clampT(t); layout();
          });
        }
        function layout() {
          var clusters = [];
          var cols = assignColumns(tasks, clusters);
          tasks.forEach(function (t) {
            var c = cols.get(t.id), e = els[t.id];
            e.style.top = ((t.start / H - A) * PX) + 'px';
            e.style.height = (t.duration / 60 * PX) + 'px';
            e.style.left = (c.column / c.of * 100) + '%';
            e.style.width = (100 / c.of) + '%';
            var label = t.text + ' · ' + hhmm(t.start) + '–' + hhmm(t.start + t.duration * M) + ' · ' + (100 / c.of) + '%';
            e.lastChild.textContent = Q[t.q].g + ' ' + label;
            e.setAttribute('aria-label', label + '. Arrow keys move, plus and minus resize.');
            if (t.id === 'a' && live) setTask({ start: t.start, duration: t.duration });
          });
          brk.textContent = '';
          table.textContent = '';
          clusters.forEach(function (c, i) {
            var first = Math.min.apply(null, c.ids.map(function (id) { return tasks.filter(function (t) { return t.id === id; })[0].start; }));
            brk.appendChild(kit.el('span', { style: { top: ((first / H - A) * PX) + 'px', height: ((c.end - first) / H * PX) + 'px' }, text: 'c' + (i + 1) }));
            table.appendChild(kit.el('li', { text: 'cluster ' + (i + 1) + ': ' + c.ids.length + ' block' + (c.ids.length > 1 ? 's' : '') +
              ', of = ' + c.of + ' · columnEnds [' + c.ends.map(hhmm).join(', ') + ']' }));
          });
        }
        var live = false;
        load('test');
        kit.onChapter(function (c) { live = c === 'overlap'; if (live) layout(); });
        kit.onKey(function (k) { host.setAttribute('data-hl', k || ''); });
      },

      /* ---------- the signature: block and its shadow ---------- */
      land: function (host, kit) {
        tile(host, kit);
        host.classList.add('hb-ld');
        var A = 11, B = 15, PX = 32, nextId = 1, TASK_ID = '3f9c';
        var task = { text: 'Write the incident report', start: 12 * H, duration: 90, eventId: '1', completed: false };
        var settings = { syncEnabled: true, granted: true };
        var rows = { '1': { title: task.text, start: task.start, end: task.start + 90 * M } };
        nextId = 2;
        var pending = 0;

        // left: Habita
        var pill = kit.el('button', { type: 'button', class: 'hb-pill' });
        var lane = kit.el('div', { class: 'hb-ld__lane', style: { height: (B - A) * PX + 'px' } });
        for (var h = A; h <= B; h++) lane.appendChild(kit.el('div', { class: 'hb-pk__hr', style: { top: (h - A) * PX + 'px' } }, kit.el('span', { text: pad(h) + ':00' })));
        var blk = kit.el('div', { class: 'hb-ld__b', tabindex: '0', role: 'button' }, kit.el('i', { style: { background: Q[1].hex }, 'aria-hidden': 'true' }), kit.el('span'));
        lane.appendChild(blk);
        var bMove = kit.button('Move +15 min', function () { schedule(task.start + 15 * M); });
        var bUns = kit.button('Unschedule', function () { if (task.start == null) schedule(12 * H); else unschedule(); });
        var bTick = kit.button('Tick it off', function () {
          task.completed = !task.completed;
          say('toggleTask: completed = ' + task.completed + '. Saved locally; no calendar call, the event stays.');
          paint();
        });
        var bRen = kit.button('Rename in Habita', function () {
          task.text = task.text === 'Write the incident report' ? 'Write the incident report (v2)' : 'Write the incident report';
          say('updateTaskText → ' + (task.start && task.eventId ? 'syncToCalendar' : 'no event to update'));
          if (task.start && task.eventId) sync();
          paint();
        });
        var left = kit.el('section', { class: 'hb-ld__pane', 'aria-label': 'Habita' },
          kit.el('p', { class: 'hb-ld__h', text: 'Habita · Day' }), pill, lane,
          kit.el('div', { class: 'k-row' }, bMove, bUns, bTick, bRen));

        // right: the provider
        var table = kit.el('dl', { class: 'hb-row' });
        var log = kit.el('ol', { class: 'hb-log hb-ld__log' });
        var bDel = kit.button('Delete it in Google Calendar', function () {
          if (!rows[task.eventId]) return say('(no row to delete)');
          delete rows[task.eventId]; say('✕ deleted in Google Calendar. Habita doesn’t know yet.'); paint();
        });
        var bGRen = kit.button('Rename it in Google Calendar', function () {
          var r = rows[task.eventId]; if (!r) return say('(no row to rename)');
          r.title = 'Incident report — Friday?'; r.edited = true; say('✎ TITLE edited in Google Calendar.'); paint();
        });
        var bPause = kit.el('button', { type: 'button', class: 'k-btn', 'aria-pressed': 'false', text: 'Pause sync',
          on: { click: function () {
            settings.syncEnabled = !settings.syncEnabled;
            say('setCalendarSyncEnabled(' + settings.syncEnabled + ')' + (settings.syncEnabled ? ' — nothing is re-sent' : ''));
            paint();
          } } });
        var bDeny = kit.el('button', { type: 'button', class: 'k-btn', 'aria-pressed': 'false', text: 'Deny permission',
          on: { click: function () {
            settings.granted = !settings.granted;
            say(settings.granted ? 'permission granted → syncAllToCalendar (tasks with a start and no eventId)' : 'READ/WRITE_CALENDAR revoked');
            if (settings.granted && task.start && !task.eventId) sync();
            paint();
          } } });
        var right = kit.el('section', { class: 'hb-ld__pane', 'aria-label': 'Phone calendar' },
          kit.el('p', { class: 'hb-ld__h', text: 'CalendarContract.Events (simulated)' }), table,
          kit.el('div', { class: 'k-row' }, bDel, bGRen, bPause, bDeny),
          kit.el('p', { class: 'hb-ld__h', text: 'Bridge log' }), log);
        host.appendChild(kit.el('div', { class: 'hb-ld__grid' }, left, right));

        pill.addEventListener('click', function () {
          if (!settings.granted) { bDeny.click(); return; }
          bPause.click();
        });

        function say(t, cls) {
          log.appendChild(kit.el('li', { text: t, class: cls || null }));
          while (log.children.length > 9) log.removeChild(log.firstChild);
          log.scrollTop = log.scrollHeight;
          kit.announce(t);
        }
        function later(fn) { pending++; paint(); setTimeout(function () { pending--; fn(); paint(); }, kit.reduced ? 0 : 520); }

        // calendar.js:137-164
        function sync() {
          if (!settings.syncEnabled) return say('saveTaskEvent → null: sync is off (calendar.js:138)');
          if (!settings.granted) return say('saveTaskEvent → null: no permission (calendar.js:138)');
          if (!task.start) return;
          var payload = '{title, start: ' + hhmm(task.start) + ', end: ' + hhmm(task.start + task.duration * M) + ', color, taskId, description}';
          var create = function () {
            say('→ createEvent ' + payload);
            later(function () {
              var id = String(nextId++);
              rows[id] = { title: task.text, start: task.start, end: task.start + task.duration * M };
              say('← { eventId: "' + id + '" }');
              task.eventId = id;
            });
          };
          if (task.eventId) {
            say('→ updateEvent ' + payload);
            later(function () {
              var r = rows[task.eventId];
              if (r) {
                if (r.edited && r.title !== task.text) say('TITLE overwritten: the payload always carries the title', 'is-warn');
                r.title = task.text; r.start = task.start; r.end = task.start + task.duration * M; r.edited = false;
                say('← { updated: true }');
              } else { say('← { updated: false } — the row is gone, so:', 'is-warn'); create(); }
            });
          } else create();
        }
        function schedule(ms, dur) {
          task.start = Math.min(Math.max(snapTime(ms), A * H), B * H - task.duration * M);
          if (dur != null) task.duration = dur;
          say('scheduleTask: saved locally at ' + hhmm(task.start));
          sync(); paint();
        }
        // tasks.js:175-184 + calendar.js:166-175
        function unschedule() {
          if (task.eventId) {
            if (!settings.granted) say('removeTaskEvent → returns early: no permission. The event is orphaned.', 'is-warn');
            else {
              var id = task.eventId;
              say('→ deleteEvent { eventId: "' + id + '" }' + (settings.syncEnabled ? '' : ' (even though sync is paused)'));
              later(function () { var had = !!rows[id]; delete rows[id]; say('← { deleted: ' + had + ' }'); });
            }
          }
          task.start = null; task.eventId = null;
          say('unscheduleTask: start = null, eventId = null');
          paint();
        }
        function status() {
          if (pending) return 'pending…';
          if (!task.start) return Object.keys(rows).length ? 'no block; ' + Object.keys(rows).length + ' event left in the calendar' : 'unscheduled';
          var r = rows[task.eventId];
          if (!task.eventId) return 'no event';
          if (!r) return 'row deleted elsewhere';
          return r.title === task.text && r.start === task.start && r.end === task.start + task.duration * M ? 'in step' : 'stale';
        }
        function paint() {
          pill.textContent = !settings.granted ? 'Calendar access not granted — tap to connect'
            : !settings.syncEnabled ? 'Calendar sync paused' : 'Syncing to your calendar';
          pill.className = 'hb-pill ' + (!settings.granted ? 'is-warn' : settings.syncEnabled ? 'is-ok' : '');
          bPause.setAttribute('aria-pressed', String(!settings.syncEnabled));
          bDeny.setAttribute('aria-pressed', String(!settings.granted));
          bUns.textContent = task.start == null ? 'Schedule at 12:00' : 'Unschedule';
          blk.hidden = task.start == null;
          if (task.start != null) {
            blk.style.top = ((task.start / H - A) * PX) + 'px';
            blk.style.height = (task.duration / 60 * PX) + 'px';
            var t = task.text + ' · ' + hhmm(task.start) + '–' + hhmm(task.start + task.duration * M);
            blk.lastChild.textContent = (task.completed ? '✓ ' : '● ') + t;
            blk.classList.toggle('is-done', task.completed);
            blk.setAttribute('aria-label', t + '. Arrow keys move it 15 minutes.');
          }
          table.textContent = '';
          var r = rows[task.eventId];
          var shown = r ? task.eventId : Object.keys(rows)[0];
          var row = rows[shown];
          var st = status();
          if (!row) table.appendChild(kit.el('p', { class: 'hb-row__none', text: 'no row' }));
          else [
            ['_ID', shown], ['TITLE', row.title], ['DTSTART', 'today ' + hhmm(row.start)], ['DTEND', 'today ' + hhmm(row.end)],
            ['EVENT_COLOR_KEY', 'nearest slot to #EE544F'], ['HAS_ALARM', '0'],
            ['DESCRIPTION', 'Focus - scheduled in Habita\\n\\n[habita:' + TASK_ID + ']']
          ].forEach(function (kv) {
            table.appendChild(kit.el('div', { class: 'hb-row__r' + (kv[0] === 'DESCRIPTION' ? ' is-marker' : ''),
              'data-stale': st === 'stale' && (kv[0] === 'TITLE' || kv[0].indexOf('DT') === 0) ? 'true' : null },
              kit.el('dt', { text: kv[0] }), kit.el('dd', { text: kv[1] })));
          });
          host.classList.toggle('is-pending', !!pending);
          if (live) setTask({ quadrant: 1, start: task.start, duration: task.duration, eventId: task.eventId, synced: st });
        }

        // drag and keys on the block
        var os = 0, sy = 0, moved = false;
        kit.drag(blk, { axis: 'y',
          start: function (p, ev) { os = task.start; sy = ev.clientY; moved = false; },
          move: function (p, ev) {
            var dy = ev.clientY - sy;
            if (!moved && Math.abs(dy) < DRAG_THRESHOLD) return;
            moved = true;
            blk.style.top = ((Math.min(Math.max(snapTime(os + dy / PX * H), A * H), B * H - task.duration * M) / H - A) * PX) + 'px';
          },
          end: function (p, ev) { if (moved) schedule(os + (ev.clientY - sy) / PX * H); } });
        blk.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowUp') schedule(task.start - 15 * M);
          else if (e.key === 'ArrowDown') schedule(task.start + 15 * M);
          else return;
          e.preventDefault();
        });
        kit.onKey(function (k) { host.setAttribute('data-hl', k || ''); });
        var live = false;
        kit.onChapter(function (c) { live = c === 'land'; if (live) paint(); });
        say('(our task, 12:00 for 90 min, already owns event _ID 1)');
        paint();
      }
    }
  });
})();
