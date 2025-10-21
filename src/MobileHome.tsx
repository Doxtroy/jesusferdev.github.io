import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MailIcon, MonitorIcon, ChatIcon, GlobeIcon } from './components/icons/RetroIcons';
import AboutBody from './components/AboutBody';
import SocialBody from './components/SocialBody';
import ProjectsBody, { type Project } from './components/ProjectsBody';
import Window from './components/Window';
import DesktopIcon from './components/DesktopIcon';
import MenuBar from './components/MenuBar';
import RetroTerminal from './components/RetroTerminal';
import SettingsBody from './components/SettingsBody.tsx';

type WinKey = 'about' | 'projects' | 'social' | 'terminal' | 'settings';
interface RetroWindow { key:WinKey; title:string; x:number; y:number; w:number; h?:number; open:boolean; z:number; minimized?:boolean }
interface DesktopIconType { id:string; label:string; x:number; y:number; openKey?:WinKey; img?:{src:string;w?:number;h?:number} }

type Theme = 'classic' | 'phosphor' | 'amber';

const clamp = (v:number,min:number,max:number)=> Math.max(min, Math.min(max,v));
const loadWinPositions = ():Record<string,Partial<RetroWindow>> => { try { const raw=localStorage.getItem('retro-win-pos'); return raw? JSON.parse(raw):{}; } catch { return {}; } };
const saveWinPositions = (wins:RetroWindow[]) => { try { const o:Record<string,Partial<RetroWindow>>={}; wins.forEach(w=>{o[w.key]={x:w.x,y:w.y,w:w.w,h:w.h,z:w.z,open:w.open};}); localStorage.setItem('retro-win-pos', JSON.stringify(o)); } catch {} };
const loadIcons = ():DesktopIconType[]|null => { try { const raw=localStorage.getItem('retro-icons'); return raw? JSON.parse(raw):null;} catch { return null;} };
const saveIcons = (icons:DesktopIconType[]) => { try { localStorage.setItem('retro-icons', JSON.stringify(icons)); } catch {} };

