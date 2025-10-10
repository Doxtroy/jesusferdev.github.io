import React, { useEffect, useRef, useState } from 'react';
import type { Project } from './ProjectsBody';

/* RetroTerminal
   Easter egg: escribir "zrok" (typo deliberado) o "unlock zork" monta el mini juego.
*/
interface Line { id:number; text:string; kind?:'cmd'|'sys'|'err' }

const WELCOME = [
  'RetroTerm v1.0 (demo) — escribe help para ayuda.',
  'Easter egg oculto disponible... (pero no se ve hasta que lo invoques).'
];

const HELP = 'Comandos: help, echo <txt>, clear, date, about, social, proyectos, exit, zork (o zork-es), salir (desde zork), reiniciar-zork';

export default function RetroTerminal({
  onRequestClose,
  projects,
  social,
  brand
}:{
  onRequestClose?:()=>void;
  projects?: Project[];
  social?: Record<string,string>;
  brand?: string;
}){
  const counterRef = useRef(WELCOME.length);
  const [lines,setLines] = useState<Line[]>(()=> WELCOME.map((t,i)=>({id:i,text:t,kind:'sys'})));
  const [input,setInput] = useState('');
  const engineRef = useRef<null | { send(cmd:string):Promise<string[]>; dispose():void; ready:boolean; introLines?:string[] }>(null);
  const loadingRef = useRef(false);
  const viewRef = useRef<HTMLDivElement>(null);

  const push=(text:string,kind?:Line['kind'])=> setLines(l=> {
    counterRef.current += 1;
    return [...l,{id:counterRef.current,text,kind}];
  });
  // Eliminado el effect de sincronización de id; ya no necesario.
  useEffect(()=>{ viewRef.current?.scrollTo({ top: viewRef.current.scrollHeight }); },[lines]);

  const handle= async (raw:string)=>{
    const cmd=raw.trim();
    if(!cmd){ push('>'); return; }
    push('> '+cmd,'cmd');
    const lower=cmd.toLowerCase();
    // Render content summaries in terminal (About / Social / Projects)
    if(['about','acerca','acerca de'].includes(lower)){
      const head = `About ${brand ?? 'Me'}`;
      const lines = [
        head,
        '- Procesador: El justo para pasar del día',
        '- Habilidades: Encender un mechero con los pies',
        '- Experiencia: Nunca suficientes para ti',
        '- Creatividad: 165 ZB de genialidad',
        'CV: (ver ventana About para enlace)',
      ];
      lines.forEach(t=> push(t,'sys'));
      return;
    }
    if(['social','redes'].includes(lower)){
      const entries = social? Object.entries(social) : [];
      if(!entries.length){ push('Social: (sin enlaces)','sys'); return; }
      push('Social Links:','sys');
      entries.forEach(([k,v])=> push(`- ${k}: ${v}`,'sys'));
      return;
    }
    if(['proyectos','projects','listar proyectos','open projects'].includes(lower)){
      if(!projects?.length){ push('Projects: (vacío)','sys'); return; }
      push(`Projects (${projects.length}):`,'sys');
      projects.forEach((p,i)=>{
        push(`${i+1}. ${p.title} — ${p.short}`,'sys');
        if(p.tech?.length) push(`   Tech: ${p.tech.join(', ')}`,'sys');
        if(p.url) push(`   Link: ${p.url}`,'sys');
      });
      return;
    }

    // If Zork engine is active, show an in-app cheat sheet (many Zork images don't include HELP)
    if(engineRef.current && (lower==='help' || lower==='ayuda')){
      const lines = [
        'Ayuda de Zork (atajos y comandos):',
        '- Mirar alrededor: look (alias: l, mirar)',
        '- Ver inventario: inventory (alias: i, inventario)',
        '- Moverse: n/s/e/w, ne/nw/se/sw, up/down (alias: u/d)',
        '- Examinar/tomar/dejar: examine/take/drop <objeto>',
        '- Guardar/Cargar: save / restore (alias: guardar / cargar)',
        '- Verbos útiles: open/close, read, push/pull, attack, give, put',
        '- Preferencias: brief (descripciones cortas) / verbose (largas)',
        '- Otros: score, restart, quit',
        'Nota: Muchas versiones no entienden HELP; por eso mostramos esta ayuda.',
      ];
      lines.forEach(t=> push(t,'sys'));
      return;
    }
    if(lower==='help'){
      push(HELP,'sys');
      push('Atajos: escribe "proyectos", "about" o "social" para ver su contenido aquí mismo.','sys');
      return;
    }
    if(lower.startsWith('echo ')){ push(cmd.slice(5)); return; }
    if(lower==='clear'){ setLines([]); return; }
    if(lower==='date'){ push(new Date().toString(),'sys'); return; }
    if(lower==='about'){ push('RetroTerminal demo por Jesús — contiene un easter egg.','sys'); return; }
    if(lower==='exit'){ onRequestClose?.(); return; }
    if(lower==='zork' || lower==='zork-es'){
      if(engineRef.current){
        push('El motor Zork ya está cargado.','sys');
        return;
      }
      if(loadingRef.current){ push('Carga ya en progreso...','sys'); return; }
      loadingRef.current = true;
      push('Cargando Zork (VisiZork)...','sys');
      // Carga dinámica para code-splitting
      (async ()=>{
        try {
          const mod = await import('../zork/VisiZorkEngine');
          const engine = await mod.loadVisiZorkEngine(p=>{ push(`[${p.percent}%] ${p.label}`,'sys'); });
          engineRef.current = engine;
          push('Motor Zork listo. Escribe tus comandos. "salir" para cerrar.','sys');
          if(engine.introLines){ engine.introLines.forEach(l=> push(l)); }
        } catch(e){
          push('Error cargando Zork: '+(e as Error).message,'err');
        } finally {
          loadingRef.current = false;
        }
      })();
      return;
    }
    if(lower==='reiniciar-zork'){
      if(engineRef.current){
        engineRef.current.dispose();
        engineRef.current = null;
        push('Motor Zork descartado. Usa "zork" para cargar de nuevo.','sys');
      } else push('El motor aún no estaba cargado.','sys');
      return;
    }
    if((lower==='salir' || lower==='exit zork') && engineRef.current){
      engineRef.current.dispose();
      engineRef.current = null;
      push('[Salida de Zork]','sys');
      return;
    }
    if(engineRef.current){
      try {
        const out = await engineRef.current.send(cmd);
        out.forEach(line=> push(line));
      } catch(e){
        push('Error de motor: '+(e as Error).message,'err');
      }
      return;
    }
    push('Comando desconocido. (help)','err');
  };

  const onSubmit=async (e:React.FormEvent)=>{ e.preventDefault(); const v=input; setInput(''); await handle(v); };

  return (
    <div className="w-full h-full bg-[#111] text-green-400 font-mono text-[12px] flex flex-col">
      <div ref={viewRef} className="flex-1 overflow-auto p-2 space-y-[2px]">
        {lines.map(l=> <div key={l.id} className={l.kind==='cmd'?'text-green-200': l.kind==='err'?'text-red-400':'text-green-400'}>{l.text}</div>)}
      </div>
      <form onSubmit={onSubmit} className="flex border-t border-green-700">
        <span className="px-2 py-1">$</span>
        <input autoFocus value={input} onChange={e=> setInput(e.target.value)} className="flex-1 bg-[#111] text-green-300 outline-none px-0 py-1" />
      </form>
    </div>
  );
}
