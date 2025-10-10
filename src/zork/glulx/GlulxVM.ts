// GlulxVM.ts
// Skeleton of a minimal Glulx interpreter (stub). This will be expanded incrementally.
// Goals now:
//  - Load memory image
//  - Maintain registers (PC, SP, FP)
//  - Provide step() and runUntilOutput() that currently just simulates output
//  - Channel collector for MAIN text
//  - Deterministic PRNG (simple LCG for now)
//  - Public API: constructor(image:ArrayBuffer), reset(), sendCommand(text:string)

export interface VMOptions {
  onOutput?: (channel: string, text: string) => void;
}

export class GlulxVM {
  private image: DataView;
  private mem: Uint8Array; // working memory copy
  private pc = 0;
  private sp = 0;
  private fp = 0;
  private rngSeed = 0x12345678;
  private onOutput?: (channel: string, text: string) => void;

  constructor(image: ArrayBuffer, opts: VMOptions = {}) {
    this.image = new DataView(image);
    this.mem = new Uint8Array(image.slice(0)); // simple copy now
    this.onOutput = opts.onOutput;
    // Minimal header parse just to set starting PC (offset 24) if Glulx
    if(this.readStr(0,4)==='Glul'){
      this.pc = this.image.getUint32(24,false); // startfunc
      this.sp = 0; // real impl sets to end of RAM + stacksize
      this.fp = 0;
    }
  }

  reset(){
    // Reset registers, memory copy, and RNG.
    const buf = this.image.buffer;
    this.mem = new Uint8Array(buf.slice(0));
    if(this.readStr(0,4)==='Glul'){
      this.pc = this.image.getUint32(24,false);
    } else {
      this.pc = 0;
    }
    this.sp = 0; this.fp = 0; this.rngSeed = 0x12345678;
  }

  exportState(){
    return {
      pc: this.pc,
      sp: this.sp,
      fp: this.fp,
      rngSeed: this.rngSeed
      // Nota: No exportamos memoria todavía (sería grande); para juego real habrá que persistir RAM.
    };
  }

  importState(state: any){
    if(state && typeof state==='object'){
      if(typeof state.pc==='number') this.pc = state.pc;
      if(typeof state.sp==='number') this.sp = state.sp;
      if(typeof state.fp==='number') this.fp = state.fp;
      if(typeof state.rngSeed==='number') this.rngSeed = state.rngSeed >>>0;
    }
  }

  // Expose some registers for debug (will be handy later and silences unused warnings).
  get registers(){
    return { pc: this.pc, sp: this.sp, fp: this.fp, memBytes: this.mem.length };
  }

  private readStr(off:number,len:number){
    let s='';
    for(let i=0;i<len;i++) s += String.fromCharCode(this.image.getUint8(off+i));
    return s;
  }

  private lcg(){
    // simple LCG for reproducibility
    this.rngSeed = ( (this.rngSeed * 1664525) + 1013904223 ) >>> 0;
    return this.rngSeed;
  }

  step(): boolean {
    // Placeholder: real implementation would decode opcode at pc.
    // For now we just return false to indicate no more work.
    return false;
  }

  runUntilOutput(maxSteps=1000){
    for(let i=0;i<maxSteps;i++){
      const cont = this.step();
      if(!cont) break;
    }
  }

  // For now, command handling is simulated. Later we will map this to game input buffer & restart run loop.
  sendCommand(text: string): string[] {
    const out: string[] = [];
    const lower = text.trim().toLowerCase();
    if(!text.trim()) return [''];
    if(lower==='mirar'){
      const { pc } = this.registers;
      out.push('Te encuentras (VM stub) en una sala abstracta. PC=0x'+pc.toString(16));
    } else if(lower==='inventario'){
      out.push('Llevas: (VM stub) nada tangible aún.');
    } else if(lower==='ayuda'){
      out.push('Ayuda (VM stub): comandos disponibles mirar, inventario, ayuda, reiniciar, header');
    } else if(lower==='reiniciar'){
      this.reset();
      out.push('[VM stub reiniciada]');
    } else if(lower==='azar'){
      out.push('Número pseudo-aleatorio: '+ (this.lcg() & 0xffff));
    } else if(lower==='regs'){
      const r = this.registers;
      out.push(`PC=0x${r.pc.toString(16)} SP=${r.sp} FP=${r.fp} MEM=${r.memBytes}B`);
    } else {
      out.push('VM stub: No implementado "'+text+'"');
    }
    // Simulate output callback
    if(this.onOutput){ out.forEach(line=> this.onOutput!('MAIN', line)); }
    return out;
  }
}
