/* ============================================================
   Memory LDK - copy tables
   Every user-facing string lives here. Adding a second language
   later means adding one more object and flipping LDK.i18n.lang.
   ============================================================ */
(function (LDK) {
  'use strict';

  var STRINGS = {
    en: {
      'home.subtitle': 'Flip two cards. Find the pair. Fill the board with friends!',
      'home.pickTheme': '1. Pick a theme',
      'home.pickSize': '2. How many cards?',
      'home.play': 'Play',
      'home.stickers': 'My stickers',
      'home.sound': 'Sound effects',
      'home.music': 'Music',
      'home.calm': 'Calm mode',

      'toggle.on': 'on',
      'toggle.off': 'off',

      'hud.pairs': 'Pairs',
      'hud.moves': 'Moves',
      'hud.time': 'Time',

      'game.peek': 'Peek',
      'game.restart': 'Shuffle again',

      'win.title': 'You found them all!',
      'win.moves': 'Moves',
      'win.time': 'Time',
      'win.streak': 'Best streak',
      'win.again': 'Play again',
      'win.menu': 'Change theme',
      'win.record': 'New best score for this board!',
      'win.sticker': 'You earned a new sticker!',

      'stickers.title': 'My sticker book',
      'stickers.sub': 'You earn one sticker every time you clear a board.',
      'stickers.empty': 'No stickers yet. Win a game to get your first one!',

      'level.little': 'Little',
      'level.medium': 'Medium',
      'level.big': 'Big',
      'level.super': 'Super',
      'level.hint': '{pairs} pairs - {cards} cards',

      /* Rotating coach lines. Short, warm, never scolding. */
      'coach.start': [
        'Take your time. Look carefully!',
        'Ready? Remember where each friend hides.',
        'Slow eyes find more pairs.'
      ],
      'coach.match': [
        'Yes! A pair!',
        'Great memory!',
        'You found them!',
        'Beautiful!'
      ],
      'coach.streak': [
        '{n} in a row! Wow!',
        'Streak of {n}! Keep going!',
        '{n} pairs in a row!'
      ],
      'coach.miss': [
        'Not yet. Remember those two.',
        'Almost! Keep them in your head.',
        'Try again, you are learning the board.'
      ],
      'coach.close': [
        'Only {n} pairs left!',
        'So close! {n} to go.',
        '{n} more and you win!'
      ],
      'coach.last': [
        'Last pair! You can do it!',
        'One left!'
      ],
      'coach.peek': [
        'A quick peek... now remember!',
        'Look fast and hold it in your mind.'
      ],

      'praise.3': 'Amazing memory!',
      'praise.2': 'Really well done!',
      'praise.1': 'You finished it! Great effort.',

      'credits': 'Made with 💜 by LDK'
    }
  };

  var lang = 'en';

  /** t('key') -> string. Arrays return a random entry. */
  function t(key, vars) {
    var table = STRINGS[lang] || STRINGS.en;
    var value = table[key];
    if (value === undefined) value = STRINGS.en[key];
    if (value === undefined) return key;
    if (Array.isArray(value)) value = value[Math.floor(Math.random() * value.length)];
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        value = value.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return value;
  }

  /** Paints every [data-i18n] node in the document. */
  function apply(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
  }

  LDK.i18n = {
    t: t,
    apply: apply,
    get lang() { return lang; },
    set lang(next) { if (STRINGS[next]) lang = next; },
    available: function () { return Object.keys(STRINGS); },
    strings: STRINGS
  };

})(window.LDK = window.LDK || {});
