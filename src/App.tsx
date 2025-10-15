import RetroMac128KPortfolio from "./RetroMac128KPortfolio";
import MobileHome from "./MobileHome";

function useIsMobileRoute(){
  if (typeof window === 'undefined') return false;
  const full = (window.location.pathname + window.location.hash).toLowerCase();
  return full.includes('hom-movile');
}

function computeHashTarget(){
  if (typeof window === 'undefined') return '#/hom-movile';
  const baseEl = document.querySelector('base');
  const href = (baseEl?.getAttribute('href') || '/').replace(/#.*$/,'');
  const normalized = href.endsWith('/') ? href.slice(0, -1) : href;
  return `${normalized}#/hom-movile` || '#/hom-movile';
}

export default function App() {
  const isMobileRoute = useIsMobileRoute();
  if (typeof window !== 'undefined' && !isMobileRoute) {
    const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isMobileViewport || isCoarse) {
      const target = computeHashTarget();
      if (!window.location.href.toLowerCase().includes('#/hom-movile')) {
        window.location.replace(target);
        return null;
      }
    }
  }
  return isMobileRoute ? <MobileHome /> : <RetroMac128KPortfolio />;
}
