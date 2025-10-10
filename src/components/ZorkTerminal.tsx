import React, { useEffect, useRef, useState } from 'react';

/*
  ZorkTerminal (placeholder)
  ==================================
  Implementa un intérprete súper simplificado que reconoce unos pocos comandos
  para simular la experiencia inicial de Zork. (El juego original es contenido
  con copyright, así que aquí sólo damos una mini demo gratuita.)

  TODO futuro: Integrar un motor IF open-source o un Z-Machine runner WASM
  cuando se valide licencia de un story file de dominio público.
*/

interface Line { id:number; text:string; cls?:string }

const INTRO = [
  'ZORK I: The Great Underground Empire (mini demo)',
  'Esta es una versión reducida de muestra. Escribe "ayuda" para comandos.',
  '',
  'Te encuentras frente a una casa blanca con una puerta cerrada.',
];

export default function ZorkTerminal(){
  const [lines,setLines] = useState<Line[]>(()=> INTRO.map((t,i)=>({id:i,text:t})));
  const [input,setInput] = useState('');
  const [counter,setCounter] = useState(INTRO.length);
  const viewRef = useRef<HTMLDivElement>(null);

  const push = (text:string, cls?:string) => {
    setLines(l=> [...l, { id: counter + 1, text, cls }]);
    setCounter(c=> c+1);
  };

  const handle = (raw:string) => {
    const cmd = raw.trim().toLowerCase();
    if(!cmd){ push('>'); return; }
    push('> '+raw,'cmd');
    if(cmd==='ayuda' || cmd==='help'){
      push('Comandos: norte, sur, entrar, abrir puerta, mirar, inventario, limpiar, reiniciar');
      return;
    }
    if(cmd==='mirar'){
      push('Casa blanca, puerta cerrada. Hay un buzón viejo.');
      return;
    }
    if(cmd==='inventario'){
      push('No llevas nada.');
      return;
    }
    if(cmd==='abrir puerta'){
      push('La puerta está cerrada con llave.');
      return;
    }
    if(cmd==='entrar'){
      push('No puedes, la puerta está cerrada.');
      return;
    }
    if(cmd==='norte'){
      push('Un denso bosque bloquea el paso.');
      return;
    }
    if(cmd==='sur'){
      push('Un precipicio impide avanzar.');
      return;
    }
    if(cmd==='limpiar' || cmd==='clear'){
      setLines([]); return;
    }
    if(cmd==='reiniciar' || cmd==='restart'){
      setLines(INTRO.map((t,i)=>({id:i,text:t}))); setCounter(INTRO.length); return;
    }
    push('No entiendo eso.');
  };

  const onSubmit = (e:React.FormEvent)=>{ e.preventDefault(); const v=input; setInput(''); handle(v); };

  useEffect(()=>{ viewRef.current?.scrollTo({ top: viewRef.current.scrollHeight }); },[lines]);

  return (
    <div className="w-full h-full bg-black text-green-400 font-mono text-[12px] flex flex-col">
      <div ref={viewRef} className="flex-1 overflow-auto p-2 space-y-[2px]">
        {lines.map(l=> <div key={l.id} className={l.cls==='cmd'? 'text-green-200':'text-green-400'}>{l.text}</div>)}
      </div>
      <form onSubmit={onSubmit} className="flex border-t border-green-700">
        <span className="px-2 py-1">&gt;</span>
        <input autoFocus value={input} onChange={e=> setInput(e.target.value)} className="flex-1 bg-black text-green-300 outline-none px-0 py-1" />
      </form>
    </div>
  );
}
