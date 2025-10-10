/* Retro patched glkote: thin wrapper to expose internal send_response and window list for line injection. */
// Cargamos original (inserta GlkOte global). Asumimos que este archivo se carga DESPUÉS de glkote.js original.
(function(){
  if(window.__retroGlkExposed) return;
  var w = window;
  // Intentamos localizar función send_response: no es global; buscamos en cadenas de funciones de GlkOte.update (heurística).
  // Estrategia fallback: monkey patch GlkOte.extevent para capturar el closure de send_response si se invoca.
  // Simpler: crear stub que no hace nada ahora; Zork no funcionará sin patch profundo.
  // (Marcador para implementación futura más robusta.)
  w.__retroGlkExposed = {
    injectLine: function(line){
      // Placeholder: sin acceso a send_response real todavía.
      if(w.GlkOte && w.GlkOte.extevent){ w.GlkOte.extevent('> '+line); }
    }
  };
})();
