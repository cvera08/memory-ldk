# Memory LDK 🧠💜

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

- 7 themes × 4 board sizes, reshuffled and re-sampled every run
- 3D card flip, match sparkles and an emoji confetti finish
- Star rating (1–3) based on moves relative to board size
- Best score saved per theme + size combination
- Sticker book, one sticker per cleared board
- Gentle WebAudio sound effects — no audio files, mutable, remembered
- Calm mode: hides background motion and the timer
- Keyboard playable, `aria-label`s on every card, honours `prefers-reduced-motion`
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
index.html        markup for the three screens (home / game / win)
styles.css        design tokens and layout
js/content.js     decks and board sizes  ← edit this to re-skin the game
js/i18n.js        every user-facing string
js/engine.js      pure game state machine (no DOM)
js/storage.js     localStorage wrapper
js/audio.js       WebAudio blips
js/confetti.js    emoji celebration
js/ui.js          DOM rendering, timers, screen router
js/main.js        entry point
```

The split is deliberate: `engine.js` has no DOM and no timers, so the rules can be
tested in isolation, and `content.js` holds everything you would want to change to
turn this into a different game.

### Adding your own theme

Append one object to `LDK.DECKS` in `js/content.js`:

```js
{
  id: 'space',
  icon: '🚀',
  name: 'Space',
  cards: [
    { emoji: '🚀', label: 'Rocket' },
    { emoji: '🪐', label: 'Planet' }
    // ...at least 12 for the Super board
  ]
}
```

That is the whole change. The theme picker, the confetti and the sticker book all
read from the same list.

---

## Roadmap

- [ ] Spanish / English language switch
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
