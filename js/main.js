/* Memory LDK - entry point */
(function () {
  'use strict';
  function boot() { window.LDK.start(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
