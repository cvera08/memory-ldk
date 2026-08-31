# Memory LDK - build log

Short notes on the decisions worth remembering. Raw material for write-ups.

---

## 2026-08-23 — Day 1: from idea to a public URL

**The ask.** A memory / concentration card game for a six-and-a-half year old.
Purple and pink, princesses, flowers, bugs, fish, castles, dolls, blocks.
Something she actually wants to open again tomorrow.

**Decisions taken today**

1. **No framework, no build step.** The whole thing is `index.html` plus seven
   small scripts. It runs from GitHub Pages, from a local `http.server`, or by
   double-clicking the file. For a project that has to survive years of not being
   maintained, zero dependencies is the feature.

2. **The engine has no DOM.** `js/engine.js` is a pure state machine: it takes a
   pool of cards and a pair count, and returns events (`flipped`, `match`,
   `mismatch`). Everything visual lives in `ui.js`. That made it possible to
   auto-solve a board in Node and assert on win detection, star scoring and streaks
   before a single card was ever clicked in a browser.

3. **Content is data, not code.** Themes and board sizes live in one file,
   `js/content.js`. Adding a deck is appending an object. This is the difference
   between "a memory game" and "a memory game engine we can re-skin next month".

4. **Copy lives in one table.** Every user-facing string is in `js/i18n.js` behind a
   `t()` call, with a `lang` switch already in place. English ships first; Spanish is
   one object away. Retrofitting i18n later is expensive — doing it on day one is free.

**The design constraint that shaped everything**

The goal was not "a fun game". It was *a game that supports concentration instead of
competing with it*. Most kids' memory games are hostile to that: countdowns, layered
animations, interstitials, sound stacked on sound.

Concrete consequences in the code:

- Wrong pairs stay visible for **1100 ms**, not the usual ~600. It is long enough to
  actually encode two cards.
- Matched cards get a `is-gone` class after their celebration and visually recede,
  so the board simplifies as the game goes on. The difficulty curve is inverted on
  purpose: hardest at the first move, trivial at the last.
- Background decoration dims the moment a board opens (`body.playing`), and
  **Calm mode** removes it and the timer completely.
- There is no fail state. The timer is information, never a threat.
- `Peek` is limited to 3–4 uses. It is an escape hatch from frustration that still
  costs something, so it does not replace remembering.

**Why the reward loop matters more than the graphics**

Stars, a per-board best score and a sticker book that persists in `localStorage`.
Nothing is uploaded anywhere. The point is a visible record of "I did this before and
I got better", which is the part that brings a six-year-old back tomorrow.

**Shipped on day 1:** 7 themes, 4 board sizes, flip animation, WebAudio sound with no
audio files, emoji confetti, star scoring, sticker book, calm mode, keyboard support,
`prefers-reduced-motion`, mobile layout, public URL.

---

## 2026-08-27 — Week 1: the settings taught me more than the game did

Four changes this week, all of them triggered by one round of real feedback.

**1. "Sound" was doing two jobs.** A single speaker icon was reading as *music* to some
people and as *effects* to others. The fix was not a better icon, it was admitting there
were two features hiding behind one control: `🔊 Sound effects` and `🎵 Music`, separate
toggles, separately remembered. The lesson is old and I keep relearning it — when users
disagree about what a control does, the control is usually doing more than one thing.

**2. The music is generated, not a file.** A `.mp3` would have meant a download, a
licence, and a loop point a child would learn to hate by the fourth playthrough.
Instead it is about ninety lines of WebAudio: a random walk along a C major pentatonic
scale, one note a second, a third above it now and then, a root note under each bar.
Pentatonic means no two notes can clash, so a random walk cannot produce a wrong note.
Zero bytes, never repeats, works offline.

**3. Calm mode was correct and still felt broken.** It genuinely hid every animation on
every screen — I verified it. But the toggle lived only on the home screen, so once a
board was open there was no way to reach it and no sign it was on. A setting you cannot
see or change from where the problem is *is* a broken setting, whatever the code does.
Fixing it meant extracting the toggles into one component rendered into both screens,
sharing state, so they can never disagree. The board screen also now hides ambient
motion unconditionally, calm mode or not.

