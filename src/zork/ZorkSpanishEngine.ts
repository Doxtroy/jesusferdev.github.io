// ZorkSpanishEngine.ts
// Carga diferida (lazy) y stub de integración del motor Zork español.
// Paso C: arquitectura con loader + barra/porcentajes simulados que deja listo
// el punto de inserción del intérprete real (Glulx / FyreVM) a futuro.
// Integra Quixe (intérprete Glulx) de quixe-master de forma dinámica en lugar del VM stub.
// Mantiene fallback al stub si Quixe falla.
import { GlulxVM } from './glulx/GlulxVM';
// import { MicroGlk } from './micro/MicroGlk'; // (reservado para futuras mejoras directas)

export interface ZorkSpanishEngineOptions {
  ulxPath?: string;
}

export interface ZorkSpanishEngine {
  readonly ready: boolean;
  readonly introLines?: string[]; // líneas que se pueden mostrar justo tras la carga
  send(command: string): Promise<string[]>; // devuelve líneas de salida
  dispose(): void;
}

export interface LoadProgress { percent: number; label: string; }

export async function loadZorkSpanishEngine(
  onProgress: (p: LoadProgress)=>void,
  opts: ZorkSpanishEngineOptions = {}
): Promise<ZorkSpanishEngine> {
  const ulxPath = opts.ulxPath || '/zork-spanish-bot-master/messages/zork.ulx';
  // Fases de progreso simuladas + fetch real del ULX para verificar disponibilidad.
  const steps: LoadProgress[] = [
    { percent: 5, label: 'Inicializando loader' },
    { percent: 15, label: 'Buscando archivo ULX' },
    { percent: 35, label: 'Descargando zork.ulx' },
    { percent: 55, label: 'Leyendo cabecera' },
    { percent: 75, label: 'Preparando memoria (stub)' },
    { percent: 90, label: 'Compilando estructuras (pendiente motor real)' },
    { percent: 100, label: 'Listo (modo stub)' }
  ];

  function pulse(i: number) {
    const s = steps[i];
    if (s) onProgress(s);
  }

  pulse(0);
  await wait(120);
  pulse(1);
  await wait(100);
  pulse(2);
  let ulxBuf: ArrayBuffer | null = null;
  try {
    const res = await fetch(ulxPath);
    if(!res.ok) throw new Error('HTTP '+res.status);
    ulxBuf = await res.arrayBuffer();
  } catch (e) {
    onProgress({percent: 100, label: 'Error al descargar ULX: '+(e as Error).message});
    throw e;
  }
  pulse(3);
  await wait(80);
  // Parseamos header Glulx (si es Glulx) para poder mostrar metadatos reales.
  let headerInfo: GlulxHeader | null = null;
  if(ulxBuf){
    headerInfo = parseGlulxHeader(ulxBuf);
  }
  pulse(4);
  await wait(80);
  // Aquí se inyectaría la creación real del Engine FyreVM con la imagen ULX.
  pulse(5);
  await wait(140);
  pulse(6);

  // Intento de integración Quixe: si carga correctamente, sustituirá al stub VM.
  let vm: GlulxVM | null = null; // stub fallback
  let quixeAdapter: QuixeAdapter | null = null;
  let quixeError: string | null = null;
  if(ulxBuf){
    try {
  // Intent: usar adapter headless (GiLoad+GlkAPI con GlkOte stub) más estable que parchear glkote.
  quixeAdapter = await initQuixeHeadlessAdapter(ulxBuf, onProgress);
    } catch(e){
      quixeError = (e as Error).message;
      // Fallback al stub
      const outputLog: string[] = [];
      vm = new GlulxVM(ulxBuf, {
        onOutput: (channel, text)=> {
          outputLog.push(`[${channel}] ${text}`);
          if(outputLog.length>100) outputLog.shift();
        }
      });
    }
  }

  const introLines: string[] = [];
  const runningReal = !!quixeAdapter && !quixeError;
  const asciiLogo = [
    '  ______      _      _  __',
    ' /__  __/____| | /| / |/ /  Z O R K  (ES)',
    '   / /  / __/| |/ |/   / ',
    '  / /__/ /__ |__/|__/ /   Aventura interactiva',
    runningReal ? '  \\____/\\___/     /_/    (intérprete Glulx activo)' : '  \\____/\\___/     /_/    (modo stub / fallback)'
  ];
  introLines.push(...asciiLogo);
  if(headerInfo){
    introLines.push(
      `${runningReal? 'Zork ES —':'Zork ES (stub) —'} Imagen Glulx detectada (tamaño ${ulxBuf!.byteLength} bytes)`,
      `Version: ${headerInfo.version} | RAM starts @ 0x${headerInfo.ramstart.toString(16)} | Initial PC: 0x${headerInfo.startfunc.toString(16)}`,
      runningReal? 'Intérprete listo. Escribe comandos para jugar.' : 'Modo stub: los comandos reales aún no funcionan (fallback).'
    );
  } else {
    introLines.push('No se pudo leer cabecera Glulx — imagen desconocida (stub).');
  }

  const engine: ZorkSpanishEngine = {
    get ready(){ return true; },
    introLines,
    async send(command: string){
      const raw = command.trim();
      if(!raw) return [''];
      const lower = raw.toLowerCase();
      if(lower==='reiniciar'){
        if(quixeAdapter){ quixeAdapter.reset(); return ['[Quixe] Reinicio de sesión (nota: reinicio total limitado).']; }
        vm?.reset(); return ['[VM] Reiniciada (stub).'];
      }
      if(lower==='guardar'){
        if(quixeAdapter){
          const ok = quixeAdapter.save();
          return [ ok ? '[OK] Partida guardada (Quixe autosave).' : '[Error] No se pudo guardar.' ];
        }
        if(!vm) return ['Motor no inicializado'];
        try { const data = vm.exportState(); localStorage.setItem('zork-es-state', JSON.stringify(data)); return ['[OK] Estado guardado (parcial).']; } catch(e){ return ['[Error] No se pudo guardar: '+(e as Error).message]; }
      }
      if(lower==='cargar'){
        if(quixeAdapter){
          const ok = quixeAdapter.restore();
            return [ ok ? '[OK] Partida restaurada.' : 'No hay partida guardada.' ];
        }
        if(!vm) return ['Motor no inicializado'];
        try { const rawState = localStorage.getItem('zork-es-state'); if(!rawState) return ['No hay estado guardado.']; const data = JSON.parse(rawState); vm.importState(data); return ['[OK] Estado cargado (parcial).']; } catch(e){ return ['[Error] No se pudo cargar: '+(e as Error).message]; }
      }
      if(lower==='header' || lower==='cabecera'){
        if(headerInfo){
          return [
            '--- Glulx Header ---',
            `Magic: ${headerInfo.magic} Version: ${headerInfo.version}`,
            `RAMStart: 0x${headerInfo.ramstart.toString(16)}`,
            `ExtStart: 0x${headerInfo.extstart.toString(16)}`,
            `EndMem: 0x${headerInfo.endmem.toString(16)}`,
            `StackSize: ${headerInfo.stacksize}`,
            `StartFunc (PC initial): 0x${headerInfo.startfunc.toString(16)}`,
            '--------------------'
          ];
        } else return ['No hay información de cabecera disponible.'];
      }
      if(quixeError) return ['Fallo al iniciar Quixe: '+quixeError];
      if(quixeAdapter){
        const out = await quixeAdapter.send(raw);
        return out.length? out : ['(sin salida)'];
      }
      if(!vm) return ['Motor no inicializado.'];
      return vm.sendCommand(raw);
    },
    dispose(){ vm = null; quixeAdapter?.dispose(); quixeAdapter=null; }
  };

  return engine;
}

