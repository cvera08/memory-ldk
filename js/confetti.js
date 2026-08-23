/* ============================================================
   Memory LDK - emoji confetti
   DOM based on purpose: it matches the card art and costs nothing.
   ============================================================ */
(function (LDK) {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** burst(['🌸','👑'], 40) */
  LDK.confetti = function (emojis, count) {
    var layer = document.getElementById('confetti-layer');
    if (!layer || reduced || !emojis || !emojis.length) return;

    var total = count || 34;
    for (var i = 0; i < total; i++) {
      var bit = document.createElement('span');
      bit.className = 'confetti-bit';
      bit.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      bit.style.left = (Math.random() * 100) + '%';
      bit.style.fontSize = (16 + Math.random() * 24) + 'px';
      bit.style.animationDuration = (2.2 + Math.random() * 2.2) + 's';
      bit.style.animationDelay = (Math.random() * 0.9) + 's';
      layer.appendChild(bit);
      /* eslint-disable no-loop-func */
      (function (node) {
        node.addEventListener('animationend', function () { node.remove(); });
      })(bit);
    }
  };

  /** A small celebration right where a pair was found. */
  LDK.sparkle = function (element) {
    if (!element || reduced) return;
    var rect = element.getBoundingClientRect();
    var layer = document.getElementById('confetti-layer');
    if (!layer) return;
    for (var i = 0; i < 6; i++) {
      var bit = document.createElement('span');
      bit.className = 'confetti-bit';
      bit.textContent = '✨';
      bit.style.left = (rect.left + rect.width / 2) + 'px';
      bit.style.top = (rect.top + rect.height / 2) + 'px';
      bit.style.fontSize = (10 + Math.random() * 12) + 'px';
      bit.style.animationDuration = (0.9 + Math.random() * 0.6) + 's';
      layer.appendChild(bit);
      (function (node) {
        node.addEventListener('animationend', function () { node.remove(); });
      })(bit);
    }
  };

})(window.LDK = window.LDK || {});
