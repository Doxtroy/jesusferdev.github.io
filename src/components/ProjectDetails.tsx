import React from 'react';
import type { Project } from './ProjectsBody';
import { GlobeIcon } from './icons/RetroIcons';

interface ProjectDetailsProps {
  project: Project | null;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  if (!project) {
    return <div className="p-4 text-[12px]">Selecciona un proyecto para ver sus detalles.</div>;
  }
  return (
    <div className="h-full w-full overflow-auto p-3 sm:p-4 bg-[#f7f7f7]">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 border border-black bg-white p-1 shadow-[4px_4px_0_#0002]">
            <img src={project.image} alt={project.title} className="h-28 w-28 sm:h-32 sm:w-32 object-cover" style={{ imageRendering: 'pixelated' as React.CSSProperties['imageRendering'] }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[18px] sm:text-[20px] font-bold leading-tight">{project.title}</h3>
            <p className="mt-1 text-[13px] sm:text-[15px] leading-snug">{project.short}</p>
            <div className="mt-2 text-[12px] sm:text-[13px]">
              <span className="font-semibold">Tech:</span> <span className="font-mono">{project.tech.join(', ')}</span>
            </div>
            {project.url && (
              <div className="mt-3">
                <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 border-[2px] border-black bg-white hover:bg-black hover:text-white text-[13px] font-semibold shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                  <GlobeIcon size={18} /> Abrir proyecto
                </a>
              </div>
            )}
          </div>
        </div>
        {/* Placeholder para futura galería o secciones adicionales */}
        <div className="mt-2 pt-2 border-t border-dashed border-black/40 text-[11px] text-black/70">
          Consejo: usa la ventana "Projects" como explorador y esta ventana para ver la ficha completa.
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
