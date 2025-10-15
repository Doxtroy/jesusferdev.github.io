import React from 'react';

interface WindowChromeProps {
	title: string;
	onClose: () => void;
	dragProps?: React.HTMLAttributes<HTMLDivElement>;
}

const WindowChrome: React.FC<WindowChromeProps> = ({ title, onClose, dragProps }) => {
	const isMobile = typeof window !== 'undefined' && (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches);
	const closeBtnSize = isMobile ? 'h-6 w-6' : 'h-4 w-4';
	const closeBtnText = isMobile ? 'text-[12px]' : 'text-[9px]';
	const chromePadding = isMobile ? 'px-3 py-2' : 'px-2 py-1';
	
	return (
		<div {...dragProps} className={`flex items-center gap-2 border-b border-black bg-[#dcdcdc] select-none text-[13px] win-chrome ${chromePadding}`}>
			<button onClick={onClose} aria-label="Close" className={`grid ${closeBtnSize} place-items-center border border-black bg-black ${closeBtnText} leading-none font-bold`} style={{ color: 'white' }}>X</button>
			<div className="relative flex-1 text-center">
				<span className="inline-block bg-[#dcdcdc] px-2 win-title">{title}</span>
				<div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-black" />
			</div>
			<div className={isMobile ? 'w-6' : 'w-4'} />
		</div>
	);
};

export default WindowChrome;
