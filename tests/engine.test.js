/* ============================================================
   Memory LDK - engine tests

   No framework and no dependencies: the browser modules attach
   themselves to `window`, so the test just provides one and runs
   with plain `node tests/engine.test.js`.
   ============================================================ */
'use strict';

global.window = {};
require('../js/content.js');
require('../js/engine.js');

var LDK = global.window.LDK;

var passed = 0;
var failures = [];

function check(name, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    failures.push({ name: name, message: err.message });
  }
}

function eq(actual, expected, what) {
  if (actual !== expected) {
    throw new Error((what || 'value') + ': expected ' + JSON.stringify(expected) +
      ', got ' + JSON.stringify(actual));
  }
}

function ok(value, what) {
  if (!value) throw new Error(what || 'expected a truthy value');
}

/** Deterministic RNG so a failing run can be reproduced exactly. */
function seeded(seed) {
  var s = seed;
  return function () {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function pairsOf(engine) {
  var byKey = {};
  engine.cards.forEach(function (card, i) {
    (byKey[card.key] = byKey[card.key] || []).push(i);
  });
  return byKey;
}

/* ---------------------------------------------------------- content */

check('every playable deck has enough cards for the largest board', function () {
  var biggest = LDK.LEVELS.reduce(function (max, l) { return Math.max(max, l.pairs); }, 0);
  LDK.DECKS.forEach(function (deck) {
    var pool = LDK.poolFor(deck);
    ok(pool.length >= biggest, deck.id + ' has only ' + pool.length + ' cards, needs ' + biggest);
  });
});

check('no deck repeats an emoji within itself', function () {
  LDK.DECKS.forEach(function (deck) {
    var seen = {};
    LDK.poolFor(deck).forEach(function (card) {
      ok(!seen[card.emoji], deck.id + ' repeats ' + card.emoji);
      seen[card.emoji] = true;
    });
  });
});

check('every card and deck is named in every language', function () {
  var languages = ['en', 'es'];
  LDK.DECKS.forEach(function (deck) {
    languages.forEach(function (lang) {
      ok(deck.name[lang], deck.id + ' has no name in ' + lang);
      deck.cards.forEach(function (card) {
        ok(card.label[lang], deck.id + ' card ' + card.emoji + ' has no label in ' + lang);
      });
    });
  });
});

check('the surprise deck pools every other deck', function () {
  var mix = LDK.poolFor(LDK.getDeck('mix'));
  var plain = LDK.DECKS.filter(function (d) { return !d.mix; });
  var total = plain.reduce(function (n, d) { return n + d.cards.length; }, 0);
  eq(mix.length, total, 'mix pool size');
});

check('lookups fall back instead of throwing', function () {
  eq(LDK.getDeck('nope').id, LDK.DECKS[0].id, 'unknown deck');
  eq(LDK.getLevel('nope').id, LDK.LEVELS[1].id, 'unknown level');
});

/* ---------------------------------------------------------- board setup */

check('a board holds exactly two of each chosen card', function () {
  var engine = LDK.createEngine({ pool: LDK.getDeck('bugs').cards, pairs: 8, rng: seeded(7) });
  eq(engine.cards.length, 16, 'card count');
  var byKey = pairsOf(engine);
  eq(Object.keys(byKey).length, 8, 'distinct emojis');
  Object.keys(byKey).forEach(function (key) {
    eq(byKey[key].length, 2, 'copies of ' + key);
  });
});

check('every card starts face down and unmatched', function () {
  var engine = LDK.createEngine({ pool: LDK.getDeck('ocean').cards, pairs: 6, rng: seeded(11) });
  engine.cards.forEach(function (card) {
    ok(!card.faceUp && !card.matched, 'a card did not start hidden');
  });
  eq(engine.stats.matched, 0, 'matched');
  eq(engine.stats.moves, 0, 'moves');
});

check('the board is shuffled, not dealt in pair order', function () {
  var engine = LDK.createEngine({ pool: LDK.getDeck('animals').cards, pairs: 12, rng: seeded(3) });
  var adjacent = 0;
  for (var i = 0; i < engine.cards.length - 1; i++) {
    if (engine.cards[i].key === engine.cards[i + 1].key) adjacent++;
  }
  ok(adjacent < 6, 'too many pairs sat next to each other: ' + adjacent);
});

check('the same seed always produces the same board', function () {
  var a = LDK.createEngine({ pool: LDK.getDeck('garden').cards, pairs: 8, rng: seeded(99) });
  var b = LDK.createEngine({ pool: LDK.getDeck('garden').cards, pairs: 8, rng: seeded(99) });
  eq(a.cards.map(function (c) { return c.key; }).join(''),
     b.cards.map(function (c) { return c.key; }).join(''), 'card order');
});

/* ---------------------------------------------------------- flipping */

check('the first flip of a turn just turns a card over', function () {
  var engine = LDK.createEngine({ pool: LDK.getDeck('toys').cards, pairs: 6, rng: seeded(21) });
  var result = engine.flip(0);
  eq(result.type, 'flipped', 'event');
  ok(engine.cards[0].faceUp, 'card is face up');
  eq(engine.stats.moves, 0, 'a half turn is not a move');
});

check('a matching second flip reports a match and keeps both cards up', function () {
  var engine = LDK.createEngine({ pool: LDK.getDeck('princess').cards, pairs: 6, rng: seeded(5) });
  var indices = pairsOf(engine)[engine.cards[0].key];
  engine.flip(indices[0]);
  var result = engine.flip(indices[1]);
  eq(result.type, 'match', 'event');
  eq(result.streak, 1, 'streak');
  eq(result.remaining, 5, 'remaining');
  eq(result.done, false, 'done');
  eq(engine.stats.moves, 1, 'moves');
  ok(engine.cards[indices[0]].matched && engine.cards[indices[1]].matched, 'both marked matched');
});

check('a wrong second flip locks the board until the player has looked', function () {
  var engine = LDK.createEngine({ pool: LDK.getDeck('ocean').cards, pairs: 6, rng: seeded(13) });
  var first = 0;
  var second = -1;
  for (var i = 1; i < engine.cards.length; i++) {
    if (engine.cards[i].key !== engine.cards[first].key) { second = i; break; }
  }
  engine.flip(first);
  var result = engine.flip(second);
  eq(result.type, 'mismatch', 'event');
  eq(engine.isLocked(), true, 'locked');
  eq(engine.flip(3).type, 'locked', 'further flips are refused');

  var hidden = engine.hideMismatch();
  eq(hidden.length, 2, 'two cards turned back');
  eq(engine.isLocked(), false, 'unlocked');
  ok(!engine.cards[first].faceUp && !engine.cards[second].faceUp, 'both hidden again');
});

check('a wrong pair resets the streak but keeps the best one', function () {
  var engine = LDK.createEngine({ pool: LDK.getDeck('bugs').cards, pairs: 8, rng: seeded(31) });
  var byKey = pairsOf(engine);
  var keys = Object.keys(byKey);

  keys.slice(0, 3).forEach(function (key) {
    engine.flip(byKey[key][0]);
    engine.flip(byKey[key][1]);
  });
  eq(engine.stats.streak, 3, 'streak after three pairs');

  engine.flip(byKey[keys[3]][0]);
  engine.flip(byKey[keys[4]][0]);
  eq(engine.stats.streak, 0, 'streak after a miss');
  eq(engine.stats.bestStreak, 3, 'best streak survives');
});

check('flipping a card that is already up or matched is ignored', function () {
  var engine = LDK.createEngine({ pool: LDK.getDeck('animals').cards, pairs: 6, rng: seeded(17) });
  var indices = pairsOf(engine)[engine.cards[0].key];
  engine.flip(indices[0]);
  eq(engine.flip(indices[0]).type, 'ignored', 'same card twice');
  engine.flip(indices[1]);
  eq(engine.flip(indices[0]).type, 'ignored', 'already matched');
  eq(engine.stats.moves, 1, 'ignored flips cost nothing');
});

check('hiddenIndices only offers cards still worth memorising', function () {
  var engine = LDK.createEngine({ pool: LDK.getDeck('garden').cards, pairs: 6, rng: seeded(23) });
  eq(engine.hiddenIndices().length, 12, 'at the start');
  var indices = pairsOf(engine)[engine.cards[0].key];
  engine.flip(indices[0]);
  engine.flip(indices[1]);
  eq(engine.hiddenIndices().length, 10, 'after one pair');
});

/* ---------------------------------------------------------- finishing */

check('clearing the board reports the win', function () {
  var engine = LDK.createEngine({ pool: LDK.getDeck('toys').cards, pairs: 6, rng: seeded(41) });
  var byKey = pairsOf(engine);
  var last = null;
  Object.keys(byKey).forEach(function (key) {
    engine.flip(byKey[key][0]);
    last = engine.flip(byKey[key][1]);
  });
  eq(last.done, true, 'done flag on the final match');
  eq(last.remaining, 0, 'remaining');
  eq(engine.isDone(), true, 'isDone');
  eq(engine.stats.moves, 6, 'a perfect run costs one move per pair');
});

check('stars reward efficiency and never drop below one', function () {
  function runWith(pairs, moves) {
    var engine = LDK.createEngine({ pool: LDK.getDeck('ocean').cards, pairs: pairs, rng: seeded(59) });
    engine.stats.moves = moves;
    return engine.stars();
  }
  eq(runWith(8, 8), 3, 'a perfect run');
  eq(runWith(8, 13), 3, 'still generous at 1.6x');
  eq(runWith(8, 14), 2, 'past the three-star line');
  eq(runWith(8, 20), 2, 'at the two-star line');
  eq(runWith(8, 21), 1, 'past it');
  eq(runWith(8, 400), 1, 'finishing always earns a star');
});

check('the star thresholds scale with board size', function () {
  var small = LDK.createEngine({ pool: LDK.getDeck('ocean').cards, pairs: 6, rng: seeded(61) });
  var big = LDK.createEngine({ pool: LDK.getDeck('ocean').cards, pairs: 12, rng: seeded(61) });
  small.stats.moves = 18;
  big.stats.moves = 18;
  eq(small.stars(), 1, 'eighteen moves is wasteful on six pairs');
  eq(big.stars(), 3, 'eighteen moves is excellent on twelve');
});

/* ---------------------------------------------------------- report */

console.log('');
failures.forEach(function (f) {
  console.log('  FAIL  ' + f.name);
  console.log('        ' + f.message);
});
console.log('  ' + passed + ' passed, ' + failures.length + ' failed');
console.log('');
process.exit(failures.length ? 1 : 0);
