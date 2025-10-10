import React, { useEffect, useRef, useState } from 'react';

interface MenuItem { label: string; action?: () => void; disabled?: boolean }
interface MenuBarProps {
  brand: string;
  openMenu: string | null;
  setOpenMenu: (k: string | null) => void;
  closeMenus: () => void;
  menuItems: Record<string, MenuItem[]>;
  menuKeys: string[];
  bringToFront?: (k: any) => void;
  barHeight?: number; // opcional, por defecto 28
  fontSizePx?: number; // permitir ajustar tipografía si se hace más grande
  horizontalPaddingRatio?: number; // factor para padding horizontal relativo a la altura
}
const MenuBar: React.FC<MenuBarProps> = ({
  brand,
  openMenu,
  setOpenMenu,
  closeMenus,
  menuItems,
  menuKeys,
  barHeight = 28,
  fontSizePx = 12,
  horizontalPaddingRatio = 0.25
}) => {
	const barRef = useRef<HTMLDivElement>(null);
	const [clock,setClock] = useState(()=> new Date());
	useEffect(()=>{ const id=setInterval(()=> setClock(new Date()), 30000); return ()=> clearInterval(id); },[]);
	useEffect(()=>{
		const handler = (e:MouseEvent)=>{
			if(!barRef.current) return;
			if(!barRef.current.contains(e.target as Node)) closeMenus();
		};
		window.addEventListener('mousedown', handler);
		return ()=> window.removeEventListener('mousedown', handler);
	},[closeMenus]);

	const h = barHeight;
  const padX = Math.round(h * horizontalPaddingRatio); // padding proporcional
	return (
		<div
        ref={barRef}
				className="flex items-center justify-between border-b border-black bg-[#e6e6e6] select-none"
        style={{
          height: h,
          lineHeight: h + 'px',
          minHeight: h,
          padding: `0 ${padX}px`,
          fontSize: fontSizePx
        }}
      >
			<div className="flex items-center gap-3" style={{paddingLeft: '50px'}}>
				<span className="font-bold cursor-default" style={{lineHeight:h+'px'}} onDoubleClick={()=> window.location.reload() }>{brand}</span>
				{menuKeys.map(key => (
					<div key={key} className="relative">
						<button
							onClick={(e)=>{ e.stopPropagation(); setOpenMenu(openMenu===key? null : key); }}
                style={{height:h, lineHeight:h+'px'}}
                className={`px-2 ${openMenu===key? 'bg-black text-white' : 'hover:bg-black hover:text-white'} transition-colors`}
						>{key}</button>
							{openMenu===key && (
							<div className="absolute left-0 top-full mt-1 w-44 border border-black bg-white shadow-lg z-[500]">
								<ul className="py-1">
									{menuItems[key].map((it,i)=>{
										if(it.label==='---') return <li key={i} className="my-1 border-t border-black/30" />;
										return (
											<li key={i}>
												<button
													disabled={it.disabled}
													onClick={()=>{ if(it.action) it.action(); closeMenus(); }}
                        className={`block w-full text-left px-2 py-1 text-[11px] ${it.disabled? 'text-black/40 cursor-not-allowed' : 'hover:bg-black hover:text-white'} transition-colors`}
												>{it.label}</button>
											</li>
										);
									})}
								</ul>
							</div>
						)}
					</div>
				))}
			</div>
			<div className="tabular-nums opacity-70 tracking-tight" style={{lineHeight:h+'px', paddingRight: '80px'}}>{clock.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})}</div>
		</div>
	);
};

export default MenuBar;
