import React, { useEffect, useMemo, useState } from "react";

// Proyecto
export interface Project {
  id: string; title: string; short: string; image: string; tech: string[]; url?: string;
}
interface ProjectsBodyProps { list: Project[]; selected: Project | null; onSelect:(p:Project)=>void; }

// Iconos genéricos retro (podrías sustituir por assets locales)
const folderIcon = (open:boolean) => (
  <div className={`h-6 w-7 border border-black relative bg-[#ffe48a] ${open? 'before:content-[" "] before:absolute before:-top-2 before:left-0 before:h-2 before:w-4 before:bg-[#ffe48a] before:border before:border-black':''}`}></div>
);

const ProjectsBody:React.FC<ProjectsBodyProps> = ({ list, selected, onSelect }) => {
  const [view,setView] = useState<'list'|'icons'>('list');
  const [selectedIds,setSelectedIds] = useState<string[]>(()=> selected? [selected.id]: []);
  const [lastIndex,setLastIndex] = useState<number>(-1);
  const [activeTag,setActiveTag] = useState<string|null>(null);
  const [sortKey,setSortKey] = useState<'name'|'tech'|'desc'>('name');
  const [sortDir,setSortDir] = useState<1|-1>(1);

  // Build tag list from tech arrays
  const allTags = useMemo(()=> Array.from(new Set(list.flatMap(p=> p.tech))).sort(), [list]);

  // Filter by tag
  const filtered = useMemo(()=> activeTag? list.filter(p=> p.tech.includes(activeTag)) : list, [list, activeTag]);

  // Sort
  const sorted = useMemo(()=> {
    const arr=[...filtered];
    arr.sort((a,b)=>{
      if(sortKey==='name') return a.title.localeCompare(b.title)*sortDir;
      if(sortKey==='tech') return a.tech.join(',').localeCompare(b.tech.join(','))*sortDir;
      return a.short.localeCompare(b.short)*sortDir; // desc
    });
    return arr;
  },[filtered, sortKey, sortDir]);

  // Clean selection if items disappear
  useEffect(()=>{
    if(!selectedIds.length) return;
    const still = selectedIds.filter(id=> sorted.some(p=>p.id===id));
    if(still.length !== selectedIds.length) setSelectedIds(still);
  },[sorted, selectedIds]);

  if(!list?.length) return <div className="p-6 text-center text-[12px]">(Vacío)</div>;
  const active = (selectedIds.length? list.find(p=> p.id===selectedIds[selectedIds.length-1]) : (selected || sorted[0])) || sorted[0];

  const toggleSort = (key:'name'|'tech'|'desc') => {
    if(sortKey===key) setSortDir(d=> d===1? -1:1); else { setSortKey(key); setSortDir(1); }
  };

  const handleSelect = (e:React.MouseEvent, p:Project, index:number) => {
    const multiKey = e.metaKey || e.ctrlKey;
    const rangeKey = e.shiftKey;
    if(!multiKey && !rangeKey) {
      setSelectedIds([p.id]);
      setLastIndex(index);
    } else if(rangeKey) {
      const start = lastIndex>=0? lastIndex : index;
      const [a,b]= start<index? [start,index] : [index,start];
      const ids = sorted.slice(a,b+1).map(x=>x.id);
      setSelectedIds(prev=> Array.from(new Set([...prev, ...ids])));
      setLastIndex(index);
    } else if(multiKey) {
      setSelectedIds(prev=> prev.includes(p.id)? prev.filter(id=>id!==p.id): [...prev,p.id]);
      setLastIndex(index);
    }
    onSelect(p);
  };

  const handleDouble = (p:Project) => { if(p.url) window.open(p.url,'_blank','noopener'); };

  return (
    <div className="flex h-full w-full flex-col text-[11px] bg-[#f3f3f3]">
      {/* Toolbar / Path */}
      <div className="flex items-center gap-3 border-b border-black bg-[#e4e4e4] px-2 py-1">
        <span className="font-bold">Projects:</span>
        <span className="px-1 border border-black bg-white">Macintosh HD</span>
        <span className="text-black/50">/</span>
        <span className="px-1 border border-black bg-white">Portfolio</span>
        <span className="text-black/50">/</span>
        <span className="px-1 border border-black bg-white">Web</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={()=>setView('list')} className={`border border-black px-2 py-0.5 ${view==='list'?'bg-black text-white':'bg-white hover:bg-black hover:text-white'}`}>List</button>
          <button onClick={()=>setView('icons')} className={`border border-black px-2 py-0.5 ${view==='icons'?'bg-black text-white':'bg-white hover:bg-black hover:text-white'}`}>Icons</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (categorías ficticias) */}
        <aside className="w-40 shrink-0 border-r border-black bg-[#efefef] p-2 flex flex-col gap-1 overflow-auto">
          <div className="font-semibold mb-1">Tags</div>
          <button onClick={()=>setActiveTag(null)} className={`text-left px-1 py-0.5 border ${activeTag===null? 'bg-black text-white border-black':'border-transparent hover:border-black hover:bg-black hover:text-white'}`}>All</button>
          {allTags.map(t=> (
            <button key={t} onClick={()=> setActiveTag(t)} className={`text-left px-1 py-0.5 border ${activeTag===t? 'bg-black text-white border-black':'border-transparent hover:border-black hover:bg-black hover:text-white'}`}>#{t}</button>
          ))}
        </aside>

        {/* File area */}
        <div className="flex flex-1 flex-col border-r border-black bg-white overflow-hidden">
          {/* Column headers (list mode) */}
          {view==='list' && (
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 border-b border-black bg-[#e9e9e9] px-2 py-1 font-semibold select-none text-[10px]">
              <button onClick={()=>toggleSort('name')} className="text-left hover:underline">Name{sortKey==='name'? (sortDir===1?' ▲':' ▼'):''}</button>
              <button onClick={()=>toggleSort('desc')} className="text-left hover:underline">Description{sortKey==='desc'? (sortDir===1?' ▲':' ▼'):''}</button>
              <button onClick={()=>toggleSort('tech')} className="text-left hover:underline">Tech{sortKey==='tech'? (sortDir===1?' ▲':' ▼'):''}</button>
              <span>Link</span>
            </div>
          )}
          {/* Scroll region */}
          <div className="relative flex-1 overflow-auto">
            {view==='list' && (
              <ul className="divide-y divide-black/40">
                {sorted.map((p,i)=>{
                  const sel = selectedIds.includes(p.id);
                  return (
                    <li key={p.id}
                      onClick={(e)=>handleSelect(e,p,i)}
                      onDoubleClick={()=>handleDouble(p)}
                      className={`grid cursor-default grid-cols-[auto_1fr_auto_auto] items-center gap-2 px-2 py-1 select-none ${sel? 'bg-black text-white':''} hover:bg-black/80 hover:text-white` }>
                      <div className="flex items-center gap-2">
                        {folderIcon(sel)}
                        <span className="font-medium truncate max-w-[140px]">{p.title}</span>
                      </div>
                      <span className="truncate text-[10px] sm:text-[11px]">{p.short}</span>
                      <span className="text-[10px] max-w-[120px] truncate">{p.tech.join(', ')}</span>
                      {p.url? <a onClick={e=>e.stopPropagation()} href={p.url} target="_blank" rel="noreferrer" className="underline text-[10px] hover:no-underline">Open</a>: <span className="text-black/40 text-[10px]">—</span>}
                    </li>
                  );
                })}
              </ul>
            )}
            {view==='icons' && (
              <div className="p-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {sorted.map((p,i)=> {
                  const sel = selectedIds.includes(p.id);
                  return (
                    <button key={p.id}
                      onClick={(e)=>handleSelect(e,p,i)}
                      onDoubleClick={()=>handleDouble(p)}
                      className={`flex flex-col items-center gap-1 text-[10px] focus:outline-none ${sel? 'opacity-100':'opacity-90 hover:opacity-100'}`}>
                      <div className={`relative flex h-14 w-14 items-center justify-center border border-black bg-white ${sel? 'outline outline-2 outline-black':''}`}>
                        {folderIcon(sel)}
                      </div>
                      <span className="w-full truncate font-medium">{p.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Preview pane */}
        <div className="w-[300px] shrink-0 flex flex-col bg-[#fafafa]">
          <div className="border-b border-black bg-[#ececec] px-2 py-1 font-semibold flex items-center justify-between">
            <span>Preview</span>
            {active.url && <a href={active.url} target="_blank" rel="noreferrer" className="text-[10px] underline">Abrir</a>}
          </div>
          <div className="p-3 flex flex-col gap-3 overflow-auto text-[11px]">
            <div className="mx-auto border border-black bg-white p-1 shadow-[4px_4px_0_#0003]">
              <img src={active.image} alt={active.title} className="h-28 w-28 object-cover" style={{imageRendering:'pixelated' as any}} />
            </div>
            <div>
              <p className="font-bold text-[12px] mb-1">{active.title}</p>
              <p className="text-[11px] leading-snug mb-2">{active.short}</p>
              <p className="text-[10px]">Tech: <span className="font-mono">{active.tech.join(', ')}</span></p>
            </div>
            <div className="mt-auto pt-2 text-[9px] text-black/60 border-t border-dashed border-black/40 space-y-0.5">
              <p>Items: {sorted.length}</p>
              <p>Selected: {selectedIds.length || 0}</p>
              {activeTag && <p>Filter: #{activeTag}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsBody;
