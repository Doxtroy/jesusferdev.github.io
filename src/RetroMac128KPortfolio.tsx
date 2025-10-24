import React, { useEffect, useMemo, useRef, useState } from 'react';
/**
 * RetroMac128KPortfolio (desktop UI)
 *
 * Customization hotspots:
 * - BRAND: personal display name shown in the menu bar and terminal title.
 * - projects: add/remove/modify your portfolio entries.
 * - Socials: LINKS passed to SocialBody and also to Terminal (for quick shortcuts).
 * - Contact buttons (mobile-only section in this file is rarely used): update email/phone/links if you plan to enable mobile here too.
 * - About: reads details from central ABOUT config (images auto-prefixed with base path).
 */
import { MailIcon, MonitorIcon, ChatIcon, GlobeIcon } from './components/icons/RetroIcons';
import AboutBody from './components/AboutBody';
import SocialBody from './components/SocialBody';
import ProjectsBody, { type Project } from './components/ProjectsBody';
import ProjectDetails from './components/ProjectDetails';
import Window from './components/Window';
import DesktopIcon from './components/DesktopIcon';
import MenuBar from './components/MenuBar';
import RetroTerminal from './components/RetroTerminal';
import SettingsBody from './components/SettingsBody.tsx';
// Centralized personalization
import { BRAND as BRAND_CFG, PROJECTS as PROJECTS_CFG, SOCIAL_LINKS, ABOUT as ABOUT_CFG, ICONS as ICONS_CFG } from './config/personalize';

// Types
type WinKey = 'about' | 'projects' | 'social' | 'terminal' | 'settings' | 'details';
interface RetroWindow { key:WinKey; title:string; x:number; y:number; w:number; h?:number; open:boolean; z:number; minimized?:boolean }
interface DesktopIconType { id:string; label:string; x:number; y:number; openKey?:WinKey; img?:{src:string;w?:number;h?:number} }

// Hoisted WindowBody component (stable identity to avoid remounting children like RetroTerminal)
type Theme = 'classic' | 'phosphor' | 'amber';
interface WindowBodyProps {
  win: RetroWindow;
  brand: string;
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (p: Project | null) => void;
  onCloseKey: (key: WinKey) => void;
  bringToFrontKey: (key: WinKey) => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  screensaverMs: number;
  onScreensaverMsChange: (n: number) => void;
  base: string;
}