**4. Tests before features.** Eighteen assertions over the engine, no framework, no
`node_modules`: `node tests/engine.test.js`. Possible only because the engine never
touches the DOM. I checked the suite could fail by breaking a star threshold on purpose
and watching two tests go red — a test suite you have never seen fail is decoration.

**Also:** the favicon was a placeholder cherry emoji I never replaced. It is now a
hand-drawn SVG of two matching cards in the brand gradient, with a PNG touch icon
rasterised by a small Python script rather than a design tool.

---

## 2026-08-31 — Week 2: the first real playtest, and what measurement settled

The game went in front of the person it was built for. Three things came out of it.

**The 1100 ms pause is right.** This was the single number I was least sure about and
the one I could not reason my way to. Standard implementations flip a wrong pair back
in roughly 600 ms; I had gone to 1100 on the theory that a six year old needs longer to
actually encode two cards than an adult does. Verdict after a long session: long enough
to hold the two cards in mind, short enough that wanting to try the next pair never
turns into waiting for the game. Keeping it. Some numbers you can only get from a
person using the thing.

**The music was wrong, and the fix came from measuring, not from taste.** The first
version was a generated melody: one note a second on a pentatonic random walk. Charming
in isolation, grating within two minutes, and — this is the part I had not checked —
each note was landing at roughly the same loudness as a game sound effect. A pitch every
second, forever, as loud as the reward sound.

I replaced it with something with no melody at all: a brown-noise bed, heavily
low-passed so it reads as distant rain, with pad chords that take four and a half
seconds to arrive and six and a half to leave, one every eleven seconds. Nothing has a
beat. Nothing repeats on a period the ear can latch onto.

Then I measured both, by tapping the audio graph with an `AnalyserNode` and reading RMS:

| | peak RMS |
| --- | --- |
| old melody, per note | ~0.050 |
| new ambient bed | 0.009 |
| "match" sound effect | 0.038 |
| win jingle | 0.066 |

A quarter of a sound effect, five times quieter than what it replaced. The point is not
the numbers themselves — it is that "the music is too loud" became a thing with a target
instead of a thing with an opinion.

**A bug that only exists in the transition.** Calm mode hides the drifting background
with `display: none`, which resets a CSS animation. Turning it back on restarted all six
floaters at 0% of their cycle — which is above the viewport — so they arrived bunched
together six seconds later. Every static screenshot looked perfect; the defect lived
entirely in the moment between two states. The fix is a distinct negative
`animation-delay` per element, so each one begins partway through its own fall and the
sky is populated the instant it reappears: five of six on screen at 80 ms, instead of
zero of six for six seconds.

**Also this week:** help bubbles on every control, written to say what the button does
*and* what state it is in right now, shown on hover, on keyboard focus, and for a beat
after a tap — because a tap is the only moment you can tell a tablet user what just
happened. A two-step "Start over" so a child can reset her own scores without a parent
opening developer tools, which erases progress but deliberately keeps preferences. And
a real `favicon.ico` at three sizes, because the browser favicon cache ignores a hard
refresh and a 404 on `/favicon.ico` leaves it showing whatever it had before.

**Status:** the product is in an acceptable state. Everything from here is additive.

---

## Post ideas

**On designing for attention**

- *"I built my daughter a memory game and it turned into a lesson about attention design."*
  The anti-pattern list from kids' games, and the concrete things done differently.
- *"Difficulty that goes down."* Why an inverted difficulty curve is the right shape for a child.
- *"1100 milliseconds."* One number I could not reason my way to, and the playtest that settled it.

**On engineering**

- *"Zero dependencies, on purpose."* A project that must still work in 2031 with nobody maintaining it.
- *"The engine has no DOM."* How a pure state machine let a browser game be unit-tested in Node.
- *"A test suite you have never seen fail is decoration."* Mutation-checking your own tests.
- *"Internationalise on day one, even if you only ship one language."* The cost curve of retrofitting i18n.
- *"Ninety lines of WebAudio beat a three-megabyte MP3."* Generated ambience with nothing to download.

**On feedback and QA**

- *"When users disagree about what a button does, it is doing two things."* The sound/music split.
- *"The setting worked. It was still broken."* Discoverability as a correctness property.
- *"The bug that only exists between two states."* Why every screenshot looked right and the
  transition was broken — and what that says about screenshot-based testing.
- *"Turn taste into a number."* Measuring perceived loudness with an AnalyserNode instead of arguing about it.
