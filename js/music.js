/* ============================================================
   Memory LDK - background music

   A slow, generated lullaby rather than an audio file: it never
   loops audibly, weighs nothing, and works offline. Everything is
   built from a C major pentatonic scale, which has no semitone
   clashes, so any two notes sound consonant together.
   ============================================================ */
(function (LDK) {
  'use strict';

  /* C major pentatonic across two octaves, plus two bass roots. */
  var SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
  var BASS = [65.41, 98.00];

  var STEP_S = 1.05;      // seconds between notes - deliberately unhurried
  var LOOKAHEAD_MS = 220; // scheduler tick
  var HORIZON_S = 1.4;    // how far ahead notes are queued
  var VOLUME = 0.45;      // master, on top of already quiet per-note gains

  var master = null;
  var timerId = null;
  var nextNoteAt = 0;
  var step = 0;
  var index = 2;
  var playing = false;

  function chain() {
    var ac = LDK.audio.context();
    if (!ac) return null;
    if (master) return ac;

    /* A gentle low-pass keeps the sines soft instead of glassy. */
    var filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1400;

    master = ac.createGain();
    master.gain.value = 0;
    master.connect(filter).connect(ac.destination);
    return ac;
  }

  /** One soft note: sine body plus a quiet triangle for a bit of warmth. */
  function voice(freq, at, duration, gain) {
    var ac = LDK.audio.context();
    var amp = ac.createGain();
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(gain, at + 0.35);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    amp.connect(master);

    ['sine', 'triangle'].forEach(function (type, i) {
      var osc = ac.createOscillator();
      var sub = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, at);
      sub.gain.value = i === 0 ? 1 : 0.22;
      osc.connect(sub).connect(amp);
      osc.start(at);
      osc.stop(at + duration + 0.05);
    });
  }

  /**
   * Random walk along the scale: mostly small steps, so the melody
   * wanders instead of jumping. Predictable enough to fade into the
   * background, varied enough not to become a loop the ear latches on to.
   */
  function nextIndex() {
    var move = [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)];
    index = Math.min(SCALE.length - 1, Math.max(0, index + move));
    return index;
  }

  function scheduleStep(at, n) {
    voice(SCALE[nextIndex()], at, 2.6, 0.16);

    /* A third above, now and then, to open the sound up. */
    if (n % 4 === 1 && Math.random() < 0.45 && index + 2 < SCALE.length) {
      voice(SCALE[index + 2], at + 0.06, 2.2, 0.08);
    }

    /* Slow root note underneath, one per bar. */
    if (n % 8 === 0) {
      voice(BASS[(n / 8) % 2], at, 6.5, 0.12);
    }
  }

  function tick() {
    var ac = LDK.audio.context();
    if (!ac) return;
    while (nextNoteAt < ac.currentTime + HORIZON_S) {
      scheduleStep(nextNoteAt, step);
      nextNoteAt += STEP_S;
      step++;
    }
  }

  LDK.music = {
    isPlaying: function () { return playing; },

    start: function () {
      var ac = chain();
      if (!ac || playing) return;
      if (ac.state === 'suspended') ac.resume();

      playing = true;
      nextNoteAt = ac.currentTime + 0.25;
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setValueAtTime(master.gain.value, ac.currentTime);
      master.gain.linearRampToValueAtTime(VOLUME, ac.currentTime + 2.5);

      tick();
      timerId = window.setInterval(tick, LOOKAHEAD_MS);
    },

    stop: function () {
      if (!playing) return;
      playing = false;
      window.clearInterval(timerId);
      timerId = null;

      var ac = LDK.audio.context();
      if (!ac || !master) return;
      /* Fade out rather than cut, so it never clicks. */
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setValueAtTime(master.gain.value, ac.currentTime);
      master.gain.linearRampToValueAtTime(0, ac.currentTime + 1.2);
    }
  };

})(window.LDK = window.LDK || {});
