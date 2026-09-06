# Memory LDK 🧠💜

[![ci](https://github.com/cvera08/memory-ldk/actions/workflows/ci.yml/badge.svg)](https://github.com/cvera08/memory-ldk/actions/workflows/ci.yml)
[![play](https://img.shields.io/badge/play-cvera08.github.io%2Fmemory--ldk-7b3fe4)](https://cvera08.github.io/memory-ldk/)
[![license](https://img.shields.io/badge/license-MIT-3fd6a4)](LICENSE)

A friendly card matching game for kids, built as a small static web app.

**▶️ Play it here: https://cvera08.github.io/memory-ldk/**

No install, no build step, no accounts, no ads, no tracking. Open the page and play.

---

## What it is

The classic *Concentration* game: all cards start face down, you turn two over, and
if they match they stay up. The board starts at maximum difficulty — every card is
hidden — and gets easier by itself as pairs disappear. That built-in difficulty
curve is exactly what makes the game work for a young child: it always ends in a win.

Seven themes, four board sizes, and a random draw from each theme pool, so the same
theme never plays out the same way twice.

| Theme | Cards |
| --- | --- |
| 👑 Princesses & Castles | crowns, castles, unicorns, fairies, jewels |
| 🌸 Flowers & Garden | blossoms, sunflowers, clovers, mushrooms |
| 🐰 Little Animals | bunnies, foxes, pandas, kittens |
| 🐞 Bugs & Roly-Polies | ladybugs, roly-polies, butterflies, snails |
| 🐠 Under the Sea | fish, octopus, dolphins, shells |
| 🧸 Toys & Blocks | teddy bears, nesting dolls, blocks, kites |
| 🎲 Surprise Mix | a random draw from all of the above |

Board sizes: **Little** (6 pairs) · **Medium** (8) · **Big** (10) · **Super** (12).

### If you are looking for this game under another name

It is the same game everywhere, and almost every country renamed it:

| Where | Called |
| --- | --- |
| English (general) | **Memory**, **Concentration**, **Pairs**, **Match Match**, **Match Up** |
| Britain | **Pelmanism** — after the Pelman Institute, a memory-training school founded in London in 1899 |
| Argentina | **Memotest** |
| Mexico and much of Latin America | **Memorama** (a registered trademark there since 1973) |
| Spain | **Juego de memoria**, **Memory** |
| Japan | **Shinkei-suijaku** (神経衰弱), literally "nerve weakening" |
| Czechia | **Pexeso** |

"Memory" is the name most people search for in English, which is why this one is
called Memory LDK.

---

## Case study: building a game around attention, not against it

This started as a home project. My daughter is six and a half, and like most kids
her age she is learning to hold her attention on one thing at a time. Card matching
games are a well-known, low-tech way to practise exactly that: to find a pair you
have to *look*, *encode*, and *hold* a position in mind while you do something else.
Working memory and sustained attention get trained together, and the feedback is
immediate.

The interesting part was that most memory games I found for kids work *against*
that goal. They are loud, they run a countdown, they interrupt with ads, they
animate everything at once. A child who is already struggling to focus does not need
more competing signals.

So the design brief became: **maximum engagement, minimum distraction.**

**What the game does on purpose:**

- **The board is the only moving thing.** Background decoration fades while you play,
  and `Calm mode` removes it and the timer entirely.
- **No countdown, no fail state.** Time is displayed, never enforced. You cannot lose.
  The only pressure is the one the child creates for herself.
- **A 1.1 second pause on a wrong pair.** Long enough to actually look at both cards
  and store them, instead of the fast flip-back most games use.
- **Matched cards recede.** They dim and stop responding, so the remaining board is
  visually simpler with every pair found — the working memory load drops as she goes.
- **The coach line never scolds.** "Not yet. Remember those two." is a prompt to
  encode, not a punishment. Praise is specific: streaks, pairs remaining, last pair.
- **A limited `Peek`.** Three or four uses per board. It rescues a frustrated player
  without removing the reason to concentrate, and it teaches the child to spend a
  scarce resource deliberately.
- **Reasons to come back.** Stars, best score per board, and a sticker book that
  fills up over time — progress that survives closing the tab.

**What it is not:** a clinical tool, a diagnosis, or a therapy. It is a well-made
toy built with some care about where a child's attention goes.

---

## Features

- English and Spanish, switchable mid-board without losing the game, remembered, and
  guessed from the browser on a first visit
- 7 themes × 4 board sizes, reshuffled and re-sampled every run
- 3D card flip, match sparkles and an emoji confetti finish
- Star rating (1–3) based on moves relative to board size
- Best score saved per theme + size combination
- Sticker book, one sticker per cleared board, each marked with the board size it was
  won on — the same dots the size picker uses, so a Super win never looks like a Little one
- Gentle WebAudio sound effects and a separate generated ambient music bed — no audio
  files at all, both mutable, both remembered
- Calm mode: hides background motion, confetti and the timer, on every screen
- Every control explains itself in a help bubble on hover, focus or tap
- A two-step "Start over" that erases stickers and scores without touching preferences
- Keyboard playable: one Tab stop into the board, then arrow keys, `Home`/`End`, and
  `Enter`/`Space` to flip; `aria-label`s on every card; honours `prefers-reduced-motion`
- Works on phone, tablet and desktop
- Progress stored locally in the browser — nothing leaves the device

---

## Running it locally

```bash
git clone https://github.com/cvera08/memory-ldk.git
cd memory-ldk
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

The app also runs by opening `index.html` directly from disk — plain scripts, no
modules, no bundler, so there is nothing to serve.

---

## Project structure

```
index.html             markup for the three screens: home / game / win
styles.css             design tokens, layout and every animation

js/content.js          the decks and the board sizes  ← edit this to re-skin the game
js/i18n.js             every user-facing string, in English and Spanish
js/engine.js           the rules, as a pure state machine with no DOM
js/storage.js          localStorage wrapper that survives private browsing
js/audio.js            short WebAudio blips for flips, matches and the win
js/music.js            the generated ambient bed
js/confetti.js         emoji celebration and match sparkles
js/tooltip.js          the help bubbles on hover, focus and tap
js/ui.js               DOM rendering, timers, screen router - the only file that
                       knows both about the rules and about the page
js/main.js             entry point, waits for DOMContentLoaded

tests/run.js           runs both suites
tests/engine.test.js   the rules, in isolation
tests/assets.test.js   the page wiring and the copy table

favicon.svg            the mark, hand-written SVG
favicon.ico            16 / 32 / 48 px fallback for browsers that ignore SVG icons
apple-touch-icon.png   180 px icon for "add to home screen"

.github/workflows/ci.yml   tests on every push, deploy only when they pass
```

Load order matters and is fixed in `index.html`: `content` and `i18n` are data,
`engine` and `storage` are logic, then `ui` wires them to the page and `main` starts it.

The split is deliberate. `engine.js` has no DOM and no timers, so the rules can be
tested in Node. `content.js` holds everything you would change to turn this into a
different game. `i18n.js` holds every sentence in both languages, and the test suite fails if the two
tables ever drift apart.

### Tests

```bash
node tests/run.js
```

No test runner and nothing to install. Two suites, in two different registers:

- **`engine.test.js`** gives the browser modules a fake `window` and exercises the
  rules directly: deck integrity, shuffling, match and mismatch handling, board
  locking, streaks, win detection and the star thresholds. The RNG is injectable, so
  every board in the suite is reproducible from its seed.
- **`assets.test.js`** checks the wiring rather than the logic: that every file
  `index.html` asks for exists, that no module is orphaned, that the script load order
  still satisfies the dependencies, that the icon set is complete, that every copy key
  used in the source has a string, that no string in the table is dead, that both
  languages carry the same keys, and that every hand-written translated string lives
  in a function the language switch actually re-runs.

The second suite exists because those are the failures that survive a green unit-test
run and only show up as a blank page in production.

### Adding your own theme

Append one object to `LDK.DECKS` in `js/content.js`:

```js
{
  id: 'space',
  icon: '🚀',
  name: { en: 'Space', es: 'Espacio' },
  cards: [
    { emoji: '🚀', label: { en: 'Rocket', es: 'Cohete' } },
    { emoji: '🪐', label: { en: 'Planet', es: 'Planeta' } }
    // ...at least 12 for the Super board
  ]
}
```

That is the whole change. The theme picker, the confetti and the sticker book all
read from the same list, and the test suite will tell you if you forgot a translation.

---

## How the site is published

There is still no build step — the files in the repository are the site. What changed
is *who* publishes them, and what has to be true first.

```
git push ─→ ci workflow ─→ tests ──pass──→ assemble _site ─→ verify _site ─→ deploy
                             │
                             └──fail──→ nothing is published, the live site stays up
```

Pages offers two publishing models. **Branch mode** watches a branch and publishes it
directly; GitHub generates a hidden workflow called `pages-build-deployment` to do it,
which is why Actions runs appear even in a repository with no workflow files of its
own. **Workflow mode**, which this repository now uses, hands that job to
`.github/workflows/ci.yml`.

That is the entire difference: the same Pages, published by a workflow you can read
and change instead of one you cannot see. What it buys here:

- **A quality gate.** Both test suites run first. A red test means the deploy job never
  starts and the previous version stays live. In branch mode every push went straight
  to production, tests or no tests.
- **A smaller published surface.** The deploy step copies only what the browser needs.
  The readme, the build log, the tests and the workflow itself are in the repository
  but not on the web server.
- **The artifact is checked before it ships.** `assets.test.js` runs a second time
  against the assembled `_site` folder, so a file that was never copied in fails the
  build instead of turning into a 404 for a six year old.
- **Pull requests get the same tests**, without deploying anything.
- **A status badge** at the top of this file that means something.

### What happened to `.nojekyll`

The repository used to carry an empty `.nojekyll` file, and it is worth explaining why
it existed and why it is gone.

Branch mode runs every site through **Jekyll** before publishing, because Pages began
life as a Jekyll host in 2008 and that default was never changed. Jekyll silently
ignores any file or folder whose name starts with an underscore and tries to interpret
`{{ }}` and `{% %}` as template syntax. An empty `.nojekyll` at the root turns that
step off. The file's *existence* is the whole signal — nothing goes inside it.

Nothing here was ever generated by Jekyll: this has always been hand-written HTML, CSS
and vanilla JavaScript. Jekyll was just a step in Pages' pipeline that had to be
switched off.

Workflow mode has no Jekyll step at all, so the file stopped doing anything and was
removed. Dead configuration that looks meaningful is worse than no configuration.

## Roadmap

- [x] Spanish / English language switch
- [ ] Two-player mode (take turns, keep score)
- [ ] Optional photo decks (family faces instead of emoji)
- [ ] Installable as a PWA for offline play on a tablet

---

## Privacy

Everything the game remembers — best scores, stickers, sound and music preferences —
lives in the browser's own `localStorage`, on the device. There is no account, no
server, no database, no analytics and no leaderboard. Nothing is uploaded anywhere,
and nobody else can see how a child is doing.

That is a design decision, not a missing feature. The point is a child competing with
her own previous attempt, not with strangers.

Practical consequences:

- Progress is **per browser, per device**. The same child on a phone and on a laptop
  has two separate sticker books.
- A hard refresh (`Cmd`/`Ctrl` + `Shift` + `R`) does **not** erase anything — that
  clears the cache, not stored data.
- Progress is lost only by clearing site data for the domain, or by playing in a
  private / incognito window.

## Tech

HTML, CSS and vanilla JavaScript. No frameworks, no dependencies, no build.
Hosted on GitHub Pages.

## License

MIT — see [LICENSE](LICENSE).

---

Made with 💜 by LDK — the three of us.
