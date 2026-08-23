/* ============================================================
   Memory LDK - sound
   Tiny WebAudio blips. No audio files, so nothing to download
   and nothing to break offline.
   ============================================================ */
(function (LDK) {
  'use strict';

  var ctx = null;
  var enabled = true;

  function context() {
    if (ctx) return ctx;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try { ctx = new Ctor(); } catch (e) { ctx = null; }
    return ctx;
  }

  /** One short note. `type` shapes the timbre, `gain` keeps it gentle. */
  function tone(freq, start, duration, type, gain) {
    var ac = context();
    if (!ac) return;
    var t0 = ac.currentTime + start;
    var osc = ac.createOscillator();
    var amp = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain || 0.14, t0 + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(amp).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  function play(notes) {
    if (!enabled) return;
    var ac = context();
    if (!ac) return;
    if (ac.state === 'suspended') ac.resume();
    notes.forEach(function (n) { tone(n[0], n[1], n[2], n[3], n[4]); });
  }

  LDK.audio = {
    setEnabled: function (value) { enabled = !!value; },
    isEnabled: function () { return enabled; },

    flip:  function () { play([[520, 0, 0.09, 'triangle', 0.07]]); },
    match: function () { play([[660, 0, 0.12, 'sine', 0.12], [880, 0.09, 0.16, 'sine', 0.11]]); },
    miss:  function () { play([[300, 0, 0.13, 'sine', 0.07], [230, 0.1, 0.16, 'sine', 0.06]]); },
    peek:  function () { play([[900, 0, 0.08, 'sine', 0.06], [1150, 0.07, 0.1, 'sine', 0.05]]); },
    streak: function () { play([[784, 0, 0.1, 'sine', 0.1], [988, 0.08, 0.12, 'sine', 0.09], [1175, 0.16, 0.18, 'sine', 0.08]]); },
    win: function () {
      play([
        [523, 0.00, 0.16, 'sine', 0.12],
        [659, 0.13, 0.16, 'sine', 0.12],
        [784, 0.26, 0.16, 'sine', 0.12],
        [1047, 0.39, 0.42, 'sine', 0.13],
        [784, 0.52, 0.42, 'sine', 0.07]
      ]);
    }
  };

})(window.LDK = window.LDK || {});
