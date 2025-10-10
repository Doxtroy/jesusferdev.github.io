// Backup of previous RetroMac128KPortfolio.tsx before full rewrite.
// Timestamp: 2025-10-06

import React, { useEffect, useMemo, useRef, useState } from 'react';
import AboutBody from './components/AboutBody';
import SocialBody from './components/SocialBody';
import ProjectsBody, { type Project } from './components/ProjectsBody';
import Window from './components/Window';
import DesktopIcon from './components/DesktopIcon';
import MenuBar from './components/MenuBar';

type WinKey = 'about' | 'projects' | 'social';
interface RetroWindow { key:WinKey; title:string; x:number; y:number; w:number; h:number; open:boolean; z:number; minimized?:boolean }
interface DesktopIconType { id:string; label:string; x:number; y:number; openKey?:WinKey; img?:{src:string;w?:number;h?:number} }

const clamp = (v:number,min:number,max:number)=> Math.max(min, Math.min(max,v));
const loadWinPositions = ():Record<string,Partial<RetroWindow>> => { try { const raw=localStorage.getItem('retro-win-pos'); return raw? JSON.parse(raw):{}; } catch { return {}; } };
const saveWinPositions = (wins:RetroWindow[]) => { try { const o:Record<string,Partial<RetroWindow>>={}; wins.forEach(w=>{o[w.key]={x:w.x,y:w.y,w:w.w,h:w.h,z:w.z,open:w.open};}); localStorage.setItem('retro-win-pos', JSON.stringify(o)); } catch {} };
const loadIcons = ():DesktopIconType[]|null => { try { const raw=localStorage.getItem('retro-icons'); return raw? JSON.parse(raw):null;} catch { return null;} };
const saveIcons = (icons:DesktopIconType[]) => { try { localStorage.setItem('retro-icons', JSON.stringify(icons)); } catch {} };

