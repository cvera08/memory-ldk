/* ============================================================
   Memory LDK - persistence
   localStorage, wrapped so private browsing never breaks the game.
   ============================================================ */
(function (LDK) {
  'use strict';

  var PREFIX = 'ldk.memory.';
  var MAX_STICKERS = 60;

  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  var DEFAULT_SETTINGS = {
    sound: true,
    calm: false,
    deck: null,
    level: null
  };

  LDK.storage = {
    getSettings: function () {
      var saved = read('settings', {}) || {};
      var out = {};
      Object.keys(DEFAULT_SETTINGS).forEach(function (k) {
        out[k] = saved[k] === undefined ? DEFAULT_SETTINGS[k] : saved[k];
      });
      return out;
    },

    saveSettings: function (patch) {
      var next = this.getSettings();
      Object.keys(patch).forEach(function (k) { next[k] = patch[k]; });
      write('settings', next);
      return next;
    },

    /** Best result per board (deck + level combination). */
    getBest: function (deckId, levelId) {
      return read('best', {})[deckId + ':' + levelId] || null;
    },

    /** Returns true when the run beat the stored record. */
    saveBest: function (deckId, levelId, result) {
      var all = read('best', {});
      var key = deckId + ':' + levelId;
      var prev = all[key];
      var better = !prev ||
        result.moves < prev.moves ||
        (result.moves === prev.moves && result.seconds < prev.seconds);
      if (better) {
        all[key] = { moves: result.moves, seconds: result.seconds, stars: result.stars };
        write('best', all);
      }
      return better;
    },

    getStickers: function () {
      var list = read('stickers', []);
      return Array.isArray(list) ? list : [];
    },

    addSticker: function (emoji) {
      var list = this.getStickers();
      list.unshift({ emoji: emoji, date: new Date().toISOString().slice(0, 10) });
      if (list.length > MAX_STICKERS) list.length = MAX_STICKERS;
      write('stickers', list);
      return list;
    }
  };

})(window.LDK = window.LDK || {});
