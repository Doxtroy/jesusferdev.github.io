// Minimal headless Glk implementation capturing text buffer output for Quixe.
// Focus: enough for a standard text adventure: one text buffer window, line input requests.
// We ignore window splits, styles, images, sound, timers (optional future work).

export interface MicroGlkOptions {
  onLineRequest?: () => void; // called when the game asks for user input
  onOutput?: (lines: string[]) => void; // emitted lines appended to transcript
  transcriptCapacity?: number; // max stored lines
}

interface WindowRecord { id: number; type: number; buffer: string[]; line_request?: boolean; }

// Subset of constants used by quixe/glk.
const Const = {
  wintype_TextBuffer: 3,
  evtype_None: 0,
  evtype_CharInput: 2,
  evtype_LineInput: 3,
};

export class MicroGlk {
  private windows: Map<number, WindowRecord> = new Map();
  private nextWinId = 1;
  private rootWin: WindowRecord | null = null;
  private lineWaitingWin: WindowRecord | null = null;
  private options: MicroGlkOptions;
  private transcript: string[] = [];

  constructor(opts: MicroGlkOptions = {}){ this.options = opts; }

  getlibrary(name: string){ if(name === 'GlkOte') return this; return null; }
  fatal_error(msg: string){ this.push('[FATAL] '+msg); }
  log(_msg: string){}

  // Called by GiDispa init
  glk_window_open(_split: any, _method: number, _size: number, type: number, _rock: number){
    // Only one text buffer window supported; reuse if exists.
    if(type !== Const.wintype_TextBuffer) throw new Error('Only TextBuffer supported');
    if(this.rootWin) return this.rootWin; 
    const rec: WindowRecord = { id: this.nextWinId++, type, buffer: [] };
    this.windows.set(rec.id, rec); this.rootWin = rec; return rec;
  }

  glk_window_get_root(){ return this.rootWin; }
  glk_window_close(win: WindowRecord){ if(win === this.rootWin){ this.windows.delete(win.id); this.rootWin=null; } }

  // Output primitives used by compiled game via dispatch (see gi_dispa table: put_string / put_char etc)
  glk_put_string(str: string){ this.push(str); }
  glk_put_char(ch: number){ this.push(String.fromCharCode(ch)); }
  glk_put_buffer(arr: number[]){ this.push(String.fromCharCode(...arr)); }
  glk_put_buffer_stream(_stream: any, arr: number[]){ this.glk_put_buffer(arr); }
  glk_put_string_stream(_stream: any, str: string){ this.glk_put_string(str); }
  glk_put_char_stream(_stream: any, ch: number){ this.glk_put_char(ch); }
  glk_set_style(_style: number){}

  // Input requests
  glk_request_line_event(win: WindowRecord, _buf: any, _len: number){
    if(!win) return; win.line_request = true; this.lineWaitingWin = win; this.options.onLineRequest?.();
  }
  glk_cancel_line_event(win: WindowRecord){ if(win){ win.line_request=false; if(this.lineWaitingWin===win) this.lineWaitingWin=null; } }

  // Called by host when user provides a line.
  accept_line(text: string){
    if(!this.lineWaitingWin) return; 
    const win = this.lineWaitingWin; win.line_request=false; this.lineWaitingWin=null;
    // Echo command with > prompt
    this.push('> '+text);
    // Provide event back to VM via callback path set by GiDispa (we store handler during init)
    if((this as any).accept){
      (this as any).accept({ type: 'line', window: win.id, value: text, gen: 0 });
    }
  }

  // Quixe/GlkOte expect update() to flush layout changes. We'll mimic minimal structure.
  update(_delta: any){ /* no-op for headless */ }

  // Utility to collect output lines and emit
  private push(raw: string){
    const lines = raw.split(/\r?\n/);
    for(const ln of lines){ if(!ln) continue; this.transcript.push(ln); if(this.options.transcriptCapacity && this.transcript.length>this.options.transcriptCapacity){ this.transcript.shift(); } }
    this.options.onOutput?.(lines.filter(Boolean));
  }

  dumpTranscript(){ return [...this.transcript]; }
}
