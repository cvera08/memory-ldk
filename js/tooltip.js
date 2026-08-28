/* ============================================================
   Memory LDK - help bubbles

   The native `title` attribute is useless here: it waits a second,
   it cannot be styled, and it never appears on a tablet. This is a
   small replacement that shows on hover, on keyboard focus, and for
   a couple of seconds after a tap - which is the only moment a touch
   user can be told what a button just did.
   ============================================================ */
(function (LDK) {
  'use strict';

  var TAP_MS = 2600;
  var GAP = 10;

  var node = null;
  var current = null;
  var hideTimer = null;

  function ensure() {
    if (node) return node;
    node = document.createElement('div');
    node.className = 'tip';
    node.id = 'ldk-tip';
    node.setAttribute('role', 'tooltip');
    node.hidden = true;
    document.body.appendChild(node);
    return node;
  }

  /** Content may carry a second line after a newline, shown dimmer. */
  function paint(content) {
    node.innerHTML = '';
    String(content).split('\n').forEach(function (line, i) {
      var span = document.createElement('span');
      span.className = i === 0 ? 'tip__text' : 'tip__note';
      span.textContent = line;
      node.appendChild(span);
    });
  }

  function place(target) {
    var box = target.getBoundingClientRect();
    var tip = node.getBoundingClientRect();

    var left = box.left + box.width / 2 - tip.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tip.width - 8));

    /* Above by default, below when there is no room up there. */
    var above = box.top - tip.height - GAP;
    var below = box.bottom + GAP;
    var top = above >= 8 ? above : below;

    node.classList.toggle('tip--below', top === below);
    node.style.left = Math.round(left) + 'px';
    node.style.top = Math.round(top) + 'px';
  }

  function show(target, content) {
    ensure();
    window.clearTimeout(hideTimer);
    paint(content);
    node.hidden = false;
    node.style.left = '-9999px';
    place(target);
    node.classList.add('is-visible');
    target.setAttribute('aria-describedby', node.id);
    current = target;
  }

  function hide() {
    window.clearTimeout(hideTimer);
    if (!node || !current) return;
    node.classList.remove('is-visible');
    node.hidden = true;
    current.removeAttribute('aria-describedby');
    current = null;
  }

  /**
   * attach(element, textFn)
   * `textFn` is called every time the bubble opens, so a toggle can
   * describe the state it is in right now.
   */
  LDK.tip = {
    attach: function (element, textFn) {
      if (!element) return;

      function open() { show(element, textFn()); }

      element.addEventListener('mouseenter', open);
      element.addEventListener('focus', open);
      element.addEventListener('mouseleave', hide);
      element.addEventListener('blur', hide);

      /* After a tap the label is stale for a moment, so re-read it. */
      element.addEventListener('click', function () {
        window.setTimeout(function () {
          show(element, textFn());
          hideTimer = window.setTimeout(hide, TAP_MS);
        }, 0);
      });
    },

    hide: hide
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hide();
  });
  window.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);

})(window.LDK = window.LDK || {});
