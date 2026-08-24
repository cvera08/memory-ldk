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

## Post ideas

- *"I built my daughter a memory game and it turned into a lesson about attention design."*
  The anti-pattern list from kids' games, and the six concrete things done differently.
- *"Zero dependencies, on purpose."* A project that must still work in 2031 with nobody maintaining it.
- *"The engine has no DOM."* How a pure state machine let a browser game be unit-tested in Node.
- *"Internationalise on day one, even if you only ship one language."* The cost curve of retrofitting i18n.
- *"Difficulty that goes down."* Why an inverted difficulty curve is the right shape for a child.
