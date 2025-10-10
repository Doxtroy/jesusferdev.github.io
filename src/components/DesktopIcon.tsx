import React from 'react';

export interface DesktopIconProps {
	id: string;
	label: string;
	x: number;
	y: number;
	img?: { src: string; w?: number; h?: number };
	isSelected?: boolean;
	onDoubleClick?: () => void;
	onPointerDown?: (e: React.PointerEvent) => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ label, x, y, img, isSelected, onDoubleClick, onPointerDown }) => {
	return (
		<div
			data-icon
			style={{ left: x, top: y, position: 'absolute', width: 92, height: 104 }}
			onDoubleClick={onDoubleClick}
			onPointerDown={onPointerDown}
			className={`select-none text-center text-[11px] ${isSelected ? 'outline outline-1 outline-black' : ''}`}
		>
			<div className={`mx-auto grid h-16 w-16 place-items-center bg-white ring-1 ring-black ${isSelected ? 'border border-black border-dotted' : ''}`}>
				{img ? <img src={img.src} alt="" className="h-12 w-12 object-contain" draggable={false} /> : <div className="h-12 w-12 bg-black" />}
			</div>
			<span className="mt-1 inline-block border border-black bg-white px-1">{label}</span>
		</div>
	);
};

export default DesktopIcon;
