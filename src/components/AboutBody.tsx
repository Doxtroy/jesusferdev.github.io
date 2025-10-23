import React from 'react';
/**
 * AboutBody
 *
 * You can personalize About by:
 * - Passing props from parents (e.g., brand) in `MobileHome.tsx` or `RetroMac128KPortfolio.tsx`.
 * - Or editing the default texts and images below.
 *
 * Props:
 * - brand: main title (also used elsewhere as BRAND)
 * - version, processor, abilities, experience, creativity: free-form strings
 * - memoryLabelLeft, memoryLabelRight: text over the memory bar
 * - cvUrl: link to your CV / resume PDF
 * - skills: array of icons (src, alt)
 * - pcImage: image at the top
 */

interface SpecRow { label:string; value:React.ReactNode }
interface SkillIcon { src:string; alt:string }
interface AboutBodyProps {
	brand?: string;
	version?: string;
	processor?: string;
	abilities?: string;
	experience?: string;
	creativity?: string;
	memoryLabelLeft?: string;
	memoryLabelRight?: string;
	cvUrl?: string;
	skills?: SkillIcon[];
	pcImage?: string;
}

// PERSONAL: Replace or extend these default skill icons (or pass `skills` prop from parent)
const defaultSkills: SkillIcon[] = [
	{ src:'https://rafaheras.dev/wp-content/uploads/2024/06/JavaScript-logo.png', alt:'JavaScript' },
	{ src:'https://rafaheras.dev/wp-content/uploads/2024/06/Php-logo.png', alt:'PHP' },
	{ src:'https://rafaheras.dev/wp-content/uploads/2024/06/fc9b4d4d43c92322dff53c160295320f.png', alt:'React' },
	{ src:'https://rafaheras.dev/wp-content/uploads/2024/06/elementor-icon.webp', alt:'Elementor' },
	{ src:'https://rafaheras.dev/wp-content/uploads/2024/06/figma-icon-1024x1024-mvfh9xsk.png', alt:'Figma' },
	{ src:'https://rafaheras.dev/wp-content/uploads/2024/06/Photoshop_CC_icon.png', alt:'Photoshop' },
	{ src:'https://rafaheras.dev/wp-content/uploads/2024/06/492px-Illustrator_CC_icon.png', alt:'Illustrator' }
];

const AboutBody: React.FC<AboutBodyProps> = ({
	brand='Me',
	version='Versión 3.141592…',
	processor='El justo para pasar del día',
	abilities='Encender un mechero con los pies',
	experience='Nunca suficientes para ti',
	creativity='165 ZB de genialidad',
	memoryLabelLeft='Memoria',
	memoryLabelRight='0,06MB libres de 965 ZB',
	cvUrl='https://rafaheras.dev/wp-content/uploads/2024/07/Rafa-de-las-Heras-CV.pdf',
	skills=defaultSkills,
	pcImage='https://rafaheras.dev/wp-content/uploads/2024/06/pc.png'
}) => {
	const specs: SpecRow[] = [
		{ label:'Procesador', value: processor },
		{ label:'Habilidades', value: abilities },
		{ label:'Experiencia', value: experience },
		{ label:'Creatividad', value: creativity },
		{ label:'Skills', value: (
			<div className="flex flex-wrap items-center gap-2">
				{skills.map(skill => (
					<img
						key={skill.src}
						src={skill.src}
						alt={skill.alt}
						className="h-5 w-5 sm:h-7 sm:w-7 object-contain"
						loading="lazy"
						decoding="async"
					/>
				))}
			</div>
		) }
	];

	return (
		<div className="h-full w-full overflow-auto p-3 sm:p-4 leading-snug">
			{/* Header / Title */}
			<div className="flex flex-col items-center text-center">
				<img
					src={pcImage}
					alt="PC"
					className="h-28 sm:h-36 w-auto object-contain mb-3"
					loading="lazy"
					decoding="async"
				/>
				<h2 className="text-[20px] sm:text-[26px] font-bold tracking-tight">
					{brand === 'Me' ? 'Rafindows 95' : brand}
				</h2>
				<p className="mt-1 italic text-[15px] sm:text-[19px]">{version}</p>
			</div>

			{/* Memory Bar */}
			<div className="mt-3.5 sm:mt-5 mb-5 sm:mb-8">
				<div className="mx-auto w-[96%] sm:w-[90%]">
					<div className="flex items-baseline justify-between px-1 sm:px-2 font-semibold text-[12px] sm:text-[15px] tracking-tight">
						<span>{memoryLabelLeft}</span>
						<span className="text-right whitespace-nowrap sm:whitespace-normal">{memoryLabelRight}</span>
					</div>
					<div className="mt-1 flex h-8 sm:h-10 w-full rounded border-[3px] border-black overflow-hidden bg-white">
						<div
							className="disk1 flex items-center justify-end gap-1 pr-2 text-[9px] sm:text-[11px] font-semibold tracking-tight"
							style={{ width: '70%', borderRight: '3px solid black', background: 'rgba(0,0,0,0.20)' }}
						>
							<span>Nudes</span>
						</div>
						<div
							className="disk2 flex items-center justify-end gap-1 pr-2 text-[9px] sm:text-[11px] font-semibold tracking-tight"
							style={{ width: '20%', borderRight: '3px solid black', background: 'rgba(0,0,0,0.10)' }}
						>
							<span>Life</span>
						</div>
						<div
							className="disk3 flex items-center justify-end gap-1 pr-2 text-[9px] sm:text-[11px] font-semibold tracking-tight"
							style={{ width: '10%', background: 'rgba(0,0,0,0.0)' }}
						>
							<span>Shit</span>
						</div>
					</div>
				</div>
			</div>

			{/* Spec rows */}
			<div className="space-y-2 sm:space-y-3" role="list">
				{specs.map(row => (
					<div
						key={row.label}
						role="listitem"
						className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-dashed border-black/40 pb-1.5 sm:pb-2"
					>
						<span className="font-semibold text-[15px] sm:text-[19px]">{row.label}</span>
						<span className="sm:text-right text-[14px] sm:text-[17px]">{row.value}</span>
					</div>
				))}
			</div>

			{/* Download Button */}
			<div className="mt-4 sm:mt-5 flex justify-center">
				<a
					href={cvUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="group inline-flex items-center gap-2 border-[2px] border-black bg-white px-4 py-2.5 font-semibold shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-[13px] sm:text-[15px]"
				>
					<span className="block h-4 w-4 bg-black text-white leading-4 grid place-items-center font-bold text-[10px]">S</span>
					<span className="underline decoration-dotted group-hover:decoration-solid">Descarga manual de instrucciones</span>
				</a>
			</div>

			{/* Footer */}
			<div className="mt-5 sm:mt-6 text-center opacity-80 text-[13px] sm:text-[15px]">
				{brand} Corporation © 1991-2085? All Lefts Reserved.
				<br />
				Designed en Toledo, ensamblado en la parte de atrás de un coche.
			</div>
		</div>
	);
};

export default AboutBody;
