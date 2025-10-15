import React from 'react';

export interface SocialLinks {
	github?: string; linkedin?: string; instagram?: string; whatsapp?: string; spotify?: string; email?: string;
}

const items: { key: keyof SocialLinks; label: string }[] = [
	{ key: 'github', label: 'GitHub' },
	{ key: 'linkedin', label: 'LinkedIn' },
	{ key: 'instagram', label: 'Instagram' },
	{ key: 'whatsapp', label: 'WhatsApp' },
	{ key: 'spotify', label: 'Spotify' },
	{ key: 'email', label: 'Email' },
];

const SocialBody: React.FC<{ LINKS: SocialLinks }> = ({ LINKS }) => (
	<div className="p-4 grid grid-cols-2 gap-3 text-[14px]">
		{items.map(it => LINKS[it.key] && (
			<a key={it.key} href={LINKS[it.key]} target="_blank" rel="noreferrer" className="group border border-black bg-white p-4 hover:bg-black hover:text-white transition">
				<span className="block font-bold mb-1 text-[16px]">{it.label}</span>
				<span className="break-all opacity-70 text-[13px] group-hover:opacity-100">{LINKS[it.key]}</span>
			</a>
		))}
	</div>
);

export default SocialBody;
