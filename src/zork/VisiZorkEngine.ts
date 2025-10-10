// VisiZorkEngine.ts
// Headless adapter for the "Visible Zorker" stack (Gnusto Z-machine engine)
// Loads visizork-master JS assets via Vite ?raw imports, injects them, and
// drives GnustoEngine directly (no DOM GlkOte). Captures console output and
// handles input/save/restore.

// Important: relies on project having visizork-master/js in the repo.
// Vite supports ?raw to import text; we then inject the scripts in-order.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite raw imports
import libJs from '../../visizork-master/js/lib.js?raw';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ifvmsJs from '../../visizork-master/js/ifvms.js?raw';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import gnustoJs from '../../visizork-master/js/gnusto.js?raw';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import zorkImageJs from '../../visizork-master/js/zork1-r88-s840726.z3.js?raw';

export interface LoadProgress { percent: number; label: string }

export interface VisiZorkEngine {
  readonly ready: boolean;
  readonly introLines?: string[];
  send(command: string): Promise<string[]>;
  dispose(): void;
  save(): boolean;
  restore(): boolean;
}

export async function loadVisiZorkEngine(onProgress: (p:LoadProgress)=>void): Promise<VisiZorkEngine> {
  const G = globalThis as any;
  // Step 1: inject minimal helper for base64 story loader used by zork1-*.js
  onProgress({ percent: 5, label: 'Preparando runtime' });
  ensureProcessBase64();

  // Step 2: inject required scripts in order
  onProgress({ percent: 20, label: 'Cargando librerías' });
  injectScriptText(libJs, 'visi-lib');
  onProgress({ percent: 40, label: 'Cargando VM (ifvms)' });
  injectScriptText(ifvmsJs, 'visi-ifvms');
  onProgress({ percent: 55, label: 'Cargando motor Gnusto' });
  injectScriptText(gnustoJs, 'visi-gnusto');
  // Workaround: gnusto uses free vars m_report_* inside methods; ensure they exist
  injectScriptText('var m_report_info=null,m_report_accum=null,m_report_counter=0,m_last_report=null;', 'visi-gnusto-report-vars');
  if (!G.GnustoEngine) throw new Error('GnustoEngine no disponible.');
  // Step 3: load embedded z-machine image
  onProgress({ percent: 70, label: 'Cargando imagen Zork' });
  injectScriptText(zorkImageJs, 'visi-zork-image'); // sets window.gameimage
  if (!G.gameimage) throw new Error('No se pudo cargar la imagen de Zork.');

  // Step 4: bootstrap engine and run until first input
  onProgress({ percent: 85, label: 'Inicializando motor' });
  const engine = new G.GnustoEngine((_msg: string)=>{ /* optional log */ });
  engine.loadStory(G.gameimage);
  // Minimal VM report setup to avoid references failing; mirrors GnustoRunner.init
  try { engine.prepare_vm_report?.({ MAX_OBJECTS: 0, MAX_GLOBALS: 0, PROP_TABLE_START: 0, PROP_TABLE_END: 0, C_TABLE_LEN: 0, C_TABLE_GLOB: 0 }); } catch {}

  // Helper: run engine to next input or output flush
  const captureLines = (txt: string): string[] => txt.split(/\r?\n/).map(s=>s.replace(/\u0000/g,'')).filter(Boolean);
  const stepUntilPrompt = (): string[] => {
    const out: string[] = [];
    let guard = 0;
    while (guard++ < 2000) {
      try {
        try { engine.reset_vm_report?.(); } catch {}
        engine.run();
      } catch (e) { out.push('[error] '+(e as Error).message); break; }
      const txt = engine.consoleText?.() || '';
      if (txt) out.push(...captureLines(txt));
      const eff0 = engine.effect?.(0);
  // Stop only when engine is waiting for input, or quit/save/restore
  if (eff0 === 'RS' || eff0 === 'RC' || eff0 === 'QU' || eff0 === 'DS' || eff0 === 'DR') break;
    }
    return out;
  };

  const intro = stepUntilPrompt();
  onProgress({ percent: 100, label: 'Motor listo' });

  // Implement save/restore bridging using localStorage
  const LS_KEY = 'visi-zork-quetzal';
  function doSave(): boolean {
    try {
      engine.saveGame?.();
      const bytes: Uint8Array = engine.saveGameData?.();
      if (!bytes || !bytes.length) return false;
      const b64 = u8ToB64(bytes);
      localStorage.setItem(LS_KEY, b64);
      return true;
    } catch { return false; }
  }
  function doRestore(): boolean {
    try {
      const b64 = localStorage.getItem(LS_KEY);
      if (!b64) return false;
      const bytes = b64ToU8(b64);
      engine.loadSavedGame?.(bytes);
      return true;
    } catch { return false; }
  }

  const api: VisiZorkEngine = {
    get ready(){ return true; },
    introLines: intro,
    async send(raw: string): Promise<string[]> {
      const cmd = raw.trim();
      if (!cmd) return [''];
      // Manual commands for save/restore (optional)
      if (cmd.toLowerCase() === 'save' || cmd.toLowerCase() === 'guardar') {
        return [ doSave() ? 'Saved.' : 'Save failed.' ];
      }
      if (cmd.toLowerCase() === 'restore' || cmd.toLowerCase() === 'cargar') {
        const ok = doRestore();
        const out = stepUntilPrompt();
        return [ ok ? 'Restored.' : 'No saved game.', ...out ];
      }

      // Feed a line to the engine (ZSCII newline 13 as terminator)
      try {
        engine.answer?.(0, 13);
        engine.answer?.(1, cmd || '');
      } catch {}

      const out: string[] = [];
      let guard = 0;
      while (guard++ < 2000) {
        try { engine.reset_vm_report?.(); } catch {}
        engine.run();
        const eff = engine.effect?.(0);
        const txt = engine.consoleText?.() || '';
        if (txt) out.push(...captureLines(txt));
        // Handle SAVE/RESTORE effects initiated by game
        if (eff === 'DS') { // SAVE
          const ok = doSave();
          try { engine.answer?.(0, ok ? 1 : 0); } catch {}
          continue;
        }
        if (eff === 'DR') { // RESTORE
          const ok = doRestore();
          try { engine.answer?.(0, ok ? 1 : 0); } catch {}
          continue;
        }
        if (eff === 'RS' || eff === 'RC' || eff === 'QU') break;
        if ((!eff || eff === 'undefined') && out.length) break;
      }
      return out.length ? out : ['(sin salida)'];
    },
    dispose(){ /* nothing to cleanup beyond globals */ },
    save: doSave,
    restore: doRestore,
  };

  return api;
}

// ---- helpers ----
function injectScriptText(code: string, id: string){
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.type = 'text/javascript';
  s.text = code;
  document.head.appendChild(s);
}

function ensureProcessBase64(){
  const G = globalThis as any;
  if (typeof G.processBase64Zcode === 'function') return;
  G.processBase64Zcode = function(base64data: string){
    const data = atob(base64data);
    const image = new Uint8Array(data.length);
    for(let ix=0; ix<data.length; ix++) image[ix] = data.charCodeAt(ix);
    G.gameimage = image;
  };
}

function u8ToB64(u8: Uint8Array): string {
  let s = '';
  for (let i=0;i<u8.length;i++) s += String.fromCharCode(u8[i]);
  // btoa on large strings can throw; chunk if needed
  try { return btoa(s); } catch {
    let out = '';
    const CHUNK = 0x8000;
    for (let i=0;i<s.length;i+=CHUNK) out += btoa(s.slice(i, i+CHUNK));
    return out;
  }
}
function b64ToU8(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i=0;i<bin.length;i++) out[i] = bin.charCodeAt(i);
  return out;
}