export default function MobileHome(){
  const BRAND='JesusFerDev';
  const screenRef = useRef<HTMLDivElement>(null);
  const [maxZ,setMaxZ] = useState(10);
  const [isMobile,setIsMobile] = useState<boolean>(false);
  const [viewport,setViewport] = useState<{w:number;h:number}>(()=> ({ w: typeof window!=='undefined'? window.innerWidth: 1024, h: typeof window!=='undefined'? ((window as any).visualViewport?.height || window.innerHeight): 768 }));
  useEffect(()=>{
    const check = () => {
      const mqNarrow = window.matchMedia('(max-width: 768px)').matches;
      const mqCoarse = window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(mqNarrow || mqCoarse);
      const h = (window as any).visualViewport?.height ?? window.innerHeight;
      setViewport({ w: window.innerWidth, h });
    };
    check();
    window.addEventListener('resize', check);
    return ()=> window.removeEventListener('resize', check);
  },[]);

  const mobileIconBox = useMemo(()=>{
    if(!isMobile) return 92;
    const gap = 20;
    const singleCol = viewport.w <= 480;
    const targetCols = singleCol ? 1 : 2;
    const box = Math.floor((viewport.w - 32 - (targetCols-1)*gap) / targetCols);
    const minClamp = singleCol ? 150 : 130;
    const maxClamp = singleCol ? 190 : 175;
    return clamp(box, minClamp, maxClamp);
  },[isMobile, viewport.w]);
  const MENU_BAR_HEIGHT = isMobile? (viewport.w <= 430 ? 68 : (viewport.w <= 480 ? 62 : 56)) : 32;
  const SAFE_BOTTOM = isMobile ?  (viewport.w <= 480 ? 100 : 88) : 0;

  type WinDef = { x:number; y:number; w:number; h?:number };
  const defaultWinDefs:Record<WinKey,WinDef>={
    about:{x:140,y:MENU_BAR_HEIGHT+40,w:560,h:586},
    projects:{x:340,y:MENU_BAR_HEIGHT+80,w:860,h:520},
    social:{x:420,y:MENU_BAR_HEIGHT+120,w:640,h:360},
    terminal:{x:300,y:MENU_BAR_HEIGHT+160,w:640,h:460},
    settings:{x:200,y:MENU_BAR_HEIGHT+120,w:460,h:280}
  };

  const initialWins:RetroWindow[] = useMemo(()=>{
    const stored=loadWinPositions();
    const base:RetroWindow[]=[
      { key:'about', title:'About Jesús',  ...defaultWinDefs.about,  open:true,  z:10, h:586 },
      { key:'projects', title:'Projects',  ...defaultWinDefs.projects, open:false, z:9  },
      { key:'social', title:'Social Life', ...defaultWinDefs.social,   open:false, z:8  },
      { key:'terminal', title:'Terminal',   ...defaultWinDefs.terminal, open:false, z:7  },
      { key:'settings', title:'Settings', ...defaultWinDefs.settings, open:false, z:6 }
    ];
    return base.map(w=>({ ...w, ...(stored[w.key]||{}) }));
  },[]);
  const [wins,setWins] = useState<RetroWindow[]>(initialWins);
  useEffect(()=> saveWinPositions(wins),[wins]);

  const computeBase = (): string => {
    const baseEl = document.querySelector('base');
    if (baseEl) {
      const href = (baseEl as HTMLBaseElement).getAttribute('href') || '/';
      return href.endsWith('/') ? href : href + '/';
    }
    const path = window.location.pathname || '/';
    const m = path.match(/^(\/[\w.-]+\/)/);
    return m ? m[1] : '/';
  };
  const base = computeBase();

  const [theme,setTheme] = useState<Theme>(()=> {
    const t = localStorage.getItem('retro-theme');
    return (t==='phosphor'||t==='classic'||t==='amber')? (t as Theme) : 'classic';
  });
  useEffect(()=> { localStorage.setItem('retro-theme', theme); },[theme]);

  const bringToFront = (key:WinKey)=> setWins((p:RetroWindow[])=>{
    const next = maxZ + 1; setMaxZ(next);
    if(isMobile){
      return p.map((w:RetroWindow)=> w.key===key? { ...w, z:next, open:true, minimized:false } : { ...w, open:false });
    }
    return p.map((w:RetroWindow)=> w.key===key? { ...w, z:next, open:true, minimized:false }:w);
  });
  const setOpen = (key:WinKey, open:boolean) => setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=> w.key===key? { ...w, open }: w));

  const closeAll = () => setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=> ({...w, open:false})));
  const openAll  = () => setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=> ({...w, open:true })));
  const resetLayout = () => setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=> ({...w, ...defaultWinDefs[w.key]})));

  useEffect(()=>{
  const bounds = screenRef.current?.getBoundingClientRect();
    if(!bounds) return;
  const bw = bounds.width - 6; const bh = bounds.height - (6 + SAFE_BOTTOM);
    setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=> {
      const effectiveH = w.h ?? 360;
      return {
        ...w,
        x: clamp(w.x, 0, Math.max(0, bw - w.w)),
        y: clamp(w.y, MENU_BAR_HEIGHT, Math.max(MENU_BAR_HEIGHT, bh - effectiveH))
      };
    }));
  },[]);

  const useDragWin = (key:WinKey) => {
    const start=useRef<{x:number;y:number}|null>(null);
    const last=useRef<{x:number;y:number}|null>(null);
    const onPointerDown=(e:React.PointerEvent)=>{ (e.target as HTMLElement).setPointerCapture(e.pointerId); start.current={x:e.clientX,y:e.clientY}; last.current=start.current; bringToFront(key); };
  const onPointerMove=(e:React.PointerEvent)=>{ if(!start.current) return; const dx=e.clientX-(last.current?.x||e.clientX); const dy=e.clientY-(last.current?.y||e.clientY); last.current={x:e.clientX,y:e.clientY}; const bounds=screenRef.current?.getBoundingClientRect(); const bw=(bounds?.width||1200)-6; const bh=(bounds?.height||800)-(6+SAFE_BOTTOM); setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=>{ if(w.key!==key) return w; const effectiveH = w.h ?? 360; return { ...w, x:clamp(w.x+dx,0,Math.max(0,bw-w.w)), y:clamp(w.y+dy,MENU_BAR_HEIGHT,Math.max(MENU_BAR_HEIGHT,bh-effectiveH)) }; })); };
    const onPointerUp=(e:React.PointerEvent)=>{ (e.target as HTMLElement).releasePointerCapture(e.pointerId); start.current=null; last.current=null; };
    return { onPointerDown,onPointerMove,onPointerUp };
  };
  const useResizeWin = (key:WinKey) => {
    const start=useRef<{x:number;y:number;w:number;h:number}|null>(null);
    const onPointerDown=(e:React.PointerEvent)=>{ (e.target as HTMLElement).setPointerCapture(e.pointerId); const w=wins.find((v:RetroWindow)=>v.key===key)!; start.current={x:e.clientX,y:e.clientY,w:w.w,h:w.h ?? 360}; bringToFront(key); };
  const onPointerMove=(e:React.PointerEvent)=>{ if(!start.current) return; const dx=e.clientX-start.current.x; const dy=e.clientY-start.current.y; const bounds=screenRef.current?.getBoundingClientRect(); const bw=(bounds?.width||1200)-6; const bh=(bounds?.height||800)-(6+SAFE_BOTTOM); setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=>{ if(w.key!==key) return w; let newW=clamp(start.current!.w+dx,260,1500); let newH=clamp(start.current!.h+dy,160,900); newW=Math.min(newW, bw - w.x); newH=Math.min(newH, bh - w.y); return { ...w, w:newW, h:newH }; })); };
    const onPointerUp=(e:React.PointerEvent)=>{ (e.target as HTMLElement).releasePointerCapture(e.pointerId); start.current=null; };
    return { onPointerDown,onPointerMove,onPointerUp };
  };

  const dragAbout = useDragWin('about');
  const dragProjects = useDragWin('projects');
  const dragSocial = useDragWin('social');
  const dragTerminal = useDragWin('terminal');
  const dragSettings = useDragWin('settings');
  const resizeAbout = useResizeWin('about');
  const resizeProjects = useResizeWin('projects');
  const resizeSocial = useResizeWin('social');
  const resizeTerminal = useResizeWin('terminal');
  const resizeSettings = useResizeWin('settings');
  const dragMap = { about: dragAbout, projects: dragProjects, social: dragSocial, terminal: dragTerminal, settings: dragSettings } as const;
  const resizeMap = { about: resizeAbout, projects: resizeProjects, social: resizeSocial, terminal: resizeTerminal, settings: resizeSettings } as const;

  const defaultIcons:DesktopIconType[]=[
    { id:'proj',   label:'Projects',  x:24,y:MENU_BAR_HEIGHT+42,  openKey:'projects', img:{src:`${base}icons/projects.png`} },
    { id:'social', label:'Social',    x:24,y:MENU_BAR_HEIGHT+190, openKey:'social',   img:{src:`${base}icons/folder-heart.png`} },
    { id:'about',  label:'About Me',  x:24,y:MENU_BAR_HEIGHT+338, openKey:'about',    img:{src:`${base}icons/about.png`} },
    { id:'terminal', label:'Terminal', x:24,y:MENU_BAR_HEIGHT+486, openKey:'terminal', img:{src:`${base}icons/projects.png`} }
  ];
  const [icons,setIcons] = useState<DesktopIconType[]>(()=> loadIcons() ?? defaultIcons);
  useEffect(()=>{
    let changed = false;
    const normalized = icons.map(ic=>{
      const src = ic.img?.src;
      if(!src) return ic;
      if(src.startsWith('/icons/')){ changed = true; return { ...ic, img: { ...ic.img!, src: `${base}${src.slice(1)}` } }; }
      if(src.startsWith('icons/')){ changed = true; return { ...ic, img: { ...ic.img!, src: `${base}${src}` } }; }
      return ic;
    });
    if(changed) setIcons(normalized);
  },[base]);
  useEffect(()=> saveIcons(icons),[icons]);
  // Desktop icon marquee/drag logic not needed on dedicated mobile route; omitted

  const projects:Project[]=[
    { id:'ucm',      title:'Máster UCM', short:'Liderando el Futuro Sostenible', image:`${base}icons/projects.png`,      tech:['WordPress','JavaScript','PHP'] },
    { id:'coduck',   title:'Coduck',     short:'Plataforma de formación',       image:`${base}icons/projects.png`,   tech:['React','Node','PostgreSQL'] },
    { id:'madmusic', title:'MadMusic',   short:'Tienda de instrumentos',        image:`${base}icons/projects.png`, tech:['Next.js','Stripe'] }
  ];
  const [selectedProject,setSelectedProject] = useState<Project|null>(projects[0]);

  const [openMenu,setOpenMenu] = useState<string|null>(null); const closeMenus=()=> setOpenMenu(null);
  const menuItems = {
    Finder:[ {label:`${BRAND} (About)`, action:()=>bringToFront('about')}, {label:'Open Terminal', action:()=>bringToFront('terminal')}, {label:'---'}, {label:'Open All', action: openAll}, {label:'Close All', action: closeAll} ],
    File:[ {label:'Open About', action:()=>bringToFront('about')}, {label:'Open Projects', action:()=>bringToFront('projects')}, {label:'Open Social', action:()=>bringToFront('social')}, {label:'Open Terminal', action:()=>bringToFront('terminal')}, {label:'---'}, {label:'Reset Layout', action: resetLayout} ],
    Window:[ {label:'Bring All to Front', action: ()=>setWins(ws=> ws.map((w,i)=>({...w,z:10+i})))}, {label:'Cascade', action: ()=>setWins(ws=> ws.map((w,i)=>({...w,x: 90 + i*48, y: MENU_BAR_HEIGHT + 32 + i*48 })))}, ],
    View:[ {label:'Settings…', action:()=> bringToFront('settings')} ]
  } as const;
  const menuKeys = Object.keys(menuItems);

  const cursorPointer = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M1 1 L12 8 L8 9 L9 13 L7 14 L6 10 L2 12 Z' fill='black'/></svg>`);
  const cursorPointerHover = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M1 1 L12 8 L8 9 L9 13 L7 14 L6 10 L2 12 Z' fill='black'/><rect x='9' y='9' width='3' height='3' fill='white' stroke='black' stroke-width='0.5'/></svg>`);
  const cursorText = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect x='7' y='2' width='2' height='12' fill='black'/><rect x='4' y='6' width='8' height='2' fill='black'/></svg>`);
  const cursorResizeNWSE = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M2 14 L14 2 M5 14H2v-3 M14 5V2h-3' stroke='black' stroke-width='2' /></svg>`);
  const cursorResizeNESW = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M2 2 L14 14 M11 2h3v3 M2 11v3h3' stroke='black' stroke-width='2' /></svg>`);
  const cursorForbidden = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='6' stroke='black' stroke-width='2' fill='white'/><path d='M4 12 L12 4' stroke='black' stroke-width='2'/></svg>`);
  const cursorGrab = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M5 14h6l2-5-1-4-2-1-1 3V5H8v2L7 4 5 5l1 5-2 1z' fill='black'/></svg>`);
  const cursorGrabbing = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M5 13h6l2-4-1-4-2-1-1 2V5H8v2L7 4 5 5l1 4-2 1z' fill='black'/></svg>`);

  const [curvature] = useState<number>(()=> {
    const stored = localStorage.getItem('crt-curvature');
    const v = stored? parseFloat(stored): 0.18; return isNaN(v)? 0.18 : Math.min(0.4, Math.max(0, v));
  });
  const [showCurvDebug,setShowCurvDebug] = useState<boolean>(()=> localStorage.getItem('crt-curv-debug')==='1');
  useEffect(()=> { localStorage.setItem('crt-curvature', String(curvature)); },[curvature]);
  useEffect(()=> { if(showCurvDebug) localStorage.setItem('crt-curv-debug','1'); else localStorage.removeItem('crt-curv-debug'); },[showCurvDebug]);
  useEffect(()=> { const handler = (e:KeyboardEvent)=>{ if(e.altKey && (e.key==='c' || e.key==='C')) { setShowCurvDebug((p)=>!p); } }; window.addEventListener('keydown', handler); return ()=> window.removeEventListener('keydown', handler); },[]);
  useEffect(()=> { const handler = (e:KeyboardEvent)=> { if(e.altKey && (e.key==='r' || e.key==='R')) { window.location.reload(); } }; window.addEventListener('keydown', handler); return ()=> window.removeEventListener('keydown', handler); },[]);
  const curvedTransform = React.useMemo(()=> { const perspective = 1500 - curvature*800; const scale = 1 - curvature*0.012; const skewYdeg = curvature * 0.8; return `perspective(${perspective}px) scale(${scale.toFixed(4)}) translateZ(0) skewY(${skewYdeg.toFixed(3)}deg)`; },[curvature]);
  // Barrel generator omitted here (kept simple for mobile route)

  return (
  <div className="relative w-full overflow-hidden bg-[#2a2a2a]" style={{ height: '100dvh' }}>
      <style>{`html,body,#root{font-family:ui-monospace,Menlo,Monaco,'Courier New',monospace}
button,[role=button],a,.cursor-pointer,.crt-wrapper,.crt-wrapper *,[data-icon]{cursor:url("data:image/svg+xml,${cursorPointer}") 1 1,pointer!important}
button:not(:disabled):hover,a:hover,[role=button]:hover,.cursor-pointer:hover,[data-icon]:hover,.clickable-hover:hover,.menu-item:hover{cursor:url("data:image/svg+xml,${cursorPointerHover}") 1 1,pointer!important}
input[type=text],textarea,.text-input,.selectable-text{cursor:url("data:image/svg+xml,${cursorText}") 7 7,text!important}
.cursor-forbidden,button:disabled,a[aria-disabled=true]{cursor:url("data:image/svg+xml,${cursorForbidden}") 7 7,not-allowed!important}
.cursor-grab{cursor:url("data:image/svg+xml,${cursorGrab}") 1 1,grab!important}
.cursor-grabbing{cursor:url("data:image/svg+xml,${cursorGrabbing}") 1 1,grabbing!important}
.cursor-nwse-resize{cursor:url("data:image/svg+xml,${cursorResizeNWSE}") 7 7,nwse-resize!important}
.cursor-nesw-resize{cursor:url("data:image/svg+xml,${cursorResizeNESW}") 7 7,nesw-resize!important}
 @keyframes bootFadeOut { to { opacity:0; filter:blur(2px); } }
 @keyframes bootScan { 0%,100% { opacity:0.15;} 50% { opacity:0.4;} }
 .boot-overlay{background:#000; color:#0f0; font-size:12px; letter-spacing:0.5px;}
 .boot-overlay.fade-out{animation: bootFadeOut 0.6s ease forwards;}
 .boot-scanline::after{content:''; position:absolute; inset:0; background:repeating-linear-gradient(to bottom, rgba(0,255,0,0.06) 0 2px, transparent 2px 4px); mix-blend-mode:overlay; pointer-events:none; animation:bootScan 2s linear infinite;}
 .boot-line{opacity:0; transform:translateY(4px); transition:opacity .25s ease, transform .25s ease;}
 .boot-line.visible{opacity:1; transform:translateY(0);} 
 .crt-wrapper{ background: var(--screen-bg, #f2f2f2); color: var(--screen-fg, #111); }
 .crt-wrapper .text, .crt-wrapper .content, .crt-wrapper [data-window], .crt-wrapper input, .crt-wrapper button { color: inherit; }
 .crt-wrapper .bg-screen { background: var(--screen-bg, #f2f2f2); }
 .crt-wrapper .fg-screen { color: var(--screen-fg, #111); }
 .crt-wrapper[style*='--screen-bg: #071a07'] .crt-vignette { opacity: 0.95; }
 .crt-wrapper[style*='--screen-bg: #071a07'] .crt-phosphor { opacity: 0.55; }
 [data-window] .win-content { scroll-behavior: smooth; }
`}</style>
      <div className="absolute inset-0" style={{ overflow:'hidden' }}>
        <div
          ref={screenRef}
          className={`crt-wrapper barrelized absolute inset-0 border border-black/30 ${theme==='phosphor' ? 'theme-phosphor' : theme==='amber' ? 'theme-amber' : 'theme-classic'}`}
          style={{ ['--screen-bg' as any]: theme==='phosphor'? '#071a07' : theme==='amber'? '#140c00' : '#f2f2f2', ['--screen-fg' as any]: theme==='phosphor'? '#b5ffb5' : theme==='amber'? '#ffd89a' : '#111111' }}
          
        >
          <div className="crt-curved-stage absolute inset-0" style={{ transform: curvedTransform }}>
            <div data-menu-bar className="relative z-50" >
              <MenuBar brand={BRAND} openMenu={openMenu} setOpenMenu={setOpenMenu} closeMenus={closeMenus} menuItems={menuItems as any} menuKeys={menuKeys as any} barHeight={MENU_BAR_HEIGHT} minimal={isMobile} />
            </div>
            {isMobile && (
              <div className="absolute inset-0" style={{ top: MENU_BAR_HEIGHT, paddingBottom: SAFE_BOTTOM }}>
                <div className="absolute inset-x-0" style={{ top: 10 }}>
                  <div className="max-w-[520px] mx-auto px-4 relative" style={{ height: (viewport.w<=390? mobileIconBox*3.8 : mobileIconBox*2.9) }}>
                    <DesktopIcon
                      id={'proj-mobile'}
                      label={'Projects'}
                      x={16}
                      y={8}
                      img={{ src: `${base}icons/projects.png` }}
                      isSelected={false}
                      onDoubleClick={()=> bringToFront('projects')}
                      onPointerDown={()=> bringToFront('projects')}
                      boxPx={mobileIconBox}
                    />
                    <DesktopIcon
                      id={'term-mobile'}
                      label={'Terminal'}
                      x={(viewport.w<=390? 16 : 16 + Math.round(mobileIconBox + 20))}
                      y={(viewport.w<=390? 8 + Math.round(mobileIconBox*1.04) : 8)}
                      img={{ src: `${base}icons/projects.png` }}
                      isSelected={false}
                      onDoubleClick={()=> bringToFront('terminal')}
                      onPointerDown={()=> bringToFront('terminal')}
                      boxPx={mobileIconBox}
                    />
                    <DesktopIcon
                      id={'settings-mobile'}
                      label={'Settings'}
                      x={(viewport.w<=390? 16 : 16)}
                      y={(viewport.w<=390? 8 + Math.round(mobileIconBox*2.08) : 8 + Math.round(mobileIconBox*1.04))}
                      img={{ src: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'><path fill='black' d='M10.325 4.317a1 1 0 0 1 .99-.142l.83.332a1 1 0 0 0 .71 0l.83-.332a1 1 0 0 1 1.314.57l.342.86a1 1 0 0 0 .54.553l.86.342a1 1 0 0 1 .57 1.314l-.332.83a1 1 0 0 0 0 .71l.332.83a1 1 0 0 1-.57 1.314l-.86.342a1 1 0 0 0-.54.553l-.342.86a1 1 0 0 1-1.314.57l-.83-.332a1 1 0 0 0-.71 0l-.83.332a1 1 0 0 1-1.314-.57l-.342-.86a1 1 0 0 0-.54-.553l-.86-.342a1 1 0 0 1-.57-1.314l.332-.83a1 1 0 0 0 0-.71l-.332-.83a1 1 0 0 1 .57-1.314l.86-.342a1 1 0 0 0 .54-.553l.342-.86ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'/></svg>`)}` }}
                      isSelected={false}
                      onDoubleClick={()=> bringToFront('settings')}
                      onPointerDown={()=> bringToFront('settings')}
                      boxPx={mobileIconBox}
                    />
                  </div>
                </div>
                <div className="absolute inset-x-0" style={{ bottom: 'max(6px, env(safe-area-inset-bottom))' }}>
                  <div className="mx-auto max-w-[520px] flex items-center justify-around gap-3 px-4 py-2" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
                    {(()=>{ const small = viewport.w <= 480; const btn = small ? 88 : Math.round(mobileIconBox*1.0); const icon = small ? 42 : Math.round(mobileIconBox*0.56); return (
                      <>
                        <button aria-label="Email" onClick={()=>{ window.location.href = 'mailto:jesusferdev@gmail.com'; }} className="grid place-items-center rounded bg-white hover:bg-black hover:text-white border border-black" style={{ width: btn, height: btn }} title="Email"><MailIcon size={icon} /></button>
                        <button aria-label="About" onClick={()=> bringToFront('about')} className="grid place-items-center rounded bg-white hover:bg-black hover:text-white border border-black" style={{ width: btn, height: btn }} title="About"><MonitorIcon size={icon} /></button>
                        <button aria-label="WhatsApp" onClick={()=>{ const phone='34600111222'; const text=encodeURIComponent('¡Hola! Vengo desde tu portfolio.'); window.location.href = `https://wa.me/${phone}?text=${text}`; }} className="grid place-items-center rounded bg-white hover:bg-black hover:text-white border border-black" style={{ width: btn, height: btn }} title="WhatsApp"><ChatIcon size={icon} /></button>
                        <button aria-label="LinkedIn" onClick={()=>{ window.open('https://www.linkedin.com/in/jesusferdev','_blank','noopener'); }} className="grid place-items-center rounded bg-white hover:bg-black hover:text-white border border-black" style={{ width: btn, height: btn }} title="LinkedIn"><GlobeIcon size={icon} /></button>
                      </>
                    ); })()}
                  </div>
                </div>
              </div>
            )}
            {(isMobile
              ? (()=>{ const openWins = wins.filter(w=>w.open); if(!openWins.length) return [] as RetroWindow[]; const top = openWins.reduce((a,b)=> a.z>b.z? a:b); return [top]; })()
              : wins
            ).map(w=> {
              const mobileHeight = (()=>{
                if(!isMobile) return w.h;
                const safePad = viewport.w <= 768 ? (viewport.w <= 480 ? 150 : 120) : 0;
                const maxH = viewport.h - MENU_BAR_HEIGHT - (6+8) - safePad;
                const fullHeight = clamp(Math.round(viewport.h * 0.965), 220, maxH);
                if(w.key==='terminal'){
                  return clamp(Math.round(fullHeight * 0.5), 180, maxH);
                }
                return fullHeight;
              })();
              return (
                <Window
                  key={w.key}
                  x={isMobile? 12 : w.x}
                  y={isMobile? MENU_BAR_HEIGHT + 6 : w.y}
                  w={isMobile? Math.max(240, viewport.w - (12+12)) : w.w}
                  h={isMobile? mobileHeight : w.h}
                  z={w.z}
                  title={w.title}
                  open={w.open}
                  onClose={()=> setOpen(w.key,false)}
                  dragProps={isMobile? undefined : (dragMap as any)[w.key]}
                  resizeProps={isMobile? undefined : (resizeMap as any)[w.key]}
                  contentClassName={w.key==='terminal' ? 'terminal-body' : (w.key==='projects' ? 'projects-body' : undefined)}
                  growBox={!isMobile}
                >
                  {w.key==='about' && <AboutBody brand={BRAND} />}
                  {w.key==='social' && <SocialBody LINKS={{ github: 'https://github.com/JesusFerDev' }} />}
                  {w.key==='projects' && <ProjectsBody list={projects} selected={selectedProject} onSelect={setSelectedProject} />}
                  {w.key==='terminal' && <RetroTerminal onRequestClose={()=> setOpen('terminal', false)} projects={projects} social={{ github: 'https://github.com/JesusFerDev' }} brand={BRAND} title={`${BRAND} Terminal`} />}
                  {w.key==='settings' && <SettingsBody theme={theme} onThemeChange={setTheme} screensaverMs={600000} onScreensaverMsChange={()=>{}} />}
                </Window>
              );
            })}
            <div className="crt-barrel-overlay" />
            <div className="crt-barrel-specular" />
          </div>
          <div className="crt-vignette" />
          <div className="crt-inner-bezel" />
          <div className="crt-phosphor" />
          <div className="crt-distort" />
        </div>
      </div>
      <style>{`
        /* Base theme variables */
        .theme-phosphor{ --crt-scanline-color: rgba(0,255,150,0.05); --crt-mask-color: rgba(0,255,140,0.03); }
        .theme-phosphor * { text-shadow: 0 0 0.6px rgba(160,255,160,0.28); }
        .theme-amber{ --crt-scanline-color: rgba(255,170,60,0.05); --crt-mask-color: rgba(255,200,120,0.03); }
        .theme-amber * { text-shadow: 0 0 0.6px rgba(255,220,150,0.22); }

        /* Phosphor readability (mobile) */
        .theme-phosphor [data-menu-bar] > div{ background-color: rgba(0,28,0,0.72) !important; border-color: rgba(0,255,160,0.28) !important; color: var(--screen-fg,#b5ffb5) !important; }
        .theme-phosphor [data-menu-bar] .border{ border-color: rgba(0,255,160,0.28) !important; }
        .theme-phosphor [data-menu-bar] .bg-white{ background-color: rgba(0,22,0,0.86) !important; }
        .theme-phosphor [data-menu-bar] button{ color: var(--screen-fg,#b5ffb5) !important; }
        .theme-phosphor [data-menu-bar] .hover\:bg-black:hover{ background-color: rgba(0,80,0,0.6) !important; }
        .theme-phosphor [data-menu-bar] .hover\:text-white:hover{ color: var(--screen-fg,#b5ffb5) !important; }
        .theme-phosphor [data-window].window-main{ background-color: rgba(0,22,0,0.62) !important; border-color: rgba(0,255,160,0.26) !important; color: var(--screen-fg,#b5ffb5) !important; }
        .theme-phosphor [data-window] .border-black{ border-color: rgba(0,255,160,0.26) !important; }
        .theme-phosphor [data-window] .bg-white{ background-color: rgba(0,24,0,0.5) !important; }
        .theme-phosphor [data-window] .win-chrome .win-title{ color: #041404 !important; text-shadow: none !important; }
        .theme-phosphor [data-icon] .bg-white{ background-color: rgba(0,28,0,0.55) !important; }
        .theme-phosphor [data-icon] .ring-black{ box-shadow: inset 0 0 0 1px rgba(0,255,128,0.22) !important; }
        .theme-phosphor [data-icon] span{ background-color: rgba(0,24,0,0.66) !important; color: var(--screen-fg,#b5ffb5) !important; }
        .theme-phosphor .text-black, .theme-phosphor .text-white, .theme-phosphor [class*='text-black/'], .theme-phosphor [class*='text-white/']{ color: var(--screen-fg,#b5ffb5) !important; }
        .theme-phosphor input, .theme-phosphor textarea, .theme-phosphor select{ background-color: rgba(0,24,0,0.62) !important; border-color: rgba(0,255,160,0.26) !important; color: var(--screen-fg,#b5ffb5) !important; }

  /* Projects window (mobile) */
  .theme-phosphor [data-window] .projects-body{ background-color: rgba(0,24,0,0.52) !important; color: var(--screen-fg,#b5ffb5) !important; }
  .theme-phosphor [data-window] .projects-body .border-black{ border-color: rgba(0,255,160,0.26) !important; }
  .theme-phosphor [data-window] .projects-body .bg-white,
  .theme-phosphor [data-window] .projects-body [class*="bg-[#"]{ background-color: rgba(0,24,0,0.5) !important; }
  .theme-phosphor [data-window] .projects-body .hover\:bg-black:hover,
  .theme-phosphor [data-window] .projects-body li:hover,
  .theme-phosphor [data-window] .projects-body button:hover{ background-color: rgba(0,80,0,0.55) !important; color: var(--screen-fg,#b5ffb5) !important; }

        /* Amber readability (mobile) */
        .theme-amber [data-menu-bar] > div{ background-color: rgba(40,24,0,0.72) !important; border-color: rgba(255,200,120,0.28) !important; color: var(--screen-fg,#ffd89a) !important; }
        .theme-amber [data-menu-bar] .border{ border-color: rgba(255,200,120,0.28) !important; }
        .theme-amber [data-menu-bar] .bg-white{ background-color: rgba(30,18,0,0.86) !important; }
        .theme-amber [data-menu-bar] button{ color: var(--screen-fg,#ffd89a) !important; }
        .theme-amber [data-menu-bar] .hover\:bg-black:hover{ background-color: rgba(90,60,0,0.6) !important; }
        .theme-amber [data-menu-bar] .hover\:text-white:hover{ color: var(--screen-fg,#ffd89a) !important; }
        .theme-amber [data-window].window-main{ background-color: rgba(28,18,0,0.62) !important; border-color: rgba(255,200,120,0.26) !important; color: var(--screen-fg,#ffd89a) !important; }
        .theme-amber [data-window] .border-black{ border-color: rgba(255,200,120,0.26) !important; }
        .theme-amber [data-window] .bg-white{ background-color: rgba(24,16,0,0.5) !important; }
        .theme-amber [data-window] .win-chrome .win-title{ color: #1a1200 !important; text-shadow: none !important; }
        .theme-amber [data-icon] .bg-white{ background-color: rgba(40,28,0,0.55) !important; }
        .theme-amber [data-icon] .ring-black{ box-shadow: inset 0 0 0 1px rgba(255,200,120,0.22) !important; }
        .theme-amber [data-icon] span{ background-color: rgba(30,20,0,0.66) !important; color: var(--screen-fg,#ffd89a) !important; }
        .theme-amber .text-black, .theme-amber .text-white, .theme-amber [class*='text-black/'], .theme-amber [class*='text-white/']{ color: var(--screen-fg,#ffd89a) !important; }
        .theme-amber input, .theme-amber textarea, .theme-amber select{ background-color: rgba(26,18,0,0.62) !important; border-color: rgba(255,200,120,0.26) !important; color: var(--screen-fg,#ffd89a) !important; }

        /* Projects window (mobile) */
        .theme-amber [data-window] .projects-body{ background-color: rgba(26,18,0,0.52) !important; color: var(--screen-fg,#ffd89a) !important; }
        .theme-amber [data-window] .projects-body .border-black{ border-color: rgba(255,200,120,0.26) !important; }
        .theme-amber [data-window] .projects-body .bg-white,
        .theme-amber [data-window] .projects-body [class*="bg-[#"]{ background-color: rgba(26,18,0,0.5) !important; }
        .theme-amber [data-window] .projects-body .hover\:bg-black:hover,
        .theme-amber [data-window] .projects-body li:hover,
        .theme-amber [data-window] .projects-body button:hover{ background-color: rgba(90,60,0,0.55) !important; color: var(--screen-fg,#ffd89a) !important; }
      `}</style>
      <style>{`
        @media (max-width: 768px), (pointer: coarse) {
          [data-window].window-main { border-radius: 10px; box-shadow: 0 10px 18px rgba(0,0,0,0.18), 0 3px 6px rgba(0,0,0,0.12); overflow: hidden; }
          [data-window] .win-chrome { padding-top: 10px; padding-bottom: 10px; }
          [data-window] .win-chrome .win-title { font-size: clamp(16px, 4.4vw, 20px); }
          [data-window] .win-content { padding: 12px; -webkit-overflow-scrolling: touch; }
          [data-window] .win-content.terminal-body { padding: 0; background-color: #101010; }
          [data-window] .win-content.terminal-body .retro-terminal-root { border-radius: 0; }
          [data-window] .win-content, [data-window] .win-content * { font-size: clamp(14px, 3.9vw, 18px) !important; line-height: 1.5 !important; }
          [data-window] .win-content button { min-height: 44px; }
          [data-window] .win-content input, [data-window] .win-content textarea, [data-window] .win-content select { min-height: 42px; padding-top: 8px; padding-bottom: 8px; }
        }
        @media (max-width: 430px) {
          [data-window] .win-content { padding: 11px; }
          [data-window] .win-content button { min-height: 42px; }
        }
      `}</style>
    </div>
  );
}
