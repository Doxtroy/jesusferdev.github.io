import React from 'react';

export type Theme = 'classic' | 'phosphor' | 'amber';

interface SettingsBodyProps {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  screensaverMs?: number;
  onScreensaverMsChange?: (ms: number) => void;
}

const SettingsBody: React.FC<SettingsBodyProps> = ({ theme, onThemeChange, screensaverMs = 60000, onScreensaverMsChange }) => {
  return (
    <div className="p-3 text-[12px] leading-tight">
      <h3 className="font-bold mb-2">Ajustes gráficos</h3>
      <div className="space-y-2">
        <div>
          <div className="mb-1">Tema de pantalla</div>
          <div className="flex gap-3">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="theme"
                checked={theme==='classic'}
                onChange={()=> onThemeChange('classic')}
              />
              <span>Clásico (escala de grises)</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="theme"
                checked={theme==='phosphor'}
                onChange={()=> onThemeChange('phosphor')}
              />
              <span>Fósforo verde</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="theme"
                checked={theme==='amber'}
                onChange={()=> onThemeChange('amber')}
              />
              <span>Ámbar</span>
            </label>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1">Tiempo inactividad para bloqueo</div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={10000}
              max={600000}
              step={5000}
              value={screensaverMs}
              onChange={(e)=> onScreensaverMsChange?.(parseInt(e.target.value,10))}
            />
            <span>{Math.round(screensaverMs/1000)}s</span>
          </div>
          <p className="opacity-70 mt-1">Rango: 10 segundos a 10 minutos</p>
        </div>
        <p className="opacity-70">El tema afecta a la pantalla dentro del monitor (fondos, textos, croma y efectos CRT).</p>
      </div>
    </div>
  );
};

export default SettingsBody;
