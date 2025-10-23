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
  boxPx?: number; // optional: base box width for responsive sizing (default 92)
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ label, x, y, img, isSelected, onDoubleClick, onPointerDown, boxPx }) => {
	const box = Math.round(boxPx || 92);
	const boxH = Math.round(box * 1.13); // preserve original aspect (104/92)
	const inner = Math.round(box * 0.696); // was w-16 (64) vs base 92
	const imgSz = Math.round(box * 0.522); // was 48 vs base 92
	const labelFont = Math.max(10, Math.round(box * 0.12));
	return (
		<div
			data-icon
			data-icon-id={label ? `${label}` : undefined}
			style={{ left: x, top: y, position: 'absolute', width: box, height: boxH }}
			onDoubleClick={onDoubleClick}
			onPointerDown={onPointerDown}
			className={`select-none text-center ${isSelected ? 'outline outline-1 outline-black' : ''}`}
		>
			<div className={`mx-auto grid place-items-center bg-white ring-1 ring-black ${isSelected ? 'border border-black border-dotted' : ''}`}
				style={{ width: inner, height: inner }}
			>
				{img ? <img src={img.src} alt="" style={{ width: imgSz, height: imgSz }} className="object-contain" draggable={false} /> : <div style={{ width: imgSz, height: imgSz }} className="bg-black" />}
			</div>
			<span className="mt-1 inline-block border border-black bg-white px-1" style={{ fontSize: labelFont }}>{label}</span>
		</div>
	);
};

export default DesktopIcon;
