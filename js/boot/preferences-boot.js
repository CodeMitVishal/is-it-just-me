// Runs in <head> BEFORE the page paints (classic script, not a module), so a saved
// theme / font / language never flashes the wrong look. Allowed values must match
// PREFERENCE_OPTIONS in js/application/preferences.js.
(function () {
  var OPTIONS = { theme: ['light', 'dark', 'contrast'], font: ['modern', 'easy', 'friendly'], lang: ['en', 'de', 'hi'] };
  var root = document.documentElement;

  function saved(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } }
  function matches(query) { try { return window.matchMedia(query).matches; } catch (e) { return false; } }
  function allowed(name, value) { return OPTIONS[name].indexOf(value) >= 0; }

  var theme = saved('theme');
  if (!allowed('theme', theme)) {
    theme = matches('(prefers-contrast: more)') ? 'contrast' : matches('(prefers-color-scheme: dark)') ? 'dark' : 'light';
  }
  var font = saved('font');
  if (!allowed('font', font)) font = 'modern';
  var lang = saved('lang');
  if (!allowed('lang', lang)) {
    var browser = String(navigator.language || 'en').slice(0, 2).toLowerCase();
    lang = allowed('lang', browser) ? browser : 'en';
  }

  root.setAttribute('data-theme', theme);
  root.setAttribute('data-font', font);
  root.setAttribute('lang', lang);
})();