export default function RetroMac128KPortfolio(){
  const BRAND='JesusFerDev';
  const screenRef = useRef<HTMLDivElement>(null);
  const [maxZ,setMaxZ] = useState(10);
  const defaultWinDefs:Record<WinKey,{x:number;y:number;w:number;h:number}>= { about:{x:120,y:120,w:560,h:360}, projects:{x:260,y:160,w:860,h:520}, social:{x:320,y:180,w:640,h:360} };
  const initialWins:RetroWindow[] = useMemo(()=>{ const stored=loadWinPositions(); const base:RetroWindow[]=[ { key:'about', title:'About Jesús', x:120,y:120,w:560,h:360,open:true,z:10 }, { key:'projects', title:'Projects', x:260,y:160,w:860,h:520,open:false,z:9 }, { key:'social', title:'Social Life', x:320,y:180,w:640,h:360,open:false,z:8 } ]; return base.map(w=>({ ...w, ...(stored[w.key]||{}) })); },[]);
  const [wins,setWins] = useState<RetroWindow[]>(initialWins);
  useEffect(()=> saveWinPositions(wins),[wins]);
  const bringToFront = (key:WinKey)=> setWins(p=>{ const next=maxZ+1; setMaxZ(next); return p.map(w=> w.key===key? { ...w, z:next, open:true, minimized:false }:w); });
  const setOpen = (key:WinKey, open:boolean) => setWins(p=> p.map(w=> w.key===key? { ...w, open }: w));
  const closeAll = () => setWins(p=> p.map(w=> ({...w, open:false})));
  const openAll  = () => setWins(p=> p.map(w=> ({...w, open:true })));
  const resetLayout = () => setWins(p=> p.map(w=> ({...w, ...defaultWinDefs[w.key]})));
  const bringAllToFront = () => setWins(p=> { let next = maxZ; const updated = p.map(w=> { next+=1; return { ...w, z:next }; }); setMaxZ(next); return updated; });
  const cascade = () => setWins(p=> p.map((w,i)=> ({...w, x: 80 + i*48, y: 80 + i*48 })));
  const tileHorizontal = () => setWins(p=> { const openWins = p.filter(w=>w.open); if(openWins.length===0) return p; const bounds = screenRef.current?.getBoundingClientRect(); const totalH = (bounds?.height||800) - 60; const eachH = Math.max(140, Math.floor(totalH / openWins.length)-12); return p.map(w=>{ if(!w.open) return w; const idx = openWins.findIndex(o=>o.key===w.key); if(idx===-1) return w; return { ...w, x: 100, y: 60 + idx*(eachH+8), w: Math.min(w.w, (bounds?.width||1200)-160), h: eachH }; }); });
  const minimizeAll = () => setWins(p=> p.map(w=> ({...w, open:false})));
  useEffect(()=>{ const bounds = screenRef.current?.getBoundingClientRect(); if(!bounds) return; const bw = bounds.width - 6; const bh = bounds.height - 6; setWins(p=> p.map(w=> ({ ...w, x: clamp(w.x, 0, Math.max(0, bw - w.w)), y: clamp(w.y, 24, Math.max(24, bh - w.h)) }))); },[]);
  const useDragWin = (key:WinKey) => { const start=useRef<{x:number;y:number}|null>(null); const last=useRef<{x:number;y:number}|null>(null); const onPointerDown=(e:React.PointerEvent)=>{ (e.target as HTMLElement).setPointerCapture(e.pointerId); start.current={x:e.clientX,y:e.clientY}; last.current=start.current; bringToFront(key); }; const onPointerMove=(e:React.PointerEvent)=>{ if(!start.current) return; const dx=e.clientX-(last.current?.x||e.clientX); const dy=e.clientY-(last.current?.y||e.clientY); last.current={x:e.clientX,y:e.clientY}; const bounds = screenRef.current?.getBoundingClientRect(); const bw = (bounds?.width ?? 1200) - 6; const bh = (bounds?.height ?? 800) - 6; setWins(p=> p.map(w=> { if(w.key!==key) return w; const newX = clamp(w.x+dx, 0, Math.max(0, bw - w.w)); const newY = clamp(w.y+dy, 24, Math.max(24, bh - w.h)); return { ...w, x:newX, y:newY }; })); }; const onPointerUp=(e:React.PointerEvent)=>{ (e.target as HTMLElement).releasePointerCapture(e.pointerId); start.current=null; last.current=null; }; return { onPointerDown,onPointerMove,onPointerUp }; };
  const useResizeWin = (key:WinKey) => { const start=useRef<{x:number;y:number;w:number;h:number}|null>(null); const onPointerDown=(e:React.PointerEvent)=>{ (e.target as HTMLElement).setPointerCapture(e.pointerId); const w=wins.find(v=>v.key===key)!; start.current={x:e.clientX,y:e.clientY,w:w.w,h:w.h}; bringToFront(key); }; const onPointerMove=(e:React.PointerEvent)=>{ if(!start.current) return; const dx=e.clientX-start.current.x; const dy=e.clientY-start.current.y; const bounds = screenRef.current?.getBoundingClientRect(); const bw = (bounds?.width ?? 1200) - 6; const bh = (bounds?.height ?? 800) - 6; setWins(p=> p.map(w=> { if(w.key!==key) return w; let newW = clamp(start.current!.w + dx, 260, 1500); let newH = clamp(start.current!.h + dy, 160, 900); newW = Math.min(newW, bw - w.x); newH = Math.min(newH, bh - w.y); return { ...w, w:newW, h:newH }; })); }; const onPointerUp=(e:React.PointerEvent)=>{ (e.target as HTMLElement).releasePointerCapture(e.pointerId); start.current=null; }; return { onPointerDown,onPointerMove,onPointerUp }; };
  const defaultIcons:DesktopIconType[]=[ { id:'proj', label:'Projects', x:24,y:70, openKey:'projects', img:{src:'/icons/projects.png'} }, { id:'social', label:'Social', x:24,y:210, openKey:'social', img:{src:'/icons/folder-heart.png'} }, { id:'about', label:'About Me', x:24,y:350, openKey:'about', img:{src:'/icons/about.png'} } ];
  const [icons,setIcons] = useState<DesktopIconType[]>(()=> loadIcons() ?? defaultIcons);
  useEffect(()=> saveIcons(icons),[icons]);
  const [selectedIcons,setSelectedIcons] = useState<string[]>([]);
  const [dragIconId,setDragIconId] = useState<string|null>(null);
  const iconSize={w:92,h:104};
  const iconDown=(e:React.PointerEvent,id:string)=>{ e.preventDefault(); e.stopPropagation(); (e.target as HTMLElement).setPointerCapture(e.pointerId); setDragIconId(id); if(!selectedIcons.includes(id)) setSelectedIcons([id]); };
  const iconMove=(e:React.PointerEvent)=>{ if(!dragIconId) return; const d=screenRef.current?.getBoundingClientRect(); setIcons(p=> p.map(ic=> selectedIcons.includes(ic.id)?{ ...ic, x:clamp(ic.x+(e.movementX||0),8,(d?.width||1000)-iconSize.w-8), y:clamp(ic.y+(e.movementY||0),24,(d?.height||700)-iconSize.h-8) }:ic)); };
  const iconUp=(e:React.PointerEvent)=>{ if(!dragIconId) return; (e.target as HTMLElement).releasePointerCapture(e.pointerId); setDragIconId(null); };
  const iconDbl=(id:string)=>{ const ic=icons.find(i=>i.id===id); if(ic?.openKey) bringToFront(ic.openKey); };
  const projects:Project[]=[ { id:'ucm', title:'Máster UCM', short:'Liderando el Futuro Sostenible', image:'/projects/ucm.png', tech:['WordPress','JavaScript','PHP'] }, { id:'coduck', title:'Coduck', short:'Plataforma de formación', image:'/projects/coduck.png', tech:['React','Node','PostgreSQL'] }, { id:'madmusic', title:'MadMusic', short:'Tienda de instrumentos', image:'/projects/madmusic.png', tech:['Next.js','Stripe'] } ];
  const [selectedProject,setSelectedProject] = useState<Project|null>(projects[0]);
  const [openMenu,setOpenMenu] = useState<string|null>(null); const closeMenus=()=> setOpenMenu(null);
  const menuItems = { Finder:[ {label:`${BRAND} (About)`, action:()=>bringToFront('about')}, {label:'---'}, {label:'Open All', action: openAll}, {label:'Close All', action: closeAll} ], File:[ {label:'Open About', action:()=>bringToFront('about')}, {label:'Open Projects', action:()=>bringToFront('projects')}, {label:'Open Social', action:()=>bringToFront('social')}, {label:'---'}, {label:'Reset Layout', action: resetLayout} ], Window:[ {label:'Bring All to Front', action: bringAllToFront}, {label:'Cascade', action: cascade}, {label:'Tile Horizontal', action: tileHorizontal}, {label:'Minimize All', action: minimizeAll} ], View:[ {label:'Reset Icons', action:()=> setIcons(defaultIcons)}, {label:'Reset Layout', action: resetLayout} ] } as const;
  const menuKeys = Object.keys(menuItems);
  const cursorPointer = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M1 1 L12 8 L8 9 L9 13 L7 14 L6 10 L2 12 Z' fill='black'/></svg>`);
  const WindowBody:React.FC<{win:RetroWindow}> = ({ win }) => { if(win.key==='about') return <AboutBody brand={BRAND}/>; if(win.key==='social') return <SocialBody LINKS={{ github:'https://github.com/JesusFerDev' }}/>; if(win.key==='projects') return <ProjectsBody list={projects} selected={selectedProject} onSelect={setSelectedProject}/>; return null; };
  return (<div className="relative h-screen w-full overflow-hidden bg-[#cfcfcf]"><style>{`html,body,#root{font-family:ui-monospace,Menlo,Monaco,'Courier New',monospace} button,[role=button],a,.cursor-pointer{cursor:url("data:image/svg+xml,${cursorPointer}") 1 1,pointer}`}</style><div className="absolute inset-0 grid place-items-center"><div className="relative aspect-[512/342] w-[min(98vw,1400px)] border-8 border-[#b9b9b9] bg-[#b9b9b9] shadow-[inset_0_8px_0_#ccc,0_25px_60px_rgba(0,0,0,0.35)]"><div ref={screenRef} className="absolute inset-3 border border-black bg-[#f2f2f2]" onPointerMove={iconMove} onPointerUp={iconUp}><MenuBar brand={BRAND} openMenu={openMenu} setOpenMenu={setOpenMenu} closeMenus={closeMenus} menuItems={menuItems as any} menuKeys={menuKeys as any} /><div className="absolute inset-0">{icons.map(ic=> (<DesktopIcon key={ic.id} id={ic.id} label={ic.label} x={ic.x} y={ic.y} img={ic.img} isSelected={selectedIcons.includes(ic.id)} onDoubleClick={()=>iconDbl(ic.id)} onPointerDown={(e)=>iconDown(e,ic.id)} />))}</div>{wins.map(w=> (<Window key={w.key} x={w.x} y={w.y} w={w.w} h={w.h} z={w.z} title={w.title} open={w.open} onClose={()=> setOpen(w.key,false)} dragProps={useDragWin(w.key)} resizeProps={useResizeWin(w.key)} growBox><WindowBody win={w} /></Window>))}</div></div></div></div>); }