function wait(ms: number){ return new Promise(r=> setTimeout(r, ms)); }

// ---- Glulx header parsing helpers (mínimo necesario para metadatos) ----
interface GlulxHeader {
  magic: string;
  version: string;
  ramstart: number;
  extstart: number;
  endmem: number;
  stacksize: number;
  startfunc: number; // initial PC address (start function)
}

function parseGlulxHeader(buf: ArrayBuffer): GlulxHeader | null {
  if(buf.byteLength < 36) return null; // header mínimo
  const dv = new DataView(buf);
  const magic = readStr(dv,0,4);
  if(magic !== 'Glul') return null;
  const version = [dv.getUint8(4),dv.getUint8(5),dv.getUint8(6),dv.getUint8(7)].join('.');
  const ramstart = dv.getUint32(8,false);
  const extstart = dv.getUint32(12,false);
  const endmem   = dv.getUint32(16,false);
  const stacksize= dv.getUint32(20,false);
  const startfunc= dv.getUint32(24,false);
  return {magic, version, ramstart, extstart, endmem, stacksize, startfunc};
}

function readStr(dv: DataView, off: number, len: number): string {
  let s='';
  for(let i=0;i<len;i++) s += String.fromCharCode(dv.getUint8(off+i));
  return s;
}

// --- Quixe Integration Layer ---

