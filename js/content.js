/* ============================================================
   Memory LDK - content
   This is the only file you need to edit to re-skin the game:
   add a deck, change the emojis, tweak the board sizes.
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
      name: 'Princesses & Castles',
      cards: [
        { emoji: '👑', label: 'Crown' },
        { emoji: '🏰', label: 'Castle' },
        { emoji: '👸', label: 'Princess' },
        { emoji: '🤴', label: 'Prince' },
        { emoji: '🦄', label: 'Unicorn' },
        { emoji: '🧚', label: 'Fairy' },
        { emoji: '🪄', label: 'Magic wand' },
        { emoji: '💎', label: 'Jewel' },
        { emoji: '🎀', label: 'Ribbon' },
        { emoji: '🗝️', label: 'Golden key' },
        { emoji: '🐴', label: 'Royal horse' },
        { emoji: '✨', label: 'Sparkles' }
      ]
    },
    {
      id: 'garden',
      icon: '🌸',
      name: 'Flowers & Garden',
      cards: [
        { emoji: '🌸', label: 'Blossom' },
        { emoji: '🌺', label: 'Hibiscus' },
        { emoji: '🌻', label: 'Sunflower' },
        { emoji: '🌼', label: 'Daisy' },
        { emoji: '🌷', label: 'Tulip' },
        { emoji: '🌹', label: 'Rose' },
        { emoji: '💐', label: 'Bouquet' },
        { emoji: '🌱', label: 'Sprout' },
        { emoji: '🍀', label: 'Clover' },
        { emoji: '🏵️', label: 'Rosette' },
        { emoji: '🌵', label: 'Cactus' },
        { emoji: '🍄', label: 'Mushroom' }
      ]
    },
    {
      id: 'animals',
      icon: '🐰',
      name: 'Little Animals',
      cards: [
        { emoji: '🐰', label: 'Bunny' },
        { emoji: '🦊', label: 'Fox' },
        { emoji: '🐼', label: 'Panda' },
        { emoji: '🐨', label: 'Koala' },
        { emoji: '🐯', label: 'Tiger' },
        { emoji: '🦁', label: 'Lion' },
        { emoji: '🐮', label: 'Cow' },
        { emoji: '🐷', label: 'Piggy' },
        { emoji: '🐸', label: 'Frog' },
        { emoji: '🐵', label: 'Monkey' },
        { emoji: '🐶', label: 'Puppy' },
        { emoji: '🐱', label: 'Kitty' }
      ]
    },
    {
      id: 'bugs',
      icon: '🐞',
      name: 'Bugs & Roly-Polies',
      cards: [
        { emoji: '🐞', label: 'Ladybug' },
        { emoji: '🪲', label: 'Roly-poly' },
        { emoji: '🦋', label: 'Butterfly' },
        { emoji: '🐛', label: 'Caterpillar' },
        { emoji: '🐝', label: 'Bee' },
        { emoji: '🐜', label: 'Ant' },
        { emoji: '🦗', label: 'Cricket' },
        { emoji: '🕷️', label: 'Spider' },
        { emoji: '🕸️', label: 'Web' },
        { emoji: '🐌', label: 'Snail' },
        { emoji: '🪱', label: 'Worm' },
        { emoji: '🍃', label: 'Leaf' }
      ]
    },
    {
      id: 'ocean',
      icon: '🐠',
      name: 'Under the Sea',
      cards: [
        { emoji: '🐠', label: 'Tropical fish' },
        { emoji: '🐟', label: 'Fish' },
        { emoji: '🐡', label: 'Puffer fish' },
        { emoji: '🐙', label: 'Octopus' },
        { emoji: '🦑', label: 'Squid' },
        { emoji: '🦀', label: 'Crab' },
        { emoji: '🐬', label: 'Dolphin' },
        { emoji: '🐳', label: 'Whale' },
        { emoji: '🦈', label: 'Shark' },
        { emoji: '🐢', label: 'Turtle' },
        { emoji: '🐚', label: 'Shell' },
        { emoji: '⭐', label: 'Sea star' }
      ]
    },
    {
      id: 'toys',
      icon: '🧸',
      name: 'Toys & Blocks',
      cards: [
        { emoji: '🧸', label: 'Teddy bear' },
        { emoji: '🪆', label: 'Nesting doll' },
        { emoji: '🧱', label: 'Building block' },
        { emoji: '🧩', label: 'Puzzle piece' },
        { emoji: '🪀', label: 'Yo-yo' },
        { emoji: '🎈', label: 'Balloon' },
        { emoji: '🎁', label: 'Present' },
        { emoji: '🪁', label: 'Kite' },
        { emoji: '🚂', label: 'Train' },
        { emoji: '🎨', label: 'Paint' },
        { emoji: '🎠', label: 'Carousel' },
        { emoji: '🎪', label: 'Circus tent' }
      ]
    },
    {
      id: 'mix',
      icon: '🎲',
      name: 'Surprise Mix',
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
