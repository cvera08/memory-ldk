/* ============================================================
   Memory LDK - content
   This is the only file you need to edit to re-skin the game:
   add a deck, change the emojis, tweak the board sizes.

   Names and labels are { en, es } tables so a deck stays one
   self-contained object: copy it, translate the two fields, done.
   ============================================================ */
(function (LDK) {
  'use strict';

  /**
   * A deck is a themed pool of cards.
   * The game picks N random items from the pool on every run,
   * so the same theme never feels identical twice.
   *
   * { id, icon, name, cards: [{ emoji, label }] }
   */
  LDK.DECKS = [
    {
      id: 'princess',
      icon: '👑',
      name: { en: 'Princesses & Castles', es: 'Princesas y Castillos' },
      cards: [
        { emoji: '👑', label: { en: 'Crown', es: 'Corona' } },
        { emoji: '🏰', label: { en: 'Castle', es: 'Castillo' } },
        { emoji: '👸', label: { en: 'Princess', es: 'Princesa' } },
        { emoji: '🤴', label: { en: 'Prince', es: 'Príncipe' } },
        { emoji: '🦄', label: { en: 'Unicorn', es: 'Unicornio' } },
        { emoji: '🧚', label: { en: 'Fairy', es: 'Hada' } },
        { emoji: '🪄', label: { en: 'Magic wand', es: 'Varita mágica' } },
        { emoji: '💎', label: { en: 'Jewel', es: 'Joya' } },
        { emoji: '🎀', label: { en: 'Ribbon', es: 'Moño' } },
        { emoji: '🗝️', label: { en: 'Golden key', es: 'Llave dorada' } },
        { emoji: '🐴', label: { en: 'Royal horse', es: 'Caballo real' } },
        { emoji: '✨', label: { en: 'Sparkles', es: 'Brillos' } }
      ]
    },
    {
      id: 'garden',
      icon: '🌸',
      name: { en: 'Flowers & Garden', es: 'Flores y Jardín' },
      cards: [
        { emoji: '🌸', label: { en: 'Blossom', es: 'Flor de cerezo' } },
        { emoji: '🌺', label: { en: 'Hibiscus', es: 'Hibisco' } },
        { emoji: '🌻', label: { en: 'Sunflower', es: 'Girasol' } },
        { emoji: '🌼', label: { en: 'Daisy', es: 'Margarita' } },
        { emoji: '🌷', label: { en: 'Tulip', es: 'Tulipán' } },
        { emoji: '🌹', label: { en: 'Rose', es: 'Rosa' } },
        { emoji: '💐', label: { en: 'Bouquet', es: 'Ramo' } },
        { emoji: '🌱', label: { en: 'Sprout', es: 'Brote' } },
        { emoji: '🍀', label: { en: 'Clover', es: 'Trébol' } },
        { emoji: '🏵️', label: { en: 'Rosette', es: 'Escarapela' } },
        { emoji: '🌵', label: { en: 'Cactus', es: 'Cactus' } },
        { emoji: '🍄', label: { en: 'Mushroom', es: 'Hongo' } }
      ]
    },
    {
      id: 'animals',
      icon: '🐰',
      name: { en: 'Little Animals', es: 'Animalitos' },
      cards: [
        { emoji: '🐰', label: { en: 'Bunny', es: 'Conejito' } },
        { emoji: '🦊', label: { en: 'Fox', es: 'Zorro' } },
        { emoji: '🐼', label: { en: 'Panda', es: 'Panda' } },
        { emoji: '🐨', label: { en: 'Koala', es: 'Koala' } },
        { emoji: '🐯', label: { en: 'Tiger', es: 'Tigre' } },
        { emoji: '🦁', label: { en: 'Lion', es: 'León' } },
        { emoji: '🐮', label: { en: 'Cow', es: 'Vaca' } },
        { emoji: '🐷', label: { en: 'Piggy', es: 'Chanchito' } },
        { emoji: '🐸', label: { en: 'Frog', es: 'Rana' } },
        { emoji: '🐵', label: { en: 'Monkey', es: 'Mono' } },
        { emoji: '🐶', label: { en: 'Puppy', es: 'Perrito' } },
        { emoji: '🐱', label: { en: 'Kitty', es: 'Gatito' } }
      ]
    },
    {
      id: 'bugs',
      icon: '🐞',
      name: { en: 'Bugs & Roly-Polies', es: 'Bichos y Bichos Bolita' },
      cards: [
        { emoji: '🐞', label: { en: 'Ladybug', es: 'Vaquita de San Antonio' } },
        { emoji: '🪲', label: { en: 'Roly-poly', es: 'Bicho bolita' } },
        { emoji: '🦋', label: { en: 'Butterfly', es: 'Mariposa' } },
        { emoji: '🐛', label: { en: 'Caterpillar', es: 'Oruga' } },
        { emoji: '🐝', label: { en: 'Bee', es: 'Abeja' } },
        { emoji: '🐜', label: { en: 'Ant', es: 'Hormiga' } },
        { emoji: '🦗', label: { en: 'Cricket', es: 'Grillo' } },
        { emoji: '🕷️', label: { en: 'Spider', es: 'Araña' } },
        { emoji: '🕸️', label: { en: 'Web', es: 'Telaraña' } },
        { emoji: '🐌', label: { en: 'Snail', es: 'Caracol' } },
        { emoji: '🪱', label: { en: 'Worm', es: 'Lombriz' } },
        { emoji: '🍃', label: { en: 'Leaf', es: 'Hoja' } }
      ]
    },
    {
      id: 'ocean',
      icon: '🐠',
      name: { en: 'Under the Sea', es: 'En el Mar' },
      cards: [
        { emoji: '🐠', label: { en: 'Tropical fish', es: 'Pez tropical' } },
        { emoji: '🐟', label: { en: 'Fish', es: 'Pez' } },
        { emoji: '🐡', label: { en: 'Puffer fish', es: 'Pez globo' } },
        { emoji: '🐙', label: { en: 'Octopus', es: 'Pulpo' } },
        { emoji: '🦑', label: { en: 'Squid', es: 'Calamar' } },
        { emoji: '🦀', label: { en: 'Crab', es: 'Cangrejo' } },
        { emoji: '🐬', label: { en: 'Dolphin', es: 'Delfín' } },
        { emoji: '🐳', label: { en: 'Whale', es: 'Ballena' } },
        { emoji: '🦈', label: { en: 'Shark', es: 'Tiburón' } },
        { emoji: '🐢', label: { en: 'Turtle', es: 'Tortuga' } },
        { emoji: '🐚', label: { en: 'Shell', es: 'Caracola' } },
        { emoji: '⭐', label: { en: 'Sea star', es: 'Estrella de mar' } }
      ]
    },
    {
      id: 'toys',
      icon: '🧸',
      name: { en: 'Toys & Blocks', es: 'Juguetes y Bloques' },
      cards: [
        { emoji: '🧸', label: { en: 'Teddy bear', es: 'Osito' } },
        { emoji: '🪆', label: { en: 'Nesting doll', es: 'Muñeca rusa' } },
        { emoji: '🧱', label: { en: 'Building block', es: 'Bloque' } },
        { emoji: '🧩', label: { en: 'Puzzle piece', es: 'Pieza de rompecabezas' } },
        { emoji: '🪀', label: { en: 'Yo-yo', es: 'Yoyó' } },
        { emoji: '🎈', label: { en: 'Balloon', es: 'Globo' } },
        { emoji: '🎁', label: { en: 'Present', es: 'Regalo' } },
        { emoji: '🪁', label: { en: 'Kite', es: 'Barrilete' } },
        { emoji: '🚂', label: { en: 'Train', es: 'Tren' } },
        { emoji: '🎨', label: { en: 'Paint', es: 'Pintura' } },
        { emoji: '🎠', label: { en: 'Carousel', es: 'Calesita' } },
        { emoji: '🎪', label: { en: 'Circus tent', es: 'Carpa de circo' } }
      ]
    },
    {
      id: 'mix',
      icon: '🎲',
      name: { en: 'Surprise Mix', es: 'Mezcla Sorpresa' },
      mix: true, // built at runtime from every other deck
      cards: []
    }
  ];

  /**
   * Board sizes. `cards` is always pairs * 2.
   * `cols` is the preferred column count on a wide screen;
   * narrow screens fall back to `colsNarrow`.
   */
  LDK.LEVELS = [
    { id: 'little', name: 'Little',  pairs: 6,  cols: 4, colsNarrow: 3, peeks: 3 },
    { id: 'medium', name: 'Medium',  pairs: 8,  cols: 4, colsNarrow: 4, peeks: 3 },
    { id: 'big',    name: 'Big',     pairs: 10, cols: 5, colsNarrow: 4, peeks: 3 },
    { id: 'super',  name: 'Super',   pairs: 12, cols: 6, colsNarrow: 4, peeks: 4 }
  ];

  LDK.DEFAULT_DECK = 'princess';
  LDK.DEFAULT_LEVEL = 'medium';

  /** Current language, defaulting to English before i18n has loaded. */
  function lang() {
    return (LDK.i18n && LDK.i18n.lang) || 'en';
  }

  /**
   * Both deck names and card labels are { en, es } tables, so a deck is
   * still one self-contained object you can copy, translate and drop in.
   */
  function localised(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[lang()] || value.en || '';
  }

  LDK.deckName = function (deck) { return localised(deck && deck.name); };
  LDK.cardLabel = function (card) { return localised(card && card.label); };
  LDK.localised = localised;

  LDK.getDeck = function (id) {
    return LDK.DECKS.find(function (d) { return d.id === id; }) || LDK.DECKS[0];
  };

  LDK.getLevel = function (id) {
    return LDK.LEVELS.find(function (l) { return l.id === id; }) || LDK.LEVELS[1];
  };

  /** Pool for a deck, resolving the special "surprise mix" deck. */
  LDK.poolFor = function (deck) {
    if (!deck.mix) return deck.cards;
    var seen = Object.create(null);
    var pool = [];
    LDK.DECKS.forEach(function (d) {
      if (d.mix) return;
      d.cards.forEach(function (c) {
        if (seen[c.emoji]) return;
        seen[c.emoji] = true;
        pool.push(c);
      });
    });
    return pool;
  };

})(window.LDK = window.LDK || {});