const WindowBody: React.FC<WindowBodyProps> = ({ win, brand, projects, selectedProject, onSelectProject, onCloseKey, bringToFrontKey, theme, onThemeChange, screensaverMs, onScreensaverMsChange, base }) => {
  const addBase = (img?: string) => {
    if (!img) return img;
    if (/^https?:\/\//.test(img)) return img;
    if (img.startsWith('/')) return `${base}${img.slice(1)}`;
    return `${base}${img}`;
  };
  switch (win.key) {
    case 'about':
      {
        const aboutProps = {
          ...ABOUT_CFG,
          brand,
          pcImage: addBase(ABOUT_CFG.pcImage),
          skills: Array.isArray(ABOUT_CFG.skills)
            ? ABOUT_CFG.skills.map(s => ({ ...s, src: addBase(s.src) as string }))
            : ABOUT_CFG.skills
        } as any;
        return <AboutBody {...aboutProps} />;
      }
    case 'social':
      return <SocialBody LINKS={SOCIAL_LINKS} />;
    case 'projects':
      return (
        <ProjectsBody
          list={projects}
          selected={selectedProject}
          onSelect={onSelectProject}
          onOpenDetails={(p) => { onSelectProject(p); bringToFrontKey('details'); }}
          folderIcons={{ open: addBase(ICONS_CFG.folders.open) as string, close: addBase(ICONS_CFG.folders.close) as string }}
        />
      );
    case 'details':
      return <ProjectDetails project={selectedProject} />;
    case 'terminal':
      return (
        <RetroTerminal
          onRequestClose={() => onCloseKey('terminal')}
          projects={projects}
          social={Object.fromEntries(Object.entries(SOCIAL_LINKS).filter(([,v])=> !!v)) as Record<string,string>}
          brand={brand}
          title={`${brand} Terminal`}
        />
      );
    case 'settings':
      return (
        <SettingsBody
          theme={theme}
          onThemeChange={onThemeChange}
          screensaverMs={screensaverMs}
          onScreensaverMsChange={onScreensaverMsChange}
        />
      );
    default:
      return null;
  }
};

// Utils / persistence
const clamp = (v:number,min:number,max:number)=> Math.max(min, Math.min(max,v));
const loadWinPositions = ():Record<string,Partial<RetroWindow>> => { try { const raw=localStorage.getItem('retro-win-pos'); return raw? JSON.parse(raw):{}; } catch { return {}; } };
const saveWinPositions = (wins:RetroWindow[]) => { try { const o:Record<string,Partial<RetroWindow>>={}; wins.forEach(w=>{o[w.key]={x:w.x,y:w.y,w:w.w,h:w.h,z:w.z,open:w.open};}); localStorage.setItem('retro-win-pos', JSON.stringify(o)); } catch {} };
const loadIcons = ():DesktopIconType[]|null => { try { const raw=localStorage.getItem('retro-icons'); return raw? JSON.parse(raw):null;} catch { return null;} };
const saveIcons = (icons:DesktopIconType[]) => { try { localStorage.setItem('retro-icons', JSON.stringify(icons)); } catch {} };

export default function RetroMac128KPortfolio(){
  // PERSONAL: Display brand/name from central config
  const BRAND = BRAND_CFG;
  const screenRef = useRef<HTMLDivElement>(null);
  const [maxZ,setMaxZ] = useState(10);
  // Mobile detection
  const [isMobile,setIsMobile] = useState<boolean>(false);
  const [viewport,setViewport] = useState<{w:number;h:number}>(()=> ({ w: typeof window!=='undefined'? window.innerWidth: 1024, h: typeof window!=='undefined'? window.innerHeight: 768 }));
  useEffect(()=>{
    if (typeof window === 'undefined') return;
    setIsMobile(false);
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return ()=> window.removeEventListener('resize', onResize);
  },[]);
  // Responsive desktop icon sizing for mobile
  const mobileIconBox = useMemo(()=>{
    if(!isMobile) return 92;
    const gap = 20;
    const singleCol = viewport.w <= 390;
    const targetCols = singleCol ? 1 : 2;
    const box = Math.floor((viewport.w - 32 - (targetCols-1)*gap) / targetCols);
    const minClamp = singleCol ? 200 : 150;
    const maxClamp = singleCol ? 380 : 260;
    return clamp(box, minClamp, maxClamp);
  },[isMobile, viewport.w]);
  const MENU_BAR_HEIGHT = isMobile? (viewport.w <= 430 ? 80 : 68) : 32; // altura visual de la barra superior (touch-friendly en móvil)

  // Layout base
  type WinDef = { x:number; y:number; w:number; h?:number };
  const defaultWinDefs:Record<WinKey,WinDef>={
    about:{x:140,y:MENU_BAR_HEIGHT+40,w:560,h:586},
    projects:{x:340,y:MENU_BAR_HEIGHT+80,w:860,h:520},
    social:{x:420,y:MENU_BAR_HEIGHT+120,w:640,h:360},
    terminal:{x:300,y:MENU_BAR_HEIGHT+160,w:640,h:460},
    settings:{x:200,y:MENU_BAR_HEIGHT+120,w:460,h:280},
    details:{x:360,y:MENU_BAR_HEIGHT+120,w:640,h:420}
  };
  // Windows init
  const initialWins:RetroWindow[] = useMemo(()=>{
    const stored=loadWinPositions();
    const base:RetroWindow[]=[
  { key:'about', title:'About Jesús',  ...defaultWinDefs.about,  open:true,  z:10, h:586 }, // provisional h stored for persistence; will auto-size visually
  { key:'projects', title:'Projects',  ...defaultWinDefs.projects, open:false, z:9  },
  { key:'social', title:'Social Life', ...defaultWinDefs.social,   open:false, z:8  },
  { key:'terminal', title:'Terminal',   ...defaultWinDefs.terminal, open:false, z:7  },
  { key:'settings', title:'Settings', ...defaultWinDefs.settings, open:false, z:6 },
  { key:'details', title:'Project Details', ...defaultWinDefs.details, open:false, z:5 }
    ];
    return base.map(w=>({ ...w, ...(stored[w.key]||{}) }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const [wins,setWins] = useState<RetroWindow[]>(initialWins);
  useEffect(()=> saveWinPositions(wins),[wins]);

  // Base URL for assets (important for GitHub Pages project sites)
  const computeBase = (): string => {
    // Prefer <base href> if present
    const baseEl = document.querySelector('base');
    if (baseEl) {
      const href = (baseEl as HTMLBaseElement).getAttribute('href') || '/';
      return href.endsWith('/') ? href : href + '/';
    }
    // Fallback: first path segment (e.g., /repo/ on Pages project sites)
    const path = window.location.pathname || '/';
    const m = path.match(/^(\/[\w.-]+\/)/);
    return m ? m[1] : '/';
  };
  const base = computeBase();

  // Theme state (classic grayscale vs green phosphor vs amber)
  const [theme,setTheme] = useState<Theme>(()=> {
    const t = localStorage.getItem('retro-theme');
    return (t==='phosphor'||t==='classic'||t==='amber')? (t as Theme) : 'classic';
  });
  useEffect(()=> { localStorage.setItem('retro-theme', theme); },[theme]);

  // En móvil preferimos una sola ventana activa a la vez
  const bringToFront = (key:WinKey)=> setWins((p:RetroWindow[])=>{
    const next = maxZ + 1; setMaxZ(next);
    if(isMobile){
      return p.map((w:RetroWindow)=> w.key===key? { ...w, z:next, open:true, minimized:false } : { ...w, open:false });
    }
    return p.map((w:RetroWindow)=> w.key===key? { ...w, z:next, open:true, minimized:false }:w);
  });
  const setOpen = (key:WinKey, open:boolean) => setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=> w.key===key? { ...w, open }: w));

  // Window actions
  const closeAll = () => setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=> ({...w, open:false})));
  const openAll  = () => setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=> ({...w, open:true })));
  const resetLayout = () => setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=> ({...w, ...defaultWinDefs[w.key]})));
  const bringAllToFront = () => setWins((p:RetroWindow[])=> { let next = maxZ; const updated = p.map((w:RetroWindow)=> { next+=1; return { ...w, z:next }; }); setMaxZ(next); return updated; });
  const cascade = () => setWins((p:RetroWindow[])=> p.map((w:RetroWindow,i:number)=> ({...w, x: 90 + i*48, y: MENU_BAR_HEIGHT + 32 + i*48 })));
  const tileHorizontal = () => setWins((p:RetroWindow[])=> { const openWins = p.filter((w:RetroWindow)=>w.open); if(openWins.length===0) return p; const bounds = screenRef.current?.getBoundingClientRect(); const totalH = (bounds?.height||800) - (MENU_BAR_HEIGHT+40); const eachH = Math.max(140, Math.floor(totalH / openWins.length)-12); return p.map((w:RetroWindow)=>{ if(!w.open) return w; const idx=openWins.findIndex((o:RetroWindow)=>o.key===w.key); if(idx===-1) return w; return { ...w, x: 100, y: MENU_BAR_HEIGHT + 28 + idx*(eachH+8), w: Math.min(w.w, (bounds?.width||1200)-160), h: eachH }; }); });
  const minimizeAll = () => closeAll();

  // Normalize after mount
  useEffect(()=>{
    const bounds = screenRef.current?.getBoundingClientRect();
    if(!bounds) return;
    const bw = bounds.width - 6; const bh = bounds.height - 6;
  setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=> {
      const effectiveH = w.h ?? 360;
      return {
        ...w,
        x: clamp(w.x, 0, Math.max(0, bw - w.w)),
        y: clamp(w.y, MENU_BAR_HEIGHT, Math.max(MENU_BAR_HEIGHT, bh - effectiveH))
      };
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Drag hook
  const useDragWin = (key:WinKey) => {
    const start=useRef<{x:number;y:number}|null>(null);
    const last=useRef<{x:number;y:number}|null>(null);
    const onPointerDown=(e:React.PointerEvent)=>{ (e.target as HTMLElement).setPointerCapture(e.pointerId); start.current={x:e.clientX,y:e.clientY}; last.current=start.current; bringToFront(key); };
    const onPointerMove=(e:React.PointerEvent)=>{ if(!start.current) return; const dx=e.clientX-(last.current?.x||e.clientX); const dy=e.clientY-(last.current?.y||e.clientY); last.current={x:e.clientX,y:e.clientY}; const bounds=screenRef.current?.getBoundingClientRect(); const bw=(bounds?.width||1200)-6; const bh=(bounds?.height||800)-6; setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=>{ if(w.key!==key) return w; const effectiveH = w.h ?? 360; return { ...w, x:clamp(w.x+dx,0,Math.max(0,bw-w.w)), y:clamp(w.y+dy,MENU_BAR_HEIGHT,Math.max(MENU_BAR_HEIGHT,bh-effectiveH)) }; })); };
    const onPointerUp=(e:React.PointerEvent)=>{ (e.target as HTMLElement).releasePointerCapture(e.pointerId); start.current=null; last.current=null; };
    return { onPointerDown,onPointerMove,onPointerUp };
  };

  // Resize hook
  const useResizeWin = (key:WinKey) => {
    const start=useRef<{x:number;y:number;w:number;h:number}|null>(null);
  const onPointerDown=(e:React.PointerEvent)=>{ (e.target as HTMLElement).setPointerCapture(e.pointerId); const w=wins.find((v:RetroWindow)=>v.key===key)!; start.current={x:e.clientX,y:e.clientY,w:w.w,h:w.h ?? 360}; bringToFront(key); };
  const onPointerMove=(e:React.PointerEvent)=>{ if(!start.current) return; const dx=e.clientX-start.current.x; const dy=e.clientY-start.current.y; const bounds=screenRef.current?.getBoundingClientRect(); const bw=(bounds?.width||1200)-6; const bh=(bounds?.height||800)-6; setWins((p:RetroWindow[])=> p.map((w:RetroWindow)=>{ if(w.key!==key) return w; let newW=clamp(start.current!.w+dx,260,1500); let newH=clamp(start.current!.h+dy,160,900); newW=Math.min(newW, bw - w.x); newH=Math.min(newH, bh - w.y); return { ...w, w:newW, h:newH }; })); };
    const onPointerUp=(e:React.PointerEvent)=>{ (e.target as HTMLElement).releasePointerCapture(e.pointerId); start.current=null; };
    return { onPointerDown,onPointerMove,onPointerUp };
  };

  // Always create drag/resize props for each window key in a fixed order (to preserve hooks order)
  const dragAbout = useDragWin('about');
  const dragProjects = useDragWin('projects');
  const dragSocial = useDragWin('social');
  const dragTerminal = useDragWin('terminal');
  const dragSettings = useDragWin('settings');
  const dragDetails = useDragWin('details');
  const resizeAbout = useResizeWin('about');
  const resizeProjects = useResizeWin('projects');
  const resizeSocial = useResizeWin('social');
  const resizeTerminal = useResizeWin('terminal');
  const resizeSettings = useResizeWin('settings');
  const resizeDetails = useResizeWin('details');
  const dragMap: Record<WinKey, { onPointerDown:(e:React.PointerEvent)=>void; onPointerMove:(e:React.PointerEvent)=>void; onPointerUp:(e:React.PointerEvent)=>void }> = {
    about: dragAbout,
    projects: dragProjects,
    social: dragSocial,
    terminal: dragTerminal,
    settings: dragSettings,
    details: dragDetails
  };
  const resizeMap: typeof dragMap = {
    about: resizeAbout,
    projects: resizeProjects,
    social: resizeSocial,
    terminal: resizeTerminal,
    settings: resizeSettings,
    details: resizeDetails
  };

  // Desktop icons (centralized through config + base prefix)
  const withBasePath = (p:string)=> (/^https?:\/\//.test(p)? p : (p.startsWith('/')? `${base}${p.slice(1)}` : `${base}${p}`));
  const defaultIcons:DesktopIconType[]=[
    { id:'proj',   label:'Projects',  x:24,y:MENU_BAR_HEIGHT+42,  openKey:'projects', img:{src: withBasePath(ICONS_CFG.desktop.projects)} },
    { id:'social', label:'Social',    x:24,y:MENU_BAR_HEIGHT+190, openKey:'social',   img:{src: withBasePath(ICONS_CFG.desktop.social)} },
    { id:'about',  label:'About Me',  x:24,y:MENU_BAR_HEIGHT+338, openKey:'about',    img:{src: withBasePath(ICONS_CFG.desktop.about)} },
    { id:'terminal', label:'Terminal', x:24,y:MENU_BAR_HEIGHT+486, openKey:'terminal', img:{src: withBasePath(ICONS_CFG.desktop.terminal)} }
  ];
  const [icons,setIcons] = useState<DesktopIconType[]>(()=> loadIcons() ?? defaultIcons);
  // Migrate old persisted icon src (e.g., '/icons/x.png') to base-prefixed paths once
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[base]);
  useEffect(()=> saveIcons(icons),[icons]);
  const [selectedIcons,setSelectedIcons] = useState<string[]>([]);
  const [dragIconId,setDragIconId] = useState<string|null>(null);
  // Marquee selection state
  const [marquee,setMarquee] = useState<null | {x1:number;y1:number;x2:number;y2:number}>(null);
  const iconAreaRef = useRef<HTMLDivElement>(null);
  // Trail state
  interface TrailDot { id:string; x:number; y:number; created:number; src?:string }
  const [trail,setTrail] = useState<TrailDot[]>([]);
  const TRAIL_LIFE = 450; // ms
  const [trailTick,setTrailTick] = useState(0);
  useEffect(()=>{ if(!trail.length) return; const id = requestAnimationFrame(()=> setTrailTick((t:number)=>t+1)); return ()=> cancelAnimationFrame(id); },[trail,trailTick]);
  const iconSize={w:92,h:104};
  const iconDown=(e:React.PointerEvent,id:string)=>{ e.preventDefault(); e.stopPropagation(); (e.target as HTMLElement).setPointerCapture(e.pointerId); setDragIconId(id); if(!selectedIcons.includes(id)) { if(e.shiftKey || e.metaKey || e.ctrlKey) setSelectedIcons((prev:string[])=> [...prev,id]); else setSelectedIcons([id]); } else { if(e.shiftKey || e.metaKey || e.ctrlKey){ /* toggle */ setSelectedIcons((prev:string[])=> prev.filter((i:string)=>i!==id)); } } };
  const iconMove=(e:React.PointerEvent)=>{ if(!dragIconId) return; const d=screenRef.current?.getBoundingClientRect(); const movedIds: string[] = selectedIcons.includes(dragIconId)? selectedIcons : [dragIconId]; setIcons((p:DesktopIconType[])=> p.map((ic:DesktopIconType)=> movedIds.includes(ic.id)?{ ...ic, x:clamp(ic.x+(e.movementX||0),8,(d?.width||1000)-iconSize.w-8), y:clamp(ic.y+(e.movementY||0),MENU_BAR_HEIGHT+4,(d?.height||700)-iconSize.h-8) }:ic));
    // trail dots for moved icons
    const now = Date.now();
    setTrail((t:TrailDot[])=>{
      const fresh = t.filter((td:TrailDot)=> now-td.created < TRAIL_LIFE);
      const additions:TrailDot[] = movedIds.map((id:string)=>{ const ic = icons.find((i:DesktopIconType)=>i.id===id); return { id, x: ic? ic.x:0, y: ic? ic.y:0, created: now, src: ic?.img?.src }; });
      return [...fresh, ...additions];
    }); };
  const iconUp=(e:React.PointerEvent)=>{ if(!dragIconId && !marquee) return; if(dragIconId){ (e.target as HTMLElement).releasePointerCapture(e.pointerId); setDragIconId(null); }
    setTimeout(()=> setTrail((t:TrailDot[])=> t.filter((td:TrailDot)=> Date.now()-td.created < TRAIL_LIFE)), TRAIL_LIFE+60);
  };
  const iconDbl=(id:string)=>{ const ic=icons.find((i:DesktopIconType)=>i.id===id); if(ic?.openKey) bringToFront(ic.openKey); };

  // Background mouse down for marquee
  const onBackgroundPointerDown = (e:React.PointerEvent) => {
    if(isMobile) return; // deshabilitar selección por lazo en móvil
    const target = e.target as HTMLElement;
    if(target.closest('[data-icon]')) return; // icon
    if(target.closest('[data-window]')) return; // window drag
    if(target.closest('[data-menu-bar]')) return; // menu bar
    const areaRect = iconAreaRef.current?.getBoundingClientRect();
    if(!areaRect) return;
    const x = e.clientX - areaRect.left; const y = e.clientY - areaRect.top;
    setMarquee({x1:x,y1:y,x2:x,y2:y});
    if(!(e.shiftKey||e.metaKey||e.ctrlKey)) setSelectedIcons([]);
  };
  const onBackgroundPointerMove = (e:React.PointerEvent) => {
    if(!marquee) return;
    const areaRect = iconAreaRef.current?.getBoundingClientRect(); if(!areaRect) return;
    const x = e.clientX - areaRect.left; const y = e.clientY - areaRect.top;
    setMarquee((m: {x1:number;y1:number;x2:number;y2:number} | null)=> m? {...m,x2:x,y2:y}:m);
  };
  const onBackgroundPointerUp = () => {
    if(!marquee) return;
    const {x1,y1,x2,y2} = marquee; const minX=Math.min(x1,x2); const maxX=Math.max(x1,x2); const minY=Math.min(y1,y2); const maxY=Math.max(y1,y2);
    const newly = icons.filter((ic:DesktopIconType)=> ic.x + iconSize.w > minX && ic.x < maxX && ic.y + iconSize.h > minY && ic.y < maxY).map((i:DesktopIconType)=>i.id);
    setSelectedIcons((prev:string[])=> Array.from(new Set([...(prev), ...newly])));
    setMarquee(null);
  };

  // Projects data
  /**
   * PERSONAL: Projects list for Projects window (desktop route)
   * See comments in MobileHome for field explanations.
   */
  const projects:Project[] = React.useMemo(()=>{
    const withBase = (img:string) => {
      if(/^https?:\/\//.test(img)) return img;
      if(img.startsWith('/')) return `${base}${img.slice(1)}`;
      return `${base}${img}`;
    };
    return PROJECTS_CFG.map(p=> ({ ...p, image: withBase(p.image) }));
  },[base]);
  const [selectedProject,setSelectedProject] = useState<Project|null>(projects[0]);
  // Note: Details window is opened via ProjectsBody onOpenDetails -> bringToFront('details')

  // ====== Restart (Reboot) logic ======
  const restartSystem = () => {
    
    try { sessionStorage.removeItem('boot-shown'); } catch {}
    setBootDone(false);
    setVisibleBootCount(0);
    setBootLines([]);
    setAudioUnlocked(false);
    setBooting(true);
    // Opcional: podríamos también resetear layout/iconos si se desea (comentado):
    // resetLayout(); setIcons(defaultIcons);
  };

  // Responsive: sin monitor, la pantalla ocupará todo el viewport

  // Menu bar items
  const [openMenu,setOpenMenu] = useState<string|null>(null); const closeMenus=()=> setOpenMenu(null);
  const menuItems = {
    Finder:[ {label:`${BRAND} (About)`, action:()=>bringToFront('about')}, {label:'Restart System', action: restartSystem}, {label:'Open Terminal', action:()=>bringToFront('terminal')}, {label:'---'}, {label:'Open All', action: openAll}, {label:'Close All', action: closeAll} ],
    File:[ {label:'Open About', action:()=>bringToFront('about')}, {label:'Open Projects', action:()=>bringToFront('projects')}, {label:'Open Social', action:()=>bringToFront('social')}, {label:'Open Terminal', action:()=>bringToFront('terminal')}, {label:'---'}, {label:'Reset Layout', action: resetLayout} ],
    Window:[ {label:'Bring All to Front', action: bringAllToFront}, {label:'Cascade', action: cascade}, {label:'Tile Horizontal', action: tileHorizontal}, {label:'Minimize All', action: minimizeAll} ],
    View:[
  {label:'Select All Icons', action:()=> setSelectedIcons(icons.map((i:DesktopIconType)=>i.id))},
      {label:'Clear Selection', action:()=> setSelectedIcons([])},
      {label:'---'},
  {label:'Settings…', action:()=> bringToFront('settings')},
  {label: `${theme==='classic'?'✓ ':''}Theme: Classic`, action:()=> setTheme('classic')},
  {label: `${theme==='phosphor'?'✓ ':''}Theme: Green Phosphor`, action:()=> setTheme('phosphor')},
  {label: `${theme==='amber'?'✓ ':''}Theme: Amber`, action:()=> setTheme('amber')},
      {label:'---'},
      {label:'Reset Icons', action:()=> setIcons(defaultIcons)},
      {label:'Reset Layout', action: resetLayout}
    ]
  } as const;
  const menuKeys = Object.keys(menuItems);

  const cursorPointer = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <path d='M1 1 L12 8 L8 9 L9 13 L7 14 L6 10 L2 12 Z' fill='black'/>
  </svg>`);
  // Variante para hover (añadimos un pequeño cuadrado highlight)
  const cursorPointerHover = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <path d='M1 1 L12 8 L8 9 L9 13 L7 14 L6 10 L2 12 Z' fill='black'/>
    <rect x='9' y='9' width='3' height='3' fill='white' stroke='black' stroke-width='0.5'/>
  </svg>`);
  // I‑beam retro para texto
  const cursorText = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <rect x='7' y='2' width='2' height='12' fill='black'/>
    <rect x='4' y='6' width='8' height='2' fill='black'/>
  </svg>`);
  // Resize diagonal (nwse)
  const cursorResizeNWSE = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <path d='M2 14 L14 2 M5 14H2v-3 M14 5V2h-3' stroke='black' stroke-width='2' />
  </svg>`);
  // Resize diagonal (nesw)
  const cursorResizeNESW = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <path d='M2 2 L14 14 M11 2h3v3 M2 11v3h3' stroke='black' stroke-width='2' />
  </svg>`);
  // Prohibido / no-drop
  const cursorForbidden = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <circle cx='8' cy='8' r='6' stroke='black' stroke-width='2' fill='white'/>
    <path d='M4 12 L12 4' stroke='black' stroke-width='2'/>
  </svg>`);
  // Mano para drag (estilo simple)
  const cursorGrab = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <path d='M5 14h6l2-5-1-4-2-1-1 3V5H8v2L7 4 5 5l1 5-2 1z' fill='black'/>
  </svg>`);
  const cursorGrabbing = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <path d='M5 13h6l2-4-1-4-2-1-1 2V5H8v2L7 4 5 5l1 4-2 1z' fill='black'/>
  </svg>`);
  // High-contrast (light) cursor variants for dark themes
  const cursorPointerLight = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <path d='M1 1 L12 8 L8 9 L9 13 L7 14 L6 10 L2 12 Z' fill='white' stroke='black' stroke-width='0.8'/>
  </svg>`);
  const cursorPointerHoverLight = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <path d='M1 1 L12 8 L8 9 L9 13 L7 14 L6 10 L2 12 Z' fill='white' stroke='black' stroke-width='0.8'/>
    <rect x='9' y='9' width='3' height='3' fill='black' stroke='white' stroke-width='0.5'/>
  </svg>`);
  const cursorTextLight = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <rect x='7' y='2' width='2' height='12' fill='white' stroke='black' stroke-width='0.8'/>
    <rect x='4' y='6' width='8' height='2' fill='white' stroke='black' stroke-width='0.8'/>
  </svg>`);
  const cursorResizeNWSELight = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <path d='M2 14 L14 2 M5 14H2v-3 M14 5V2h-3' stroke='white' stroke-width='2' />
  </svg>`);
  const cursorResizeNESWLight = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <path d='M2 2 L14 14 M11 2h3v3 M2 11v3h3' stroke='white' stroke-width='2' />
  </svg>`);
  const cursorGrabLight = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <path d='M5 14h6l2-5-1-4-2-1-1 3V5H8v2L7 4 5 5l1 5-2 1z' fill='white' stroke='black' stroke-width='0.6'/>
  </svg>`);
  const cursorGrabbingLight = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'>
    <path d='M5 13h6l2-4-1-4-2-1-1 2V5H8v2L7 4 5 5l1 4-2 1z' fill='white' stroke='black' stroke-width='0.6'/>
  </svg>`);

  // (WindowBody moved to module scope to avoid remounting children)

  // ================== CURVATURA DEBUG ==================
  // Valor normalizado 0..0.4 aprox (0 = plano, 0.4 = muy curvo)
  const [curvature,setCurvature] = useState<number>(()=> {
    const stored = localStorage.getItem('crt-curvature');
    const v = stored? parseFloat(stored): 0.18; // valor por defecto medio
    return isNaN(v)? 0.18 : Math.min(0.4, Math.max(0, v));
  });
  const [showCurvDebug,setShowCurvDebug] = useState<boolean>(()=> localStorage.getItem('crt-curv-debug')==='1');
  useEffect(()=> { localStorage.setItem('crt-curvature', String(curvature)); },[curvature]);
  useEffect(()=> { if(showCurvDebug) localStorage.setItem('crt-curv-debug','1'); else localStorage.removeItem('crt-curv-debug'); },[showCurvDebug]);
  // Toggle con Alt + C
  useEffect(()=> {
  const handler = (e:KeyboardEvent)=>{ if(e.altKey && (e.key==='c' || e.key==='C')) { setShowCurvDebug((p:boolean)=>!p); } };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  },[]);
  // Atajo Alt+R para reiniciar
  useEffect(()=> {
    const handler = (e:KeyboardEvent)=> { if(e.altKey && (e.key==='r' || e.key==='R')) { restartSystem(); } };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  },[]);
  // Calcula transform dinámica según curvatura
  const curvedTransform = React.useMemo(()=> {
    // Escala se reduce ligeramente, perspectiva baja cuando curvatura sube
    const perspective = 1500 - curvature*800; // 1500 -> 1180
    const scale = 1 - curvature*0.012;        // 1 -> ~0.995
    // Ligerísima deformación vertical (skew) opcional
    const skewYdeg = curvature * 0.8;         // hasta 0.32deg
    return `perspective(${perspective}px) scale(${scale.toFixed(4)}) translateZ(0) skewY(${skewYdeg.toFixed(3)}deg)`;
  },[curvature]);

  // Eliminado: controles y bounding box del monitor PNG

  // Medimos aspecto real del PNG para calcular anchura base coherente
  // Eliminado: cálculo de aspecto/anchuras del monitor

  // ====== Auto-fit: alinear pantalla dentro del monitor en cualquier resolución ======
  // Cuando está activo, calcula escala y offset para que la "pantalla" ocupe casi todo el alto
  // dejando un pequeño margen por arriba y abajo para que se vea el monitor.

  // Sin auto-fit: la pantalla ya ocupa el viewport

  

  /* ================= Barrel Distortion (SVG Displacement Map – Estático) =================
    Genera un mapa R/G para desplazar X/Y (rojo = X, verde = Y) produciendo una curvatura
    tipo barril sutil. SIN animación (lo que pediste). Ajusta BARREL_FILTER_SCALE para variar
    la intensidad (recomendado 10–24). Pon 0 para desactivar. */
  const BARREL_MAP_SIZE = 256;     // (disabled currently)
  const BARREL_FILTER_SCALE = 0;   // Desactivado para restaurar vista limpia
  const [barrelMapUrl,setBarrelMapUrl] = useState<string>('');

  // ================== BOOT / STARTUP ANIMATION ==================
  // Boot solo una vez por sesión: si sessionStorage tiene 'boot-shown', no mostrar
  const [booting,setBooting] = useState<boolean>(()=> {
    if (typeof window !== 'undefined') {
      try { return !sessionStorage.getItem('boot-shown'); } catch { return true; }
    }
    return true;
  });
  const [bootLines,setBootLines] = useState<string[]>([]);
  const [visibleBootCount,setVisibleBootCount] = useState(0);
  const [bootDone,setBootDone] = useState(false);
  // Refleja si el contexto de audio ha sido desbloqueado por interacción (los navegadores bloquean autoplay)
  const [audioUnlocked,setAudioUnlocked] = useState(false);
  useEffect(()=>{
  if(!booting) return;
    // --- Audio setup (Web Audio) ---
    let audioCtx:AudioContext|undefined;
  let unlocked = false;
    const pendingBeeps: {f:number; t:number; v:number}[] = [];
    const ensureCtx = () => {
      if(!audioCtx){
        try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch {}
      }
      return audioCtx;
    };
    const tryResume = async () => {
      const ctx = ensureCtx();
      if(ctx && ctx.state === 'suspended'){
        try { await ctx.resume(); unlocked = true; setAudioUnlocked(true); flushPending(); } catch {/* ignore */}
      } else if(ctx){ unlocked = true; setAudioUnlocked(true); flushPending(); }
    };
    const flushPending = () => {
      if(!audioCtx) return;
      while(pendingBeeps.length){ const {f,t,v} = pendingBeeps.shift()!; _playBeep(f,t,v); }
    };
    const _playBeep = (freq:number, time=0.08, vol=0.25) => {
      const ctx = ensureCtx(); if(!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type='square'; osc.frequency.value=freq;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now); osc.stop(now + time);
    };
    const beep = (freq:number, time=0.08, vol=0.25) => {
      const ctx = ensureCtx();
      if(!ctx){ return; }
      if(!unlocked || ctx.state==='suspended'){
        pendingBeeps.push({f:freq,t:time,v:vol});
        return;
      }
      _playBeep(freq,time,vol);
    };
    const successChord = async () => {
      await tryResume();
      const ctx = ensureCtx(); if(!ctx) return;
      const base = ctx.currentTime + 0.03;
      const notes = [523.25,659.25,783.99]; // C5 E5 G5
      notes.forEach((f,i)=>{
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type='triangle'; osc.frequency.value=f;
        g.gain.setValueAtTime(0.0001, base);
        g.gain.linearRampToValueAtTime(0.22, base+0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, base+0.6);
        osc.connect(g).connect(ctx.destination);
        osc.start(base + i*0.01); osc.stop(base+0.65);
      });
    };
    const unlockHandler = () => { if(!unlocked){ tryResume(); } };
    window.addEventListener('pointerdown', unlockHandler, { once:false });
    window.addEventListener('keydown', unlockHandler, { once:false });
    const lines = [
      'Rafindows 95 (C) 1991-2085 Corp.',
      `CPU: ${navigator.hardwareConcurrency || 1} cores virtualizados`,
      'Memoria Base .............. OK',
      'Iniciando GUI retro........ OK',
      'Montando unidad NUDES...... OK',
      'Cargando iconos............. OK',
      'Aplicando CRT Curvature..... OK',
      'Listo. Presiona cualquier tecla para continuar.'
    ];
    setBootLines(lines);
    let idx=0;
    const step = () => {
      idx+=1; setVisibleBootCount(idx);
      // reproducir beep por línea (menos en la última que lleva chord final)
      if(idx <= lines.length){
        if(idx < lines.length) {
          // variar frecuencia para un efecto progresivo
          const f = 520 + (idx*37)%240;
          beep(f, 0.07, 0.18);
        } else {
          successChord();
        }
      }
      if(idx < lines.length){ timers.push(setTimeout(step, 160)); }
      else { // esperar y luego cerrar
        try { sessionStorage.setItem('boot-shown','1'); } catch {}
        timers.push(setTimeout(()=> { setBootDone(true); setTimeout(()=> setBooting(false), 600); }, 900));
      }
    };
    const timers:ReturnType<typeof setTimeout>[]=[];
    timers.push(setTimeout(step, 400));
  const skip = () => { if(!booting) return; timers.forEach(t=>clearTimeout(t)); setVisibleBootCount(lines.length); setBootDone(true); try { sessionStorage.setItem('boot-shown','1'); } catch {}; successChord(); setTimeout(()=> setBooting(false), 300); };
  const keyHandler = ()=> { if(booting) skip(); };
    const clickHandler = () => skip();
    window.addEventListener('keydown', keyHandler);
    window.addEventListener('pointerdown', clickHandler, { once:false });
    return ()=> { timers.forEach(t=>clearTimeout(t)); window.removeEventListener('keydown', keyHandler); window.removeEventListener('pointerdown', clickHandler); window.removeEventListener('pointerdown', unlockHandler); window.removeEventListener('keydown', unlockHandler); };
  },[booting]);

  useEffect(()=>{
    // Crear canvas offscreen
    const canvas = document.createElement('canvas');
    canvas.width = BARREL_MAP_SIZE; canvas.height = BARREL_MAP_SIZE;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    const mid = BARREL_MAP_SIZE/2; const radius = mid; // radio para distorsión
    for(let y=0;y<BARREL_MAP_SIZE;y++){
      for(let x=0;x<BARREL_MAP_SIZE;x++){
        const dx = x - mid; const dy = y - mid; const l = Math.sqrt(dx*dx + dy*dy);
        if(l < radius){
          const a = Math.asin(l / radius); // ángulo relativo
          const z = 255 - Math.cos(a) * 255; // profundidad simulada
          const r = mid + (dx / radius) * (z / 255) * mid; // canal rojo = desplazamiento X
          const g = mid + (dy / radius) * (z / 255) * mid; // canal verde = desplazamiento Y
          // atenuación suave al borde
          const o = l >= radius - 4 ? Math.max(0, 1 - (l - (radius - 4)) / 4) : 1;
          ctx.fillStyle = `rgba(${Math.floor(r)},${Math.floor(g)},0,${o})`;
        } else {
          ctx.fillStyle = 'rgba(128,128,0,0)';
        }
        ctx.fillRect(x,y,1,1);
      }
    }
    setBarrelMapUrl(canvas.toDataURL('image/png'));
  },[]);

  // No animación: se genera una sola vez y se aplica.

  // ================== SCREENSAVER + LOCK (colocado tras boot state) ==================
  // Tiempo de inactividad configurable (persistido)
  const [screensaverMs,setScreensaverMs] = useState<number>(()=>{
    const v = localStorage.getItem('screensaver-ms');
    const n = v? parseInt(v,10) : 600000;
    return Number.isFinite(n) ? Math.min(Math.max(n, 10000), 10*60*1000) : 60000; // 10s .. 10min
  });
  useEffect(()=>{ localStorage.setItem('screensaver-ms', String(screensaverMs)); },[screensaverMs]);
  const [locked,setLocked] = useState(false);
  const [passInput,setPassInput] = useState('');
  const [attempts,setAttempts] = useState(0);
  const [errorMsg,setErrorMsg] = useState<string|null>(null);
  const passRef = useRef<HTMLInputElement|null>(null);
  const lastActiveRef = useRef<number>(Date.now());
  // Registrar actividad dentro de la pantalla
  useEffect(()=>{
    const mark = ()=>{ lastActiveRef.current = Date.now(); };
    const el = screenRef.current ?? window;
    el.addEventListener('mousemove', mark as any);
    el.addEventListener('keydown', mark as any);
    el.addEventListener('pointerdown', mark as any);
    el.addEventListener('wheel', mark as any);
    el.addEventListener('touchstart', mark as any);
    return ()=>{
      el.removeEventListener('mousemove', mark as any);
      el.removeEventListener('keydown', mark as any);
      el.removeEventListener('pointerdown', mark as any);
      el.removeEventListener('wheel', mark as any);
      el.removeEventListener('touchstart', mark as any);
    };
  },[]);
  // Temporizador de inactividad (no se activa durante el boot)
  useEffect(()=>{
    const id = setInterval(()=>{
      if(booting) return;
      if(!locked && Date.now() - lastActiveRef.current > screensaverMs){ setLocked(true); }
    }, 1000);
    return ()=> clearInterval(id);
  },[locked, booting, screensaverMs]);
  // Enfoque del input y Enter para desbloquear
  useEffect(()=>{ if(locked){
    // Reset de estado al bloquear
    setAttempts(0);
    setErrorMsg(null);
    setPassInput('');
    setTimeout(()=> passRef.current?.focus(), 40);
  } },[locked]);
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{ if(e.altKey && (e.key==='l' || e.key==='L')) setLocked(true); };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  },[]);
  const tryUnlock = () => {
    if(passInput.trim()==='3141'){
      setLocked(false); setPassInput(''); lastActiveRef.current = Date.now();
      setAttempts(0); setErrorMsg(null);
    } else {
  setAttempts((a:number)=>a+1);
      setErrorMsg('Contraseña incorrecta');
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#2a2a2a]">
  <style>{`html,body,#root{font-family:ui-monospace,Menlo,Monaco,'Courier New',monospace}
