import { color } from 'framer-motion';
import React from 'react';

interface WindowChromeProps {
	title: string;
	onClose: () => void;
	dragProps?: React.HTMLAttributes<HTMLDivElement>;
}

const WindowChrome: React.FC<WindowChromeProps> = ({ title, onClose, dragProps }) => (
	<div {...dragProps} className="flex items-center gap-2 border-b border-black bg-[#dcdcdc] px-2 py-1 select-none text-[12px] win-chrome">
		<button onClick={onClose} aria-label="Close" className="grid h-4 w-4 place-items-center border border-black bg-black text-[8px] leading-none" style={{ color: 'white' }}>X</button>
		<div className="relative flex-1 text-center">
			<span className="inline-block bg-[#dcdcdc] px-2 win-title">{title}</span>
			<div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-black" />
		</div>
		<div className="w-4" />
	</div>
);

export default WindowChrome;
