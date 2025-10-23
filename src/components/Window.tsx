import React from 'react';
import WindowChrome from './WindowChrome';

export interface WindowProps {
	x: number; y: number; w: number; h?: number | 'auto'; z: number; title: string; open: boolean;
	children: React.ReactNode; onClose: () => void; dragProps?: React.HTMLAttributes<HTMLDivElement>; resizeProps?: React.HTMLAttributes<HTMLDivElement>; growBox?: boolean; style?: React.CSSProperties; contentClassName?: string; contentStyle?: React.CSSProperties; statusText?: string;
}

const Window: React.FC<WindowProps> = ({ x, y, w, h='auto', z, title, open, children, onClose, dragProps, resizeProps, growBox, style, contentClassName, contentStyle, statusText }) => {
	if (!open) return null;
	// When the window has a fixed height, allow internal scrolling so content is never clipped
	const baseContentClass = h==='auto'? 'relative w-full overflow-visible' : 'relative h-full w-full overflow-auto';
	const contentClasses = `${baseContentClass} win-content${contentClassName ? ` ${contentClassName}` : ''}`;
	return (
		<div data-window className="window-main absolute bg-white border border-black shadow-lg flex flex-col" style={{ left:x, top:y, width:w, height: h==='auto'? undefined : h, zIndex:z, minWidth:260, minHeight:160, ...style }}>
			<WindowChrome title={title} onClose={onClose} dragProps={dragProps} />
			<div className={contentClasses.replace(' h-full','').concat(h==='auto' ? '' : ' min-h-0 flex-1')} style={contentStyle}>
				{children}
				{growBox && (
					<div className="absolute right-0 bottom-0 h-6 w-6 cursor-nwse-resize" style={{ zIndex:2 }} {...resizeProps}>
						<svg width="24" height="24" className="absolute right-1 bottom-1 opacity-60" viewBox="0 0 24 24"><path d="M4 20h16M8 16h12M12 12h8" stroke="#000" strokeWidth="1.5" fill="none"/></svg>
					</div>
				)}
			</div>
			{/* Status bar (optional) */}
			{statusText && (
				<div className="win-status select-none border-t border-black bg-[#e9e9e9] text-[10px] leading-tight px-2 py-1">
					{statusText}
				</div>
			)}
		</div>
	);
};

export default Window;