/* Base clickable */
button,[role=button],a,.cursor-pointer,[data-icon]{cursor:url("data:image/svg+xml,${cursorPointer}") 1 1,pointer!important}
button:not(:disabled):hover,a:hover,[role=button]:hover,.cursor-pointer:hover,[data-icon]:hover,.clickable-hover:hover,.menu-item:hover{cursor:url("data:image/svg+xml,${cursorPointerHover}") 1 1,pointer!important}
/* Texto */
input[type=text],textarea,.text-input,.selectable-text{cursor:url("data:image/svg+xml,${cursorText}") 7 7,text!important}
/* Forbidden */
.cursor-forbidden,button:disabled,a[aria-disabled=true]{cursor:url("data:image/svg+xml,${cursorForbidden}") 7 7,not-allowed!important}
/* Drag / grab */
.cursor-grab{cursor:url("data:image/svg+xml,${cursorGrab}") 1 1,grab!important}
.cursor-grabbing{cursor:url("data:image/svg+xml,${cursorGrabbing}") 1 1,grabbing!important}
/* Resize diagonals */
.cursor-nwse-resize{cursor:url("data:image/svg+xml,${cursorResizeNWSE}") 7 7,nwse-resize!important}
.cursor-nesw-resize{cursor:url("data:image/svg+xml,${cursorResizeNESW}") 7 7,nesw-resize!important}
 /* Boot animation */
 @keyframes bootFadeOut { to { opacity:0; filter:blur(2px); } }
 @keyframes bootScan { 0%,100% { opacity:0.15;} 50% { opacity:0.4;} }
 .boot-overlay{background:#000; color:#0f0; font-size:12px; letter-spacing:0.5px;}
 .boot-overlay.fade-out{animation: bootFadeOut 0.6s ease forwards;}
 .boot-scanline::after{content:''; position:absolute; inset:0; background:repeating-linear-gradient(to bottom, rgba(0,255,0,0.06) 0 2px, transparent 2px 4px); mix-blend-mode:overlay; pointer-events:none; animation:bootScan 2s linear infinite;}
 .boot-line{opacity:0; transform:translateY(4px); transition:opacity .25s ease, transform .25s ease;}
 .boot-line.visible{opacity:1; transform:translateY(0);} 
 /* Theme variables for the in-monitor screen */
 .crt-wrapper{ background: var(--screen-bg, #f2f2f2); color: var(--screen-fg, #111); }
 .crt-wrapper .text, .crt-wrapper .content, .crt-wrapper [data-window], .crt-wrapper input, .crt-wrapper button { color: inherit; }
 .crt-wrapper .bg-screen { background: var(--screen-bg, #f2f2f2); }
 .crt-wrapper .fg-screen { color: var(--screen-fg, #111); }
 /* Slight tint adjustments for phosphor */
 .crt-wrapper[style*='--screen-bg: #071a07'] .crt-vignette { opacity: 0.95; }
 .crt-wrapper[style*='--screen-bg: #071a07'] .crt-phosphor { opacity: 0.55; }
`}</style>
      {/* (Boot overlay global eliminado; se renderiza dentro de la pantalla) */}
      {/* SVG Filter for barrel distortion */}
  {/* Barrel filter desactivado temporalmente (set BARREL_FILTER_SCALE>0 para reactivar) */}
  {BARREL_FILTER_SCALE>0 && (
        <svg width="0" height="0" style={{position:'absolute'}} aria-hidden>
          <filter id="barrel-crt" x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
            {barrelMapUrl && (
              <image
                id="barrel-map"
                href={barrelMapUrl}
                x="0" y="0" width={BARREL_MAP_SIZE} height={BARREL_MAP_SIZE}
                preserveAspectRatio="none"
                result="map"
                
              />
            )}
            <feDisplacementMap in="SourceGraphic" in2="map" scale={BARREL_FILTER_SCALE} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      {/* Responsive stage: screen fills the viewport, no external monitor image */}
      <div className="absolute inset-0" style={{ overflow:'hidden' }}>
        <div
          ref={screenRef}
          className={`crt-wrapper barrelized absolute inset-0 border border-black/30 ${theme==='phosphor' ? 'theme-phosphor' : theme==='amber' ? 'theme-amber' : 'theme-classic'}`}
          style={{
            // theme applied here via CSS variables
            ['--screen-bg' as any]: theme==='phosphor'? '#071a07' : theme==='amber'? '#140c00' : '#f2f2f2',
            ['--screen-fg' as any]: theme==='phosphor'? '#b5ffb5' : theme==='amber'? '#ffd89a' : '#111111',
            cursor: `url("data:image/svg+xml,${theme==='phosphor'||theme==='amber'? cursorPointerLight : cursorPointer}") 1 1, default`
          }}
          onPointerMove={(e:React.PointerEvent)=>{iconMove(e); onBackgroundPointerMove(e);}}
          onPointerUp={(e:React.PointerEvent)=>{iconUp(e); onBackgroundPointerUp();}}
          onPointerDown={onBackgroundPointerDown}
        >
              {booting && (
                <div className={`boot-overlay absolute inset-0 z-[5000] flex flex-col px-4 py-3 font-mono overflow-hidden ${bootDone?'fade-out':''}`} style={{background:'#000'}}>
                  <div className="relative flex-1 boot-scanline">
                    <pre className="whitespace-pre-wrap leading-snug select-none">{
                      bootLines.map((l:string,i:number)=> (
                        <div key={i} className={`boot-line ${i < visibleBootCount ? 'visible':''}`}>{l}</div>
                      ))
                    }</pre>
                    {!audioUnlocked && !bootDone && (
                      <button
                        onClick={(e)=>{ /* simple hint; pointerdown global activará unlock */ e.stopPropagation(); }}
                        className="absolute top-1 right-1 text-[10px] px-2 py-[2px] bg-[#111] border border-green-600/50 rounded text-green-400 hover:bg-green-600/20"
                        title="Haz clic o pulsa una tecla para habilitar audio (autoplay bloqueado)"
                      >🔇 sonido</button>
                    )}
                    {!bootDone && <div className="mt-3 text-[10px] opacity-60">Pulsa cualquier tecla o clic para saltar…</div>}
                  </div>
                </div>
              )}
              {/* Screensaver / Lock overlay */}
              {locked && (
                <div className="ss-overlay absolute inset-0 z-[6000] flex flex-col items-center justify-center text-green-200" onKeyDown={(e:React.KeyboardEvent)=>{ if(e.key==='Enter') tryUnlock(); }}>
                  <div className="ss-glow absolute inset-0" />
                  <div className="ss-scan absolute inset-0" />
                  <div className="relative z-10 flex flex-col items-center gap-3 p-4 rounded border border-green-700 bg-black/60 shadow-[0_0_30px_rgba(0,255,140,0.25)]">
                    <div className="text-[12px] opacity-80">Sistema bloqueado — introduce la contraseña</div>
                    <div className="text-[18px] tracking-wide">Retro Lock</div>
                    <div className="flex items-center gap-2">
                      <label className="text-[12px]">Password</label>
                      <input ref={passRef} value={passInput} onChange={(e:React.ChangeEvent<HTMLInputElement>)=> { setPassInput(e.target.value); if(errorMsg) setErrorMsg(null); }} type="password" className="bg-black/70 border border-green-700 text-green-300 text-[12px] px-2 py-1 outline-none focus:border-green-400" placeholder="••••" autoComplete="off" />
                      <button onClick={tryUnlock} className="text-[12px] border border-green-700 px-2 py-1 hover:bg-green-600/20">Unlock</button>
                    </div>
                    {errorMsg && <div className="text-[10px] text-red-400">{errorMsg}</div>}
                    <div className="text-[10px] opacity-60">Los 4 primeros dígitos de un número muy famoso</div>
                    {attempts >= 3 && (
                      <div className="text-[10px] opacity-60">¿Te dice algo este símbolo? π</div>
                    )}
                  </div>
                </div>
              )}
              <div className="crt-curved-stage absolute inset-0" style={{ transform: curvedTransform }}>
              <div data-menu-bar className="relative z-50" >
                <MenuBar brand={BRAND} openMenu={openMenu} setOpenMenu={setOpenMenu} closeMenus={closeMenus} menuItems={menuItems as any} menuKeys={menuKeys as any} barHeight={MENU_BAR_HEIGHT} minimal={isMobile} />
              </div>
              {showCurvDebug && (
                <div className="absolute z-[120] top-[4px] right-[6px] bg-black/60 text-[10px] leading-tight text-white font-mono px-2 py-1 rounded shadow-lg backdrop-blur" style={{width:200}}>
                  <div className="flex items-center justify-between mb-1">
                    <span>Curv:</span>
                    <span>{curvature.toFixed(3)}</span>
                  </div>
                  <input type="range" min={0} max={0.4} step={0.002} value={curvature} onChange={e=> setCurvature(parseFloat(e.target.value))} className="w-full accent-white" />
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {[0,0.08,0.16,0.24,0.32].map(p=> (
                      <button key={p} onClick={()=> setCurvature(p)} className={`px-1 py-[1px] border border-white/30 rounded ${Math.abs(curvature-p)<0.002?'bg-white text-black':'text-white/80 hover:bg-white/20'}`}>{p}</button>
                    ))}
                    <button onClick={()=> setCurvature(0.18)} className="px-1 py-[1px] border border-white/30 rounded hover:bg-white/20">def</button>
                    <button onClick={()=> setShowCurvDebug(false)} className="ml-auto px-1 py-[1px] border border-white/30 rounded hover:bg-red-500/70">×</button>
                  </div>
                  <p className="mt-1 text-[9px] opacity-60">Alt+C toggle</p>
                </div>
              )}
              {isMobile ? (
                <div className="absolute inset-0" style={{ top: MENU_BAR_HEIGHT }}>
                  {/* Escritorio móvil: iconos de Proyectos y Terminal */}
                  <div className="absolute inset-x-0" style={{ top: 10 }}>
                    <div className="max-w-[520px] mx-auto px-4 relative" style={{ height: (viewport.w<=390? mobileIconBox*3.6 : mobileIconBox*2.4) }}>
                      <DesktopIcon id={'proj-mobile'} label={'Projects'} x={16} y={8} img={{src: `${base}icons/projects.png`}} isSelected={false} onDoubleClick={()=> bringToFront('projects')} onPointerDown={()=> bringToFront('projects')} boxPx={mobileIconBox} />
                      <DesktopIcon id={'term-mobile'} label={'Terminal'} x={(viewport.w<=390? 16 : 16 + Math.round(mobileIconBox + 20))} y={(viewport.w<=390? 8 + Math.round(mobileIconBox*1.3) : 8)} img={{src: `${base}icons/projects.png`}} isSelected={false} onDoubleClick={()=> bringToFront('terminal')} onPointerDown={()=> bringToFront('terminal')} boxPx={mobileIconBox} />
                    </div>
                  </div>
                  {/* Dock inferior con 4 acciones */}
                  <div className="absolute inset-x-0 bottom-6">
                    <div className="mx-auto max-w-[520px] flex items-center justify-around gap-3 px-4 py-2">
                      {/* Correo */}
                      <button aria-label="Email" onClick={()=>{ window.location.href = 'mailto:jesusferdev@gmail.com'; }} className="grid place-items-center rounded bg-white hover:bg-black hover:text-white border border-black" style={{ width: Math.round(mobileIconBox*1.45), height: Math.round(mobileIconBox*1.45) }} title="Email"><MailIcon size={Math.round(mobileIconBox*0.74)} /></button>
                      {/* About */}
                      <button aria-label="About" onClick={()=> bringToFront('about')} className="grid place-items-center rounded bg-white hover:bg-black hover:text-white border border-black" style={{ width: Math.round(mobileIconBox*1.45), height: Math.round(mobileIconBox*1.45) }} title="About"><MonitorIcon size={Math.round(mobileIconBox*0.74)} /></button>
                      {/* WhatsApp */}
                      <button aria-label="WhatsApp" onClick={()=>{ const phone='34600111222'; const text=encodeURIComponent('¡Hola! Vengo desde tu portfolio.'); window.location.href = `https://wa.me/${phone}?text=${text}`; }} className="grid place-items-center rounded bg-white hover:bg-black hover:text-white border border-black" style={{ width: Math.round(mobileIconBox*1.45), height: Math.round(mobileIconBox*1.45) }} title="WhatsApp"><ChatIcon size={Math.round(mobileIconBox*0.74)} /></button>
                      {/* Navegador/LinkedIn */}
                      <button aria-label="LinkedIn" onClick={()=>{ window.open('https://www.linkedin.com/in/jesusferdev','_blank','noopener'); }} className="grid place-items-center rounded bg-white hover:bg-black hover:text-white border border-black" style={{ width: Math.round(mobileIconBox*1.45), height: Math.round(mobileIconBox*1.45) }} title="LinkedIn"><GlobeIcon size={Math.round(mobileIconBox*0.74)} /></button>
                    </div>
                  </div>
                </div>
              ) : (
                <div ref={iconAreaRef} className="absolute inset-x-0 bottom-0" style={{ top: MENU_BAR_HEIGHT }}>
                  {icons.map(ic=> (
                    <DesktopIcon key={ic.id} id={ic.id} label={ic.label} x={ic.x} y={ic.y} img={ic.img} isSelected={selectedIcons.includes(ic.id)} onDoubleClick={()=>iconDbl(ic.id)} onPointerDown={(e)=>iconDown(e,ic.id)} />
                  ))}
                  <div className="pointer-events-none absolute inset-0">
                    {trail.map(td=> {
                      const age = Date.now()-td.created; const life = TRAIL_LIFE; const t = Math.min(1, age / life); const opacity = 1 - t; if(opacity<=0) return null; const containerW=92; const square=64; const offsetX=(containerW-square)/2; const left=td.x+offsetX; const top=td.y; const scale=1+0.05*(1-t); return (
                        <div key={td.created+td.id+Math.random()} style={{ position:'absolute', left, top, width:square, height:square, opacity, transform:`scale(${scale})`, pointerEvents:'none', transition:'opacity 90ms linear' }}>
                          <div data-icon-trail className="w-full h-full bg-white ring-1 ring-black flex items-center justify-center">
                            {td.src ? <img src={td.src} className="w-12 h-12 object-contain" draggable={false} /> : <div className="w-12 h-12 bg-black" />}
                          </div>
                        </div>
                      ); })}
                  </div>
                  {marquee && (()=>{ const {x1,y1,x2,y2}=marquee; const left=Math.min(x1,x2); const top=Math.min(y1,y2); const w=Math.abs(x1-x2); const h=Math.abs(y1-y2); return (
                    <div className="absolute border border-black/70 bg-black/10" style={{ left, top, width:w, height:h, backdropFilter:'invert(1) contrast(1.2)' }} />
                  ); })()}
                </div>
              )}
              {(isMobile
                ? (()=>{ const openWins = wins.filter(w=>w.open); if(!openWins.length) return [] as RetroWindow[]; const top = openWins.reduce((a,b)=> a.z>b.z? a:b); return [top]; })()
                : wins
              ).map(w=> (
                <Window
                  key={w.key}
                  x={isMobile? 12 : w.x}
                  y={isMobile? MENU_BAR_HEIGHT + 10 : w.y}
                  w={isMobile? Math.max(240, viewport.w - (12+12)) : w.w}
                  h={isMobile? clamp(Math.round(viewport.h * 0.92), 220, viewport.h - MENU_BAR_HEIGHT - (10+12)) : w.h}
                  z={w.z}
                  title={w.title}
                  open={w.open}
                  onClose={()=> setOpen(w.key,false)}
                  dragProps={isMobile? undefined : dragMap[w.key]}
                  resizeProps={isMobile? undefined : resizeMap[w.key]}
                  contentClassName={w.key==='terminal' ? 'terminal-body overflow-hidden' : (w.key==='projects' ? 'projects-body' : undefined)}
                  statusText={w.key==='projects' ? 'Doble clic → Detalles  •  Shift = rango  •  Ctrl = multi' : undefined}
                  growBox={!isMobile}
                >
                  {/* PERSONAL: About/Socials/Terminal customization happens through props here */}
                  {/* PERSONAL: About/Socials/Terminal customization happens through props here */}
                  <WindowBody
                    win={w}
                    brand={BRAND}
                    projects={projects}
                    selectedProject={selectedProject}
                    onSelectProject={setSelectedProject}
                    onCloseKey={(key)=> setOpen(key,false)}
                    bringToFrontKey={bringToFront}
                    theme={theme}
                    onThemeChange={setTheme}
                    screensaverMs={screensaverMs}
                    onScreensaverMsChange={setScreensaverMs}
                    base={base}
                  />
                </Window>
              ))}
              <div className="crt-barrel-overlay" style={{ cursor: `url("data:image/svg+xml,${theme==='phosphor'||theme==='amber'? cursorPointerLight : cursorPointer}") 1 1, default` }} />
                <div className="crt-barrel-specular" style={{ cursor: `url("data:image/svg+xml,${theme==='phosphor'||theme==='amber'? cursorPointerLight : cursorPointer}") 1 1, default` }} />
            </div>
            {/* CRT overlays */}
            <div className="crt-vignette" style={{ cursor: `url("data:image/svg+xml,${theme==='phosphor'||theme==='amber'? cursorPointerLight : cursorPointer}") 1 1, default` }} />
            <div className="crt-inner-bezel" style={{ cursor: `url("data:image/svg+xml,${theme==='phosphor'||theme==='amber'? cursorPointerLight : cursorPointer}") 1 1, default` }} />
            <div className="crt-phosphor" style={{ cursor: `url("data:image/svg+xml,${theme==='phosphor'||theme==='amber'? cursorPointerLight : cursorPointer}") 1 1, default` }} />
            <div className="crt-distort" style={{ cursor: `url("data:image/svg+xml,${theme==='phosphor'||theme==='amber'? cursorPointerLight : cursorPointer}") 1 1, default` }} />
          </div>
        </div>
    {/* Screensaver styles */}
    <style>{`
    @keyframes ssFlicker { 0%,100%{ opacity:0.98 } 50% { opacity:1 } }
    @keyframes ssScan { 0% { transform: translateY(-100%) } 100% { transform: translateY(100%) } }
    .ss-overlay{ background: radial-gradient(ellipse at center, rgba(0,20,0,0.65) 0%, rgba(0,0,0,0.9) 60%, rgba(0,0,0,1) 100%); backdrop-filter: blur(0.6px) saturate(1.1); animation: ssFlicker 1.8s ease-in-out infinite; }
    .ss-scan{ background: linear-gradient(to bottom, rgba(160,255,160,0.06) 0%, rgba(0,0,0,0) 60%); mix-blend-mode: screen; animation: ssScan 3.2s linear infinite; opacity:0.4; }
    .ss-glow{ pointer-events:none; box-shadow: inset 0 0 140px rgba(0,255,160,0.08), inset 0 0 28px rgba(0,255,160,0.12); }
    `}</style>
          <style>{`
            [data-window] .win-content.terminal-body { padding: 0; background-color: #101010; }
            [data-window] .win-content.terminal-body .retro-terminal-root { border-radius: 0; }
          `}</style>
          {/* Theme style overrides for green-phosphor: emphasize readability */}
          <style>{`
            /* Global theme image filter variables */
            .theme-classic{ --theme-image-filter: grayscale(1) contrast(1.06); }
            .theme-phosphor{ --theme-image-filter: grayscale(1) brightness(0.92) sepia(1) hue-rotate(90deg) saturate(2.1) contrast(1.08); }
            .theme-amber{ --theme-image-filter: grayscale(1) brightness(0.94) sepia(1) hue-rotate(-20deg) saturate(2.2) contrast(1.08); }

            /* Apply filters to raster images inside icons and window content */
            .theme-classic [data-icon] img,
            .theme-classic [data-icon-trail] img,
            .theme-classic [data-window] .win-content img{ filter: var(--theme-image-filter); }
            .theme-phosphor [data-icon] img,
            .theme-phosphor [data-icon-trail] img,
            .theme-phosphor [data-window] .win-content img{ filter: var(--theme-image-filter); }
            .theme-amber [data-icon] img,
            .theme-amber [data-icon-trail] img,
            .theme-amber [data-window] .win-content img{ filter: var(--theme-image-filter); }

            /* Also tint the trail tile background to avoid white glare */
            .theme-phosphor [data-icon-trail]{ background-color: rgba(0,24,0,0.5) !important; }
            .theme-amber [data-icon-trail]{ background-color: rgba(26,18,0,0.5) !important; }

            /* Global content whites -> themed gray for readability */
            .theme-phosphor [data-window] .win-content .bg-white,
            .theme-phosphor [data-window] .win-content [class*="bg-[#"]{ background-color: rgba(0,24,0,0.5) !important; }
            .theme-amber [data-window] .win-content .bg-white,
            .theme-amber [data-window] .win-content [class*="bg-[#"]{ background-color: rgba(26,18,0,0.5) !important; }

            .theme-phosphor{ --crt-scanline-color: rgba(0,255,150,0.05); --crt-mask-color: rgba(0,255,140,0.03); }
            .theme-phosphor{ -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
            .theme-phosphor * { text-shadow: 0 0 0.6px rgba(160,255,160,0.28); }
            .theme-phosphor .crt-wrapper::before{ opacity: 0.32; animation-duration: 24s; }
            .theme-phosphor .crt-wrapper::after{ opacity: 0.22; }
            .theme-phosphor .crt-vignette{ opacity: 0.88; }
            .theme-phosphor .crt-phosphor{ opacity: 0.48; }
            /* Menu bar inside screen */
            .theme-phosphor [data-menu-bar] > div{ background-color: rgba(0,28,0,0.72) !important; border-color: rgba(0,255,160,0.28) !important; color: var(--screen-fg,#b5ffb5) !important; }
            .theme-phosphor [data-menu-bar] .border{ border-color: rgba(0,255,160,0.28) !important; }
            .theme-phosphor [data-menu-bar] .bg-white{ background-color: rgba(0,22,0,0.86) !important; }
            .theme-phosphor [data-menu-bar] button{ color: var(--screen-fg,#b5ffb5) !important; }
            .theme-phosphor [data-menu-bar] .hover\:bg-black:hover{ background-color: rgba(0,80,0,0.6) !important; }
            .theme-phosphor [data-menu-bar] .hover\:text-white:hover{ color: var(--screen-fg,#b5ffb5) !important; }
      /* Windows */
      .theme-phosphor [data-window].window-main{ background-color: rgba(0,22,0,0.62) !important; border-color: rgba(0,255,160,0.26) !important; color: var(--screen-fg,#b5ffb5) !important; }
      .theme-phosphor [data-window] .border-black{ border-color: rgba(0,255,160,0.26) !important; }
      .theme-phosphor [data-window] .bg-white{ background-color: rgba(0,24,0,0.5) !important; }
  /* Window title specifically black for readability (no bg override) */
  .theme-phosphor [data-window] .win-chrome .win-title{ color: #041404 !important; text-shadow: none !important; }
            /* Icons */
            .theme-phosphor [data-icon] .bg-white{ background-color: rgba(0,28,0,0.55) !important; }
            .theme-phosphor [data-icon] .ring-black{ box-shadow: inset 0 0 0 1px rgba(0,255,128,0.22) !important; }
            .theme-phosphor [data-icon] span{ background-color: rgba(0,24,0,0.66) !important; color: var(--screen-fg,#b5ffb5) !important; }
            /* Typography overrides for readability */
            .theme-phosphor .text-black, .theme-phosphor .text-white, .theme-phosphor [class*='text-black/'], .theme-phosphor [class*='text-white/']{ color: var(--screen-fg,#b5ffb5) !important; }
            /* Inputs */
            .theme-phosphor input, .theme-phosphor textarea, .theme-phosphor select{ background-color: rgba(0,24,0,0.62) !important; border-color: rgba(0,255,160,0.26) !important; color: var(--screen-fg,#b5ffb5) !important; }

            /* Projects window */
            .theme-phosphor [data-window] .projects-body{ background-color: rgba(0,24,0,0.52) !important; color: var(--screen-fg,#b5ffb5) !important; }
            .theme-phosphor [data-window] .projects-body .border-black{ border-color: rgba(0,255,160,0.26) !important; }
            .theme-phosphor [data-window] .projects-body .bg-white,
            .theme-phosphor [data-window] .projects-body [class*="bg-[#"]{ background-color: rgba(0,24,0,0.5) !important; }
            .theme-phosphor [data-window] .projects-body .hover\:bg-black:hover,
            .theme-phosphor [data-window] .projects-body li:hover,
            .theme-phosphor [data-window] .projects-body button:hover{ background-color: rgba(0,80,0,0.55) !important; color: var(--screen-fg,#b5ffb5) !important; }

            /* High-contrast cursors for dark phosphor theme */
            .theme-phosphor.crt-wrapper,
            .theme-phosphor.crt-wrapper *,
            .theme-phosphor button,
            .theme-phosphor [role=button],
            .theme-phosphor a,
            .theme-phosphor .cursor-pointer,
            .theme-phosphor.crt-wrapper,
            .theme-phosphor .crt-wrapper,
            .theme-phosphor .crt-wrapper *,
            .theme-phosphor [data-icon]{ cursor:url("data:image/svg+xml,${cursorPointerLight}") 1 1, pointer !important; }
            .theme-phosphor button:not(:disabled):hover,
            .theme-phosphor a:hover,
            .theme-phosphor [role=button]:hover,
            .theme-phosphor .cursor-pointer:hover,
            .theme-phosphor.crt-wrapper:hover,
            .theme-phosphor.crt-wrapper:hover,
            .theme-phosphor .crt-wrapper:hover,
            .theme-phosphor [data-icon]:hover,
            .theme-phosphor .clickable-hover:hover,
            .theme-phosphor .menu-item:hover{ cursor:url("data:image/svg+xml,${cursorPointerHoverLight}") 1 1, pointer !important; }
            .theme-phosphor input[type=text],
            .theme-phosphor textarea,
            .theme-phosphor .text-input,
            .theme-phosphor .selectable-text{ cursor:url("data:image/svg+xml,${cursorTextLight}") 7 7, text !important; }
            .theme-phosphor .cursor-grab{ cursor:url("data:image/svg+xml,${cursorGrabLight}") 1 1, grab !important; }
            .theme-phosphor .cursor-grabbing{ cursor:url("data:image/svg+xml,${cursorGrabbingLight}") 1 1, grabbing !important; }
            .theme-phosphor .cursor-nwse-resize{ cursor:url("data:image/svg+xml,${cursorResizeNWSELight}") 7 7, nwse-resize !important; }
            .theme-phosphor .cursor-nesw-resize{ cursor:url("data:image/svg+xml,${cursorResizeNESWLight}") 7 7, nesw-resize !important; }

            /* Amber theme (retro amber monochrome) */
            .theme-amber{ --crt-scanline-color: rgba(255,170,60,0.05); --crt-mask-color: rgba(255,200,120,0.03); }
            .theme-amber{ -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
            .theme-amber * { text-shadow: 0 0 0.6px rgba(255,220,150,0.22); }
            .theme-amber .crt-wrapper::before{ opacity: 0.30; animation-duration: 24s; }
            .theme-amber .crt-wrapper::after{ opacity: 0.20; }
            .theme-amber .crt-vignette{ opacity: 0.86; }
            .theme-amber .crt-phosphor{ opacity: 0.44; }
            /* Menu bar inside screen */
            .theme-amber [data-menu-bar] > div{ background-color: rgba(40,24,0,0.72) !important; border-color: rgba(255,200,120,0.28) !important; color: var(--screen-fg,#ffd89a) !important; }
            .theme-amber [data-menu-bar] .border{ border-color: rgba(255,200,120,0.28) !important; }
            .theme-amber [data-menu-bar] .bg-white{ background-color: rgba(30,18,0,0.86) !important; }
            .theme-amber [data-menu-bar] button{ color: var(--screen-fg,#ffd89a) !important; }
            .theme-amber [data-menu-bar] .hover\:bg-black:hover{ background-color: rgba(90,60,0,0.6) !important; }
            .theme-amber [data-menu-bar] .hover\:text-white:hover{ color: var(--screen-fg,#ffd89a) !important; }
      /* Windows */
      .theme-amber [data-window].window-main{ background-color: rgba(28,18,0,0.62) !important; border-color: rgba(255,200,120,0.26) !important; color: var(--screen-fg,#ffd89a) !important; }
      .theme-amber [data-window] .border-black{ border-color: rgba(255,200,120,0.26) !important; }
      .theme-amber [data-window] .bg-white{ background-color: rgba(24,16,0,0.5) !important; }
  /* Window title specifically black for readability (no bg override) */
  .theme-amber [data-window] .win-chrome .win-title{ color: #1a1200 !important; text-shadow: none !important; }
            /* Icons */
            .theme-amber [data-icon] .bg-white{ background-color: rgba(40,28,0,0.55) !important; }
            .theme-amber [data-icon] .ring-black{ box-shadow: inset 0 0 0 1px rgba(255,200,120,0.22) !important; }
            .theme-amber [data-icon] span{ background-color: rgba(30,20,0,0.66) !important; color: var(--screen-fg,#ffd89a) !important; }
            /* Typography overrides for readability */
            .theme-amber .text-black, .theme-amber .text-white, .theme-amber [class*='text-black/'], .theme-amber [class*='text-white/']{ color: var(--screen-fg,#ffd89a) !important; }
            /* Inputs */
            .theme-amber input, .theme-amber textarea, .theme-amber select{ background-color: rgba(26,18,0,0.62) !important; border-color: rgba(255,200,120,0.26) !important; color: var(--screen-fg,#ffd89a) !important; }

            /* Projects window */
            .theme-amber [data-window] .projects-body{ background-color: rgba(26,18,0,0.52) !important; color: var(--screen-fg,#ffd89a) !important; }
            .theme-amber [data-window] .projects-body .border-black{ border-color: rgba(255,200,120,0.26) !important; }
            .theme-amber [data-window] .projects-body .bg-white,
            .theme-amber [data-window] .projects-body [class*="bg-[#"]{ background-color: rgba(26,18,0,0.5) !important; }
            .theme-amber [data-window] .projects-body .hover\:bg-black:hover,
            .theme-amber [data-window] .projects-body li:hover,
            .theme-amber [data-window] .projects-body button:hover{ background-color: rgba(90,60,0,0.55) !important; color: var(--screen-fg,#ffd89a) !important; }

            /* High-contrast cursors for dark amber theme */
            .theme-amber.crt-wrapper,
            .theme-amber.crt-wrapper *,
            .theme-amber button,
            .theme-amber [role=button],
            .theme-amber a,
            .theme-amber .cursor-pointer,
            .theme-amber.crt-wrapper,
            .theme-amber .crt-wrapper,
            .theme-amber .crt-wrapper *,
            .theme-amber [data-icon]{ cursor:url("data:image/svg+xml,${cursorPointerLight}") 1 1, pointer !important; }
            .theme-amber button:not(:disabled):hover,
            .theme-amber a:hover,
            .theme-amber [role=button]:hover,
            .theme-amber .cursor-pointer:hover,
            .theme-amber.crt-wrapper:hover,
            .theme-amber.crt-wrapper:hover,
            .theme-amber .crt-wrapper:hover,
            .theme-amber [data-icon]:hover,
            .theme-amber .clickable-hover:hover,
            .theme-amber .menu-item:hover{ cursor:url("data:image/svg+xml,${cursorPointerHoverLight}") 1 1, pointer !important; }
            .theme-amber input[type=text],
            .theme-amber textarea,
            .theme-amber .text-input,
            .theme-amber .selectable-text{ cursor:url("data:image/svg+xml,${cursorTextLight}") 7 7, text !important; }
            .theme-amber .cursor-grab{ cursor:url("data:image/svg+xml,${cursorGrabLight}") 1 1, grab !important; }
            .theme-amber .cursor-grabbing{ cursor:url("data:image/svg+xml,${cursorGrabbingLight}") 1 1, grabbing !important; }
            .theme-amber .cursor-nwse-resize{ cursor:url("data:image/svg+xml,${cursorResizeNWSELight}") 7 7, nwse-resize !important; }
            .theme-amber .cursor-nesw-resize{ cursor:url("data:image/svg+xml,${cursorResizeNESWLight}") 7 7, nesw-resize !important; }

            /* Classic theme: ensure menu hover text is legible (white on black) */
            .theme-classic [data-menu-bar] button { color: #111 !important; }
            .theme-classic [data-menu-bar] button:hover { color: #fff !important; }
            .theme-classic [data-menu-bar] button.bg-black { color: #fff !important; }
            .theme-classic [data-menu-bar] .hover\:text-white:hover { color: #fff !important; }
          `}</style>
          {/* Mobile XL overrides removed from desktop route to isolate them in MobileHome */}
      {/* monitor debug panel removed in responsive version */}
    </div>
  );
}