interface QuixeAdapter {
  send(cmd: string): Promise<string[]>;
  reset(): void;
  save(): boolean;
  restore(): boolean;
  dispose(): void;
}

// === Headless adapter usando GiLoad + GlkAPI + GlkOte stub para capturar salida ===
async function initQuixeHeadlessAdapter(ulx:ArrayBuffer, progress:(p:LoadProgress)=>void): Promise<QuixeAdapter> {
  progress({percent: 76, label: 'Cargando Quixe (headless)'});
  await ensureScript('/quixe/gi_dispa.js');
  await ensureScript('/quixe/gi_load.js');
  await ensureScript('/quixe/quixe.js');
  await ensureScript('/quixe/glkapi.js');
  const g:any = (globalThis as any);
  if(!g.GiLoadClass || !g.GiDispaClass || !g.QuixeClass || !g.GlkClass) throw new Error('Componentes Quixe incompletos (verifica /public/quixe)');
  const GiLoad = new g.GiLoadClass();
  const GiDispa = new g.GiDispaClass();
  const Quixe = new g.QuixeClass();
  const Glk = new g.GlkClass();
  const outputLines:string[] = []; let lastIdx=0; let mainWinId:number|null=null; let gen=0;
  const glkOteStub = {
    log: (_m:string)=>{},
    fatal_error: (msg:string)=> { outputLines.push('[FATAL] '+msg); },
    getlibrary: (_n:string)=> null,
    init: (opts:any)=> { opts.accept({ type:'init', gen: gen++, metrics:{ width:80,height:25 } }); },
    update: (delta:any)=> {
      if(delta?.windows){ for(const w of delta.windows){ if(w.id && (w.text||w.content)){ if(mainWinId==null) mainWinId=w.id; const groups=[...(w.text||[]), ...(w.content||[])]; for(const g2 of groups){ if(g2?.content) push(g2.content); if(Array.isArray(g2?.text)){ for(const t of g2.text){ if(t?.content) push(t.content); } } } } } }
      if(delta?.content){ for(const c of delta.content){ if(c?.text){ for(const t of c.text){ if(t?.content) push(t.content); } } } }
    }
  };
  function push(line:string){ if(!line) return; outputLines.push(line); }
  push('[diag] Scripts cargados: ' + ['GiDispaClass','GiLoadClass','QuixeClass','GlkClass'].filter(k=> !!g[k+'']).join(','));
  (globalThis as any).Glk = Glk; // requerido por gi_load para defaults
  const bytes = Array.from(new Uint8Array(ulx));
  try {
    GiLoad.load_run({ GlkOte: glkOteStub, GiDispa, vm: Quixe }, bytes, { format:'array' });
    push('[diag] GiLoad.load_run ejecutado');
  } catch(e){ push('[diag][error] load_run: '+(e as Error).message); }
  function collect(): string[]{ if(lastIdx<outputLines.length){ const slice=outputLines.slice(lastIdx); lastIdx=outputLines.length; return slice; } return []; }
  function sendLine(text:string){
    // Intentar acceder a función de aceptación. Glk internamente liga accept_ui_event en closure; exponemos hack si disponible.
    const maybe = (Glk as any).accept_ui_event || (glkOteStub as any).accept;
    if(maybe){
      try { maybe({ type:'line', gen: gen++, window: mainWinId, value: text }); push('[diag] Línea inyectada'); }
      catch(e){ push('[diag][error] inyectar línea: '+(e as Error).message); }
    }
    else push('[Error] No accept_ui_event disponible');
  }
  const adapter: QuixeAdapter = {
    async send(cmd:string){ if(!cmd.trim()) return []; push('> '+cmd); sendLine(cmd); await new Promise(r=> setTimeout(r,0)); const out=collect(); return out.length? out : ['(sin salida)']; },
    reset(){}, save(){ return false; }, restore(){ return false; }, dispose(){}
  };
  collect();
  return adapter;
}

function ensureScript(src:string): Promise<void>{
  return new Promise((res,rej)=>{
    if(document.querySelector(`script[data-dyn='${src}']`)){ res(); return; }
    const s=document.createElement('script'); s.src=src; s.async=true; s.dataset.dyn=src; s.onload=()=>res(); s.onerror=()=>rej(new Error('No se pudo cargar '+src)); document.head.appendChild(s);
  });
}
