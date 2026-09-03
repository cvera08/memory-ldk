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
      'home.language': 'Language',

      'a11y.hidden': 'Hidden card {n}',
      'toggle.on': 'on',
      'toggle.off': 'off',

      'tip.sound': 'Little blips when you turn a card over and when you find a pair.',
      'tip.music': 'A soft background sound that helps you concentrate.',
      'tip.calm': 'Hides the moving background, the confetti and the clock.',
      'tip.peek': 'Shows every hidden card for a moment. You only get a few.',
      'tip.restart': 'Shuffles this board and starts it again from the beginning.',
      'tip.stickers': 'You collect one sticker for every board you finish.',
      'tip.back': 'Go back and choose another theme.',
      'tip.on': 'Right now: on. Click to turn it off.',
      'tip.off': 'Right now: off. Click to turn it on.',

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

      'stickers.title': 'My sticker book',
      'stickers.sub': 'You earn one sticker every time you clear a board.',
      'stickers.empty': 'No stickers yet. Win a game to get your first one!',
      'reset.button': 'Start over',
      'reset.confirm': 'Erase every sticker and best score? This cannot be undone.',
      'reset.yes': 'Yes, erase everything',
      'reset.cancel': 'Keep them',
      'reset.done': 'All clear. A fresh start!',
      'tip.reset': 'Erases the stickers and the best scores saved on this device.',

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
    },

    es: {
      'home.subtitle': '¡Dá vuelta dos cartas. Encontrá el par. Llená el tablero de amigos!',
      'home.pickTheme': '1. Elegí un tema',
      'home.pickSize': '2. ¿Cuántas cartas?',
      'home.play': 'Jugar',
      'home.stickers': 'Mis figuritas',
      'home.sound': 'Sonidos',
      'home.music': 'Música',
      'home.calm': 'Modo calmo',
      'home.language': 'Idioma',

      'a11y.hidden': 'Carta tapada {n}',
      'toggle.on': 'sí',
      'toggle.off': 'no',

      'tip.sound': 'Soniditos cuando das vuelta una carta y cuando encontrás un par.',
      'tip.music': 'Un sonido suave de fondo que ayuda a concentrarse.',
      'tip.calm': 'Esconde el fondo en movimiento, el papel picado y el reloj.',
      'tip.peek': 'Muestra todas las cartas tapadas un ratito. Tenés pocas.',
      'tip.restart': 'Mezcla este tablero y lo empieza de nuevo.',
      'tip.stickers': 'Ganás una figurita cada vez que terminás un tablero.',
      'tip.back': 'Volver y elegir otro tema.',
      'tip.on': 'Ahora está activado. Tocá para desactivarlo.',
      'tip.off': 'Ahora está desactivado. Tocá para activarlo.',
      'tip.reset': 'Borra las figuritas y los récords guardados en este dispositivo.',

      'hud.pairs': 'Pares',
      'hud.moves': 'Jugadas',
      'hud.time': 'Tiempo',

      'game.peek': 'Espiar',
      'game.restart': 'Mezclar otra vez',

      'win.title': '¡Los encontraste a todos!',
      'win.moves': 'Jugadas',
      'win.time': 'Tiempo',
      'win.streak': 'Mejor racha',
      'win.again': 'Jugar de nuevo',
      'win.menu': 'Cambiar de tema',
      'win.record': '¡Nuevo récord en este tablero!',

      'stickers.title': 'Mi álbum de figuritas',
      'stickers.sub': 'Ganás una figurita cada vez que completás un tablero.',
      'stickers.empty': 'Todavía no hay figuritas. ¡Ganá una partida para la primera!',
      'reset.button': 'Empezar de cero',
      'reset.confirm': '¿Borrar todas las figuritas y los récords? No se puede deshacer.',
      'reset.yes': 'Sí, borrar todo',
      'reset.cancel': 'Dejarlos',
      'reset.done': '¡Listo! Todo de nuevo desde cero.',

      'level.little': 'Chiquito',
      'level.medium': 'Mediano',
      'level.big': 'Grande',
      'level.super': 'Súper',
      'level.hint': '{pairs} pares - {cards} cartas',

      'coach.start': [
        'Tomate tu tiempo. ¡Mirá bien!',
        '¿Lista? Acordate dónde se esconde cada amigo.',
        'Los ojos tranquilos encuentran más pares.'
      ],
      'coach.match': [
        '¡Sí! ¡Un par!',
        '¡Qué buena memoria!',
        '¡Los encontraste!',
        '¡Hermoso!'
      ],
      'coach.streak': [
        '¡{n} seguidos! ¡Guau!',
        '¡Racha de {n}! ¡Seguí así!',
        '¡{n} pares seguidos!'
      ],
      'coach.miss': [
        'Todavía no. Acordate de esas dos.',
        '¡Casi! Guardalas en la cabeza.',
        'Probá de nuevo, te estás aprendiendo el tablero.'
      ],
      'coach.close': [
        '¡Quedan solo {n} pares!',
        '¡Falta poquito! {n} para terminar.',
        '¡{n} más y ganás!'
      ],
      'coach.last': [
        '¡El último par! ¡Vos podés!',
        '¡Queda uno!'
      ],
      'coach.peek': [
        'Una espiadita... ¡ahora acordate!',
        'Mirá rápido y guardalo en la mente.'
      ],

      'praise.3': '¡Memoria increíble!',
      'praise.2': '¡Muy bien hecho!',
      'praise.1': '¡Lo terminaste! Buen esfuerzo.',

      'credits': 'Hecho con 💜 por LDK'
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
