import React from 'react';

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
				{skills.map(s=> <img key={s.src} src={s.src} alt={s.alt} className="h-6 w-6 object-contain" />)}
			</div>
		) }
	];

	return (
		<div className="h-full w-full overflow-auto p-3 sm:p-4 text-[11px] sm:text-[12px] leading-snug">
			{/* Header / Title */}
					<div className="flex flex-col items-center text-center">
						<img src={pcImage} alt="PC" className="h-20 sm:h-24 w-auto object-contain mb-2" />
						<h2 className="text-[18px] sm:text-[20px] font-bold tracking-tight">{brand === 'Me' ? 'Rafindows 95' : brand}</h2>
						<p className="mt-0.5 text-[11px] sm:text-[12px] italic">{version}</p>
			</div>

			{/* Memory Bar */}
					<div className="relative mt-4 sm:mt-5 mb-6 sm:mb-8">
						<div className="flex h-7 sm:h-8 w-[96%] sm:w-[90%] mx-auto rounded border-[3px] border-black overflow-hidden relative bg-white">
							<div className="disk1 flex items-center justify-end gap-1 pr-2 text-[10px] sm:text-[11px] font-semibold tracking-tight" style={{width:'70%',borderRight:'3px solid black', background:'rgba(0,0,0,0.20)'}}>
						<span>Nudes</span>
					</div>
							<div className="disk2 flex items-center justify-end gap-1 pr-2 text-[10px] sm:text-[11px] font-semibold tracking-tight" style={{width:'20%',borderRight:'3px solid black', background:'rgba(0,0,0,0.10)'}}>
						<span>Life</span>
					</div>
							<div className="disk3 flex items-center justify-end gap-1 pr-2 text-[10px] sm:text-[11px] font-semibold tracking-tight" style={{width:'10%', background:'rgba(0,0,0,0.0)'}}>
						<span>Shit</span>
					</div>
					{/* Labels above */}
							<span className="absolute -top-4 sm:-top-5 left-0 ml-[5%] font-semibold text-[11px] sm:text-[12px]">{memoryLabelLeft}</span>
							<span className="absolute -top-4 sm:-top-5 right-0 mr-[5%] font-semibold text-[11px] sm:text-[12px]">{memoryLabelRight}</span>
				</div>
			</div>

			{/* Spec rows */}
					<div className="space-y-1.5 sm:space-y-2" role="list">
				{specs.map(row=> (
					<div
						key={row.label}
						role="listitem"
								className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-dashed border-black/40 pb-1"
					>
								<span className="font-semibold">{row.label}</span>
								<span className="sm:text-right">{row.value}</span>
					</div>
				))}
			</div>

			{/* Download Button */}
					<div className="mt-4 sm:mt-5 flex justify-center">
						<a href={cvUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 border border-black bg-white px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
							<span className="block h-3 w-3 bg-black text-white text-[8px] sm:text-[9px] leading-3 grid place-items-center font-bold">S</span>
					<span className="underline decoration-dotted group-hover:decoration-solid">Descarga manual de instrucciones</span>
				</a>
			</div>

			{/* Footer */}
					<div className="mt-5 sm:mt-6 text-center text-[10px] sm:text-[11px] opacity-80">
				{brand} Corporation © 1991-2085? All Lefts Reserved.<br />Designed en Toledo, ensamblado en la parte de atrás de un coche.
			</div>
		</div>
	);
};

export default AboutBody;
