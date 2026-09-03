/* ============================================================
   Memory LDK - user interface
   Owns the DOM, the timers and the screen router.
   All game rules live in engine.js; this file only reacts.
   ============================================================ */
(function (LDK) {
  'use strict';

  var MISMATCH_MS = 1100;   // long enough for a 6 year old to really look
  var PEEK_MS = 1400;
  var WIN_DELAY_MS = 700;

  var t = LDK.i18n.t;
  var el = {};

  var state = {
    deckId: LDK.DEFAULT_DECK,
    levelId: LDK.DEFAULT_LEVEL,
    engine: null,
    peeksLeft: 0,
    startedAt: 0,
    elapsed: 0,
    tickId: null,
    busy: false
  };

  /* Persisted preferences, mirrored by every toggle button on screen. */
  var prefs = { sound: true, music: false, calm: false };

  /* ---------------------------------------------------------
     helpers
     --------------------------------------------------------- */

  function $(id) { return document.getElementById(id); }

  function clock(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function showScreen(name) {
    ['home', 'game', 'win'].forEach(function (s) {
      $('screen-' + s).classList.toggle('is-active', s === name);
    });
    document.body.classList.toggle('playing', name === 'game');
    LDK.tip.hide();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function coach(key, vars) {
    el.coach.textContent = t(key, vars);
    el.coach.classList.remove('is-pop');
    void el.coach.offsetWidth;
    el.coach.classList.add('is-pop');
  }

  /* ---------------------------------------------------------
     home screen
     --------------------------------------------------------- */

  function renderDecks() {
    el.deckGrid.innerHTML = '';
    LDK.DECKS.forEach(function (deck) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'deck' + (deck.id === state.deckId ? ' is-selected' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(deck.id === state.deckId));
      btn.innerHTML =
        '<span class="deck__icon" aria-hidden="true">' + deck.icon + '</span>' +
        '<span class="deck__name"></span>';
      btn.querySelector('.deck__name').textContent = LDK.deckName(deck);
      btn.addEventListener('click', function () {
        state.deckId = deck.id;
        LDK.storage.saveSettings({ deck: deck.id });
        LDK.audio.flip();
        renderDecks();
      });
      el.deckGrid.appendChild(btn);
    });
  }

  function renderLevels() {
    el.levelRow.innerHTML = '';
    LDK.LEVELS.forEach(function (level) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pill' + (level.id === state.levelId ? ' is-selected' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(level.id === state.levelId));
      btn.innerHTML =
        '<span class="pill__name"></span>' +
        '<span class="pill__dots" aria-hidden="true">' + new Array(level.pairs / 2 + 1).join('•') + '</span>';
      btn.querySelector('.pill__name').textContent = t('level.' + level.id);
      btn.addEventListener('click', function () {
        state.levelId = level.id;
        LDK.storage.saveSettings({ level: level.id });
        LDK.audio.flip();
        renderLevels();
      });
      el.levelRow.appendChild(btn);
    });
    var current = LDK.getLevel(state.levelId);
    el.levelHint.textContent = t('level.hint', { pairs: current.pairs, cards: current.pairs * 2 });
  }

  /* ---------------------------------------------------------
     board
     --------------------------------------------------------- */

  function columnsFor(level) {
    return window.innerWidth < 560 ? level.colsNarrow : level.cols;
  }

  function applyColumns() {
    el.board.style.setProperty('--cols', columnsFor(LDK.getLevel(state.levelId)));
  }

  function renderBoard() {
    var cards = state.engine.cards;
    el.board.innerHTML = '';
    applyColumns();

    cards.forEach(function (card, index) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card';
      btn.dataset.index = String(index);
      btn.tabIndex = index === 0 ? 0 : -1;
      btn.setAttribute('aria-label', t('a11y.hidden', { n: index + 1 }));
      btn.innerHTML =
        '<span class="card__inner">' +
          '<span class="card__face card__face--back" aria-hidden="true">✨</span>' +
          '<span class="card__face card__face--front" aria-hidden="true"></span>' +
        '</span>';
      btn.querySelector('.card__face--front').textContent = card.emoji;
      btn.addEventListener('click', function () { onCardClick(index); });
      el.board.appendChild(btn);
    });
  }

  function cardNode(index) {
    return el.board.children[index];
  }

  /* ---------------------------------------------------------
     keyboard navigation

     The board is a roving-tabindex group: one Tab stop gets you in,
     then the arrow keys walk the grid and Enter or Space flips.
     Matched cards are disabled, so movement skips over them.
     --------------------------------------------------------- */

  function setTabStop(index) {
    Array.prototype.forEach.call(el.board.children, function (node, i) {
      node.tabIndex = i === index ? 0 : -1;
    });
  }

  /** First card that can still be turned over, searching from `from`. */
  function seekOpen(from, delta) {
    var total = el.board.children.length;
    for (var i = from; i >= 0 && i < total; i += delta) {
      if (!el.board.children[i].disabled) return i;
    }
    return -1;
  }

  function moveFocus(from, delta) {
    var target = seekOpen(from + delta, delta > 0 ? 1 : -1);
    if (target < 0) return;
    setTabStop(target);
    el.board.children[target].focus();
  }

  /** Keeps a Tab stop on the board once the focused card is matched away. */
  function repairTabStop() {
    var hasStop = Array.prototype.some.call(el.board.children, function (node) {
      return node.tabIndex === 0 && !node.disabled;
    });
    if (hasStop) return;
    var next = seekOpen(0, 1);
    if (next >= 0) setTabStop(next);
  }

  function onBoardKeydown(event) {
    var focused = document.activeElement;
    if (!focused || focused.parentNode !== el.board) return;

    var index = Number(focused.dataset.index);
    var cols = columnsFor(LDK.getLevel(state.levelId));
    var deltas = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: cols,
      ArrowUp: -cols
    };

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      var edge = event.key === 'Home' ? seekOpen(0, 1) : seekOpen(el.board.children.length - 1, -1);
      if (edge >= 0) { setTabStop(edge); el.board.children[edge].focus(); }
      return;
    }

    if (deltas[event.key] === undefined) return;
    event.preventDefault();
    moveFocus(index, deltas[event.key]);
  }

  function paintFaceUp(index, up) {
    var node = cardNode(index);
    if (!node) return;
    var card = state.engine.cards[index];
    node.classList.toggle('is-up', up);
    node.setAttribute('aria-label', up ? LDK.cardLabel(card) : t('a11y.hidden', { n: index + 1 }));
  }

  function updateHud() {
    var s = state.engine.stats;
    el.statPairs.textContent = s.matched + '/' + s.pairs;
    el.statMoves.textContent = String(s.moves);
    el.statTime.textContent = clock(state.elapsed);
  }

  /* ---------------------------------------------------------
     timer
     --------------------------------------------------------- */

  function tick() {
    state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    el.statTime.textContent = clock(state.elapsed);
  }

  function startTimer() {
    stopTimer();
    state.elapsed = 0;
    state.startedAt = Date.now();
    state.tickId = window.setInterval(tick, 1000);
  }

  function stopTimer() {
    if (state.tickId) window.clearInterval(state.tickId);
    state.tickId = null;
  }

  /** Freeze the clock, keeping the seconds counted so far. */
  function pauseTimer() {
    if (!state.tickId) return;
    tick();
    stopTimer();
  }

  /** Pick the clock back up where it stopped, never from zero. */
  function resumeTimer() {
    if (state.tickId || !state.engine || state.engine.isDone()) return;
    if (!$('screen-game').classList.contains('is-active')) return;
    state.startedAt = Date.now() - state.elapsed * 1000;
    state.tickId = window.setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------
     playing
     --------------------------------------------------------- */

  function startGame() {
    var deck = LDK.getDeck(state.deckId);
    var level = LDK.getLevel(state.levelId);

    state.engine = LDK.createEngine({ pool: LDK.poolFor(deck), pairs: level.pairs });
    state.peeksLeft = level.peeks;
    state.busy = false;

    el.deckIcon.textContent = deck.icon;
    el.deckName.textContent = LDK.deckName(deck);
    el.peekCount.textContent = String(state.peeksLeft);
    el.btnPeek.disabled = false;

    renderBoard();
    updateHud();
    coach('coach.start');
    showScreen('game');
    startTimer();
  }

  function onCardClick(index) {
    if (state.busy) return;
    var result = state.engine.flip(index);

    if (result.type === 'ignored' || result.type === 'locked') return;

    paintFaceUp(index, true);
    LDK.audio.flip();
    updateHud();

    if (result.type === 'match') {
      handleMatch(result);
    } else if (result.type === 'mismatch') {
      handleMismatch(result);
    }
  }

  function handleMatch(result) {
    updateHud();
    result.indices.forEach(function (i) {
      var node = cardNode(i);
      node.classList.add('is-matched');
      node.disabled = true;
      LDK.sparkle(node);
      window.setTimeout(function () { node.classList.add('is-gone'); }, 620);
    });
    repairTabStop();

    if (result.done) {
      LDK.audio.win();
      finish();
      return;
    }

    if (result.streak >= 2) {
      LDK.audio.streak();
      coach('coach.streak', { n: result.streak });
    } else {
      LDK.audio.match();
      if (result.remaining === 1) coach('coach.last');
      else if (result.remaining <= 3) coach('coach.close', { n: result.remaining });
      else coach('coach.match');
    }
  }

  function handleMismatch(result) {
    state.busy = true;
    LDK.audio.miss();
    coach('coach.miss');
    result.indices.forEach(function (i) { cardNode(i).classList.add('is-wrong'); });

    window.setTimeout(function () {
      state.engine.hideMismatch().forEach(function (i) {
        cardNode(i).classList.remove('is-wrong');
        paintFaceUp(i, false);
      });
      state.busy = false;
    }, MISMATCH_MS);
  }

  function peek() {
    if (state.busy || state.peeksLeft <= 0) return;
    var hidden = state.engine.hiddenIndices();
    if (!hidden.length) return;

    state.peeksLeft--;
    state.busy = true;
    el.peekCount.textContent = String(state.peeksLeft);
    el.btnPeek.disabled = state.peeksLeft === 0;
    LDK.audio.peek();
    coach('coach.peek');

    hidden.forEach(function (i) { cardNode(i).classList.add('is-up'); });
    window.setTimeout(function () {
      hidden.forEach(function (i) {
        if (!state.engine.cards[i].faceUp) cardNode(i).classList.remove('is-up');
      });
      state.busy = false;
    }, PEEK_MS);
  }

  /* ---------------------------------------------------------
     win screen
     --------------------------------------------------------- */

  function finish() {
    stopTimer();
    state.busy = true;

    var deck = LDK.getDeck(state.deckId);
    var stats = state.engine.stats;
    var stars = state.engine.stars();

    var isRecord = LDK.storage.saveBest(state.deckId, state.levelId, {
      moves: stats.moves,
      seconds: state.elapsed,
      stars: stars
    });
    LDK.storage.addSticker(deck.icon);
    refreshStickerCount();

    el.winSticker.textContent = deck.icon;
    el.winPraise.textContent = t('praise.' + stars);
    el.winMoves.textContent = String(stats.moves);
    el.winTime.textContent = clock(state.elapsed);
    el.winStreak.textContent = String(stats.bestStreak);
    el.winRecord.textContent = t('win.record');
    el.winRecord.hidden = !isRecord;

    Array.prototype.forEach.call(el.winStars.children, function (star, i) {
      star.classList.toggle('is-off', i >= stars);
    });

    window.setTimeout(function () {
      showScreen('win');
      LDK.confetti(LDK.poolFor(deck).map(function (c) { return c.emoji; }), 40);
      state.busy = false;
    }, WIN_DELAY_MS);
  }

  /* ---------------------------------------------------------
     sticker book
     --------------------------------------------------------- */

  function refreshStickerCount() {
    el.stickerCount.textContent = String(LDK.storage.getStickers().length);
  }

  function renderStickers() {
    var list = LDK.storage.getStickers();
    el.stickerGrid.innerHTML = '';
    list.forEach(function (item) {
      var box = document.createElement('div');
      box.className = 'sticker';
      box.innerHTML =
        '<span class="sticker__emoji" aria-hidden="true">' + item.emoji + '</span>' +
        '<span class="sticker__date"></span>';
      box.querySelector('.sticker__date').textContent = item.date;
      el.stickerGrid.appendChild(box);
    });
    el.stickerEmpty.hidden = list.length > 0;
    el.btnReset.hidden = list.length === 0;
  }

  function openStickers() {
    renderStickers();
    /* Always open in the neutral state - never mid-confirmation. */
    el.resetConfirm.hidden = true;
    el.resetDone.hidden = true;
    el.modal.hidden = false;
  }

  function closeStickers() { el.modal.hidden = true; }

  function resetProgress() {
    LDK.storage.clearProgress();
    renderStickers();
    refreshStickerCount();
    el.resetConfirm.hidden = true;
    el.btnReset.hidden = true;
    el.resetDone.hidden = false;
  }

  /* ---------------------------------------------------------
     settings toggles

     One definition per preference, rendered into every mount point
     (home screen and game screen) so the state can never drift
     between screens and can be changed mid-board.
     --------------------------------------------------------- */

  var TOGGLES = [
    {
      key: 'sound',
      labelKey: 'home.sound',
      glyph: function (on) { return on ? '🔊' : '🔇'; },
      apply: function (on) { LDK.audio.setEnabled(on); },
      confirm: function (on) { if (on) LDK.audio.match(); }
    },
    {
      key: 'music',
      labelKey: 'home.music',
      glyph: function () { return '🎵'; },
      apply: function (on) {
        if (on) LDK.music.start();
        else LDK.music.stop();
      }
    },
    {
      key: 'calm',
      labelKey: 'home.calm',
      glyph: function () { return '🌿'; },
      apply: function (on) {
        document.body.classList.toggle('calm', on);
        if (el.statTimeBox) el.statTimeBox.classList.toggle('is-hidden', on);
      }
    }
  ];

  var toggleNodes = {};

  function renderSettings(mount, compact) {
    if (!mount) return;
    mount.innerHTML = '';
    TOGGLES.forEach(function (spec) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip chip--toggle' + (compact ? ' chip--icon' : '');
      btn.innerHTML = '<span class="chip__glyph" aria-hidden="true"></span>' +
        (compact ? '' : '<span class="chip__text"></span>');
      if (!compact) btn.querySelector('.chip__text').textContent = t(spec.labelKey);
      btn.addEventListener('click', function () { setPref(spec.key, !prefs[spec.key]); });
      LDK.tip.attach(btn, function () {
        return t('tip.' + spec.key) + '\n' + t(prefs[spec.key] ? 'tip.on' : 'tip.off');
      });
      (toggleNodes[spec.key] = toggleNodes[spec.key] || []).push(btn);
      mount.appendChild(btn);
    });
    syncToggles();
  }

  function specFor(key) {
    for (var i = 0; i < TOGGLES.length; i++) if (TOGGLES[i].key === key) return TOGGLES[i];
    return null;
  }

  /** Single entry point: updates state, DOM, storage and every button. */
  function setPref(key, value, silent) {
    var spec = specFor(key);
    if (!spec) return;
    prefs[key] = value;
    spec.apply(value);
    syncToggles();
    if (silent) return;
    var patch = {};
    patch[key] = value;
    LDK.storage.saveSettings(patch);
    if (spec.confirm) spec.confirm(value);
  }

  function syncToggles() {
    TOGGLES.forEach(function (spec) {
      var on = prefs[spec.key];
      var label = t(spec.labelKey);
      (toggleNodes[spec.key] || []).forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(on));
        btn.setAttribute('aria-label', label + ': ' + t(on ? 'toggle.on' : 'toggle.off'));
        btn.querySelector('.chip__glyph').textContent = spec.glyph(on);
      });
    });
  }

  /* ---------------------------------------------------------
     boot
     --------------------------------------------------------- */

  function cacheDom() {
    el = {
      deckGrid: $('deck-grid'),
      levelRow: $('difficulty-row'),
      levelHint: $('difficulty-hint'),
      btnPlay: $('btn-play'),
      btnStickers: $('btn-stickers'),
      stickerCount: $('sticker-count'),
      settingsHome: $('settings-home'),
      settingsGame: $('settings-game'),

      board: $('board'),
      coach: $('coach'),
      deckIcon: $('game-deck-icon'),
      deckName: $('game-deck-name'),
      statPairs: $('stat-pairs'),
      statMoves: $('stat-moves'),
      statTime: $('stat-time'),
      statTimeBox: $('stat-time-box'),
      btnBack: $('btn-back'),
      btnPeek: $('btn-peek'),
      peekCount: $('peek-count'),
      btnRestart: $('btn-restart'),

      winSticker: $('win-sticker'),
      winPraise: $('win-praise'),
      winStars: $('win-stars'),
      winMoves: $('win-moves'),
      winTime: $('win-time'),
      winStreak: $('win-streak'),
      winRecord: $('win-record'),
      btnAgain: $('btn-again'),
      btnMenu: $('btn-menu'),

      modal: $('modal-stickers'),
      stickerGrid: $('sticker-grid'),
      stickerEmpty: $('sticker-empty'),
      btnCloseStickers: $('btn-close-stickers'),
      btnReset: $('btn-reset'),
      resetConfirm: $('reset-confirm'),
      resetDone: $('reset-done'),
      btnResetYes: $('btn-reset-yes'),
      btnResetNo: $('btn-reset-no')
    };
  }

  function bind() {
    el.btnPlay.addEventListener('click', startGame);
    el.btnRestart.addEventListener('click', startGame);
    el.btnAgain.addEventListener('click', startGame);

    el.btnBack.addEventListener('click', function () {
      stopTimer();
      showScreen('home');
    });
    el.btnMenu.addEventListener('click', function () { showScreen('home'); });

    el.btnPeek.addEventListener('click', peek);
    el.board.addEventListener('keydown', onBoardKeydown);

    /* Every control whose job is not obvious from its icon alone. */
    [
      [el.btnPeek, 'tip.peek'],
      [el.btnRestart, 'tip.restart'],
      [el.btnStickers, 'tip.stickers'],
      [el.btnReset, 'tip.reset'],
      [el.btnBack, 'tip.back']
    ].forEach(function (pair) {
      LDK.tip.attach(pair[0], function () { return t(pair[1]); });
    });

    el.btnStickers.addEventListener('click', openStickers);
    el.btnCloseStickers.addEventListener('click', closeStickers);
    el.modal.querySelector('[data-close]').addEventListener('click', closeStickers);

    /* Two steps on purpose: a six year old should not be able to wipe
       her own sticker book with one stray tap. */
    el.btnReset.addEventListener('click', function () {
      el.resetConfirm.hidden = false;
      el.btnResetNo.focus();
    });
    el.btnResetNo.addEventListener('click', function () { el.resetConfirm.hidden = true; });
    el.btnResetYes.addEventListener('click', resetProgress);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !el.modal.hidden) closeStickers();
    });

    window.addEventListener('resize', function () {
      if (state.engine) applyColumns();
    });

    /* A child who wanders off mid-board should not come back to a ruined
       best time, and music playing to an empty room helps nobody. */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        pauseTimer();
        LDK.music.stop();
      } else {
        resumeTimer();
        if (prefs.music) LDK.music.start();
      }
    });
  }

  LDK.start = function () {
    cacheDom();
    LDK.i18n.apply(document);

    var saved = LDK.storage.getSettings();
    state.deckId = saved.deck || LDK.DEFAULT_DECK;
    state.levelId = saved.level || LDK.DEFAULT_LEVEL;

    renderSettings(el.settingsHome, false);
    renderSettings(el.settingsGame, true);
    setPref('sound', saved.sound, true);
    setPref('calm', saved.calm, true);

    /* Autoplay is blocked until the page has been interacted with, so a
       remembered music preference is applied on the first click instead
       of at load time. */
    prefs.music = !!saved.music;
    syncToggles();
    if (prefs.music) {
      document.addEventListener('click', function once() {
        document.removeEventListener('click', once);
        if (prefs.music) LDK.music.start();
      });
    }

    renderDecks();
    renderLevels();
    refreshStickerCount();
    bind();
  };

})(window.LDK = window.LDK || {});
