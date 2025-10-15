import RetroMac128KPortfolio from "./RetroMac128KPortfolio";
import MobileHome from "./MobileHome";
export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/';
  const hash = typeof window !== 'undefined' ? (window.location.hash || '').toLowerCase() : '';
  const useMobile = path.includes('hom-movile') || hash.includes('hom-movile');
  // Auto-redirect to mobile route when on a mobile device and not already there
  if (typeof window !== 'undefined' && !useMobile) {
    const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isMobileViewport || isCoarse) {
      const base = document.querySelector('base')?.getAttribute('href') || '/';
      // Use hash route for GH Pages compatibility
      const target = base.endsWith('/') ? `${base}#/hom-movile` : `${base}/#/hom-movile`;
      if (window.location.href.indexOf('#/hom-movile') === -1) {
        window.location.replace(target);
        return null;
      }
    }
  }
  return useMobile ? <MobileHome /> : <RetroMac128KPortfolio />;
}
