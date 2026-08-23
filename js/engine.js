/* ============================================================
   Memory LDK - game engine
   Pure state machine: no DOM, no timers, no sound.
   Everything the UI needs is returned as an event object.
   ============================================================ */
(function (LDK) {
  'use strict';

  /** Fisher-Yates, with an injectable RNG so runs can be reproduced in tests. */
  function shuffle(list, rng) {
    var out = list.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }

  /** Picks `count` distinct items from a pool. */
  function sample(pool, count, rng) {
    return shuffle(pool, rng).slice(0, Math.min(count, pool.length));
  }

  /**
   * createEngine({ pool, pairs, rng })
   *
   * The board always starts at full difficulty (every card face down)
   * and gets easier on its own: each matched pair is one less thing
   * to hold in memory.
   */
  LDK.createEngine = function (options) {
    var rng = options.rng || Math.random;
    var pairs = options.pairs;
    var chosen = sample(options.pool, pairs, rng);

    var deck = [];
    chosen.forEach(function (item, i) {
      for (var copy = 0; copy < 2; copy++) {
        deck.push({
          id: i + '-' + copy,
          key: item.emoji,
          emoji: item.emoji,
          label: item.label,
          faceUp: false,
          matched: false
        });
      }
    });

    var cards = shuffle(deck, rng);
    var selection = [];
    var locked = false;

    var stats = {
      moves: 0,
      matched: 0,
      pairs: pairs,
      streak: 0,
      bestStreak: 0,
      peeksUsed: 0
    };

    function done() { return stats.matched === stats.pairs; }

    /**
     * Flip the card at `index`.
     * Returns an event the UI can render:
     *   ignored | locked | flipped | match | mismatch
     */
    function flip(index) {
      if (locked) return { type: 'locked' };
      var card = cards[index];
      if (!card || card.matched || card.faceUp) return { type: 'ignored' };

      card.faceUp = true;
      selection.push(index);

      if (selection.length < 2) return { type: 'flipped', index: index };

      stats.moves++;
      var a = cards[selection[0]];
      var b = cards[selection[1]];
      var indices = selection.slice();

      if (a.key === b.key) {
        a.matched = b.matched = true;
        stats.matched++;
        stats.streak++;
        if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
        selection = [];
        return {
          type: 'match',
          indices: indices,
          streak: stats.streak,
          remaining: stats.pairs - stats.matched,
          done: done()
        };
      }

      locked = true;
      stats.streak = 0;
      return { type: 'mismatch', indices: indices };
    }

    /** Called by the UI once the "wrong pair" animation has been seen. */
    function hideMismatch() {
      selection.forEach(function (i) { cards[i].faceUp = false; });
      var indices = selection.slice();
      selection = [];
      locked = false;
      return indices;
    }

    /** Indices the player may still need to memorise (for the peek helper). */
    function hiddenIndices() {
      var out = [];
      cards.forEach(function (c, i) { if (!c.matched && !c.faceUp) out.push(i); });
      return out;
    }

    /**
     * 3 stars is a near-perfect run, 1 star always means "you finished it".
     * Thresholds scale with board size so a Super board is not punished.
     */
    function stars() {
      if (stats.moves <= Math.ceil(stats.pairs * 1.6)) return 3;
      if (stats.moves <= Math.ceil(stats.pairs * 2.5)) return 2;
      return 1;
    }

    return {
      cards: cards,
      stats: stats,
      flip: flip,
      hideMismatch: hideMismatch,
      hiddenIndices: hiddenIndices,
      stars: stars,
      isLocked: function () { return locked; },
      isDone: done
    };
  };

  LDK.shuffle = shuffle;

})(window.LDK = window.LDK || {});
